# Theme Wrapper Component

## Overview

The `ThemeWrapper` component provides consistent background colors and theme support across all pages in the Harmonia webapp using Tailwind's dark mode variant.

## Features

- ✅ **Light/Dark Theme Support**: Automatically adapts to theme changes
- ✅ **Consistent Backgrounds**: Unified background colors across all pages
- ✅ **Responsive Text Colors**: Text automatically adjusts for readability
- ✅ **Extensible**: Accepts optional `className` prop for custom styling
- ✅ **Minimal Height**: Ensures full viewport height coverage

## Usage

```tsx
import { ThemeWrapper } from "@/components/ui/theme-wrapper";

export default function MyPage() {
  return (
    <ThemeWrapper>
      {/* Your page content here */}
      <h1>Page Title</h1>
      <p>Page content...</p>
    </ThemeWrapper>
  );
}
```

## Applied Classes

### Background Colors

- **Light Mode**: `bg-white` (white background)
- **Dark Mode**: `dark:bg-[#070B1D]` (dark blue background)

### Text Colors

- **Light Mode**: `text-black` (black text)
- **Dark Mode**: `dark:text-white` (white text)

### Layout

- `min-h-screen`: Ensures minimum full viewport height

## Theme Configuration

The app uses Tailwind's "class" strategy for dark mode, configured in `app/layout.tsx`:

```tsx
<html lang="en" className="dark">
```

This means:

- Dark mode is enabled by default
- Theme changes are controlled by adding/removing the `dark` class on the `<html>` element
- All `dark:` prefixed classes will apply when the `dark` class is present

## Migration Guide

### Before (Inconsistent Backgrounds)

```tsx
// Different pages had different backgrounds
<div className="bg-black h-full md:h-screen">
  {/* content */}
</div>

<div className="bg-[#070B1D] min-h-screen">
  {/* content */}
</div>

<div className="min-h-screen">
  {/* no background */}
</div>
```

### After (Unified Theme Support)

```tsx
// All pages use consistent theming
<ThemeWrapper className="h-full md:h-screen">{/* content */}</ThemeWrapper>
```

## Text Color Guidelines

When using ThemeWrapper, text colors should be theme-aware:

### Good Examples

```tsx
// Automatically adapts to theme
<h1 className="text-xl font-semibold">Title</h1>

// Explicit theme-aware colors
<p className="text-gray-600 dark:text-gray-400">Description</p>
<button className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
  Button
</button>
```

### Avoid

```tsx
// Hardcoded colors that don't adapt
<h1 className="text-white">Title</h1>
<p className="text-black">Description</p>
```

## Integration with LayoutWrapper

ThemeWrapper and LayoutWrapper work together:

```tsx
<ThemeWrapper className="h-full md:h-screen">
  <LayoutWrapper>
    {/* Page content with consistent spacing and theming */}
    <h1>Page Title</h1>
    <p>Content...</p>
  </LayoutWrapper>
</ThemeWrapper>
```

## Theme Toggle Compatibility

If you implement a theme toggle (e.g., using `next-themes`), the ThemeWrapper will automatically respond:

```tsx
// Example with next-themes
import { useTheme } from "next-themes";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle Theme
    </button>
  );
}
```

The ThemeWrapper will automatically apply the correct background and text colors when the theme changes.

## Browser Support

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers
- ✅ Tailwind CSS dark mode support required

## Performance

- **Minimal impact**: Lightweight component with no additional dependencies
- **No JavaScript required**: Pure CSS-based theme switching
- **Tree-shakeable**: Only imports what's needed

## Future Enhancements

1. **Custom Theme Colors**: Allow custom background colors via props
2. **Theme Variants**: Support for multiple theme options
3. **Smooth Transitions**: Add CSS transitions for theme changes
4. **System Preference**: Respect user's system theme preference
