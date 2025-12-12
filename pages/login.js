import { useState } from 'react';
export default function Login(){
  const [u,setU]=useState(''); const [p,setP]=useState(''); const [m,setM]=useState('');
  async function submit(e){ e.preventDefault(); const res = await fetch('/api/auth/login',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({username:u,password:p})}); const j = await res.json(); if(!res.ok){ setM(j.error || 'Error'); return;} localStorage.setItem('app_token', j.token); setM('Login OK'); }
  return (<div style={{padding:20}}><h2>Login</h2><form onSubmit={submit}><input placeholder='username' value={u} onChange={e=>setU(e.target.value)} /><br/><input placeholder='password' type='password' value={p} onChange={e=>setP(e.target.value)} /><br/><button>Login</button></form><div>{m}</div></div>);
}
