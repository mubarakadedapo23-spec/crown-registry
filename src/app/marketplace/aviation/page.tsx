import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/home/FeaturedListings";

export default async function CategoryPage() {
  const listings = await prisma.listing.findMany({
    where: { status: "ACTIVE", category: { in: ["PRIVATE_JETS", "HELICOPTERS"] } },
    take: 24,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    include: {
      images: { take: 1 },
      seller: { select: { id: true, name: true, avatar: true, verificationStatus: true } },
      brand: { select: { name: true, logoUrl: true } },
      _count: { select: { wishlisted: true } },
    },
  });
  return (
    <div className="min-h-screen bg-[#050505] pt-20">
      <div className="bg-[#030303] border-b border-[rgba(201,168,76,0.1)] py-12 px-6">
        <div style={{maxWidth:1280,margin:"0 auto"}}>
          <p style={{fontFamily:"Montserrat,sans-serif",fontSize:9,letterSpacing:"0.3em",textTransform:"uppercase",color:"#C9A84C",marginBottom:8}}>Marketplace</p>
          <h1 style={{fontFamily:"Cormorant Garamond,serif",fontSize:"clamp(2rem,5vw,3.5rem)",fontWeight:300,color:"#F0EAD0"}}>Private Jets & Helicopters</h1>
          <p style={{color:"#666",marginTop:8,fontFamily:"Montserrat,sans-serif",fontSize:13}}>{listings.length} listings available</p>
        </div>
      </div>
      <div style={{maxWidth:1280,margin:"0 auto",padding:"48px 24px"}}>
        {listings.length === 0 ? (
          <div style={{textAlign:"center",padding:"80px 0"}}>
            <p style={{fontFamily:"Cormorant Garamond,serif",fontSize:"1.5rem",color:"#666"}}>No listings yet</p>
            <a href="/listings/new"><button style={{marginTop:20,padding:"12px 32px",background:"linear-gradient(135deg,#C9A84C,#8B6914)",color:"#fff",border:"none",fontFamily:"Montserrat,sans-serif",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",cursor:"pointer"}}>List an Asset</button></a>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:20}}>
            {listings.map((listing, i) => <ListingCard key={listing.id} listing={listing} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
