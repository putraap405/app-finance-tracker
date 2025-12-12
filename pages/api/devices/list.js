import { supabaseAdmin } from '../../lib/supabaseServer';
import { verifyJwt } from '../../lib/auth';
import { loadDB } from '../../lib/readWriteDB';

export default async function handler(req,res){
  if(req.method!=='GET') return res.status(405).end();
  const token = (req.headers.authorization||'').replace('Bearer ','');
  const payload = verifyJwt(token); if(!payload) return res.status(401).json({error:'Unauthorized'});
  if (supabaseAdmin) {
    const { data: devices } = await supabaseAdmin.from('devices').select('*').eq('user_id', payload.uid);
    return res.status(200).json({ devices });
  } else {
    const db = loadDB();
    const devices = db.devices.filter(d=>d.user_id===payload.uid);
    return res.status(200).json({ devices });
  }
}
