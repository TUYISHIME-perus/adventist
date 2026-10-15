const { getSessionFromReq } = require('./_helpers');
module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try{
    const session = await getSessionFromReq(req);
    return res.status(200).json({ authenticated: !!session });
  }catch(err){ console.error('session err', err); return res.status(500).json({ error: 'Unable to check session' }); }
};
