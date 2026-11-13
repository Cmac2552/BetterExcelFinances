# UI Style Guide

This document provides comprehensive UI styling guidelines for Better Excel Finances. Use this as your reference when creating or modifying any UI components in the application.

**Purpose**: Ensure consistency in design, maintain the dark financial aesthetic, and provide quick-reference patterns for common UI needs.

---

## Design System Overview

Better Excel Finances uses a **dark-first design system** optimized for financial data visualization:

- **Dark theme**: Primary aesthetic with high contrast for readability
- **Financial indicators**: Color-coded system (green for assets, red for debts)
- **Minimalist approach**: Clean, focused interface without unnecessary decoration
- **Subtle interactions**: Hover states and transitions provide feedback without distraction

---

## Color Palette

### Primary Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#141414` | Main app background, card backgrounds |
| Surface | `#1E2228` | Elevated surfaces, input backgrounds, secondary cards |
| Text Primary | `#f4f0e1` | Main text color, headings, labels |

### Semantic Colors (Financial Indicators)

| Color | Hex | Usage |
|-------|-----|-------|
| Assets (Green) | `#00A896` | Asset indicators, positive values, unchecked switches |
| Debts (Red) | `#7B0323` | Debt indicators, negative values, checked switches |

### Chart Colors

Used in data visualizations (pie charts, line charts):

| Variable | HSL Value | Hex Equivalent |
|----------|-----------|----------------|
| `--chart-1` | `12 76% 61%` | Light variant |
| `--chart-2` | `173 58% 39%` | Teal |
| `--chart-3` | `197 37% 24%` | Dark blue |
| `--chart-4` | `43 74% 66%` | Yellow |
| `--chart-5` | `27 87% 67%` | Orange |

**Pie Chart Palette** (CategoryPieChart.tsx):
- `#A2CFFE` (Baby Blue)
- `#D98880` (Muted Red)
- `#98FB98` (Muted Green)
- `#F3E5AB` (Muted Yellow)
- `#D3D3D3` (Light Grey)
- `#F5F5F5` (White Smoke)
- `#B0C4DE` (Light Steel Blue)
- And 9 additional muted variants for comprehensive category coverage

### Border & UI Colors

| Color | Usage |
|-------|-------|
| `border-gray-600` | Standard borders, input borders |
| `border-gray-700` | Secondary button borders, emphasis |
| `border-gray-400` | Hover state borders |
| `border-transparent` | Initial state for ghost buttons |

---

## Typography System

### Font Family
- **Primary**: `Inter` (system font stack via Tailwind)

### Text Sizes & Usage

| Class | Size | Usage |
|-------|------|-------|
| `text-xs` | 0.75rem | Small labels, helper text |
| `text-sm` | 0.875rem | Secondary text, descriptions |
| `text-base` | 1rem | Body text, buttons, inputs |
| `text-lg` | 1.125rem | Dialog titles, emphasized text |
| `text-xl` | 1.25rem | Section subheadings |
| `text-2xl` | 1.5rem | Section headings, card titles |
| `text-4xl` | 2.25rem | Net worth amount (hero text) |

### Font Weights

| Class | Weight | Usage |
|-------|--------|-------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Labels, emphasized text |
| `font-semibold` | 600 | Dialog titles, important headings |
| `font-bold` | 700 | Main headings, section titles |

### Special Typography Patterns

```tsx
// Uppercase label pattern (common for form labels)
className="text-sm font-medium uppercase tracking-wide text-[#f4f0e1]"

// Section heading
className="text-2xl font-bold text-[#f4f0e1]"

// Net worth amount with gradient
className="text-4xl font-bold bg-gradient-to-r from-[#00A896] to-[#7B0323] bg-clip-text text-transparent"
```

---

## Component Styling Patterns

### Buttons

Button variants are the most critical UI element. Use the correct variant for each context:

#### Variant Reference

| Variant | Visual Style | Usage |
|---------|-------------|--------|
| `primary` | Cream background (`#f4f0e1`), black text, glowing shadow | Primary CTAs, important actions (e.g., "Import Data", "Save") |
| `secondary` | Dark surface (`#1E2228`), gray border, cream text | Secondary actions, alternative options |
| `ghost` | Transparent, border on hover only | Icon buttons, delete buttons, non-intrusive actions |
| `destructive` | Red background, white text | Dangerous actions (rare, prefer ghost for deletes) |
| `default` | Zinc background (shadcn default) | Rarely used, prefer primary/secondary |
| `link` | Underlined text, no background | Inline links, navigation |

#### Size Options

| Size | Dimensions | Usage |
|------|------------|-------|
| `default` | h-9, px-4 | Standard button size |
| `sm` | h-8, px-3, text-xs | Compact buttons in tight spaces |
| `lg` | h-10, px-8 | Large CTAs, hero buttons |
| `icon` | h-9, w-9 | Square icon buttons |
| `icon-slim` | h-9, w-6 | Narrow icon buttons (pencil, delete) |

#### Code Examples

```tsx
// Primary CTA
<Button variant="primary" size="lg">
  Import Data From Previous Month
</Button>

// Secondary action
<Button variant="secondary" size="default">
  Cancel
</Button>

// Icon button (ghost)
<Button variant="ghost" size="icon-slim">
  <TiPencil />
</Button>

// Destructive action (rare)
<Button variant="destructive" size="default">
  Delete Account
</Button>
```

#### When to Use Which Variant

- **Primary**: Main action on a page (1 per screen max)
- **Secondary**: Alternative actions, modal cancel buttons
- **Ghost**: Edit/delete icons, toolbar buttons, non-critical actions
- **Destructive**: Only when action is truly dangerous (not for simple deletes)

---

### Form Inputs

Standard input pattern used throughout the app:

```tsx
// Text input
<input
  type="text"
  className="w-full px-4 py-2 bg-[#1E2228] text-[#f4f0e1] border border-gray-600 rounded-lg focus:ring-2 focus-visible:ring-[#f4f0e1] focus-visible:outline-none placeholder-gray-400"
  placeholder="Account name"
/>

// NumericFormat (currency input)
<NumericFormat
  value={value}
  onValueChange={(values) => setValue(values.floatValue ?? 0)}
  thousandSeparator=","
  prefix="$"
  decimalScale={2}
  fixedDecimalScale
  className="w-full px-4 py-2 bg-[#1E2228] text-[#f4f0e1] border border-gray-700 rounded-lg focus:ring-2 focus-visible:ring-[#f4f0e1] focus-visible:outline-none"
/>
```

**Key Properties**:
- Background: `bg-[#1E2228]` (surface color)
- Text: `text-[#f4f0e1]`
- Border: `border-gray-600` or `border-gray-700`
- Focus ring: `focus-visible:ring-[#f4f0e1]` (2px ring)
- Placeholder: `placeholder-gray-400`

---

### Cards

Cards provide container structure for sections:

```tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Standard card
<Card className="bg-[#141414] h-full w-[95%]">
  <CardHeader className="p-2">
    {/* Header content */}
  </CardHeader>
  <CardContent className="p-4">
    {/* Main content */}
  </CardContent>
</Card>

// Alternative (surface-colored card)
<Card className="bg-[#1E2228] rounded-lg p-6 shadow-sm">
  {/* Content */}
</Card>
```

**Patterns**:
- Default background: `bg-[#141414]` (matches app background)
- Elevated surface: `bg-[#1E2228]`
- Standard padding: `p-6` or `p-4`
- Border radius: `rounded-lg` (0.5rem)
- Shadow (optional): `shadow-sm`

---

### Dialogs/Modals

Dialog styling uses dark content (matching the app's dark theme) on a dark overlay:

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

<Dialog>
  <DialogContent className="sm:max-w-lg bg-[#141414] border border-gray-700 text-[#f4f0e1]">
    <DialogHeader>
      <DialogTitle className="text-lg font-semibold text-[#f4f0e1]">
        Dialog Title
      </DialogTitle>
      <DialogDescription className="text-sm text-gray-400">
        Optional description
      </DialogDescription>
    </DialogHeader>

    {/* Dialog content */}

    <DialogFooter>
      <Button variant="secondary">Cancel</Button>
      <Button variant="primary">Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Key Patterns**:
- Overlay: `bg-black/80` (80% opacity)
- Content Background: `bg-[#141414]` (matches main dark background)
- Content Text: `text-[#f4f0e1]` (cream text)
- Border: `border-gray-700`
- Max width: `max-w-lg` (or `max-w-2xl` for dense layouts like tables)
- Padding: `p-6`

---

### Switches

Switches use semantic colors for asset/debt indication:

```tsx
import { Switch } from "@/components/ui/switch";

<Switch
  checked={isDebt}
  onCheckedChange={setIsDebt}
/>
```

**Color Logic**:
- Unchecked (Asset): Green background
- Checked (Debt): Red background
- Thumb: `bg-[#f4f0e1]` (cream color)
- Size: h-5, w-9

**Note**: The switch component in this app is customized. Default state = Asset (green), Checked state = Debt (red).

---

### Select Dropdowns

```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

<Select value={value} onValueChange={setValue}>
  <SelectTrigger className="w-full bg-[#1E2228] text-[#f4f0e1] border border-gray-600">
    <SelectValue placeholder="Select month" />
  </SelectTrigger>
  <SelectContent className="bg-[#1E2228] text-[#f4f0e1] border border-gray-600">
    <SelectItem value="1-2024">January 2024</SelectItem>
    <SelectItem value="2-2024">February 2024</SelectItem>
  </SelectContent>
</Select>
```

---

## Layout & Spacing

### Container Widths

Common width patterns in the dashboard:

```tsx
// Financial section cards (3 columns)
className="w-1/3"  // Each section takes 1/3 width

// Dashboard main areas
className="w-[60%]"  // Sections area (left side)
className="w-[30%]"  // Chart area (right side)

// Full width with margin
className="w-[95%]"  // Card with slight margin
```

### Flexbox Patterns

```tsx
// Horizontal layout with space between
className="flex items-center justify-between"

// Horizontal layout with gap
className="flex flex-row gap-4"

// Vertical stack
className="flex flex-col gap-2"

// Centered content
className="flex justify-center items-center"

// Wrap items
className="flex flex-wrap gap-4"
```

### Grid Patterns

```tsx
// Responsive grid (common for transaction tables)
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
```

### Spacing Scale

Use consistent spacing throughout:

| Class | Size | Usage |
|-------|------|-------|
| `gap-1` | 0.25rem | Tight spacing |
| `gap-2` | 0.5rem | Small spacing between related items |
| `gap-4` | 1rem | **Default spacing** between elements |
| `gap-6` | 1.5rem | Larger spacing between sections |
| `p-2` | 0.5rem | Compact padding (card headers) |
| `p-4` | 1rem | Standard padding |
| `p-6` | 1.5rem | **Default card padding** |
| `m-4` | 1rem | Standard margin |
| `ml-2` | 0.5rem | Small left margin (icons) |
| `mr-4` | 1rem | Right margin between elements |

---

## Interactive States

### Hover States

```tsx
// Button hover (example: ghost button)
className="hover:border-gray-400 hover:bg-gray-700"

// Primary button hover (glow effect)
className="hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"

// Group hover pattern (show on parent hover)
<div className="group">
  <div className="invisible group-hover:visible">
    {/* Content appears on parent hover */}
  </div>
</div>
```

### Focus States

**Standardized focus ring** (use everywhere for accessibility):

```tsx
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4f0e1]"

// With ring offset (for buttons)
className="focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
```

### Active/Disabled States

```tsx
// Disabled state (automatic on Button component)
disabled={true}
// Results in: disabled:pointer-events-none disabled:opacity-50

// Active/selected state
className="data-[state=active]:bg-[#1E2228]"
```

---

## Chart & Data Visualization

### Line Chart (Net Worth Tracking)

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

// Uses --chart-1 through --chart-5 CSS variables
<Line
  type="monotone"
  dataKey="value"
  stroke="hsl(var(--chart-1))"
  strokeWidth={2}
/>
```

### Pie Chart (Category Spending)

See CategoryPieChart.tsx for reference. Uses COLORS array with 16 muted pastel variants.

### Data Tables

```tsx
// Table container
<div className="overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr className="border-b border-gray-700">
        <th className="text-left p-2 text-sm font-medium uppercase tracking-wide text-[#f4f0e1]">
          Category
        </th>
        <th className="text-right p-2 text-sm font-medium uppercase tracking-wide text-[#f4f0e1]">
          Amount
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-gray-800 hover:bg-[#1E2228]">
        <td className="p-2 text-[#f4f0e1]">Food</td>
        <td className="p-2 text-right text-[#f4f0e1]">$500.00</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## Gradient Patterns

### Text Gradients

```tsx
// Net worth amount (conditional gradient: green to red)
className="text-4xl font-bold bg-gradient-to-r from-[#00A896] to-[#7B0323] bg-clip-text text-transparent"

// Alternative single-color emphasis
className="text-[#00A896]"  // Green for positive
className="text-[#7B0323]"  // Red for negative
```

### Decorative Gradients

```tsx
// Accent line (optional)
<div className="h-1 w-full bg-gradient-to-r from-[#00A896] to-[#7B0323]" />
```

---

## Icons

### Icon Libraries

- **react-icons**: Primary icon library
  - `react-icons/go` (GoXCircleFill for delete)
  - `react-icons/ti` (TiPencil for edit)
  - `react-icons/fa6` (FaMoneyBill1 for financial indicators)
- **lucide-react**: Used in shadcn components

### Icon Patterns

```tsx
// Icon with semantic color
<FaMoneyBill1 className="text-[#00A896] text-2xl w-[2rem] h-[2rem]" /> // Asset
<FaMoneyBill1 className="text-[#7B0323] text-2xl w-[2rem] h-[2rem]" /> // Debt

// Icon button
<Button variant="ghost" size="icon-slim">
  <TiPencil className="text-[#f4f0e1]" />
</Button>

// Delete icon
<Button variant="ghost" size="icon-slim" onClick={onDelete}>
  <GoXCircleFill className="text-[#f4f0e1]" />
</Button>
```

---

## Quick Reference: Copy-Paste Patterns

### Primary CTA Button
```tsx
<Button variant="primary" size="lg">Save Changes</Button>
```

### Secondary Button
```tsx
<Button variant="secondary" size="default">Cancel</Button>
```

### Icon Button (Edit)
```tsx
<Button variant="ghost" size="icon-slim">
  <TiPencil className="text-[#f4f0e1]" />
</Button>
```

### Text Input
```tsx
<input
  type="text"
  className="w-full px-4 py-2 bg-[#1E2228] text-[#f4f0e1] border border-gray-600 rounded-lg focus:ring-2 focus-visible:ring-[#f4f0e1] focus-visible:outline-none placeholder-gray-400"
  placeholder="Enter value"
/>
```

### Currency Input
```tsx
<NumericFormat
  value={amount}
  onValueChange={(values) => setAmount(values.floatValue ?? 0)}
  thousandSeparator=","
  prefix="$"
  decimalScale={2}
  fixedDecimalScale
  className="w-full px-4 py-2 bg-[#1E2228] text-[#f4f0e1] border border-gray-700 rounded-lg focus:ring-2 focus-visible:ring-[#f4f0e1] focus-visible:outline-none"
/>
```

### Card Container
```tsx
<Card className="bg-[#141414] rounded-lg p-6 shadow-sm">
  {/* Content */}
</Card>
```

### Section Heading
```tsx
<h2 className="text-2xl font-bold text-[#f4f0e1]">Section Title</h2>
```

### Label (Form)
```tsx
<label className="text-sm font-medium uppercase tracking-wide text-[#f4f0e1]">
  Field Name
</label>
```

### Horizontal Layout with Gap
```tsx
<div className="flex items-center gap-4">
  {/* Items */}
</div>
```

### Group Hover Pattern
```tsx
<div className="group">
  <div className="invisible group-hover:visible">
    {/* Shows on hover */}
  </div>
</div>
```

---

## Design Principles & Best Practices

### Color Usage Guidelines

1. **Background hierarchy**: Use `#141414` for main background, `#1E2228` for elevated surfaces
2. **Text contrast**: Always use `#f4f0e1` on dark backgrounds for optimal readability
3. **Semantic colors**: Reserve green/red only for financial indicators (assets/debts)
4. **Chart colors**: Use CSS variables (`--chart-1` to `--chart-5`) for data visualization
5. **Borders**: Use gray variants (`border-gray-600/700`) for subtle separation

### Spacing Guidelines

1. **Default gap**: Use `gap-4` as the standard spacing between elements
2. **Card padding**: Use `p-6` for standard card padding
3. **Form spacing**: Use `gap-2` between label and input, `gap-4` between form rows
4. **Section spacing**: Use `my-4` or `gap-6` between major sections

### Accessibility Requirements

1. **Focus states**: Always include `focus-visible:ring-2 focus-visible:ring-[#f4f0e1]`
2. **ARIA labels**: Add `aria-label` to icon-only buttons
3. **Keyboard navigation**: Ensure all interactive elements are keyboard-accessible
4. **Color contrast**: Maintain WCAG AA standard (cream on dark meets this)

### Responsive Design Approach

1. **Mobile-first**: Start with mobile layout, enhance for larger screens
2. **Flexible widths**: Use percentage widths (`w-1/3`) or max-width constraints
3. **Grid responsiveness**: Use `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` pattern
4. **Touch targets**: Ensure buttons are minimum 44x44px on mobile

### Animation Guidelines

1. **Subtle only**: Use `transition-colors` and `transition-all duration-300` for smooth state changes
2. **No distractions**: Avoid animations that draw attention away from content
3. **Hover feedback**: Provide immediate visual feedback on hover (border/background change)
4. **Loading states**: Use opacity changes or subtle pulses for loading indicators

---

## File References

This guide was created by analyzing:

- `tailwind.config.ts` - Theme configuration
- `app/globals.css` - CSS variables and base styles
- `components/ui/button.tsx` - Button variants
- `components/ui/card.tsx` - Card patterns
- `components/ui/dialog.tsx` - Modal patterns
- `components/ui/switch.tsx` - Switch styling
- `app/components/financialInputs.tsx` - Example usage
- `app/components/financialSections.tsx` - Complex component styling
- `app/upload/CategoryPieChart.tsx` - Chart colors

---

## Maintenance

When adding new UI patterns:

1. Document the pattern in this guide with code examples
2. Ensure it follows the existing color palette and spacing scale
3. Test for accessibility (focus states, keyboard navigation)
4. Update this guide if you establish a new convention

**Last Updated**: 2026-02-02
