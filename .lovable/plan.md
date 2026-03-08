
## Core Issues Found

### Issue 1: Download buttons have NO onClick handlers
In `LandingPage.tsx`, these buttons do nothing when clicked:
- **Line 93**: Hero "Download Android App" button — no `onClick`
- **Line 245**: CTA section "Download APK" button — no `onClick`
- **Line 248**: CTA section "Add to Home Screen" button — no `onClick`

The PWA `beforeinstallprompt` logic that was supposedly added in previous attempts **was never actually saved** — the current file still has the original version with zero install logic.

### Issue 2: No PWA state management in LandingPage
The `LandingPage` component has no `useEffect`, no `deferredPrompt` state, and no `isIOS` detection. All the install functionality only exists in `InstallScreen.tsx`, which users never reach because the buttons don't navigate anywhere.

### Issue 3: `/install` route is broken
In `App.tsx` line 35: `<Route path="/install" element={<AppShell />} />` — this routes `/install` to `AppShell`, not `InstallScreen`. `InstallScreen` only lives at `/app/install`. So any navigation to `/install` shows the full app shell, not the install page.

### Issue 4: Button colors
The hero "Download Android App" button uses `gradient-cta` (green gradient), not blue. Should use `gradient-blue`.

---

## Fix Plan

### 1. Fix `LandingPage.tsx`
Add PWA install logic directly to the landing page:

```text
LandingPage.tsx
├── Add useState: deferredPrompt, isIOS, showIOSModal
├── Add useEffect: capture beforeinstallprompt event, detect iOS
├── handleInstall():
│   ├── iOS → show iOS instructions modal
│   ├── deferredPrompt available → trigger native PWA install prompt
│   └── fallback (desktop/no prompt) → navigate to /app/install
├── Hero button "Download Android App":
│   └── onClick={handleInstall} + change to gradient-blue
├── CTA "Download APK" button:
│   └── onClick={handleInstall} + change to gradient-blue
├── CTA "Add to Home Screen" button:
│   └── onClick={handleInstall} + keep blue styling
└── Add iOS instructions modal (overlay dialog)
```

### 2. Fix `App.tsx` route
Change `/install` route to render `InstallScreen` directly, not `AppShell`:
```text
/install → <InstallScreen /> (standalone, not wrapped in AppShell)
```

### 3. Smart behavior per platform
```text
On Android Chrome (has deferredPrompt) → native install dialog appears
On iOS Safari → show modal with: Share → Add to Home Screen steps
On Desktop / no prompt → navigate to /app/install with instructions
Already installed (standalone mode) → show "Already installed" message
```

### Files to change
- `src/pages/LandingPage.tsx` — add install logic + fix button colors/handlers
- `src/App.tsx` — fix `/install` route to use standalone `InstallScreen`
