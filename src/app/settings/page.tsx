import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import SettingsClient from "./client";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("is_admin, photo_url, instagram").eq("id", user.id).single();

  return (
    <SettingsClient
      userId={user.id}
      email={user.email!}
      isAdmin={profile?.is_admin || false}
      photoUrl={profile?.photo_url || null}
      instagram={profile?.instagram || ""}
    />
  );
}