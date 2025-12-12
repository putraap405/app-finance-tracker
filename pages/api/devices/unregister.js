import { supabaseAdmin } from '../../lib/supabaseServer';
import { verifyJwt } from '../../lib/auth';
import { loadDB, saveDB } from '../../lib/readWriteDB';

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).end();
  const token = (req.headers.authorization||'').replace('Bearer ','');
  const payload = verifyJwt(token); if(!payload) return res.status(401).json({error:'Unauthorized'});
  const { deviceId } = req.body || {};
  if(!deviceId) return res.status(400).json({error:'deviceId required'});

  if (supabaseAdmin) {
    await supabaseAdmin.from('devices').delete().match({ user_id: payload.uid, device_id: deviceId });
    return res.status(200).json({ok:true});
  } else {
    const db = loadDB();
    db.devices = db.devices.filter(d=>!(d.user_id===payload.uid && d.device_id===deviceId));
    saveDB(db);
    return res.status(200).json({ok:true});
  }
}
