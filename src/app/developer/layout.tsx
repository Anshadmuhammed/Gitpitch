import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DeveloperLayoutClient } from "@/components/layout/DeveloperLayoutClient";

export default async function DeveloperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  // Check role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (userData?.role !== 'developer') {
    redirect("/dashboard");
  }

  return (
    <DeveloperLayoutClient>
      {children}
    </DeveloperLayoutClient>
  );
}
