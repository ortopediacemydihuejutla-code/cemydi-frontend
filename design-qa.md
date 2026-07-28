# Sidebar design QA

- Source visual truth: `C:\Users\Victo\AppData\Local\Temp\codex-clipboard-adb4aa34-7263-467b-ae88-ab7e6b3d24b0.png`
- Implementation route: `http://localhost:3000/admin`
- Implementation screenshot: unavailable; the verification browser was redirected to `/login`
- Source pixels: 316 × 481
- Implementation pixels: unavailable
- Intended CSS viewport: desktop admin sidebar, expanded, light theme
- Density normalization: unavailable because the protected implementation could not be captured
- State: active navigation item with unread notification counters

## Full-view comparison evidence

The source reference was opened and inspected. The local implementation route could
not be captured in the equivalent authenticated state because the isolated verification
browser does not have an administrator session and the server redirected it to `/login`.

## Focused region comparison evidence

Blocked for the same authentication reason. No valid sidebar crop exists from the
implementation, so typography, spacing, colors, icon alignment, counters and active
state cannot be judged side by side.

## Findings

- [P1] Authenticated sidebar capture unavailable
  - Location: expanded admin sidebar at `/admin`
  - Evidence: the source shows the requested active rectangle and notification badges;
    the verification browser reached `/login` instead of the admin shell.
  - Impact: a faithful visual comparison cannot be completed.
  - Fix: authenticate an administrator in the in-app verification browser, then capture
    the expanded light-theme sidebar at the same state and compare it with the source.

## Required fidelity surfaces

- Fonts and typography: blocked pending implementation capture.
- Spacing and layout rhythm: blocked pending implementation capture.
- Colors and visual tokens: source inspected; implementation comparison blocked.
- Image and icon fidelity: Lucide remains the established product icon system; visual
  alignment comparison is blocked.
- Copy and content: navigation labels intentionally remain those of CEMYDI; visual
  comparison is blocked.

## Comparison history

- Pass 1: source opened; implementation redirected to `/login`; no valid comparison
  could be produced.

## Implementation checklist

- Sign in as an administrator in the in-app browser.
- Capture the expanded sidebar in light theme.
- Compare the full sidebar and a focused active-row crop against the source.
- Correct any remaining P1/P2 spacing, typography or color differences.

## Follow-up polish

- Verify the collapsed-state notification dot and dark-theme contrast after the primary
  light-theme comparison passes.

final result: blocked
