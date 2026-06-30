---
name: RaktSetu Precision
colors:
  surface: '#fbf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#fbf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f0'
  surface-container: '#efeeeb'
  surface-container-high: '#eae8e5'
  surface-container-highest: '#e4e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#5c403f'
  inverse-surface: '#30312f'
  inverse-on-surface: '#f2f0ed'
  outline: '#906f6e'
  outline-variant: '#e5bdbb'
  surface-tint: '#bf0229'
  primary: '#9e001f'
  on-primary: '#ffffff'
  primary-container: '#c8102e'
  on-primary-container: '#ffdad8'
  inverse-primary: '#ffb3b1'
  secondary: '#685c59'
  on-secondary: '#ffffff'
  secondary-container: '#f0dfdb'
  on-secondary-container: '#6e625f'
  tertiary: '#005468'
  on-tertiary: '#ffffff'
  tertiary-container: '#296c81'
  on-tertiary-container: '#b5eaff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad8'
  primary-fixed-dim: '#ffb3b1'
  on-primary-fixed: '#410007'
  on-primary-fixed-variant: '#92001c'
  secondary-fixed: '#f0dfdb'
  secondary-fixed-dim: '#d3c3bf'
  on-secondary-fixed: '#221a17'
  on-secondary-fixed-variant: '#4f4442'
  tertiary-fixed: '#b6eaff'
  tertiary-fixed-dim: '#91d0e7'
  on-tertiary-fixed: '#001f28'
  on-tertiary-fixed-variant: '#004e60'
  background: '#fbf9f6'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2df'
  bone-bg: '#faf8f5'
  charcoal-card: '#1a1210'
  crimson-accent: '#c8102e'
  border-subtle: rgba(26, 18, 16, 0.09)
  text-muted: '#737373'
typography:
  display-xl:
    fontFamily: Instrument Serif
    fontSize: 100px
    fontWeight: '400'
    lineHeight: 90px
    letterSpacing: -0.04em
  display-xl-mobile:
    fontFamily: Instrument Serif
    fontSize: 60px
    fontWeight: '400'
    lineHeight: 54px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Instrument Serif
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
  headline-md:
    fontFamily: Dm Sans
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Dm Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Dm Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Dm Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Dm Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  margin-desktop: 40px
  margin-mobile: 16px
  gutter: 24px
  unit: 8px
  container-max: 1280px
---

## Brand & Style
RaktSetu embodies **Sophisticated Medical Logistics**—a blend of high-stakes urgency and institutional reliability. The brand personality is "Clinical Excellence meets Modern Intelligence." 

The design style is **Corporate Modern with Editorial Flair**. It leverages the structured, trustworthy foundations of medical software but elevates it with high-contrast typography and subtle "technical" textures (like the aceternity grid and grain filters). The use of italics in headlines provides a human, empathetic touch to an otherwise data-heavy environment. It feels urgent yet calm, precise yet accessible.

## Colors
The palette is rooted in **Crimson-Bone-Charcoal**. 

- **Primary (Crimson):** Used for critical actions, branding, and status indicators. It signifies the biological nature of the product (blood) and the urgency of the mission.
- **Secondary (Charcoal):** Provides a heavy, grounded anchor. Used for high-contrast sections (footers, hero buttons, dashboard cards) to create a sense of premium "command and control" tech.
- **Neutral (Bone):** A warm, off-white (#FAF8F5) serves as the primary background color, reducing eye strain compared to pure white and evoking a sterilized, clinical environment.
- **Support Colors:** Green and Yellow are used sparingly for status updates within data visualizations.

## Typography
The system uses a high-contrast pair of **Instrument Serif** and **DM Sans**.

- **Instrument Serif:** Reserved for large display headings and branding. It introduces an editorial, authoritative character. The use of the *italic variant* for emphasis (e.g., "blood", "life") is a core brand motif.
- **DM Sans:** The workhorse for all functional UI. It is chosen for its low-contrast, geometric clarity, ensuring that data and labels remain legible in high-stress medical contexts.
- **Tracking:** Tight letter-spacing on display headings for impact; generous tracking on small uppercase labels (label-sm) for a technical/logistical feel.

## Layout & Spacing
The layout follows a **Fixed-Width Centered Grid** for desktop and a **Fluid Fluid Grid** for mobile.

- **Grid:** 12-column structure for the container-max (1280px).
- **Rhythm:** An 8px linear scale. Section padding is aggressive (py-32 / 128px) to emphasize "clinical" whitespace and allow the serif typography to breathe.
- **Mobile Adaptations:** Margins shrink from 40px to 16px. Content stacks vertically, but grid-based feature cards maintain a tight 8px or 16px gap to imply a "modular system" rather than separate pieces.

## Elevation & Depth
Depth is conveyed through **Materiality and Subtle Containment** rather than heavy shadows.

- **Surface Layering:** The primary background is `Bone`. Secondary cards use pure `White` with a 1px `border-subtle` to stand out.
- **High-Contrast "Command" Layers:** Critical dashboards and the footer use `Charcoal` backgrounds with semi-transparent white borders (`white/10`) to create a "glass-on-dark" effect.
- **Shadows:** Minimal. Used only on hover (`shadow-xl` with primary tint) or for large floating modals to indicate focus. 
- **Texture:** A 5% opacity stardust noise filter is applied across the entire site to soften the digital edges and provide a tactile, paper-like quality.

## Shapes
The shape language is primarily **Geometric and Functional**, with specific exceptions for interactive elements.

- **Standard Containers:** Feature cards and input fields use a `rounded-xl` (8px) radius, balancing modern softness with structural rigidity.
- **Interactive Elements:** Primary and secondary buttons use a **Full/Pill** radius. This distinguishes "actionable" items from "informational" containers.
- **Iconography:** Symbols are thin-weight (300) Material Symbols, reinforcing the precise, technical nature of the logistics platform.

## Components
- **Buttons:** 
    - *Primary:* Pill-shaped, Crimson background, white text. Includes a "Spring Transition" (cubic-bezier) on hover that scales the button 105%.
    - *Command:* Pill-shaped, Charcoal background. Used for high-priority secondary actions like "Request Emergency Access."
- **Dashboard Cards:** High-contrast charcoal containers with semi-transparent data bars. Progress bars should use the `primary` crimson for "High Stock" and `yellow/amber` for "Low Stock."
- **Feature Cards:** White background, subtle border, featuring a large serif index number (e.g., 01, 02) in a low-opacity primary color as a decorative watermark.
- **Inputs:** Minimalist white or dark-transparent fields with 1px borders. Focus states should use a primary-colored glow (`primary/40`).
- **Badges:** Small, uppercase text in pill-shaped containers with 10% opacity backgrounds of the text color (e.g., Crimson on Crimson/10).