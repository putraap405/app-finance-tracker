import { supabaseAdmin } from '../../../lib/supabaseServer';
import { hashPassword, signJwt } from '../../../lib/auth';
import { loadDB, saveDB } from '../../../lib/readWriteDB';

export default async function handler(req,res){
  if (req.method!=='POST') return res.status(405).end();
  const { username, email, password } = req.body || {};
  if(!username || !password) return res.status(400).json({error:'username & password required'});
  if (supabaseAdmin) {
    const hashed = await hashPassword(password);
    const { data, error } = await supabaseAdmin.from('users').insert([{username,email,password:hashed}]).select().single();
    if(error) return res.status(500).json({error:error.message});
    const token = signJwt({ uid: data.id, username: data.username, role: data.role});
    return res.status(201).json({ user:{id:data.id,username:data.username,role:data.role}, token });
  } else {
    const db = loadDB();
    if(db.users.find(u=>u.username===username || u.email===email)) return res.status(400).json({error:'User exists'});
    const hashed = await hashPassword(password);
    const user = { id: 'local-'+Date.now(), username, email, password:hashed, role:'user', is_banned:false };
    db.users.push(user);
    saveDB(db);
    const token = signJwt({ uid: user.id, username: user.username, role: user.role});
    return res.status(201).json({ user:{id:user.id,username:user.username,role:user.role}, token });
  }
}
