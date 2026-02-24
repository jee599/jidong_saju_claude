// src/lib/auth/helpers.ts — Auth utility functions

import { getSupabaseBrowser } from "@/lib/db/supabase";

/**
 * Send a magic link login email via Supabase Auth.
 */
export async function sendMagicLink(email: string): Promise<{ error?: string }> {
  const supabase = getSupabaseBrowser();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }
  return {};
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  const supabase = getSupabaseBrowser();
  await supabase.auth.signOut();
}

/**
 * Get current user session (client-side).
 */
export async function getCurrentUser() {
  const supabase = getSupabaseBrowser();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Get current session (client-side).
 */
export async function getSession() {
  const supabase = getSupabaseBrowser();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
