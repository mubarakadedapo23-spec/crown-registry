import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Users, Search, Shield, Ban } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; role?: string; status?: string; page?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  if (!["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes((session.user as any).role)) {
    redirect("/dashboard/buyer");
  }

  const page = Number(searchParams.page ?? 1);
  const limit = 25;

  const where: any = {
    ...(searchParams.q
      ? {
          OR: [
            { email: { contains: searchParams.q, mode: "insensitive" } },
            { name: { contains: searchParams.q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(searchParams.role ? { role: searchParams.role } : {}),
    ...(searchParams.status ? { status: searchParams.status } : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
      select: {
        id: true, name: true, email: true, role: true, status: true,
        verificationStatus: true, createdAt: true, totalListings: true,
        country: true, emailVerified: true,
        _count: { select: { listings: true, orders: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const ROLE_BADGE: Record<string, string> = {
    BUYER: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    SELLER: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    DEALER: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    AGENCY: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    MODERATOR: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    ADMIN: "text-crown-gold bg-crown-gold/10 border-crown-gold/20",
    SUPER_ADMIN: "text-red-400 bg-red-400/10 border-red-400/20",
  };

  const STATUS_BADGE: Record<string, string> = {
    ACTIVE: "text-emerald-400",
    PENDING: "text-amber-400",
    SUSPENDED: "text-orange-400",
    BANNED: "text-red-400",
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-crown-gold mb-1">Admin Panel</p>
          <h1 className="font-serif text-2xl text-crown-ivory">User Management</h1>
          <p className="font-sans text-crown-ash text-xs mt-1">{total.toLocaleString()} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <form className="flex items-center gap-2 border border-crown-gold/20 bg-crown-obsidian-light px-3 py-2 flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-crown-ash shrink-0" />
          <input
            name="q"
            defaultValue={searchParams.q}
            placeholder="Search by name or email..."
            className="bg-transparent border-none outline-none text-crown-ivory font-sans text-xs flex-1 placeholder:text-crown-ash/40"
          />
        </form>
        {["BUYER", "SELLER", "DEALER", "ADMIN"].map((role) => (
          <a
            key={role}
            href={`/dashboard/admin/users?role=${role}`}
            className={`px-3 py-2 border font-sans text-[9px] tracking-widest uppercase transition-all ${
              searchParams.role === role
                ? "border-crown-gold bg-crown-gold/10 text-crown-gold"
                : "border-crown-gold/15 text-crown-ash hover:border-crown-gold/40"
            }`}
          >
            {role}
          </a>
        ))}
        {(searchParams.role || searchParams.q) && (
          <a href="/dashboard/admin/users"
             className="px-3 py-2 border border-red-400/20 text-red-400 font-sans text-[9px] tracking-widest uppercase">
            Clear
          </a>
        )}
      </div>

      {/* Table */}
      <div className="luxury-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-crown-gold/10">
                {["User", "Role", "Status", "Verified", "Listings", "Country", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-sans text-[8px] tracking-[0.2em] uppercase text-crown-ash/50">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-crown-gold/6 hover:bg-crown-gold/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-sans text-xs text-crown-ivory">{user.name ?? "—"}</p>
                      <p className="font-sans text-[9px] text-crown-ash/50">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 font-sans text-[8px] tracking-widest uppercase border ${ROLE_BADGE[user.role] ?? ""}`}>
                      {user.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-sans text-[9px] tracking-widest uppercase ${STATUS_BADGE[user.status] ?? "text-crown-ash"}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-sans text-[9px] ${user.verificationStatus === "VERIFIED" ? "text-emerald-400" : "text-crown-ash/40"}`}>
                      {user.verificationStatus === "VERIFIED" ? "✓ Verified" : user.verificationStatus.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans text-xs text-crown-ash">{user._count.listings}</td>
                  <td className="px-4 py-3 font-sans text-xs text-crown-ash">{user.country ?? "—"}</td>
                  <td className="px-4 py-3 font-sans text-[9px] text-crown-ash/50">{formatRelativeTime(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button className="w-7 h-7 border border-crown-gold/15 flex items-center justify-center
                                         text-crown-ash hover:text-crown-gold hover:border-crown-gold/40 transition-all"
                              title="View details">
                        <Shield className="w-3 h-3" />
                      </button>
                      {user.status === "ACTIVE" && (
                        <button className="w-7 h-7 border border-red-400/15 flex items-center justify-center
                                           text-crown-ash hover:text-red-400 hover:border-red-400/40 transition-all"
                                title="Suspend user">
                          <Ban className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-crown-gold/10">
          <p className="font-sans text-[9px] text-crown-ash/50">
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total.toLocaleString()}
          </p>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(Math.ceil(total / limit), 10) }, (_, i) => i + 1).map((p) => (
              <a key={p}
                 href={`/dashboard/admin/users?page=${p}${searchParams.role ? `&role=${searchParams.role}` : ""}${searchParams.q ? `&q=${searchParams.q}` : ""}`}
                 className={`w-7 h-7 flex items-center justify-center font-sans text-xs border transition-all ${
                   p === page ? "border-crown-gold bg-crown-gold/10 text-crown-gold" : "border-crown-gold/15 text-crown-ash hover:border-crown-gold/40"
                 }`}>
                {p}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
