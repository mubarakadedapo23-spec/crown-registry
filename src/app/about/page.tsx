export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20 px-6">
      <div style={{maxWidth:800,margin:"0 auto"}}>
        <p style={{fontFamily:"Montserrat,sans-serif",fontSize:9,letterSpacing:"0.3em",textTransform:"uppercase",color:"#C9A84C",marginBottom:16}}>Our Story</p>
        <h1 style={{fontFamily:"Cormorant Garamond,serif",fontSize:"clamp(2.5rem,5vw,4rem)",fontWeight:300,color:"#F0EAD0",marginBottom:32}}>About Crown Registry</h1>
        <div style={{color:"#888",lineHeight:1.9,fontSize:15,fontFamily:"Montserrat,sans-serif"}}>
          <p>Crown Registry is a marketplace built to connect buyers and sellers of luxury assets — from cars and watches to real estate and yachts.</p><br/>
          <p>We're newly launched and growing. Every listing is created by a real seller, and every feature you see is actively being built and improved.</p><br/>
          <h2 style={{color:"#C9A84C",fontSize:"1.5rem",fontFamily:"Cormorant Garamond,serif",fontWeight:300,marginBottom:12}}>Get In Touch</h2>
          <p>Questions, feedback, or interested in listing an asset? <a href="/contact" style={{color:"#C9A84C"}}>Contact us</a>.</p>
        </div>
      </div>
    </div>
  );
}
