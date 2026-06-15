import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createAdminClient } from '@/lib/supabase/admin';
import { safeEqual } from '@/lib/security';

interface SendPayload {
  title: string;
  body: string;
  url?: string;
}

interface PushSub {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function POST(request: Request) {
  const secret = request.headers.get('x-cron-secret');
  if (!safeEqual(secret, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidEmail = process.env.VAPID_EMAIL ?? 'admin@nutrinews.de';

  if (!vapidPublic || !vapidPrivate) {
    return NextResponse.json({ ok: false, reason: 'VAPID keys not configured' });
  }

  webpush.setVapidDetails(`mailto:${vapidEmail}`, vapidPublic, vapidPrivate);

  const { title, body, url } = (await request.json()) as SendPayload;
  const payload = JSON.stringify({ title, body, url: url ?? '/' });

  const supabase = createAdminClient();
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth');

  if (!subs || subs.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, failed: 0 });
  }

  const results = await Promise.allSettled(
    (subs as PushSub[]).map(sub =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      )
    )
  );

  const sent = results.filter(r => r.status === 'fulfilled').length;

  // Remove subscriptions that are permanently invalid (410 Gone / 404 Not Found)
  const expiredEndpoints = (subs as PushSub[])
    .filter((_, i) => {
      const r = results[i];
      if (r.status === 'rejected') {
        const code = (r.reason as { statusCode?: number })?.statusCode;
        return code === 404 || code === 410;
      }
      return false;
    })
    .map(s => s.endpoint);

  if (expiredEndpoints.length > 0) {
    await supabase
      .from('push_subscriptions')
      .delete()
      .in('endpoint', expiredEndpoints);
  }

  return NextResponse.json({ ok: true, sent, failed: results.length - sent });
}
