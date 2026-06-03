import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/auth/login?callbackUrl=/dashboard/buyer");

  return (
    <div className="flex h-screen bg-crown-obsidian overflow-hidden">
      <DashboardSidebar role={(session.user as any)?.role ?? "BUYER"} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardTopbar user={session.user} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
