import { Sidebar } from "@/components/layout/Sidebar";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#0a0a08]">
        {children}
      </main>
    </div>
  );
}
