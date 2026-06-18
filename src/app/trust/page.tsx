export default function TrustPage() {
  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20 px-6">
      <div style={{maxWidth:800,margin:"0 auto"}}>
        <p style={{fontFamily:"Montserrat,sans-serif",fontSize:9,letterSpacing:"0.3em",textTransform:"uppercase",color:"#C9A84C",marginBottom:16}}>Trust & Safety</p>
        <h1 style={{fontFamily:"Cormorant Garamond,serif",fontSize:"clamp(2.5rem,5vw,4rem)",fontWeight:300,color:"#F0EAD0",marginBottom:32}}>How We Approach Trust</h1>
        <div style={{color:"#888",lineHeight:1.9,fontSize:15,fontFamily:"Montserrat,sans-serif"}}>
          <p>Crown Registry is a new marketplace and we're building trust features from day one.</p><br/>
          <h2 style={{color:"#C9A84C",fontSize:"1.3rem",fontFamily:"Cormorant Garamond,serif",fontWeight:300,marginBottom:12}}>Currently Available</h2>
          <ul style={{listStyle:"none",padding:0}}>
            {["Optional seller identity verification","Encrypted connection (HTTPS/SSL) on all pages","Direct messaging kept on-platform","Payment processing handled by Stripe"].map(f => (
              <li key={f} style={{padding:"8px 0",borderBottom:"1px solid rgba(201,168,76,0.06)"}}>✦ {f}</li>
            ))}
          </ul><br/>
          <h2 style={{color:"#C9A84C",fontSize:"1.3rem",fontFamily:"Cormorant Garamond,serif",fontWeight:300,marginBottom:12}}>Report a Concern</h2>
          <p>If something on the platform doesn't seem right, email <a href="mailto:trust@crownregistry.com" style={{color:"#C9A84C"}}>trust@crownregistry.com</a> directly.</p>
        </div>
      </div>
    </div>
  );
}
