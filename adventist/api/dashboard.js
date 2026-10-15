const db = require('../db');
const { getSessionFromReq, parseJsonBody } = require('./_helpers');

async function getDashboard(){
  if (!db) return null;
  const maybe = db.getDashboard();
  return Promise.resolve(maybe);
}
async function setDashboard(obj){
  if (!db) throw new Error('Database not configured');
  const maybe = db.setDashboard(obj);
  return Promise.resolve(maybe);
}

module.exports = async (req, res) => {
  if (req.method === 'GET'){
    try{ const dashboard = await getDashboard(); return res.status(200).json({ dashboard }); }
    catch(e){ console.error('dashboard get', e); return res.status(500).json({ error: 'Unable to read dashboard' }); }
  }
  if (req.method === 'POST'){
    try{
      const session = await getSessionFromReq(req);
      if (!session) return res.status(401).json({ error: 'Sign in to update the dashboard.' });
      const body = await parseJsonBody(req);
      await setDashboard(body);
      return res.status(200).json({ ok: true });
    }catch(e){ console.error('dashboard post', e); return res.status(500).json({ error: 'Unable to save dashboard' }); }
  }
  return res.status(405).json({ error: 'Method not allowed' });
};
