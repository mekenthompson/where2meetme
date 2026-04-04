# The Design System: Editorial Precision & Tonal Depth

## 1. Overview & Creative North Star
**Creative North Star: The Objective Concierge**
This design system moves beyond the utility of a map and into the realm of high-end editorial curation. It represents "The Objective Concierge"—a digital presence that is authoritative, mathematically precise, yet welcoming. 

To break the "template" look of standard utility apps, this system employs **Intentional Asymmetry** and **Tonal Layering**. We avoid the rigid, boxed-in feeling of traditional grids by using breathing room as a structural element. Elements don't just sit on a page; they inhabit a space defined by light, depth, and sophisticated typography scales that prioritize information hierarchy over decorative clutter.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a "Deep Navy" authority, punctuated by a "Fairness Green" that signals balance and success. 

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section sitting on a `surface` background provides all the definition a user needs. We define space through mass, not lines.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine paper. 
*   **Base:** `surface` (#f9f9fb)
*   **Secondary Sections:** `surface-container-low` (#f3f3f5)
*   **Interactive Cards:** `surface-container-lowest` (#ffffff)
*   **Elevated Overlays:** `surface-container-high` (#e8e8ea)

### The "Glass & Gradient" Rule
To escape a flat, "out-of-the-box" feel, use **Glassmorphism** for floating elements (e.g., search bars over maps). Utilize semi-transparent surface colors with a `backdrop-filter: blur(20px)`. 
*   **Signature Textures:** Apply a subtle linear gradient to primary CTAs, transitioning from `primary` (#000666) to `primary-container` (#1a237e) at a 135-degree angle. This adds a "soul" to the action buttons that flat hex codes cannot replicate.

---

## 3. Typography: The Editorial Voice
We utilize a pairing of **Manrope** for high-impact display and **Inter** for functional clarity.

*   **Display & Headlines (Manrope):** These are our "Editorial" weights. Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) for hero moments. The geometric nature of Manrope conveys the "Modern & Objective" personality.
*   **Title & Body (Inter):** Inter is used for its legendary readability. `title-md` (1.125rem) should be used for venue names, while `body-md` (0.875rem) handles the metadata of travel times.
*   **Hierarchy as Brand:** By drastically contrasting a `display-sm` headline against a `label-md` travel-time tag, we create a sense of professional curation.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering** rather than traditional structural lines or heavy shadows.

*   **The Layering Principle:** Stacking tiers creates natural lift. Place a `surface-container-lowest` card on a `surface-container-low` section. The change in luminance provides a sophisticated, soft-touch elevation.
*   **Ambient Shadows:** If a floating effect is required (e.g., a "Calculate" button), use a shadow with a blur radius of 32px and an opacity of 6%. The shadow color should be a tinted version of `on-surface` (#1a1c1d), not pure black, to mimic natural ambient light.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, it must be a "Ghost Border": `outline-variant` (#c6c5d4) at 15% opacity. Never use 100% opaque borders.

---

## 5. Components

### Venue Cards & Results
*   **Constraint:** Forbid the use of divider lines.
*   **Style:** Use `surface-container-lowest` backgrounds with `xl` (1.5rem) corner radius. Use vertical white space (24px) to separate the venue name from the address.
*   **Fairness Green Accent:** Use `secondary` (#1b6d24) for the "Time Balance" indicator (e.g., "Person A: 15m | Person B: 15m").

### Buttons
*   **Primary:** Gradient of `primary` to `primary-container`. `full` (9999px) roundedness.
*   **Secondary:** `surface-container-highest` background with `on-surface` text. No border.
*   **States:** On hover, increase the background luminance by 5%. On tap, scale the button to 0.98.

### Input Fields (The "Meeting Point" Inputs)
*   **Style:** Minimalist. Use `surface-container-low` as the field background.
*   **Focus State:** Instead of a thick border, use a subtle `primary` glow (4px spread, 10% opacity) and transition the label color to `primary`.

### Travel Mode Chips
*   **Unselected:** `surface-container-high` background, `on-surface-variant` icon.
*   **Selected:** `primary` background, `on-primary` icon. 
*   **Sizing:** `lg` (1rem) roundedness to create a modern, pill-like feel.

### Specialized Component: The "Parity Meter"
A custom horizontal gauge using `secondary` (Fairness Green) to visualize the delta between two travelers' journey times. It should be fluid and thick (8px height) with `full` roundedness.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical layouts for search results (e.g., staggering cards slightly).
*   **Do** use "Fairness Green" exclusively for travel-time successes and balance.
*   **Do** rely on `body-sm` and `label-md` for secondary metadata to keep the interface feeling "light."

### Don’t
*   **Don’t** use a 1px #000 border for any reason.
*   **Don’t** use pure black (#000000) for text; use `on-surface` (#1a1c1d) to maintain the premium feel.
*   **Don’t** crowd the interface. If it feels busy, increase the `surface` spacing.
*   **Don’t** use standard "drop shadows." If it doesn't look like light hitting paper, it’s too heavy.