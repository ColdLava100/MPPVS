# Student Dashboard Design System

This document defines the established design language for the MPP Voting Portal student dashboard. All future UI development must adhere to these specifications to maintain visual consistency.

---

## 1. Strict Constraints

### Icons
- **MANDATORY**: Use `lucide-react` for all icons
- **NEVER** use inline SVGs unless absolutely required
- Import icons at top of file: `import { IconName } from 'lucide-react'`

### Emojis
- **STRICTLY FORBIDDEN**: No emojis allowed in any UI components
- Use icons (lucide-react) or text labels instead

---

## 2. Color Palette

### Primary Colors
| Usage | Tailwind Class |
|-------|----------------|
| Primary Header/Footer | `bg-[#4c0519]` |
| Dark Overlay | `bg-[#2d0a0a]` |
| Hero Gradient Start | `from-[#4c0519]/90` |
| Hero Gradient Mid | `via-[#2d0a0a]/95` |
| Hero Gradient End | `to-black` |

### Accent Colors
| Usage | Tailwind Class |
|-------|----------------|
| Primary Button | `bg-[#c5a021]` |
| Primary Button Hover | `hover:bg-yellow-400` |
| Accent/Highlight | `text-yellow-500` |
| Live Indicator | `bg-red-600` |

### Background Colors
| Usage | Tailwind Class |
|-------|----------------|
| Main Background | `bg-black` |
| Card Background | `bg-white/95` |
| Container (subtle) | `bg-white/5` |
| Container (strong) | `bg-white/10` |
| Hover State | `hover:bg-white/5` |

### Border Colors
| Usage | Tailwind Class |
|-------|----------------|
| Subtle Border | `border-white/5` |
| Default Border | `border-white/10` |
| Strong Border | `border-white/20` |

### Text Colors
| Usage | Tailwind Class |
|-------|----------------|
| Primary Text | `text-white` |
| Secondary Text | `text-slate-400` |
| Muted Text | `text-slate-300` |
| Disabled/Hint | `opacity-40` or `opacity-60` |
| Accent Text | `text-yellow-500` |

---

## 3. Typography

### Font Sizes (Heading)
| Element | Tailwind Class |
|---------|----------------|
| Hero Heading | `text-8xl` |
| Section Heading | `text-7xl` |
| Page Title | `text-6xl` |
| Card Title | `text-5xl` |
| Large Stat | `text-4xl` |

### Font Sizes (Body/Labels)
| Element | Tailwind Class |
|---------|----------------|
| Navigation | `text-[11px]` |
| Small Label | `text-[10px]` |
| Tiny Label | `text-[9px]` |

### Font Weights
| Element | Tailwind Class |
|---------|----------------|
| Headings | `font-bold` |
| Labels/Nav | `font-black` |
| Body Text | `font-light` |
| Quotes | `italic` |

### Letter Spacing (Tracking)
| Element | Tailwind Class |
|---------|----------------|
| Nav Items | `tracking-[0.3em]` |
| Small Labels | `tracking-[0.2em]` |
| Section Labels | `tracking-[0.4em]` |
| Hero Labels | `tracking-[0.5em]` |
| Wide Labels | `tracking-[0.6em]` |

---

## 4. Layout & Spacing

### Page Layout
| Element | Value |
|---------|-------|
| Content Padding | `p-12` |
| Hero Padding | `p-24` |
| Max Content Width | `max-w-7xl` |
| Grid Gap | `gap-6` or `gap-16` |

### Grid Systems
| Usage | Tailwind Class |
|-------|----------------|
| 5-Column Grid | `grid grid-cols-1 lg:grid-cols-5` |
| 4-Column Grid | `grid grid-cols-2 lg:grid-cols-4` |
| 3-Column Grid | `grid grid-cols-1 md:grid-cols-3` |

### Header Dimensions
| Element | Tailwind Class |
|---------|----------------|
| Header Height | `h-[100px]` |
| Header Padding | `px-12` |
| Header Position | `sticky top-0 z-[100]` |

### Sidebar Dimensions
| Element | Value |
|---------|-------|
| Collapsed Width | `w-24` (96px) |
| Expanded Width | `w-72` (288px) |
| Sidebar Margin Left | `ml-24` |
| Position | `fixed left-4 top-4 bottom-4` |

### Card/Component Spacing
| Element | Tailwind Class |
|---------|----------------|
| Card Padding | `p-8` or `p-12` |
| Section Margin | `mb-12` |
| Large Section Margin | `mb-24` |

---

## 5. Component Blueprints

### Primary Button (Vote/CTA)
```tsx
<button className="bg-[#c5a021] text-black px-14 py-6 rounded-sm text-[12px] font-black uppercase tracking-[0.3em] hover:bg-yellow-400 transition-all shadow-2xl active:scale-95 flex items-center gap-4 group">
  Button Text <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
</button>
```

**Variants:**
- Rounded: `rounded-full` (header buttons)
- Square: `rounded-sm` (main CTAs)

### Secondary Button
```tsx
<button className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded text-[9px] font-black uppercase tracking-widest transition flex items-center gap-2.5 group">
  <HelpCircle className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors" /> 
  Label
</button>
```

### Card Container (Metric/Stat Box)
```tsx
<div className="p-8 bg-white/95 backdrop-blur-xl border border-white/20 border-b-[6px] {color} shadow-2xl group hover:-translate-y-2 transition-all duration-500 rounded-sm">
  {/* Content */}
</div>
```

**Border Colors (Bottom Accent):**
- Blue: `border-b-blue-600`
- Red: `border-b-red-700`
- Orange: `border-b-orange-600`
- Green: `border-b-green-700`
- Yellow: `border-b-yellow-600`

### Badge/Status Indicator
```tsx
<span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
  Status
</span>
```

### Input Field (CRITICAL - Always use these exact classes)
```tsx
<input 
  type="text" 
  className="w-full bg-white border-b border-slate-300 px-0 py-2 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
  required 
/>
```

**Select Dropdown (CRITICAL - Add class to options)**
```tsx
<select 
  className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
>
  <option value="" className="text-black">Select...</option>
  {items.map(item => (
    <option key={item.id} value={item.id} className="text-black">{item.name}</option>
  ))}
</select>
```

**Key Rules:**
- ALWAYS use `bg-white` (NOT bg-slate-50 which is too light and may show white text on white)
- ALWAYS add `text-black` explicitly
- For select options, ALWAYS add `className="text-black"` to each `<option>` element
- This ensures readable black text on all form inputs regardless of parent container darkness

### Loading State
```tsx
<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
  <p>Loading...</p>
</div>
```

---

## 6. Background & Effects

### Background Image Pattern
```tsx
<div 
  className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
  style={{ 
    backgroundImage: `url(${bgImageUrl})`,
    filter: 'blur(10px) brightness(0.2)'
  }}
/>
```

### Glassmorphism Container
```tsx
<div className="bg-white/5 backdrop-blur-3xl rounded-sm border border-white/10 shadow-2xl">
  {/* Content */}
</div>
```

### Gradient Overlay
```tsx
<div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
```

---

## 7. Responsive Breakpoints

| Breakpoint | Tailwind Prefix | Typical Usage |
|------------|-----------------|---------------|
| Mobile | (default) | Single column |
| Tablet | `md:` | 2 columns |
| Desktop | `lg:` | 3-5 columns |

---

## 8. Animation Patterns

### Hover Transitions
- Scale: `hover:-translate-y-2 transition-all duration-500`
- Color: `hover:text-yellow-500 transition-all duration-300`
- Shadow: `hover:shadow-[#4c0519]/40`

### Active States
- Scale: `active:scale-95`
- Immediate: `transition-transform`

### Loading/Pulse
```tsx
<span className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_12px_rgba(220,38,38,0.9)]" />
```

---

## Summary

All future UI components for the MPP Voting Portal should follow these patterns exactly. Use this document as the single source of truth for all design decisions.

**Key Rules:**
1. No emojis - use lucide-react icons only
2. Use exact color classes listed above
3. Follow typography conventions (tracking, font weights)
4. Use component blueprints for consistency
5. Test responsive behavior at md: and lg: breakpoints