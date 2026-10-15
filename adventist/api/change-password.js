const { parseJsonBody, ensureAdminRecord, getSessionFromReq, setValue } = require('./_helpers');
const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try{
    const session = await getSessionFromReq(req);
    if (!session) return res.status(401).json({ error: 'Sign in to change the administrator password.' });
    const body = await parseJsonBody(req);
    const currentPassword = body.currentPassword || '';
    const newPassword = body.newPassword || '';
    const creds = await ensureAdminRecord();
    if (!creds) return res.status(500).json({ error: 'Admin credentials not initialized.' });
    const ok = (function(){ try{ const actual = crypto.scryptSync(currentPassword, creds.salt, 64); return actual.equals(Buffer.from(creds.hash,'hex')); }catch(e){return false} })();
    if (!ok) return res.status(401).json({ error: 'The current password is incorrect.' });
    if (newPassword.length < 12) return res.status(400).json({ error: 'The new password must contain at least 12 characters.' });
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(newPassword, salt, 64).toString('hex');
    await setValue('admin_credentials', JSON.stringify({ salt, hash }));
    // clear all sessions
    // (simple approach) remove sessions not implemented - sessions can expire
    return res.status(200).json({ ok: true });
  }catch(err){ console.error('change-password err', err); return res.status(500).json({ error: 'Unable to change password' }); }
};
