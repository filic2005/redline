import { supabase } from './supabaseClient.ts';

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function getCurrentUser(token: string) {
  const { data, error } = await supabase.auth.getUser(token);
  if (error) throw error;
  return data.user;
}