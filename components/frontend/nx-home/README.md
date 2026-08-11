# NXBazaar 3D Liquid Glass Homepage Architecture

## Component Map

```text
app/(front-end)/page.tsx (Server Component)
  └─ NxGlassHome (Server Component)
      ├─ Navbar (Embedded header with client auth & cart count)
      ├─ FloatingGlassFragments (Static ambient background fragments)
      ├─ GlassLeftWing (Desktop perspective wing)
      ├─ GlassMainFrame (Central dominant liquid glass frame)
      │   ├─ GlassNavigation (Client navigation with active path indicator)
      │   ├─ GlassContent (Hero copy, search, categories, product previews)
      │   │   ├─ HomeSearch (Client search form with trim & query submit)
      │   │   ├─ HomeCategoryStrip (Category chips with image/icon fallback)
      │   │   └─ HomeProductPreview (Product cards with price & media fallback)
      │   └─ GlassActionRail (Quick access links and status indicator)
      └─ GlassRightWing (Desktop perspective wing)
```

## Server / Client Boundary

- **Server-Side Data Fetching**: `app/(front-end)/page.tsx` fetches and normalizes category and product records.
- **Client Components (Used only where interactivity is required)**:
  - `GlassNavigation.tsx`: Active pathname detection (`usePathname`).
  - `HomeSearch.tsx`: Local query input state and router navigation (`useRouter`).
  - `Navbar.tsx` & `CartCount.tsx`: Redux store subscription for live cart badge and NextAuth session status.

## Data Contracts (`types.ts`)

Only JSON-serializable primitives cross the server-to-client boundary:

- **`NxHomeCategory`**: `{ id: string; title: string; slug: string | null; imageUrl: string | null; }`
- **`NxHomeProduct`**: `{ id: string; title: string; slug: string | null; imageUrl: string | null; salePrice: number | null; productPrice: number | null; categoryName: string | null; }`

*No Prisma Decimals, unformatted Dates, BigInts, or ORM internal references are passed to client components.*

## Verified Routing Contract

- **Homepage**: `/`
- **Search**: `/search?search=<query>`
- **Category Browsing**: `/category/[slug]`
- **Product Details**: `/products/[slug]`
- **Cart**: `/cart`
- **Orders**: `/orders` (customer) / `/dashboard/orders` (backoffice)
- **Account / Sign In**: `/account` / `/login`
- **Wishlist**: Placeholder (disabled, non-mutating)

## Responsive Behavior & Breakpoints

- **Desktop (>= 1024px)**: Center dominant glass frame with 3D perspective side wings (`.nx-left-wing`, `.nx-right-wing`), static floating ambient fragments, and cyan bottom reflection.
- **Tablet (768px – 1023px)**: Side wings and floating fragments hide cleanly (`display: none`), perspective is disabled (`perspective: none`), search spans full width, product grid shifts to 2 columns.
- **Mobile (< 768px & <= 430px)**: Single column natural vertical scrolling, horizontal category strip with smooth scroll (`scrollbar-width: none`), navigation collapses to horizontal row, floor reflections removed, no horizontal page overflow.

## Visual Invariants (Do Not Modify)

1. No white or unstyled margins around the homepage scene.
2. Center glass frame remains the primary focal element with translucent gradients (`rgba(222, 238, 249, 0.42)`).
3. Thin bright white/silver specular edge shines (`.nx-edge-shine`).
4. Cyan floor ambient lighting centered at bottom (`.nx-bottom-glow`, `.nx-floor-reflection`).
5. Side wings remain angled and narrow on desktop, hidden on tablet and mobile.
6. Floating glass fragments remain static with zero runtime JavaScript animations.
7. Accessible contrast, visible focus-visible outlines (`rgba(74,132,255,.78)`), and reduced-motion support.

## Future Development Rules

- **DO** reuse the existing `nx-home` design tokens (`--nx-radius-main`, `--nx-glass-border`, etc.).
- **DO** maintain server data fetching in `page.tsx` and pass serialized data down.
- **DO NOT** add global full-page navbars inside the glass scene.
- **DO NOT** create duplicate cart state slices inside `nx-home` (use `redux/slices/cartSlice.ts`).
- **DO NOT** apply full-screen glass transforms to inner dashboard or admin views.
