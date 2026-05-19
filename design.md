# Comprehensive Design System & Layout Specifications Report

This report compiles high-fidelity layout specifications, spacing rules, font pairs, element sizes, color palettes, and component mappings extracted from the `Flight` Figma design file.

---

## 1. Design System Overview & Grid Architecture

### Layout & Page Geometry
The design system is structured to handle both **B2C (Business-to-Consumer)** and **B2B (Business-to-Business)** interfaces for a flight booking portal ("My Travel Deal").

*   **Canvas Grid & Spacing**:
    *   **Base Spacing Unit**: 8px grid system (all margins, paddings, and element heights are multiples of 8px—e.g., 8px, 16px, 24px, 32px, 48px, 64px).
    *   **Page Max-Width**: Standard web desktop layout at **1440px** width.
    *   **Container Padding**: 120px left and right margins for primary content wrappers on B2C pages, ensuring a clean 1200px active center container.
    *   **B2B Canvas layout**: A denser grid with smaller lateral paddings (~40px to 64px) to maximize horizontal data density for agent flight search result grids.

### Spacing Rules
*   **Hero section padding**: 80px top / bottom.
*   **Section-to-Section spacing**: 96px vertical margin between major sections (e.g., between "Why Choose Us" and "Popular Destinations").
*   **Card Inner Padding**: 24px or 32px padding-box for standard cards (e.g., flight search widget, testimonial cards).
*   **Form Field Spacing**: 16px horizontal gap between adjacent input fields; 12px vertical gap between label and input control.

---

## 2. Brand Color Palette (HEX Specs)

The color palette uses a primary dark navy brand color with vibrant crimson red accents for core Call-To-Action (CTA) elements, balanced by neutral greys and clean white backgrounds.

| Color Role | Color Swatch Name | Estimated HEX | Figma Canvas Usage & Brand Context |
| :--- | :--- | :--- | :--- |
| **Primary Navy** | Deep Midnight | `#0B132B` | Navigation bars, selected button states, headers, prices, active text. |
| **Primary Accent** | Crimson Red | `#DF1B24` | Primary CTA buttons ("Search Again", "Login"), selected tabs, logo, and active links. |
| **Secondary Accent**| Soft Slate | `#E2E8F0` | Unselected tab backgrounds, borders, inactive form elements, neutral badges. |
| **Muted Brand** | Corporate Maroon| `#7E191B` | Special badges (e.g., baggage class `25K`), specific warning text. |
| **Text Primary** | Charcoal | `#1F2937` | Body text, input labels, primary titles. |
| **Text Secondary** | Muted Grey | `#6B7280` | Subtitles, place names (e.g., "DEL, Indira Gandhi..."), helper text. |
| **Page Background** | Off-White / Cream| `#F9FAFB` | Main B2C landing page backgrounds, B2B dashboard cards background. |
| **Accent Background**| Soft Pink Tint | `#FEE2E2` | Active banner backgrounds, highlight badges, selected state fills. |

---

## 3. Typography & Hierarchy

The typography uses a clean, modern, high-legibility geometric sans-serif typeface (Inter / Roboto style) designed for digital travel reservation systems.

### Font Scale & Hierarchy

| Level | Size (px) | Weight | Line-Height | Tracking / Spacing | Usage Examples |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Title** | 48px | Bold (700) | 56px | -1.5px | Hero Banner main headers |
| **Section Title** | 32px | Bold (700) | 40px | -0.5px | "Why Choose Us", "Popular Flights" |
| **Card Heading** | 24px | Bold (700) | 32px | Normal | Price display in list view (`$120`) |
| **Field Primary** | 18px | Semi-Bold (600)| 24px | Normal | Departure city ("New Delhi"), Traveller Count |
| **Body / Labels** | 14px | Medium (500) | 20px | Normal | Form labels ("Departure From"), Menu links |
| **Captions / Details**| 12px | Regular (400) | 16px | +0.2px | Airport subtext ("DEL, Indira Gandhi..."), taxes |

---

## 4. Key UI Components Specifications

### A. Flight Search Widget (Floating Card Component)
*   **Dimensions**: ~1200px width x ~220px height.
*   **Border Radius**: 16px rounded corners.
*   **Box Shadow**: Soft elevation shadow (`0px 10px 25px rgba(0, 0, 0, 0.05)`).
*   **Tabs Switcher**: 48px height tabs. Selected tab ("Flights") features a red icon and a solid red 3px bottom indicator bar.
*   **Interactive Controls**:
    *   *Directional Swap Button*: A 40px x 40px circular crimson red button centered between "Departure From" and "Going To" inputs, housing a white directional icon (`->` / `<->`).
    *   *Inputs Layout*: Standardized input block consisting of a 12px grey uppercase label sitting above an 18px semi-bold black value.

### B. B2B / B2C Flight Search Results List Card
*   **Layout**: Compact horizontal card grid.
*   **Price Block**: Main currency display `$120` in 24px Bold Dark Navy text, with `Incl. $34 tax` directly underneath in 11px grey caption.
*   **Airline Logo Container**: Center-aligned image wrapper with a height of 32px.
*   **Flight Info Rows**:
    *   *Airline details column*: Logo (e.g., Air India), flight code (`AI 2814`), date, route (`DEL -> MUM`), seat class, departure/arrival times, duration.
    *   *Badges & Amenities*:
        *   `PUB`: Dark blue solid badge (indicates Public fare).
        *   `25K`: Crimson solid badge (indicates baggage limit).
        *   `TKT` & `FEE`: Light grey outlined badges.
        *   *Amenities Icons*: Inline icons for Seats, USB plugs, and Wi-Fi.

### C. Overlays & Modals (B2C Login Modal)
*   **Dimensions**: 480px width x 600px height.
*   **Background**: Pure white surface sitting on a 40% opacity black backdrop overlay.
*   **Form Fields**: Modern clean bottom-border input lines (rather than fully enclosed boxes) with 12px grey float-labels.
*   **Social Login Section**: Row of three 48px circular buttons housing brand icons for Google, Facebook, and Apple.

---

## 5. Page Layout Details

### 1. B2B Flight Search / Booking (Homepage):
- **Logo**: Red suitcase icon + red text "My Travel Deal"
- **Main Navigation Menu**:
  - Text color: Dark Grey
  - Items: `Group Travel` (with dropdown arrow), `My Booking` (with dropdown arrow), `My Account` (with dropdown arrow), `For Sale` (with dropdown arrow)
- **Flight Search Widget (Card Component)**:
  - Background: White card with rounded corners and shadow.
  - Active Tab: `Flights` (displays flight icon and red bottom border indicator).
  - Search Modes (Radio buttons):
    - `One Way`: Selected state has a red inner circle with a grey/red outer border.
    - `Round Trip` / `Multi City`: Unselected state.
  - Search Fields (Structured with title above value):
    - `Departure From`: Primary value "New Delhi" (large, bold black), secondary value "DEL, Indira Gandhi..." (small, grey).
    - `Going To`: Primary value "Mumbai" (large, bold black), secondary value "BOM, Chhatrapat..." (small, grey).
    - Directional swap button: A circular red button with a white right arrow `->`.
    - `Departure Date`: Primary value "24 Sep' 25" (large, bold black), secondary value "Wednesday" (small, grey), plus a chevron icon.
    - `Return Date`: "Book Round Trip To Save Extra" (blue text link).
    - `Traveller & Class`: Primary value "1 Traveller" (large, bold black), secondary value "Economy" (small, grey).
  - Bottom Options (Checkboxes):
    - `Baggage Fares Only` & `Non-Stops Flights`: Checkboxes with red borders (unchecked by default).

### 2. B2C Flight Search / Landing Page (`B2C_01_flight`):
- **Logo**: Same red suitcase + red text logo on the far left.
- **Top Header Menu**:
  - `Home` (Active state: bold red text with a tiny red dot underneath it).
  - `Group Travel`, `About Us` (Inactive state: grey text).
  - `Login / Signup`: A prominent red button with white text and a diagonal arrow.
- **Hero Slider Section**:
  - Background: A beautiful sunset sky image with an airplane wing visible.
  - Heading: `Enjoy Zero Convenience Fee` (large, bold white text).
  - Subheading: `Journeys Simple, Safe, And Affordable` (small, white).
  - Carousel Indicators: Three dots in the center (first is solid white, others are transparent grey).
- **Flight Search Widget (Floating Card)**:
  - Active Tab: `Flights` (red icon + bold red text).
  - Header Links (Right side): `Last Searches v` (grey text + chevron) and `Reset Search` (grey text).
  - Radio buttons: `One Way` (selected: red dot with red/grey border), `Round Trip`, `Multi City`.
  - Input Fields (Structured identically to B2B search):
    - `Departure From`: "New Delhi" (large bold black) / "DEL, Indira Gandhi..." (small grey).
    - Swap button: Red circular icon with white right arrow `->`.
    - `Going To`: "Mumbai" (large bold black) / "BOM, Chhatrapat..." (small grey).
    - `Departure Date v`: "24 Sep' 25" (large bold black) / "Wednesday" (small grey).
    - `Return Date`: "Book Round Trip To Save Extra" (blue text link).
    - `Travellers & Class v`: "1 Traveller" (large bold black) / "Economy" (small grey).
  - Checkbox: `Non-Stops Flights` (unselected with red border).
  - CTA Button: `Search ->` (solid red button, white text, diagonal arrow).
- **"Why Choose Us" Section**:
  - Heading: `WHY CHOOSE US` (red, small caps, suitcase icon).
  - Subtitle: `Making Your Journeys Simple, Safe, And Affordable` (large bold text, with red wavy underline under "Safe, And Affordable").
  - Core Benefit Cards:
    - `Best Price Guarantee`: icon with checkmark inside a red shield, and placeholder description.
    - `Easy & Quick Booking`: icon with calendar and checkmarks.
    - `Customer Care 24/7`: icon with headset and "24" text.
- **PNB Promotional Banner**:
  - A wide banner showing: `Flat 15% Off On PNB Bank`, `Promo Code: FLY123PNB`.
  - Brand logo: Punjab National Bank.
- **"Popular Destinations" Section**:
  - Title: `POPULAR DESTINATIONS` (red, small caps).
  - Subtitle: `Discover Your Next Dream Destination` (bold, large font, with a red wavy underline under "Dream Destination").
  - Navigation: Grey left arrow circle and red right arrow circle.
  - Destination Cards (with image, dark bottom overlay, white text, and circular arrow icon):
    - `Bangkok` (1 tour)
    - `Chicago` (1 tour)
    - `London` (1 tour)
    - `Singapore` (1 tour)
- **"Popular Flights" Section**:
  - Title: `POPULAR FLIGHTS` / `Travel Deal Recommendations` (with a red wavy underline under "Recommendations").
  - Tab Switcher:
    - Active Tab (pink background, white text): `Popular Flights`
    - Inactive Tab (grey text): `Popular Airlines and Airports`
  - Flight routes grid (5 columns) with repeating mock routes (e.g. `Flight to Singapore`, `Flight to Japan`, `Flight to Maldives`, etc.).
- **Footer Section**:
  - Background color: Light grey / beige background.
  - Columns:
    - Logo + description paragraph.
    - `Services`: `Flight Booking`, `Group Travel` (red header, grey links).
    - `Company`: `About Us`, `Career`, `Blog` (red header, grey links).
    - `Need Help?`: `Customer Support`, `Accessibility Statement`, `Privacy Policy`, `Terms Of Use` (red header, grey links).

### 3. B2C Login & Sign Up Modal (`B2C_01_Login`):
- Display: Overlay dialog centered on top of a darkened landing page.
- Tabs (Top switcher):
  - `Login` (selected: bold red text with a red underline).
  - `Signup` (unselected: grey text).
- Heading: `Welcome to My Travel Deal!` (bold black).
- Subheading: `Please Login Using Your Email/Mobile To Continue` (small grey text).
- Fields:
  - `Email Id / Mobile Number` (text field with input line).
  - `Password` (password field with input line).
- Link: `Forgot Password` (red text, right-aligned under password input).
- CTA Button: Solid red button at the bottom.
- Social Logins: `Or Login With` followed by circular buttons for Google, Facebook, and Apple.

### 4. B2C About Us (`B2C_About Us`):
- Navigation: Header menu has `About Us` selected (red bold text, red dot below it).
- Header Title Bar: A solid red horizontal bar containing the white title `About Us`.
- Section: `Why Us?` with a bold header, mock text paragraph, and a blue text link `Come work with us ->`.

---

## 6. Figma Canvas Organization & Map

The Figma project is meticulously organized into a structural map to streamline developer handoff:

```
Figma Project Root
├─ Page: inspiration (Template reference frames & layout moodboards)
├─ Page: Final Design (The core production-ready designs)
│   ├─ Column 1 (Left): B2B Administrative & Back-Office Flows
│   │   ├─ Row 1: Calendar View (+ B2B Search Widget)
│   │   ├─ Row 2: Group Travel B2C Mockups
│   │   ├─ Row 3: My Account / Wallet Dashboards
│   │   ├─ Row 4: Agent & Sub-Agent Management portals
│   │   ├─ Row 5: My Booking dashboards
│   │   └─ Row 6: Offline Reservation Portal
│   │
│   └─ Column 2 (Right): B2C Flight Booking Funnel & Search Results
│       ├─ B2C_01_flight (Main Landing Page)
│       ├─ B2C_01_Login (Overlay Modal Design)
│       ├─ B2C_About Us (Company Information page)
│       └─ B2B_List (B2B flight list views, payment modules, quotes, and add-ons)
│
└─ Page: Colour theme (Component libraries, style guides, and brand swatches)
    ├─ Frame 2085652905 (CyberSabra Header Theme Style Guide)
    ├─ Frame 2085652907 / 2906 / 2904 (Vertical Typography & Components stack)
    └─ B2B_List Swatches (Global design variables and color swatches)
```
