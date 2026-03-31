# Nutri News 🐦

> Evidenzbasierte Ernährungsnews für Ernährungstherapeut:innen in Deutschland.

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TailwindCSS
- **Backend & Auth**: Supabase (Postgres, Auth, Storage, Edge Functions)
- **Hosting**: Vercel
- **PWA**: Manifest + Service Worker (installierbar auf iOS/Android)

## Setup

### 1. Supabase

1. Neues Projekt auf [supabase.com](https://supabase.com) anlegen
2. SQL aus `/supabase/schema.sql` im SQL-Editor ausführen

#### Google OAuth einrichten

3. **Google Cloud Console** → [console.cloud.google.com](https://console.cloud.google.com)
   - Neues Projekt anlegen (oder bestehendes nutzen)
   - APIs & Services → OAuth 2.0-Clientdaten → Webanwendung erstellen
   - Autorisierte Weiterleitungs-URIs hinzufügen:
     - `https://<deine-supabase-projekt-id>.supabase.co/auth/v1/callback`
   - **Client-ID** und **Client-Secret** kopieren

4. **Supabase Dashboard** → Authentication → Providers → Google
   - Google aktivieren
   - Client-ID und Client-Secret aus Schritt 3 eintragen
   - Speichern

5. **Supabase Dashboard** → Authentication → URL Configuration
   - **Site URL**: `https://deine-app.vercel.app`
   - **Redirect URLs** (beide eintragen):
     - `https://deine-app.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback`

### 2. Lokale Entwicklung

```bash
npm install
cp .env.local.example .env.local
# .env.local befüllen mit deinen Supabase Keys
npm run dev
```

### 3. Vercel Deployment

1. Repo mit Vercel verbinden
2. Environment Variables setzen:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
3. Deploy!

## Kategorien

19 Fachkategorien inkl. Trends/Lion-Kategorie für Laienpresse.

## Admin

Nur für User mit `role = 'admin'` in der `profiles`-Tabelle. Manuell in Supabase setzen:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'deine@email.de';
```
