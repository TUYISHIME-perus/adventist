const db = require('../db');
const crypto = require('crypto');

async function getValue(key){
  const v = db.getValue ? db.getValue(key) : null;
  return Promise.resolve(v);
}
async function setValue(key, value){
  const r = db.setValue ? db.setValue(key, value) : null;
  return Promise.resolve(r);
}

function parseJsonBody(req){
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function createPasswordRecord(password){
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

function verifyPassword(password, record){
  if (!record || !record.salt || !record.hash) return false;
  const actual = crypto.scryptSync(password, record.salt, 64);
  const expected = Buffer.from(record.hash, 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(actual, actual) ? true : actual.equals(expected);
}

async function ensureAdminRecord(){
  const raw = await getValue('admin_credentials');
  if (raw) {
    try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch{ return raw; }
  }
  const envPass = process.env.ADMIN_PASSWORD;
  if (!envPass) return null;
  const rec = createPasswordRecord(envPass);
  await setValue('admin_credentials', JSON.stringify(rec));
  return rec;
}

async function getSessionFromReq(req){
  const cookies = (req.headers.cookie || '').split(';').map(c=>c.trim());
  const tokCookie = cookies.find(c => c.startsWith('campus_session='));
  if (!tokCookie) return null;
  const token = tokCookie.split('=')[1];
  if (!token) return null;
  const raw = await getValue('session:'+token);
  if (!raw) return null;
  try{
    const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!obj || !obj.expires) return null;
    if (obj.expires <= Date.now()) return null;
    return obj;
  }catch(e){ return null; }
}

module.exports = {
  getValue, setValue, parseJsonBody, createPasswordRecord, verifyPassword, ensureAdminRecord, getSessionFromReq
};
