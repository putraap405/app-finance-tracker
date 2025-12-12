import { supabaseAdmin } from '../../../lib/supabaseServer';
import ADMIN_INFO from '../../../ADMIN_INFO.json';
import { comparePassword, signJwt } from '../../../lib/auth';
import { loadDB } from '../../../lib/readWriteDB';

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).end();
  const { username, password } = req.body || {};
  if(!username || !password) return res.status(400).json({error:'username & password required'});
  if (supabaseAdmin) {
    const { data: user, error } = await supabaseAdmin.from('users').select('*').or(`username.eq.${username},email.eq.${username}`).maybeSingle();
    if(error) return res.status(500).json({error:error.message});
    if(!user) return res.status(401).json({error:'Invalid credentials'});
    if(user.is_banned) return res.status(403).json({error:'Account banned'});
    const ok = await comparePassword(password, user.password);
    if(!ok) return res.status(401).json({error:'Invalid credentials'});
    const token = signJwt({ uid:user.id, username:user.username, role:user.role});
    return res.status(200).json({ user:{id:user.id,username:user.username,role:user.role}, token });
  } else {
    const db = loadDB();
    // local ADMIN_INFO.json fallback (plain-text) for development
    if(username === ADMIN_INFO.admin_username && password === ADMIN_INFO.admin_password){
      // create a simple admin token
      const token = signJwt({ uid:'local-admin', username:ADMIN_INFO.admin_username, role:'admin'});
      return res.status(200).json({ user:{id:'local-admin',username:ADMIN_INFO.admin_username,role:'admin'}, token });
    }
    const user = db.users.find(u=>u.username===username || u.email===username);
    if(!user) return res.status(401).json({error:'Invalid credentials'});
    if(user.is_banned) return res.status(403).json({error:'Account banned'});
    const ok = await comparePassword(password, user.password);
    if(!ok) return res.status(401).json({error:'Invalid credentials'});
    const token = signJwt({ uid:user.id, username:user.username, role:user.role});
    return res.status(200).json({ user:{id:user.id,username:user.username,role:user.role}, token });
  }
}
