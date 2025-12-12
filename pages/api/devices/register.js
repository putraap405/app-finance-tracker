import { supabaseAdmin } from '../../lib/supabaseServer';
import { verifyJwt } from '../../lib/auth';
import { loadDB, saveDB } from '../../lib/readWriteDB';

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).end();
  const token = (req.headers.authorization||'').replace('Bearer ','');
  const payload = verifyJwt(token);
  if(!payload) return res.status(401).json({error:'Unauthorized'});
  const { deviceId, deviceInfo } = req.body || {};
  if(!deviceId) return res.status(400).json({error:'deviceId required'});

  if (supabaseAdmin) {
    // server-side supabase logic omitted here for brevity - assume implemented similarly
    const { data: user } = await supabaseAdmin.from('users').select('id,role').eq('id', payload.uid).single();
    if(!user) return res.status(401).json({error:'User not found'});
    const { data: existing } = await supabaseAdmin.from('devices').select('*').eq('user_id', user.id);
    const found = existing && existing.find(d=>d.device_id===deviceId);
    if(found){
      await supabaseAdmin.from('devices').update({ last_seen: new Date(), device_info: deviceInfo }).eq('id', found.id);
      return res.status(200).json({ok:true, message:'Device updated'});
    }
    if(existing.length>=2) return res.status(403).json({error:'Device limit reached'});
    await supabaseAdmin.from('devices').insert([{user_id:user.id, device_id:deviceId, device_info:deviceInfo}]);
    return res.status(201).json({ok:true});
  } else {
    const db = loadDB();
    const user = db.users.find(u=>u.id===payload.uid);
    if(!user) return res.status(401).json({error:'User not found'});
    const existing = db.devices.filter(d=>d.user_id===user.id);
    const found = existing.find(d=>d.device_id===deviceId);
    if(found){
      found.last_seen = new Date().toISOString();
      found.device_info = deviceInfo;
      saveDB(db);
      return res.status(200).json({ok:true});
    }
    if(existing.length>=2) return res.status(403).json({error:'Device limit reached'});
    db.devices.push({ id:'dev-'+Date.now(), user_id:user.id, device_id:deviceId, device_info:deviceInfo, created_at:new Date().toISOString(), last_seen:new Date().toISOString()});
    saveDB(db);
    return res.status(201).json({ok:true});
  }
}
