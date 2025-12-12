import { supabaseAdmin } from '../../../../lib/supabaseServer';
import { verifyJwt } from '../../../../lib/auth';
import { loadDB } from '../../../../lib/readWriteDB';

export default async function handler(req,res){
  const token = (req.headers.authorization||'').replace('Bearer ','');
  const payload = verifyJwt(token); if(!payload) return res.status(401).json({error:'Unauthorized'});
  if (supabaseAdmin) {
    const { data: me } = await supabaseAdmin.from('users').select('role').eq('id', payload.uid).single();
    if(!me || me.role!=='admin') return res.status(403).json({error:'Admin only'});
    const { data: users, error } = await supabaseAdmin.from('users').select('id,username,email,role,is_banned,created_at').order('created_at',{ascending:false});
    if(error) return res.status(500).json({error:error.message});
    return res.status(200).json({users});
  } else {
    const db = loadDB();
    const users = db.users.map(u=>({id:u.id,username:u.username,email:u.email,role:u.role,is_banned:u.is_banned,created_at:u.created_at||null}));
    return res.status(200).json({users});
  }
}
