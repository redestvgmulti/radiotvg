
# Rádio TVG -- Senior Engineering Refactor Plan

This is a structural architecture refactor across 8 phases to transform the current app into a scalable, Spotify-grade streaming architecture.

---

## Phase 1 -- Core Playback Architecture (CRITICAL)

**Problem**: Audio lives inside `HeroPlayer.tsx`, which unmounts on tab navigation. Playback stops when the user switches tabs.

**Solution**: Extract audio logic into a persistent `AudioEngine` component mounted at the `App.tsx` root, outside of `<Routes>`. `HeroPlayer` becomes UI-only.

### New files
- `src/components/AudioEngine.tsx` -- Persistent component (renders nothing visible). Owns the `<audio>` element and HLS instance. Subscribes to `useRadioStore` for `streamUrl`, `isPlaying`, `volume`, `currentEnvironmentSlug`. Handles:
  - HLS instance creation/destruction on environment switch
  - Play/pause sync via store subscription
  - Volume sync
  - Uses refs for `isPlaying` to avoid stale closures in HLS callbacks
- `src/components/PlaybackController.tsx` -- Coordinates audio vs video. Rules:
  - When video player opens, pause audio (store `wasPlaying` flag)
  - When video closes, resume audio if `wasPlaying`
  - Reads a new `isVideoActive` flag from a new `usePlaybackStore` or added to `useRadioStore`

### Modified files
- `src/stores/useRadioStore.ts` -- Add `isVideoActive`, `setVideoActive(bool)`, and `previouslyPlaying` state
- `src/App.tsx` -- Mount `<AudioEngine />` and `<PlaybackController />` before `<AppLayout />`
- `src/components/HeroPlayer.tsx` -- Remove all audio/HLS logic. Remove `audioRef`, `hlsRef`, and all `useEffect` hooks related to audio. Keep only: image, visualizer bars, track info, play/pause/volume controls (which call store actions)
- `src/pages/VideoTab.tsx` -- Call `setVideoActive(true)` when opening video player, `setVideoActive(false)` on close

---

## Phase 2 -- Live State Fix

**Problem**: `isLive: true` is hardcoded in the store. `LiveBadge` always shows.

**Solution**: Fetch `isLive` from `radio_settings` table (key: `video_is_live`) and subscribe to realtime changes.

### Modified files
- `src/stores/useRadioStore.ts` -- Change `isLive` default to `false`. Add `loadLiveStatus()` that fetches from `radio_settings` where `key = 'video_is_live'`. Add realtime subscription to `radio_settings` table for live updates.
- `src/components/AudioEngine.tsx` -- Call `loadLiveStatus()` on mount
- Database migration: Enable realtime on `radio_settings` table (`ALTER PUBLICATION supabase_realtime ADD TABLE public.radio_settings;`)

---

## Phase 3 -- Admin Architecture

**Problem**: Every admin page independently checks auth in `useEffect`. Content flashes before redirect. Duplicated header/back-button patterns.

**Solution**: Create `AdminLayout` wrapper component.

### New files
- `src/components/AdminLayout.tsx` -- Shared layout wrapper for all admin routes. Responsibilities:
  - Check session + admin role on mount
  - Show loading spinner while checking
  - Redirect to `/admin/login` if unauthorized
  - Render shared admin header with user email and logout
  - Accept `title`, `subtitle`, `headerActions` props
  - Force light theme via `document.documentElement.classList.remove('dark')` on mount

### Modified files
- `src/App.tsx` -- Wrap admin routes (except `/admin/login`) with `<AdminLayout>`
- `src/pages/AdminDashboard.tsx` -- Remove auth check `useEffect`, remove header/logout. Use `AdminLayout`
- `src/pages/AdminStreaming.tsx` -- Remove auth check pattern, use `AdminLayout`
- `src/pages/AdminVideo.tsx` -- Same cleanup
- `src/pages/AdminSponsors.tsx` -- Same cleanup
- `src/pages/AdminPrograms.tsx` -- Same cleanup
- `src/pages/AdminUsers.tsx` -- Same cleanup
- `src/pages/AdminStats.tsx` -- Same cleanup
- `src/pages/AdminConfig.tsx` -- Same cleanup

---

## Phase 4 -- Media Session API

**Problem**: No lock screen controls or background playback metadata on mobile.

**Solution**: Integrate Media Session API into `AudioEngine`.

### Modified files
- `src/components/AudioEngine.tsx` -- Add Media Session integration:
  - Set `navigator.mediaSession.metadata` with title, artist, album, artwork (from environment image)
  - Set action handlers: `play`, `pause`, `previoustrack` (prev environment), `nexttrack` (next environment)
  - Update metadata on environment change

---

## Phase 5 -- Cleanup

### Delete files
- `src/components/AudioPlayerCard.tsx` -- Duplicate of HeroPlayer, imported nowhere
- `src/pages/Index.tsx` -- Lovable placeholder, route points to `AudioTab` instead
- `src/components/NavLink.tsx` -- Imported nowhere

### Modified files
- `src/index.css` -- Remove duplicate font imports (lines 7-11). Keep single import on line 5 and add Lora + Space Mono to it
- `src/index.css` -- Remove entire `.dark` block (lines 85-126). This app is light-only. This eliminates the dark theme problem at the root
- `src/App.tsx` -- Remove the `useEffect` hack that removes `.dark` class (no longer needed once CSS block is removed)
- `tailwind.config.ts` -- Remove `darkMode: ["class"]` line since we are light-only

---

## Phase 6 -- Data Integration

**Problem**: `ProgramasTab` uses hardcoded mock data. Video library is hardcoded with test Mux URLs.

### Modified files
- `src/pages/ProgramasTab.tsx` -- Replace `mockPrograms` with real query to `programs` table. Determine "now playing" by comparing current day/time against `day_of_week`, `start_time`, `end_time`. Group by day for display. Show loading skeleton while fetching.
- `src/pages/VideoTab.tsx` -- This requires a new `videos` table for the library. For now, keep hardcoded but add a TODO comment. The live stream section already reads from DB which is correct.

### Database migration
- Create `videos` table: `id`, `title`, `thumbnail_url`, `hls_url`, `duration`, `views_count`, `is_active`, `sort_order`, `created_at`
- Add RLS: public read for active videos, admin full access

---

## Phase 7 -- Performance

### Modified files
- `src/App.tsx` -- Wrap admin page imports with `React.lazy()` and `<Suspense>`:
  ```
  const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
  const AdminStreaming = lazy(() => import('./pages/AdminStreaming'));
  // ... etc
  ```
  Add `<Suspense fallback={<LoadingSpinner />}>` around admin routes

### New files
- `src/components/ErrorBoundary.tsx` -- Generic error boundary wrapping main app sections. Shows friendly error message with reload button instead of white screen.

### Modified files
- `src/App.tsx` -- Wrap `<AppLayout>` with `<ErrorBoundary>`

---

## Phase 8 -- Media Logic Improvements

### Modified files
- `src/components/AudioEngine.tsx` -- Use `useRef` for `isPlaying` to avoid stale closures in HLS `MANIFEST_PARSED` callback. Pattern:
  ```typescript
  const isPlayingRef = useRef(isPlaying);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  // In HLS callback: if (isPlayingRef.current) audio.play()
  ```
- `src/components/VideoPlayer.tsx` -- Add autoplay muted fallback:
  ```typescript
  video.play().catch(() => {
    video.muted = true;
    video.play().then(() => setPlaying(true));
    setMuted(true);
  });
  ```

---

## Architecture Overview (After Refactor)

```text
App.tsx
+-- ErrorBoundary
+-- AudioEngine (persistent, never unmounts)
+-- PlaybackController (coordinates audio/video)
+-- AppLayout
    +-- Public Routes (max-w-lg, BottomNav)
    |   +-- AudioTab -> HeroPlayer (UI only)
    |   +-- VideoTab -> VideoPlayer
    |   +-- ProgramasTab (DB-driven)
    |   +-- PerfilTab
    |   +-- ConfigTab
    +-- Admin Routes (lazy loaded, wrapped in AdminLayout)
        +-- AdminLogin (no layout wrapper)
        +-- AdminLayout (auth guard + shared header)
            +-- AdminDashboard
            +-- AdminStreaming
            +-- AdminVideo
            +-- AdminSponsors
            +-- AdminPrograms
            +-- AdminUsers
            +-- AdminStats
            +-- AdminConfig
```

## Files Summary

| Action | File |
|--------|------|
| CREATE | `src/components/AudioEngine.tsx` |
| CREATE | `src/components/PlaybackController.tsx` |
| CREATE | `src/components/AdminLayout.tsx` |
| CREATE | `src/components/ErrorBoundary.tsx` |
| MODIFY | `src/stores/useRadioStore.ts` |
| MODIFY | `src/App.tsx` |
| MODIFY | `src/components/HeroPlayer.tsx` |
| MODIFY | `src/components/VideoPlayer.tsx` |
| MODIFY | `src/pages/VideoTab.tsx` |
| MODIFY | `src/pages/ProgramasTab.tsx` |
| MODIFY | `src/pages/AdminDashboard.tsx` |
| MODIFY | `src/pages/AdminStreaming.tsx` |
| MODIFY | `src/pages/AdminVideo.tsx` |
| MODIFY | `src/pages/AdminSponsors.tsx` |
| MODIFY | `src/pages/AdminPrograms.tsx` |
| MODIFY | `src/pages/AdminUsers.tsx` |
| MODIFY | `src/pages/AdminStats.tsx` |
| MODIFY | `src/pages/AdminConfig.tsx` |
| MODIFY | `src/index.css` |
| MODIFY | `tailwind.config.ts` |
| DELETE | `src/components/AudioPlayerCard.tsx` |
| DELETE | `src/pages/Index.tsx` |
| DELETE | `src/components/NavLink.tsx` |
| MIGRATION | Enable realtime on `radio_settings` |
| MIGRATION | Create `videos` table |

## Risk Notes

1. **Realtime subscription** on `radio_settings` requires the table to be added to `supabase_realtime` publication. This is a one-time migration.
2. **Media Session API** has limited support on some Android WebViews. The implementation is additive (progressive enhancement) so it won't break anything.
3. **Removing `.dark` CSS entirely** means if dark mode is ever needed later, it must be re-added. Given the project spec is light-only, this is acceptable.
4. **Lazy loading admin routes** means the first navigation to an admin page will show a brief loading state. This is standard and acceptable.
5. **The `videos` table migration** creates the schema but `VideoTab` will initially still use hardcoded data until a future admin UI is built for video library management.
