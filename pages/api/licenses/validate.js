import { supabaseAdmin } from '../../lib/supabaseServer';
import { loadDB, saveDB } from '../../lib/readWriteDB';

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).end();
  const { code, userId } = req.body || {};
  if(!code) return res.status(400).json({error:'code required'});
  if (supabaseAdmin) {
    const { data: lic } = await supabaseAdmin.from('licenses').select('*').eq('code', code).maybeSingle();
    if(!lic) return res.status(404).json({valid:false,error:'License not found'});
    if(!lic.is_active) return res.status(400).json({valid:false,error:'License not active'});
    if(lic.expires_at && new Date(lic.expires_at) < new Date()) return res.status(400).json({valid:false,error:'License expired'});
    if(userId && !lic.assigned_user_id) await supabaseAdmin.from('licenses').update({assigned_user_id:userId}).eq('id',lic.id);
    return res.status(200).json({valid:true,license:lic});
  } else {
    const db = loadDB();
    const lic = db.licenses.find(l=>l.code===code);
    if(!lic) return res.status(404).json({valid:false,error:'License not found'});
    if(!lic.is_active) return res.status(400).json({valid:false,error:'License not active'});
    if(lic.expires_at && new Date(lic.expires_at) < new Date()) return res.status(400).json({valid:false,error:'License expired'});
    if(userId && !lic.assigned_user_id){ lic.assigned_user_id = userId; saveDB(db); }
    return res.status(200).json({valid:true,license:lic});
  }
}
