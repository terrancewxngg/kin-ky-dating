import { createClient } from "@/lib/supabase-server";
import { getCurrentRoundKey } from "@/lib/constants";
import { redirect } from "next/navigation";
import AdminClient from "./client";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/dashboard");

  const roundKey = getCurrentRoundKey();

  return (
    <AdminClient
      email={user.email!}
      isAdmin={true}
      currentRoundKey={roundKey}
    />
  );
}