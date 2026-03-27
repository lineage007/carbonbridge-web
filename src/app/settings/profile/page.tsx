'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
const fr = "'Fraunces', serif"; const bg = "'Plus Jakarta Sans', sans-serif"; const mono = "'JetBrains Mono', monospace";
type Tab = 'profile'|'company'|'billing'|'api'|'notifications'|'security'|'team';
const TABS: {key:Tab;label:string}[] = [{key:'profile',label:'My Profile'},{key:'company',label:'Company Details'},{key:'billing',label:'Billing & Plan'},{key:'api',label:'API Keys'},{key:'notifications',label:'Notifications'},{key:'security',label:'Security'},{key:'team',label:'Team Members'}];
function Inp({label,value,type='text'}:{label:string;value:string;type?:string}) { return <div style={{marginBottom:'16px'}}><label style={{fontFamily:bg,fontSize:'12px',fontWeight:600,color:'#8B8178',display:'block',marginBottom:'6px'}}>{label}</label><input defaultValue={value} type={type} style={{width:'100%',padding:'10px 14px',border:'1px solid #E8E2D8',borderRadius:'8px',fontFamily:bg,fontSize:'13px',color:'#1A1714',background:'#fff',outline:'none'}}/></div>; }
function Tog({label,desc,on:init=false}:{label:string;desc?:string;on?:boolean}) { const [on,set]=useState(init); return <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #F0EDE6'}}><div><div style={{fontFamily:bg,fontSize:'13px',fontWeight:600,color:'#1A1714'}}>{label}</div>{desc&&<div style={{fontFamily:bg,fontSize:'11px',color:'#8B8178',marginTop:'2px'}}>{desc}</div>}</div><button onClick={()=>set(!on)} style={{width:'42px',height:'24px',borderRadius:'12px',border:'none',cursor:'pointer',background:on?'#2D6A4F':'#D5CFC4',position:'relative'}}><div style={{width:'18px',height:'18px',borderRadius:'50%',background:'#fff',position:'absolute',top:'3px',left:on?'21px':'3px',transition:'left 0.2s',boxShadow:'0 1px 3px rgba(0,0,0,0.15)'}}/></button></div>; }
export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/settings/profile');
    }
  }, [user, loading, router]);

  const [tab,setTab]=useState<Tab>('profile');

  if (loading || !user) return null;
  const Card=({children,title}:{children:React.ReactNode;title:string})=>(<div style={{background:'#fff',border:'1px solid #E8E2D8',borderRadius:'12px',padding:'28px',marginBottom:'16px'}}><h2 style={{fontFamily:fr,fontSize:'18px',fontWeight:600,color:'#1A1714',marginBottom:'20px'}}>{title}</h2>{children}</div>);
  const Btn=({children}:{children:React.ReactNode})=>(<button style={{fontFamily:bg,fontSize:'13px',fontWeight:600,color:'#1B3A2D',background:'#C9A96E',border:'none',padding:'10px 24px',borderRadius:'8px',cursor:'pointer'}}>{children}</button>);
  return (
    <div style={{minHeight:'100vh',background:'#FAFAF7'}}>
      <Navbar />
      
      <main style={{flex:1,background:'#FAFAF7',overflow:'auto'}}>
        <div style={{padding:'32px 28px',maxWidth:'900px'}}>
          <h1 style={{fontFamily:fr,fontSize:'28px',fontWeight:600,color:'#1A1714',marginBottom:'4px'}}>Settings</h1>
          <p style={{fontFamily:bg,fontSize:'13px',color:'#8B8178',marginBottom:'28px'}}>Manage your account, company, billing, and preferences.</p>
          <div style={{display:'flex',gap:'24px'}}>
            <div style={{width:'200px',flexShrink:0}}>
              {TABS.map(t=>(<button key={t.key} onClick={()=>setTab(t.key)} style={{display:'block',width:'100%',padding:'10px 14px',borderRadius:'8px',border:'none',cursor:'pointer',fontFamily:bg,fontSize:'13px',textAlign:'left',fontWeight:tab===t.key?600:400,color:tab===t.key?'#1B3A2D':'#8B8178',background:tab===t.key?'rgba(27,58,45,0.06)':'transparent',marginBottom:'2px'}}>{t.label}</button>))}
            </div>
            <div style={{flex:1,maxWidth:'640px'}}>
              {tab==='profile'&&<Card title="Personal Information"><div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'24px'}}><div style={{width:'64px',height:'64px',borderRadius:'50%',background:'linear-gradient(135deg,#1B3A2D,#2D6A4F)',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontFamily:bg,fontSize:'22px',fontWeight:700,color:'#C9A96E'}}>E</span></div><div><div style={{fontFamily:bg,fontSize:'14px',fontWeight:600,color:'#1A1714'}}>Upload Photo</div><div style={{fontFamily:bg,fontSize:'11px',color:'#8B8178'}}>JPG, PNG · Max 2MB</div></div></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 16px'}}><Inp label="First Name" value="Khalid"/><Inp label="Last Name" value="Al Mansouri"/></div><Inp label="Email" value="k.almansouri@emiratesindustrial.ae"/><Inp label="Phone" value="+971 50 123 4567"/><Inp label="Job Title" value="Head of Sustainability"/><div style={{display:'flex',justifyContent:'flex-end',marginTop:'8px'}}><Btn>Save Changes</Btn></div></Card>}
              {tab==='company'&&<Card title="Company Information"><Inp label="Legal Entity Name" value="Emirates Industrial Group PJSC"/><Inp label="Trade Licence Number" value="123456"/><Inp label="Tax Registration Number (TRN)" value="100234567890003"/><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 16px'}}><Inp label="Industry" value="Industrial Manufacturing"/><Inp label="Employees" value="2,500+"/></div><Inp label="Registered Address" value="Floor 24, Central Tower, DIFC, Dubai, UAE"/><div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0 16px'}}><Inp label="City" value="Dubai"/><Inp label="Country" value="UAE"/><Inp label="PO Box" value="504821"/></div><Inp label="Website" value="https://emiratesindustrial.ae"/><div style={{display:'flex',justifyContent:'flex-end',marginTop:'8px'}}><Btn>Save Changes</Btn></div></Card>}
              {tab==='billing'&&<><Card title="Current Plan"><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}><div/><span style={{fontFamily:bg,fontSize:'10px',fontWeight:700,padding:'4px 10px',borderRadius:'4px',background:'rgba(201,169,110,0.1)',color:'#C9A96E'}}>PREMIUM</span></div><div style={{fontFamily:mono,fontSize:'28px',fontWeight:700,color:'#1A1714',marginBottom:'4px'}}>$499<span style={{fontSize:'14px',color:'#8B8178',fontWeight:400}}>/month</span></div><p style={{fontFamily:bg,fontSize:'12px',color:'#8B8178',marginBottom:'16px'}}>Unlimited access. Next billing: April 1, 2026.</p></Card><Card title="Payment Method"><div style={{display:'flex',alignItems:'center',gap:'14px',padding:'14px',background:'#FAFAF7',borderRadius:'8px'}}><div style={{width:'40px',height:'28px',background:'#1A1714',borderRadius:'4px',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontFamily:mono,fontSize:'10px',color:'#fff',fontWeight:700}}>VISA</span></div><div><div style={{fontFamily:bg,fontSize:'13px',fontWeight:600,color:'#1A1714'}}>•••• •••• •••• 4821</div><div style={{fontFamily:bg,fontSize:'11px',color:'#8B8178'}}>Expires 08/2028</div></div></div></Card></>}
              {tab==='api'&&<Card title="API Keys"><p style={{fontFamily:bg,fontSize:'12px',color:'#8B8178',marginBottom:'20px'}}>Integrate CarbonBridge with your systems.</p><div style={{padding:'14px',background:'#FAFAF7',borderRadius:'8px',marginBottom:'16px'}}><div style={{fontFamily:bg,fontSize:'13px',fontWeight:600,color:'#1A1714'}}>Production Key</div><div style={{fontFamily:mono,fontSize:'12px',color:'#8B8178',marginTop:'4px'}}>cb_live_••••••••••••••••mK9x</div></div><Btn>Generate New Key</Btn></Card>}
              {tab==='notifications'&&<Card title="Notification Preferences"><Tog label="Order Confirmations" desc="Email when an order is confirmed" on={true}/><Tog label="Price Alerts" desc="Notified when credit prices change" on={true}/><Tog label="Compliance Deadlines" desc="Reminders before NRCC, CBAM, CORSIA deadlines" on={true}/><Tog label="New Listings" desc="Alert when matching credits are listed"/><Tog label="Market Reports" desc="Weekly market digest" on={true}/></Card>}
              {tab==='security'&&<><Card title="Password"><Inp label="Current Password" value="" type="password"/><Inp label="New Password" value="" type="password"/><Inp label="Confirm Password" value="" type="password"/><Btn>Update Password</Btn></Card><Card title="Two-Factor Authentication"><Tog label="Enable 2FA" desc="Authenticator app for login"/></Card></>}
              {tab==='team'&&<Card title="Team Members"><div style={{display:'flex',justifyContent:'flex-end',marginBottom:'16px'}}><Btn>＋ Invite</Btn></div>{[{n:'Khalid Al Mansouri',e:'k.almansouri@emiratesindustrial.ae',r:'Admin'},{n:'Sarah Chen',e:'s.chen@emiratesindustrial.ae',r:'Buyer'},{n:'Mohammed Al Rashid',e:'m.alrashid@emiratesindustrial.ae',r:'Viewer'}].map(m=>(<div key={m.e} style={{display:'flex',alignItems:'center',gap:'14px',padding:'12px 0',borderBottom:'1px solid #F0EDE6'}}><div style={{width:'36px',height:'36px',borderRadius:'50%',background:'#1B3A2D',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontFamily:bg,fontSize:'12px',fontWeight:700,color:'#C9A96E'}}>{m.n[0]}</span></div><div style={{flex:1}}><div style={{fontFamily:bg,fontSize:'13px',fontWeight:600,color:'#1A1714'}}>{m.n}</div><div style={{fontFamily:bg,fontSize:'11px',color:'#8B8178'}}>{m.e}</div></div><span style={{fontFamily:bg,fontSize:'11px',fontWeight:600,padding:'3px 8px',borderRadius:'4px',background:m.r==='Admin'?'rgba(201,169,110,0.1)':'rgba(0,0,0,0.04)',color:m.r==='Admin'?'#C9A96E':'#8B8178'}}>{m.r}</span></div>))}</Card>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
