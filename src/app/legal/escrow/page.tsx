export default function EscrowPage() {
  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20 px-6">
      <div style={{maxWidth:800,margin:"0 auto"}}>
        <h1 style={{fontFamily:"Cormorant Garamond,serif",fontSize:"2.5rem",fontWeight:300,color:"#F0EAD0",marginBottom:32}}>Escrow Terms</h1>
        <div style={{color:"#888",lineHeight:1.9,fontSize:14,fontFamily:"Montserrat,sans-serif"}}>
          <p>For purchases made through Crown Registry, payment is processed via Stripe and held until the buyer confirms delivery, at which point it is released to the seller minus commission.</p><br/>
          <h2 style={{color:"#C9A84C",fontSize:"1.2rem",marginBottom:8}}>How It Works</h2>
          <p>1. Buyer submits payment through Stripe checkout.</p>
          <p>2. Seller is notified and arranges delivery.</p>
          <p>3. Buyer confirms receipt.</p>
          <p>4. Funds are released to the seller.</p><br/>
          <p>Contact: support@crownregistry.com</p>
        </div>
      </div>
    </div>
  );
}
