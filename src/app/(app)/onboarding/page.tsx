import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import OnboardingClient from './OnboardingClient';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Check if user already completed onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('preferred_categories')
    .eq('id', user.id)
    .single();

  if (profile?.preferred_categories && profile.preferred_categories.length > 0) redirect('/');

  // Load channels for step 3
  const { data: channels } = await supabase
    .from('channels')
    .select('id, slug, name, emoji, description')
    .order('name')
    .limit(8);

  return <OnboardingClient channels={channels ?? []} />;
}
