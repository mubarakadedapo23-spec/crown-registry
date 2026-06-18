export default function DealersPage() {
  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20 px-6">
      <div style={{maxWidth:800,margin:"0 auto"}}>
        <p style={{fontFamily:"Montserrat,sans-serif",fontSize:9,letterSpacing:"0.3em",textTransform:"uppercase",color:"#C9A84C",marginBottom:16}}>For Dealers & Agencies</p>
        <h1 style={{fontFamily:"Cormorant Garamond,serif",fontSize:"clamp(2.5rem,5vw,4rem)",fontWeight:300,color:"#F0EAD0",marginBottom:32}}>Dealer Program</h1>
        <div style={{color:"#888",lineHeight:1.9,fontSize:15,fontFamily:"Montserrat,sans-serif"}}>
          <p>Crown Registry's Dealer plan is built for car dealers, aircraft brokers, yacht brokers, and real estate agencies managing multiple listings.</p><br/>
          <h2 style={{color:"#C9A84C",fontSize:"1.3rem",fontFamily:"Cormorant Garamond,serif",fontWeight:300,marginBottom:12}}>What's Included</h2>
          <ul style={{listStyle:"none",padding:0}}>
            {["Up to 500 active listings","Team member accounts","Lead tracking and CRM tools","Bulk inventory management","Priority placement in search results"].map(f => (
              <li key={f} style={{padding:"8px 0",borderBottom:"1px solid rgba(201,168,76,0.06)"}}>✦ {f}</li>
            ))}
          </ul><br/>
          <a href="/auth/register"><button style={{padding:"14px 32px",background:"linear-gradient(135deg,#C9A84C,#8B6914)",color:"#fff",border:"none",fontFamily:"Montserrat,sans-serif",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",cursor:"pointer"}}>Apply as a Dealer</button></a>
        </div>
      </div>
    </div>
  );
}
