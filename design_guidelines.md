# TruthChain MVP Design Guidelines

## Design Approach: Trust-Focused Utility Platform

**Selected Framework**: Material Design principles adapted for blockchain/verification context
**Core Philosophy**: Build credibility through clarity, precision, and transparency. Every element should reinforce trust in the verification process.

---

## Typography System

**Font Stack**: 
- Primary: Inter (Google Fonts) - for UI elements, forms, data
- Monospace: JetBrains Mono - for hashes, CIDs, transaction IDs

**Hierarchy**:
- H1 (Page Title): text-4xl font-bold tracking-tight
- H2 (Section Headers): text-2xl font-semibold
- Body (Forms/Tables): text-base font-normal
- Labels: text-sm font-medium uppercase tracking-wide
- Data (Hashes/CIDs): text-sm font-mono
- Helper Text: text-xs

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 4, 6, 8, 12 consistently
- Component padding: p-6 or p-8
- Section spacing: mb-8 or mb-12
- Form field gaps: gap-6
- Table cell padding: p-4

**Container Strategy**:
- Main container: max-w-6xl mx-auto px-6
- Form width: max-w-2xl mx-auto
- Table: full width within container
- Cards: Consistent p-6 or p-8 internal padding

---

## Component Library

### Header Section
- Centered layout with logo/icon + title
- Subtitle explaining "Decentralized News Verification on Polygon"
- Subtle connection status indicator (Wallet Connected/Not Connected)
- Minimal navigation if needed

### Upload Form Card
**Structure**:
- Elevated card with subtle border
- Form title with verification icon
- Text input (multiline textarea, 4-5 rows)
- File upload with drag-drop zone showing:
  - Upload icon
  - "Drop media file here or click to browse"
  - Accepted formats below (Images: JPG, PNG, GIF | Video: MP4, WebM)
- Submit button (primary action, full width on mobile, auto width on desktop)
- Progress indicator during upload (indeterminate spinner + status text)

### Records Table
**Design**:
- Elevated card container
- Table header: "Verified News Records" with count badge
- Columns: 
  1. Timestamp (human-readable)
  2. News Text (truncated with expand option)
  3. Media (thumbnail preview)
  4. Verification Status (icon + text: "Verified on Polygon")
  5. Details (IPFS CID + TX Hash - truncated, click to copy)
- Responsive: Stack to cards on mobile
- Zebra striping for readability
- Hover states for rows
- Empty state with illustration and "No records yet" message

### Status Indicators
- Success: Checkmark icon + "Verified"
- Processing: Spinner + "Uploading to IPFS..."
- Blockchain: Chain icon + "Recording on Polygon..."
- Complete: Shield icon + "Permanently Verified"

### Buttons
- Primary (Submit): Prominent, full rounded (rounded-lg)
- Secondary (View Details): Outlined style
- Icon buttons (Copy, Expand): Ghost style with hover background

---

## Page Layout

**Single-Page Application Structure**:

1. **Header** (py-8)
   - Logo + Title centered
   - Wallet connection status top-right

2. **Hero Section** (py-12, subtle gradient background)
   - Main heading
   - Subtitle explaining the platform
   - Quick stats: "X records verified" + "Powered by Polygon + IPFS"

3. **Upload Section** (py-12)
   - Form card (max-w-2xl, centered)
   - Clear visual hierarchy

4. **Records Section** (py-12)
   - Full-width table within container
   - Pagination if needed

5. **Footer** (py-8, border-top)
   - Links: GitHub, Documentation
   - MIT License notation
   - Built with Polygon + IPFS logos

---

## Visual Treatment Notes

**Theme Constraint**: Green/blue palette per requirements - implement with purpose:
- Green: Success states, verification confirmations
- Blue: Primary actions, links, blockchain elements

**Depth & Elevation**:
- Cards: Subtle shadow (shadow-sm on default, shadow-md on hover)
- Active elements: shadow-lg
- Inputs: Border focus with ring effect

**Iconography**: 
- Use Heroicons (outline style for navigation, solid for status)
- Verification: Shield check icon
- Upload: Cloud upload icon
- Blockchain: Link/chain icon
- IPFS: Database/server icon

---

## Responsive Behavior

**Breakpoints**:
- Mobile (base): Single column, stacked layout
- Tablet (md:): Form remains centered, table shows abbreviated columns
- Desktop (lg:): Full layout with all table columns

**Mobile Optimizations**:
- Upload form: Full width with adequate touch targets (min 44px)
- Table: Transform to card list with key data visible
- Buttons: Full width on mobile

---

## Trust-Building Elements

- Display blockchain transaction links (to Polygonscan)
- Show IPFS gateway preview links
- Timestamp with "Verified X minutes ago"
- Immutable record indicators
- Open-source badge in footer

This design prioritizes clarity, credibility, and efficient workflows while maintaining the minimal aesthetic suitable for an MVP demonstrating blockchain verification capabilities.