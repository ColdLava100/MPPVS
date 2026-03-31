---
name: Next.js UI Rules
description: Rules for frontend development using Next.js App Router and UI components.
---

# Next.js UI Guidelines

When building user interfaces (within `/apps/web`), you must enforce modern frontend principles:

1. **App Router Strategy**:
   - Strictly employ the Next.js App Router approach for structural design. 

2. **Server Components vs. Client Boundaries**:
   - **CRITICAL RULE**: Do **NOT** spray `"use client"` arbitrarily over every component. 
   - `"use client"` is exclusively reserved for interactive "leaf" boundary components—those that strictly govern client state bindings (`useState`, `useRef`), lifecycle integrations (`useEffect`), or specific DOM manipulation bindings (`onClick`, `onChange`).
   - Keep your primary Data Fetching pages and structural nested layouts cleanly functioning as Server Components.

3. **UX & Styling Excellence**:
   - Utilize `shadcn-ui` blocks properly initialized with your Tailwind UI parameters.

4. **API Integration**:
   - Perform all external fetching explicitly resolving to endpoints governed by the `process.env.NEXT_PUBLIC_API_URL` variable to guarantee cross-environment portability.
