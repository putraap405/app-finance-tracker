import { supabaseAdmin } from '../../../../lib/supabaseServer';
import { verifyJwt } from '../../../../lib/auth';
import { loadDB, saveDB } from '../../../../lib/readWriteDB';

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).end();
  const token = (req.headers.authorization||'').replace('Bearer ','');
  const payload = verifyJwt(token); if(!payload) return res.status(401).json({error:'Unauthorized'});
  const { userId, ban } = req.body || {};
  if (!userId) return res.status(400).json({error:'userId required'});
  if (supabaseAdmin) {
    const { data: me } = await supabaseAdmin.from('users').select('role').eq('id', payload.uid).single();
    if(!me || me.role!=='admin') return res.status(403).json({error:'Admin only'});
    const { error } = await supabaseAdmin.from('users').update({ is_banned: !!ban }).eq('id', userId);
    if(error) return res.status(500).json({error:error.message});
    return res.status(200).json({ok:true});
  } else {
    const db = loadDB();
    const user = db.users.find(u=>u.id===userId);
    if(!user) return res.status(404).json({error:'User not found'});
    user.is_banned = !!ban; saveDB(db);
    return res.status(200).json({ok:true});
  }
}
