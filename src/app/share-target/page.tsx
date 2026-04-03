import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: Promise<{ title?: string; text?: string; url?: string }>;
}

export default async function ShareTargetPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const url = params.url ?? params.text ?? '';

  // Check if it's a card URL like /card/<uuid>
  const cardMatch = url.match(/\/card\/([0-9a-f-]{36})/i);
  if (cardMatch) {
    redirect(`/card/${cardMatch[1]}`);
  }

  // Fall back to search with title or text
  const query = params.title ?? params.text ?? '';
  if (query.trim()) {
    redirect(`/?q=${encodeURIComponent(query.trim())}`);
  }

  redirect('/');
}
