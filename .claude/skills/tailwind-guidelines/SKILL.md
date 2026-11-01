---
name: tailwind-guidelines
description: Apply Tailwind-first styling across frameworks, including responsive utilities, CSS escape hatches, and cn class composition.
---
# Tailwind-first styling

## Default to Tailwind

- Use Tailwind utilities by default for layout, spacing, sizing, typography, color, borders, states, and responsive styling. Keep classes near the markup when that makes structure and styling easier to read.
- In component frameworks such as SvelteKit, React, and Vue, avoid global CSS unless necessary; prefer component-scoped styles for component-specific rules.
- When using Tailwind, express styling with Tailwind utility classes. Use custom CSS only for specific cases utilities do not reasonably cover, such as keyframe animations or specialized pseudo-element styling. Keep those rules scoped to the component when the framework supports it.
- Reserve global CSS for genuinely global concerns such as Tailwind imports, fonts, theme tokens, resets, and shared base styles. Avoid moving ordinary component styles into separate CSS files without a reason.
- Organize reusable theme values and typography roles centrally, then consume them through Tailwind utilities. For a single static theme, direct Tailwind v4 `@theme` tokens are enough. If the app needs multiple themes or semantic overrides, keep a small set of role-based CSS variables (for example, background/foreground, primary/primary-foreground, and border) and map them to utilities with `@theme inline`. Plain CSS variables alone do not create Tailwind utilities.
- Borrow shadcn's semantic-token approach, not its entire token inventory or component conventions. Add roles only when the UI uses them; pair foreground and background roles deliberately and check contrast. Treat any reference stylesheet as an organizational example, not a palette or project structure to copy blindly.
- Use inline styles for runtime values such as measured positions or progress. Keep static styling in Tailwind or CSS.
- When a runtime value must affect a CSS-only rule, pass it through a CSS custom property; avoid generating utility names dynamically.

## Responsive styles

- For responsive values known in source code, use Tailwind breakpoint prefixes (`sm:`, `md:`, `lg:`) in markup or class maps. Tailwind breakpoints are mobile-first: unprefixed classes apply by default and prefixed classes apply at that breakpoint and above.
- Do not add a dependency just to express ordinary responsive layout. Use an existing runtime-responsive helper when a component API accepts responsive CSS values at runtime that cannot be represented cleanly as a finite set of Tailwind class choices.
- Avoid constructing Tailwind class names by concatenating fragments. Use complete class strings in markup or class maps so Tailwind can detect them at build time.

## Reuse class styles

When class strings repeat, decide whether the repeated styling represents a named visual choice:

- Use a small class map for a few semantic styles, such as text roles or page variants.
- For a reusable component with a small, finite set of meaningful visual variants, use a typed union and an exhaustive `Record<Variant, string>` class map. Compose its selected entry with base and caller classes using the existing `cn` helper. Keep semantic element choice (for example, heading level or link versus button) separate from visual variant.
- Avoid variant APIs for one-off styling and avoid enumerating combinations such as `primarySmallDisabled`; model independent concerns separately when they are genuinely configurable. Keep each Tailwind class string complete and static so the scanner can detect it.
- Use the project's existing `cn` helper for conditional composition and Tailwind conflict resolution (typically `clsx` plus `tailwind-merge`). Do not introduce a second helper or duplicate that setup.
- Keep `cn` for conditional or caller-provided classes, especially where caller classes may override defaults. Do not wrap every static class string in it.

## Examples

Examples use a fictional e-commerce app (catalog, products, cart, and checkout) for consistency. This context is illustrative, not a requirement for projects using the skill.

- **DON'T:** Repeat literal colors and move component layout into global CSS:

  ```svelte
  <button class="bg-[#e85d2a] text-[#202124]">Add to cart</button>
  <style>
    :global(.product-card) { display: grid; gap: 1rem; }
  </style>
  ```

- **DO:** Use a small semantic variable set when theme switching or role-based overrides are useful, map it to Tailwind utilities, and scope CSS escape hatches:

  ```css
  :root {
    --background: white;
    --foreground: #202124;
    --primary: #a83212;
    --primary-foreground: white;
    --border: #dedede;
  }

  @theme inline {
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    --color-primary: var(--primary);
    --color-primary-foreground: var(--primary-foreground);
    --color-border: var(--border);
  }
  ```

  ```svelte
  <main class="reveal bg-background text-foreground">
    <button class="bg-primary text-primary-foreground">Add to cart</button>
  </main>
  <style>
    @keyframes reveal {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Scoped CSS is the escape hatch for this custom animation. */
    .reveal { animation: reveal 200ms ease-out; }
  </style>
  ```

  For a single static theme, define the needed values directly in `@theme` instead of adding the CSS-variable-to-utility mapping layer. Add `.dark` or other theme overrides only when the product supports those modes.

- **DON'T:** Build utility names from fragments or bundle unrelated properties into a growing variant list:

  ```ts
  const className = `bg-${color}-600 text-${size}`;
  type ButtonVariant = 'primary' | 'primarySmall' | 'primaryDisabled' | 'secondary' | 'secondarySmall';
  ```

- **DO:** Use a finite typed map of complete classes, while keeping HTML semantics independent:

  ```ts
  type ButtonVariant = 'primary' | 'secondary';

  const buttonVariantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'border border-border bg-background text-foreground',
  };
  ```

  ```svelte
  <button class={cn('rounded-md px-4 py-2', buttonVariantClasses[variant], className)}>
    Add to cart
  </button>
  ```

This semantic CSS-variable-to-utility pattern is inspired by [shadcn/ui theming](https://ui.shadcn.com/docs/theming); use it selectively rather than adopting its full token set.
