import { supabaseAdmin } from '../../../../lib/supabaseServer';
import { verifyJwt } from '../../../../lib/auth';
import { loadDB, saveDB } from '../../../../lib/readWriteDB';
import { v4 as uuidv4 } from 'uuid';

function generateCode(){
  return uuidv4().split('-')[0].toUpperCase() + '-' + Math.random().toString(36).substring(2,8).toUpperCase();
}

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).end();
  const token = (req.headers.authorization||'').replace('Bearer ','');
  const payload = verifyJwt(token); if(!payload) return res.status(401).json({error:'Unauthorized'});
  // check admin, local fallback
  if (supabaseAdmin) {
    const { data: user } = await supabaseAdmin.from('users').select('id,role').eq('id', payload.uid).single();
    if(!user || user.role!=='admin') return res.status(403).json({error:'Admin only'});
    const { expiresAt, metadata } = req.body || {};
    const code = generateCode();
    const { data, error } = await supabaseAdmin.from('licenses').insert([{code, metadata: metadata||{}, expires_at: expiresAt||null, is_active:true}]).select().single();
    if(error) return res.status(500).json({error:error.message});
    return res.status(201).json({license:data});
  } else {
    const db = loadDB();
    const { expiresAt, metadata } = req.body || {};
    const code = generateCode();
    const lic = { id:'lic-'+Date.now(), code, metadata:metadata||{}, expires_at: expiresAt||null, is_active:true, created_at: new Date().toISOString() };
    db.licenses.push(lic); saveDB(db);
    return res.status(201).json({license:lic});
  }
}
