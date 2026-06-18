export default function PressPage() {
  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20 px-6">
      <div style={{maxWidth:700,margin:"0 auto",textAlign:"center"}}>
        <p style={{fontFamily:"Montserrat,sans-serif",fontSize:9,letterSpacing:"0.3em",textTransform:"uppercase",color:"#C9A84C",marginBottom:16}}>Media</p>
        <h1 style={{fontFamily:"Cormorant Garamond,serif",fontSize:"clamp(2.5rem,5vw,4rem)",fontWeight:300,color:"#F0EAD0",marginBottom:24}}>Press</h1>
        <p style={{color:"#888",lineHeight:1.9,fontSize:15,fontFamily:"Montserrat,sans-serif"}}>Crown Registry is newly launched. There's no press coverage yet — if you're a journalist and want to talk, reach out directly.</p><br/>
        <p style={{color:"#C9A84C",fontFamily:"Montserrat,sans-serif",fontSize:13}}><a href="mailto:press@crownregistry.com" style={{color:"#C9A84C"}}>press@crownregistry.com</a></p>
      </div>
    </div>
  );
}
