import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testAuth() {
  const email = 'fileepcoci05@gmail.com';
  const password = 'password123';

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !signInData.session) {
    console.error('Sign-in error:', signInError?.message);
    return;
  }

  const token = signInData.session.access_token;
  console.log('\nAccess Token:', token);

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError) {
    console.error('Get user error:', userError.message);
    return;
  }

  console.log('\n👤 Current User:', userData.user);
}

testAuth();