export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20 px-6">
      <div style={{maxWidth:700,margin:"0 auto",textAlign:"center"}}>
        <p style={{fontFamily:"Montserrat,sans-serif",fontSize:9,letterSpacing:"0.3em",textTransform:"uppercase",color:"#C9A84C",marginBottom:16}}>Join Us</p>
        <h1 style={{fontFamily:"Cormorant Garamond,serif",fontSize:"clamp(2.5rem,5vw,4rem)",fontWeight:300,color:"#F0EAD0",marginBottom:24}}>Careers</h1>
        <p style={{color:"#888",lineHeight:1.9,fontSize:15,fontFamily:"Montserrat,sans-serif"}}>We don't have any open roles listed right now. Check back soon, or reach out directly if you'd like to introduce yourself.</p><br/>
        <a href="/contact"><button style={{padding:"14px 32px",background:"transparent",border:"1px solid rgba(201,168,76,0.4)",color:"#C9A84C",fontFamily:"Montserrat,sans-serif",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",cursor:"pointer"}}>Get in Touch</button></a>
      </div>
    </div>
  );
}
