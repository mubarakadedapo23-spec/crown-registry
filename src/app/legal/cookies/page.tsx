export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20 px-6">
      <div style={{maxWidth:800,margin:"0 auto"}}>
        <h1 style={{fontFamily:"Cormorant Garamond,serif",fontSize:"2.5rem",fontWeight:300,color:"#F0EAD0",marginBottom:32}}>Cookie Policy</h1>
        <div style={{color:"#888",lineHeight:1.9,fontSize:14,fontFamily:"Montserrat,sans-serif"}}>
          <p>Crown Registry uses cookies to keep you signed in and to remember basic preferences. We do not sell cookie data to third parties.</p><br/>
          <h2 style={{color:"#C9A84C",fontSize:"1.2rem",marginBottom:8}}>Essential Cookies</h2>
          <p>Required for login sessions and core site functionality. Cannot be disabled.</p><br/>
          <p>Contact: privacy@crownregistry.com</p>
        </div>
      </div>
    </div>
  );
}
