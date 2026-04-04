"use server";

import { createClient } from "@/lib/supabase/server";

export async function createInvite(coachId: string, email?: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invite_tokens")
    .insert({
      coach_id: coachId,
      email: email || null,
    })
    .select("token")
    .single();

  if (error) throw new Error(error.message);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/invite/${data.token}`;
}

export async function validateInvite(token: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invite_tokens")
    .select("*, coach:profiles!invite_tokens_coach_id_fkey(full_name)")
    .eq("token", token)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error || !data) return null;

  return {
    id: data.id as string,
    token: data.token as string,
    coach_id: data.coach_id as string,
    coach_name: (data.coach as { full_name: string } | null)?.full_name ?? "Arthur Armelin",
    email: data.email as string | null,
  };
}

export async function redeemInvite(
  token: string,
  userId: string,
  coachId: string
) {
  const supabase = await createClient();

  // Mark token as used
  await supabase
    .from("invite_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("token", token);

  // Create coach-athlete relationship
  await supabase.from("coach_athlete_relationships").insert({
    coach_id: coachId,
    athlete_id: userId,
    status: "active",
  });
}
