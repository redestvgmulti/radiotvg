

# RadioTVG — Corrected Implementation Plan

## Audit Results

- **AudioEngine**: Mounted at App root, supports HLS/YouTube/direct streams with full error recovery. No changes needed.
- **Ads table**: Structure confirmed — has `id`, `name`, `media_url`, `media_type`, `link_url`, `display_duration`, `station_ids`, `is_active`, `sort_order`.
- **`redeem_reward` function**: Exists, deducts points and inserts into `redemptions`. Needs coupon_code generation added.
- **`radio_settings`**: Used for `is_live` with realtime subscription. Ready for `whatsapp_number`.
- **Legacy cleanup (SponsorCarousel, sponsors, video_is_live)**: Already clean — no references found.
- **LiveBadge**: Imported in `AudioTab.tsx` (line 5) and `PersistentPlayer.tsx` (line 4), but **not actually used** in either component's JSX. Both use inline badge markup instead. Safe to remove imports.

---

## Phase 1 — Database Migrations

### 1A. Create `avatars` storage bucket
Create bucket `avatars` (public). Storage policies on `storage.objects`:
- **Upload**: authenticated, `bucket_id = 'avatars'` AND `auth.uid()::text = (storage.foldername(name))[1]`
- **Public read**: `bucket_id = 'avatars'`

### 1B. Insert `whatsapp_number` setting
Insert into `radio_settings`: `key='whatsapp_number', value='559999999999', label='WhatsApp', category='contato'`

### 1C. Add `coupon_code` to redemptions
```sql
ALTER TABLE redemptions ADD COLUMN coupon_code text;
```

### 1D. Update `redeem_reward` function
Add coupon generation using random hash format:
```sql
coupon_code := 'TVG-' || to_char(now(),'YYYY') || '-' || upper(substr(md5(random()::text),1,4));
```
Insert `coupon_code` into the redemptions row.

### 1E. Create `get_coupon_export()` function
```sql
CREATE FUNCTION get_coupon_export()
RETURNS TABLE(display_name text, email varchar, reward_name text, coupon_code text, redeemed_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.display_name, u.email, r.name, rd.coupon_code, rd.redeemed_at
  FROM redemptions rd
  JOIN profiles p ON p.user_id = rd.user_id
  JOIN rewards r ON r.id = rd.reward_id
  JOIN auth.users u ON u.id = rd.user_id
  ORDER BY rd.redeemed_at DESC;
$$;
```

---

## Phase 2 — UI Components

### 2A. AppHeader (`src/components/AppHeader.tsx`)
- Sticky, 64px, dark blur background
- Left: Radio TVG logo
- Right: WhatsApp button (fetches `whatsapp_number` from `radio_settings` dynamically)
- Rendered in `AppLayout` on all public routes

### 2B. Remove PersistentPlayer
- Remove `<PersistentPlayer />` from `App.tsx`
- AudioEngine stays mounted at root — playback continues across pages
- Player UI only exists in AudioTab hero section

### 2C. Profile Photo Upload (PerfilTab)
- Add camera overlay on avatar
- File picker: jpg/png/webp, max 2MB
- Upload path: `avatars/{user_id}/avatar.webp`
- Update `profiles.avatar_url`

### 2D. Shared ads hook (`src/hooks/useAdsRotation.ts`)
Extract rotation logic from `AdDisplay` into a shared hook:
```ts
useAdsRotation(stationId?: string) → { currentAd, allAds }
```
Both `AdDisplay` and `AdFrame` consume this hook.

### 2E. AdFrame component (`src/components/AdFrame.tsx`)
- 16:9 aspect ratio via `aspect-ratio: 16/9`
- Uses `useAdsRotation` hook
- Placed below radio player in AudioTab

### 2F. Three ad positions in AudioTab
1. **AdFrame** (16:9) — below hero/player
2. **AdDisplay** (mid-content) — between "Ao Vivo Agora" and "Próximos"
3. **Optional footer banner** — above bottom nav, only if ads available

### 2G. Reward info card
Add to both `PerfilTab` and `RewardsTab`:
> "A cada 60 minutos ouvindo a rádio você ganha 10 pontos."

### 2H. Export Coupons button (AdminRewards)
- Add "Exportar Cupons" button
- Calls `supabase.rpc('get_coupon_export')`
- Converts to CSV client-side
- Downloads as `cupons_resgatados.csv`

---

## Phase 3 — PWA & Push

### 3A. PWA Manifest (`public/manifest.json`)
- `display: standalone`, `background_color: #0B0F19`, `theme_color: #0B0F19`
- Icons: 192x192 and 512x512
- Add `<link rel="manifest">` and `<meta name="theme-color">` to `index.html`

### 3B. InstallAppPrompt (`src/components/InstallAppPrompt.tsx`)
- Listen for `beforeinstallprompt`
- Modal: "Instalar aplicativo Rádio TVG" with "Instalar" / "Agora não"
- Store dismissal in `localStorage`

### 3C. OneSignal (`src/lib/onesignal.ts`)
- Guard: `if (typeof window !== "undefined")`
- Singleton initialization (flag to prevent double-init)
- Add SDK script to `index.html`
- Permission prompt logic: track continuous listening duration via `useRadioStore.isPlaying`, start timer on play, reset on pause, prompt after 30 seconds continuous
- **Needs `ONESIGNAL_APP_ID`** — will set up structure first, add ID later

---

## Phase 4 — Cleanup

- Remove unused `LiveBadge` import from `AudioTab.tsx` (line 5) and `PersistentPlayer.tsx` (line 4)
- Remove hardcoded WhatsApp link from `AudioTab.tsx` (line 157) — replaced by AppHeader dynamic button
- SponsorCarousel/sponsors/video_is_live: already clean, no action needed

---

## Files Summary

**New files:**
- `src/components/AppHeader.tsx`
- `src/components/AdFrame.tsx`
- `src/components/InstallAppPrompt.tsx`
- `src/hooks/useAdsRotation.ts`
- `src/lib/onesignal.ts`
- `public/manifest.json`

**Modified files:**
- `src/App.tsx` — add AppHeader, remove PersistentPlayer, add InstallAppPrompt
- `src/pages/AudioTab.tsx` — add AdFrame, remove hardcoded WhatsApp, remove LiveBadge import, add ad positions
- `src/pages/PerfilTab.tsx` — add avatar upload, add points info card
- `src/pages/RewardsTab.tsx` — add points info card
- `src/pages/AdminRewards.tsx` — add export coupons button
- `src/components/AdDisplay.tsx` — refactor to use `useAdsRotation` hook
- `index.html` — add manifest link, theme-color meta, OneSignal script

**Database migrations:**
- Create `avatars` bucket + storage.objects policies
- Insert `whatsapp_number` setting
- Add `coupon_code` column to redemptions
- Update `redeem_reward` function with coupon generation
- Create `get_coupon_export` security definer function

