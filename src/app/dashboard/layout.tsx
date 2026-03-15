import { Sidebar } from "@/components/layout/Sidebar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
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
