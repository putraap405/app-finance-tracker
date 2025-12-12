import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
const MainApp = dynamic(()=>import('../components/MainApp'), { ssr:false });

export default function AppPage(){
  const [token,setToken]=useState(null);
  useEffect(()=>{ setToken(localStorage.getItem('app_token')); },[]);
  if(!token) return <div style={{padding:20}}>Not logged in. Go to <a href="/login">Login</a></div>;
  return <MainApp />;
}
