import { supabaseAdmin } from '../../../../lib/supabaseServer';
import { verifyJwt } from '../../../../lib/auth';
import { loadDB } from '../../../../lib/readWriteDB';

export default async function handler(req,res){
  const token = (req.headers.authorization||'').replace('Bearer ','');
  const payload = verifyJwt(token); if(!payload) return res.status(401).json({error:'Unauthorized'});
  if (supabaseAdmin) {
    const { data: user } = await supabaseAdmin.from('users').select('role').eq('id', payload.uid).single();
    if(!user || user.role!=='admin') return res.status(403).json({error:'Admin only'});
    const { data: licenses, error } = await supabaseAdmin.from('licenses').select('*').order('created_at',{ascending:false});
    if(error) return res.status(500).json({error:error.message});
    return res.status(200).json({licenses});
  } else {
    const db = loadDB();
    return res.status(200).json({licenses: db.licenses.slice().reverse()});
  }
}
