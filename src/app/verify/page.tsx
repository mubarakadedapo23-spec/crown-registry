export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20 px-6">
      <div style={{maxWidth:700,margin:"0 auto"}}>
        <p style={{fontFamily:"Montserrat,sans-serif",fontSize:9,letterSpacing:"0.3em",textTransform:"uppercase",color:"#C9A84C",marginBottom:16}}>Trust & Safety</p>
        <h1 style={{fontFamily:"Cormorant Garamond,serif",fontSize:"clamp(2.5rem,5vw,4rem)",fontWeight:300,color:"#F0EAD0",marginBottom:32}}>Seller Verification</h1>
        <div style={{color:"#888",lineHeight:1.9,fontSize:15,fontFamily:"Montserrat,sans-serif"}}>
          <p>Verification helps buyers know who they're dealing with. Verified sellers display a badge on their profile and listings.</p><br/>
          <h2 style={{color:"#C9A84C",fontSize:"1.3rem",fontFamily:"Cormorant Garamond,serif",fontWeight:300,marginBottom:12}}>How to Get Verified</h2>
          <p>1. Complete your seller profile with full name and contact details.</p>
          <p>2. Submit a government-issued ID for individual sellers, or business registration documents for dealers.</p>
          <p>3. Our team reviews submissions, typically within 2–3 business days.</p><br/>
          <a href="/dashboard/seller/verification"><button style={{padding:"14px 32px",background:"linear-gradient(135deg,#C9A84C,#8B6914)",color:"#fff",border:"none",fontFamily:"Montserrat,sans-serif",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",cursor:"pointer"}}>Start Verification</button></a>
        </div>
      </div>
    </div>
  );
}
