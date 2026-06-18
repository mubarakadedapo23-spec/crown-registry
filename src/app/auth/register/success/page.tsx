"use client";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function RegisterSuccessPage() {
  return (
    <div style={{minHeight:"100vh",background:"#050505",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{maxWidth:440,textAlign:"center"}}>
        <div style={{width:64,height:64,border:"1px solid rgba(201,168,76,0.4)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px"}}>
          <CheckCircle2 style={{width:28,height:28,color:"#C9A84C"}} />
        </div>
        <h1 style={{fontFamily:"Cormorant Garamond,serif",fontSize:"2.2rem",fontWeight:300,color:"#F0EAD0",marginBottom:12}}>Account Created</h1>
        <p style={{color:"#888",fontFamily:"Montserrat,sans-serif",fontSize:14,lineHeight:1.8,marginBottom:32}}>
          Welcome to Crown Registry. Your account is ready — you can now sign in and start exploring the marketplace.
        </p>
        <Link href="/auth/login">
          <button style={{padding:"14px 36px",background:"linear-gradient(135deg,#C9A84C,#8B6914)",color:"#fff",border:"none",fontFamily:"Montserrat,sans-serif",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",cursor:"pointer"}}>
            Continue to Sign In
          </button>
        </Link>
      </div>
    </div>
  );
}
