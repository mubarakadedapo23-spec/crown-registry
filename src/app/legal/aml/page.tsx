export default function AMLPage() {
  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20 px-6">
      <div style={{maxWidth:800,margin:"0 auto"}}>
        <h1 style={{fontFamily:"Cormorant Garamond,serif",fontSize:"2.5rem",fontWeight:300,color:"#F0EAD0",marginBottom:32}}>Anti-Money Laundering Policy</h1>
        <div style={{color:"#888",lineHeight:1.9,fontSize:14,fontFamily:"Montserrat,sans-serif"}}>
          <p>Crown Registry takes reasonable steps to prevent the platform being used for money laundering, including identity verification for sellers and monitoring of unusual transaction patterns.</p><br/>
          <p>We may request additional documentation for high-value transactions and reserve the right to delay or decline transactions that raise concerns.</p><br/>
          <p>Contact: compliance@crownregistry.com</p>
        </div>
      </div>
    </div>
  );
}
