export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20 px-6">
      <div style={{maxWidth:700,margin:"0 auto"}}>
        <p style={{fontFamily:"Montserrat,sans-serif",fontSize:9,letterSpacing:"0.3em",textTransform:"uppercase",color:"#C9A84C",marginBottom:16}}>For Developers</p>
        <h1 style={{fontFamily:"Cormorant Garamond,serif",fontSize:"clamp(2.5rem,5vw,4rem)",fontWeight:300,color:"#F0EAD0",marginBottom:32}}>API Access</h1>
        <div style={{color:"#888",lineHeight:1.9,fontSize:15,fontFamily:"Montserrat,sans-serif"}}>
          <p>API access for programmatic listing management is planned for Dealer and Enterprise plan subscribers.</p><br/>
          <p>This feature is not yet available. If you're interested in early access, get in touch and we'll notify you when it launches.</p><br/>
          <a href="/contact"><button style={{padding:"14px 32px",background:"transparent",border:"1px solid rgba(201,168,76,0.4)",color:"#C9A84C",fontFamily:"Montserrat,sans-serif",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",cursor:"pointer"}}>Contact Us</button></a>
        </div>
      </div>
    </div>
  );
}
