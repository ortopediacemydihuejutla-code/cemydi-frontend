# QA visual — refactor de Mi cuenta

- Source visual truth:
  - Cuenta antes del refactor:
    `C:\Users\Victo\AppData\Local\Temp\codex-clipboard-468deb97-a064-4fc7-bc41-6bbf206bd4b2.png`
  - Sidebar administrativo:
    `C:\Users\Victo\AppData\Local\Temp\codex-clipboard-58e34038-60ca-4904-a175-53afd738a0fe.png`
- Implementation route: `http://localhost:3000/mi-cuenta`
- Implementation screenshots:
  - Header visible while scrolling upward with the account container outside the viewport:
    `C:\Users\Victo\Documents\ortopedia-cemydi-web\cemydi-frontend\account-header-scroll-up-footer.png`
  - Header forcibly hidden while the account container intersects the viewport:
    `C:\Users\Victo\Documents\ortopedia-cemydi-web\cemydi-frontend\account-header-main-active-hidden.png`
  - Header opened after returning to the upper limit:
    `C:\Users\Victo\Documents\ortopedia-cemydi-web\cemydi-frontend\account-header-auto-open.png`
  - Header fully collapsed after the automatic timeout:
    `C:\Users\Victo\Documents\ortopedia-cemydi-web\cemydi-frontend\account-header-auto-closed.png`
  - Header in normal document flow at the page top:
    `C:\Users\Victo\Documents\ortopedia-cemydi-web\cemydi-frontend\account-header-static-top.png`
  - Header naturally outside the viewport after scrolling:
    `C:\Users\Victo\Documents\ortopedia-cemydi-web\cemydi-frontend\account-header-scrolled-away.png`
  - Header visible after returning to the page top:
    `C:\Users\Victo\Documents\ortopedia-cemydi-web\cemydi-frontend\account-header-at-page-top.png`
  - Incomplete-profile notice and editable form:
    `C:\Users\Victo\Documents\ortopedia-cemydi-web\cemydi-frontend\account-profile-completion-notice.png`
  - Header visible after a short upward scroll:
    `C:\Users\Victo\Documents\ortopedia-cemydi-web\cemydi-frontend\account-scroll-header-visible.png`
  - High-contrast logout action:
    `C:\Users\Victo\Documents\ortopedia-cemydi-web\cemydi-frontend\account-logout-red.png`
  - Refined account shell and expanded sidebar:
    `C:\Users\Victo\Documents\ortopedia-cemydi-web\cemydi-frontend\account-header-sidebar-desktop.png`
  - Refined mobile sidebar:
    `C:\Users\Victo\Documents\ortopedia-cemydi-web\cemydi-frontend\account-header-sidebar-mobile.png`
  - Summary desktop:
    `C:\Users\Victo\Documents\ortopedia-cemydi-web\cemydi-frontend\account-round4-summary-qa-1920.png`
  - Rentals empty state:
    `C:\Users\Victo\Documents\ortopedia-cemydi-web\cemydi-frontend\account-round4-rentals-empty-desktop.png`
  - Favorites empty state:
    `C:\Users\Victo\Documents\ortopedia-cemydi-web\cemydi-frontend\account-round4-favorites-empty-desktop.png`
  - Favorites populated and paginated:
    `C:\Users\Victo\Documents\ortopedia-cemydi-web\cemydi-frontend\account-round4-favorites-list-desktop.png`
  - Orders empty table:
    `C:\Users\Victo\Documents\ortopedia-cemydi-web\cemydi-frontend\account-round4-orders-empty-desktop.png`
  - Mobile account sidebar:
    `C:\Users\Victo\Documents\ortopedia-cemydi-web\cemydi-frontend\account-round4-mobile-sidebar.png`
  - Mobile orders:
    `C:\Users\Victo\Documents\ortopedia-cemydi-web\cemydi-frontend\account-round4-orders-mobile.png`
- Combined comparison:
  - Scroll-direction visibility versus forced hidden account-container state:
    `C:\Users\Victo\Documents\ortopedia-cemydi-web\cemydi-frontend\design-qa-account-direction-visibility.png`
  - Automatic open and closed account-header states:
    `C:\Users\Victo\Documents\ortopedia-cemydi-web\cemydi-frontend\design-qa-account-auto-header-comparison.png`
  - Overlaid header versus final in-flow header:
    `C:\Users\Victo\Documents\ortopedia-cemydi-web\cemydi-frontend\design-qa-account-static-header-comparison.png`
  - Previous and corrected scroll/logout refinement:
    `C:\Users\Victo\Documents\ortopedia-cemydi-web\cemydi-frontend\design-qa-scroll-logout-comparison.png`
  - Admin reference and refined account shell:
    `C:\Users\Victo\Documents\ortopedia-cemydi-web\cemydi-frontend\design-qa-account-header-sidebar-comparison.png`
  - Full account view:
    `C:\Users\Victo\Documents\ortopedia-cemydi-web\cemydi-frontend\design-qa-account-round4-full-comparison.png`
  - Focused sidebar comparison:
    `C:\Users\Victo\Documents\ortopedia-cemydi-web\cemydi-frontend\design-qa-account-round4-sidebar-comparison.png`
- Viewports:
  - Current desktop refinement: `1440 × 900` CSS px, `deviceScaleFactor: 1`
  - Comparison desktop: `1920 × 920` CSS px, `deviceScaleFactor: 1`
  - Functional desktop checks: `1440 × 1000` CSS px, `deviceScaleFactor: 1`
  - Mobile: `390 × 844` CSS px, `deviceScaleFactor: 1`
- Pixel dimensions:
  - Current desktop implementation: `1425 × 900`.
  - Current mobile implementation: `375 × 844`.
  - Source screenshots: `1920 × 1020`, including `100px` browser chrome.
  - Normalized source content crop: `1905 × 910`.
  - Desktop implementation: `1905 × 910`.
  - Mobile implementation: `375 × 811`.
- State:
  - Authenticated client.
  - Summary loaded with empty rentals and reviews.
  - Empty rentals, empty favorites and empty orders.
  - Favorites populated with seven real catalog products for pagination testing,
    then restored to the original empty state.

## Full-view comparison evidence

The full comparison places the previous account view on the left and the refactored
implementation on the right at a normalized `1905 × 910` content crop. Public
header, white/green brand treatment, summary hierarchy and content density remain
recognizable. The sidebar is no longer encapsulated inside the summary card; it is
an independent application rail while the account section remains the single main
content surface.

The latest focused comparison shows the same route in the two decisive states.
When the main account container is outside the viewport, an upward scroll reveals
the header. As soon as that container intersects the viewport, the observer hides
the header regardless of the scroll direction. The header is a translated fixed
overlay, so it never resizes or pushes the account content.

## Focused region comparison evidence

The focused comparison places the `/admin` sidebar and the customer sidebar in the
same image. The implementation reuses the admin sidebar primitives and visual
tokens: brand row, group labels, icon alignment, compact menu rows, pale teal active
state, three-pixel active indicator, border, internal scrolling, collapsed rail,
mobile sheet and user menu footer. Account-only destinations replace admin-only
destinations without changing the interaction pattern.

## Findings

No actionable P0, P1 or P2 differences remain.

- [P3] The orders page currently renders its complete empty/history structure but
  has no production records.
  - Evidence: the existing backend explicitly has no order/sales model or endpoint.
  - Impact: no order can be displayed until that domain is implemented.
  - Resolution: accepted for this request because the user requested the base
    structure. The table, responsive cards, empty state and pagination are ready for
    a future paginated response.
- [P3] Runtime verification used a client session. An administrator session was not
  present in the selected browser.
  - Resolution: all account role guards that rejected administrators were removed or
    changed to safe empty states; administrators also receive a direct
    `Panel administrativo` shortcut in the account sidebar.

## Required fidelity surfaces

- Fonts and typography: the existing CEMYDI typography remains intact. Sidebar
  family, scale, weight, truncation and line height now come from the same shared
  components and CSS selectors used by `/admin`. The account identity uses a
  two-line name/email treatment with ellipsis protection.
- Spacing and layout rhythm: the sidebar is a standalone `256px` rail and collapses
  to `64px`, matching the admin component. Its collapsed identity becomes a compact
  vertical avatar/control stack. The removed account title block gives the content
  more usable height. The main card keeps stable width while lists grow vertically.
- Colors and visual tokens: the sidebar is driven by `--sidebar-*`, `--brand-*`,
  `--surface` and `--border-soft` tokens. Green is limited to the active indicator,
  selected row and primary actions. Logout now uses a solid `#dc2626` destructive
  surface, white copy, a darker hover state and a restrained red shadow.
- Image quality and asset fidelity: the existing `logoOriginal.png` and
  `logoColicionado.png` assets are reused. Product images remain the catalog source
  assets; no placeholders, custom SVGs or CSS drawings were added.
- Copy and content: breadcrumb copy is static on every account route:
  `Inicio > Mi cuenta`. Rentas and favorites retain their existing empty-state copy.
  Orders adds the requested ID, date, status and total columns. The repeated
  `Mi cuenta / Administra tu perfil...` shell copy is no longer rendered. Incomplete
  profiles receive the explicit copy `Aún debes completar tu perfil`.
- Icons: the same Lucide family already used by the admin sidebar is reused for
  account navigation and states.
- Responsiveness and accessibility: no horizontal overflow at `1440px` or `390px`.
  The active route exposes `aria-current="page"`, the mobile rail opens as a dialog,
  table headers use semantic scopes, form controls have accessible labels and
  pagination buttons use Spanish accessible names. On `/mi-cuenta`, the hidden
  header exposes `aria-hidden="true"` and `inert`; all other public routes preserve
  the normal sticky header behavior.

## Primary interactions tested

- Navigated among Summary, Rentals, Favorites and Orders from the sidebar.
- Confirmed the breadcrumb remains `Inicio > Mi cuenta` on every route.
- Collapsed the desktop sidebar from `256px` to `64px`.
- Opened and closed the mobile sidebar sheet.
- Confirmed the special header behavior is scoped exactly to `/mi-cuenta`.
- With the main account container outside the viewport, confirmed a downward scroll
  hides the header and a `40px` upward scroll reveals it.
- Confirmed the revealed header uses `translate: 0px` and remains fully interactive.
- Continued scrolling upward until the main account container re-entered the
  viewport and confirmed the observer immediately forced the header hidden.
- Confirmed the forced-hidden state uses `translate: 0px -100%`,
  `aria-hidden="true"` and `inert`.
- Temporarily removed the QA account phone number, confirmed both account catalog
  entry points changed to `Completar perfil`, opened `/perfil?completar=1`, and
  confirmed the notice plus editing state.
- Restored the QA phone number and confirmed both destinations returned to the
  catalog.
- Confirmed the identity area exposes the authenticated name and email.
- Confirmed the collapse control remains usable in expanded, collapsed and mobile
  states.
- Confirmed the direct destructive-styled `Cerrar sesión` control is visible in
  expanded and collapsed sidebars.
- Confirmed the selected route updates in desktop and mobile navigation.
- Verified centered empty states for Rentals and Favorites.
- Added seven real products to Favorites through the catalog UI.
- Confirmed page 1 shows six results and page 2 shows one result.
- Removed the seven temporary favorites and restored the original account state.
- Confirmed Orders exposes semantic ID, Date, Status and Total headers plus disabled
  empty pagination.
- Confirmed the public footer remains present; only `/mi-cuenta` uses the
  direction-and-intersection behavior while other public routes retain their sticky
  header.
- Final render shows no Next.js error overlay.

## Comparison history

1. [P1] Reusing `NavMain` directly outside the admin layout required an admin-only
   query provider and caused the account route to fail.
   - Fix: kept the exact shared sidebar primitives and styling but implemented the
     account navigation list without admin notification fetching.
   - Post-fix evidence: `account-round4-summary-qa-1920.png`.
2. [P2] The original sidebar remained inside the large white account card.
   - Fix: moved it into the shared collapsible sidebar framework as an independent
     rail, with the content card in the adjacent flexible region.
   - Post-fix evidence: `design-qa-account-round4-full-comparison.png`.
3. [P2] Breadcrumb content changed by account subsection.
   - Fix: the shared breadcrumb now renders only `Inicio > Mi cuenta`.
   - Post-fix evidence: all implementation captures.
4. [P2] Empty rental and favorite content was top-left aligned.
   - Fix: introduced a shared flex-centered account empty state with a stable minimum
     height.
   - Post-fix evidence: `account-round4-rentals-empty-desktop.png` and
     `account-round4-favorites-empty-desktop.png`.
5. [P2] Favorites could grow indefinitely and lacked a bounded list.
   - Fix: added six-item client pagination, result counts and shared admin-style
     previous/next controls.
   - Post-fix evidence: `account-round4-favorites-list-desktop.png`.
6. Final pass — no actionable P0/P1/P2 differences found.
7. [P2] The fixed public header consumed vertical space and repeated account-level
   title copy reduced content density.
   - Fix: converted the account header to a zero-layout, direction-aware overlay,
     removed the repeated account title/description, and moved identity/collapse
     controls into the sidebar header.
   - Post-fix evidence:
     `design-qa-account-header-sidebar-comparison.png`,
     `account-header-sidebar-desktop.png`, and
     `account-header-sidebar-mobile.png`.
8. [P2] Logout was hidden inside the generic user dropdown and had weak visual
   priority.
   - Fix: replaced it in the customer sidebar with a direct, labeled,
     destructive-styled action that retains an icon-only tooltip when collapsed.
   - Post-fix evidence: current desktop and mobile sidebar captures.
9. Final refinement pass — no actionable P0/P1/P2 differences found.
10. [P1] The scroll-direction threshold was evaluated per browser event, so fine
    trackpad and wheel events could remain below the threshold indefinitely.
    - Fix: reveal on any genuine upward delta and hide on a downward delta greater
      than one pixel, while deduplicating identical React state updates.
    - Post-fix evidence: browser state changed from `translate: 0 -100%` to
      `translate: 0` after a `20px` upward movement in
      `account-scroll-header-visible.png`.
11. [P2] The pale destructive treatment lacked emphasis and the development control
    could overlap the collapsed logout action.
    - Fix: applied a solid red surface with white copy, increased the collapsed
      target to `40 × 40px`, added an accessible name, and raised the footer clear
      of the bottom overlay.
    - Post-fix evidence: `account-logout-red.png` and
      `design-qa-scroll-logout-comparison.png`.
12. Final correction pass — no actionable P0/P1/P2 differences found.
13. [P1] Returning to the page top after an account-route transition could leave
    the header hidden because no new scroll event was emitted.
    - Fix: synchronize the initial route scroll position on the next animation
      frame and treat `scrollY <= 16` as a visible-header state.
    - Post-fix evidence: `account-header-at-page-top.png`; browser state confirmed
      `scrollY: 0`, `aria-hidden: false`, and `translate: 0px`.
14. [P1] Catalog entry points did not account for missing delivery/contact data.
    - Fix: added a shared profile-completion rule requiring name, email, phone and
      address. Incomplete profiles route to `/perfil?completar=1`, automatically
      open editing, and display a clear warning. Complete profiles route to
      `/catalogo`.
    - Post-fix evidence: `account-profile-completion-notice.png` and 67 passing
      tests, including profile-completion coverage.
15. Final profile-flow pass — no actionable P0/P1/P2 differences found.
16. [P1] The direction-aware fixed header could cover the account identity and
    breadcrumb when it appeared at the upper scroll limit.
    - Fix: removed the account scroll listener, transforms, fixed positioning,
      hidden state and inert state. Account routes now render the header in normal
      document flow; it disappears naturally with page scrolling.
    - Post-fix evidence: `design-qa-account-static-header-comparison.png`,
      `account-header-static-top.png`, and
      `account-header-scrolled-away.png`. Measured overlap is `false` at the top.
17. Final in-flow header pass — no actionable P0/P1/P2 differences found.
18. [P1] The in-flow header no longer overlapped content, but remained visible
    indefinitely while the page stayed at the top.
    - Fix: added a 2.5-second automatic close, a fully collapsed `0px` state and
      upper-limit reactivation after the user has scrolled away. The mobile menu
      pauses automatic closing while open.
    - Post-fix evidence: `design-qa-account-auto-header-comparison.png`,
      `account-header-auto-open.png`, and `account-header-auto-closed.png`.
19. Final automatic-header pass — no actionable P0/P1/P2 differences found.
20. [P1] The timer and upper-limit behavior did not implement the requested
    deterministic direction rules and could leave the header visible while account
    content was active.
    - Fix: replaced the timer with a route-scoped scroll-delta listener and an
      `IntersectionObserver` attached to the principal account container. Up reveals,
      down hides, and container intersection always overrides both by hiding.
    - Post-fix evidence: `design-qa-account-direction-visibility.png`,
      `account-header-scroll-up-footer.png`, and
      `account-header-main-active-hidden.png`.
21. Final direction-and-intersection pass — no actionable P0/P1/P2 differences found.

## Implementation checklist

- [x] Static breadcrumb without a containing breadcrumb card.
- [x] Standalone sidebar using the same primitives and behavior as `/admin`.
- [x] Desktop collapse, mobile sheet and user footer.
- [x] Administrator-safe account shell and subsection behavior.
- [x] Centered Rental and Favorite empty states.
- [x] Clearly separated list records.
- [x] Server pagination for Rentals.
- [x] Client pagination for Favorites.
- [x] New responsive Orders route, history table/cards, empty state and pagination.
- [x] Public footer preserved.
- [x] Special visibility logic scoped only to `/mi-cuenta`.
- [x] Upward scroll reveals the header while the main account container is outside.
- [x] Downward scroll hides the header.
- [x] Main account container intersection always forces the header hidden.
- [x] Hidden header is not keyboard-focusable and exposes the correct accessibility state.
- [x] User name, email and collapse control integrated into sidebar header.
- [x] Compact and usable collapsed sidebar identity state.
- [x] Direct, visually distinct logout action.
- [x] Solid red logout action with white text and clear collapsed state.
- [x] Header scrolls away automatically instead of remaining fixed.
- [x] Shared profile-completion rule for account catalog entry points.
- [x] Incomplete-profile warning and automatic editing state.
- [x] Complete profiles route directly to the catalog.
- [x] Repeated account shell title and description removed.
- [x] Full lint passes.
- [x] Production build passes.
- [x] 67 automated tests pass.

final result: passed
