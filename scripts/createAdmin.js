import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if(!url || !key){ console.error('Set env SUPABASE_URL and SUPABASE_SERVICE_KEY'); process.exit(1); }
const supabase = createClient(url, key);
async function run(){
  const username='admin'; const email='admin@yourdomain.com'; const pass='Admin@12345';
  const hash = await bcrypt.hash(pass,10);
  const { error } = await supabase.from('users').insert([{username,email,password:hash,role:'admin'}]);
  if(error) console.error(error); else console.log('Admin created:',username,pass);
}
run();
