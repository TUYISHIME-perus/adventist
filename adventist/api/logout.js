const { getSessionFromReq, setValue } = require('./_helpers');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try{
    const session = await getSessionFromReq(req);
    if (!session) return res.status(401).json({ error: 'Not authenticated' });
    // remove session
    const cookies = (req.headers.cookie || '').split(';').map(c=>c.trim());
    const tokCookie = cookies.find(c => c.startsWith('campus_session='));
    const token = tokCookie && tokCookie.split('=')[1];
    if (token) await setValue('session:'+token, JSON.stringify({ }));
    // clear cookie
    res.setHeader('Set-Cookie', `campus_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`);
    return res.status(200).json({ ok: true });
  }catch(err){ console.error('logout err', err); return res.status(500).json({ error: 'Unable to logout' }); }
};
