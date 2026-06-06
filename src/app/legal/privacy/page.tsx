export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 style={{fontFamily:"Georgia,serif", color:"#F0EAD0", fontSize:"2.5rem", fontWeight:300, marginBottom:"2rem"}}>
          Privacy Policy
        </h1>
        <div style={{color:"#666", lineHeight:1.8, fontSize:"14px"}}>
          <p>Last updated: June 2026</p>
          <br/>
          <p>Crown Registry respects your privacy and is committed to protecting your personal data.</p>
          <br/>
          <h2 style={{color:"#C9A84C", fontSize:"1.2rem", marginBottom:"0.5rem"}}>1. Data We Collect</h2>
          <p>We collect information you provide during registration, listings, and transactions.</p>
          <br/>
          <h2 style={{color:"#C9A84C", fontSize:"1.2rem", marginBottom:"0.5rem"}}>2. How We Use Data</h2>
          <p>Your data is used to operate the marketplace, process transactions, and improve our services.</p>
          <br/>
          <h2 style={{color:"#C9A84C", fontSize:"1.2rem", marginBottom:"0.5rem"}}>3. Data Sharing</h2>
          <p>We do not sell your data. We share data only with service providers necessary to operate Crown Registry.</p>
          <br/>
          <h2 style={{color:"#C9A84C", fontSize:"1.2rem", marginBottom:"0.5rem"}}>4. Contact</h2>
          <p>For privacy concerns: privacy@crownregistry.com</p>
        </div>
      </div>
    </div>
  );
}
