# NephroCare Design System

## Design Thesis

NephroCare is a clinical case file interpreted through contemporary public-health editorial design. It should feel calm enough for a worried patient, precise enough for an appointment, and distinctive enough to be remembered without relying on spectacle.

## Visual Authority

Preserve the existing Activity-mark wordmark and blue, navy, teal, coral, lime, and white palette. Expand that identity through typography, composition, data notation, rules, and motion. Do not replace it with a new logo, monochrome redesign, dark-tech theme, or competitor imitation.

## Modes

- Home: Persuade, with product truth and a real screening-preview state as the visual lead.
- Assessment, reports, symptoms, NephroBot, and results: Operate.
- CKD guide, about, and legal pages: Read.

## Typography

- Interface, body, and display: the original native system sans-serif stack.
- Use weight, scale, rules, and colour to create hierarchy without introducing a second typeface.
- Use sentence case. Do not use negative letter spacing or viewport-scaled font sizes.
- Keep body measure between 58 and 72 characters where practical. Hindi copy may run wider when required for comfortable wrapping.

## Color

- Navy ink: `hsl(201 57% 16%)`
- Medical blue: `hsl(209 90% 43%)`
- Clinical teal: `hsl(172 85% 34%)`
- Safety coral: `hsl(7 72% 60%)`
- Signal lime: `hsl(75 62% 48%)`
- Pale clinical field: `hsl(189 58% 95%)`
- White and lightly tinted blue-gray provide the main reading surfaces.

Never use purple-blue gradients, pure black, gray text on colored panels, decorative glow, or one-hue monochrome sections. Coral and lime are signals, not large background fills.

## Composition

- Prefer editorial bands, split fields, ledgers, ruled lists, and asymmetric offsets over repeated equal cards.
- Cards are reserved for individual records, bounded tools, modal surfaces, and actual repeated entities.
- Never nest cards. Never place a decorative rounded-square icon tile above a heading.
- Use a stable `1240px` service shell, generous outer rhythm, and explicit mobile collapse for every multi-column section.
- Radius stays between 0 and 8 pixels for most surfaces. A pill is allowed only for statuses, segmented choices, and compact tags whose shape communicates state.

## Icon Language

- Preserve the Activity icon only as part of the NephroCare wordmark.
- Use Lucide symbols only for familiar actions, navigation, warnings, disclosure, and status. Decorative category icons are removed.
- Action icons are 16 to 20 pixels, use a consistent 1.75 to 2 pixel stroke, and appear next to text unless the command is universally understood.
- Do not put icons in colored circles or rounded-square containers. Use numbering, labels, rules, and typography to carry hierarchy.
- Icon-only buttons require a tooltip or accessible name and a stable 44 by 44 pixel hit area.

## Motion

- Motion intensity: 4 of 10. Every animation must explain hierarchy, state, or spatial change.
- Use transform and opacity only for routine UI motion.
- Entrances use `cubic-bezier(0.23, 1, 0.32, 1)` and 180 to 260 milliseconds.
- On-screen morphing uses `cubic-bezier(0.77, 0, 0.175, 1)`.
- Buttons use subtle 100 to 160 millisecond press feedback around `scale(0.975)`.
- No bounce, elastic easing, perpetual ornament, hover lift on dense repeated rows, or animation from `scale(0)`.
- Respect `prefers-reduced-motion` everywhere.

## Components

- Header: quiet sticky utility shell with a clear active route and compact language control.
- Buttons: solid blue primary, restrained text or outlined secondary, no oversized pills.
- Forms: visible grouped sections, aligned labels, clear unknown states, and persistent progress context.
- Reports: table and ledger grammar, tabular numerals, explicit provenance, and limited color reserved for risk and status.
- Empty states: plain explanation plus one next action, without mascots or decorative illustrations.
- Doctor recommendation: editorial quotation with hospital attribution and validation context, not a testimonial card.

## Responsive And Accessibility

- Desktop layouts may be asymmetric; mobile order follows reading priority and never relies on horizontal scrolling.
- Hindi content must reflow without clipping navigation, buttons, status labels, or data rows.
- Maintain visible focus, sufficient contrast, reduced-motion alternatives, semantic heading order, and 44-pixel touch targets.

## Anti-References

Avoid generic template signatures: Inter, purple gradients, glassmorphism, floating orbs, glowing borders, rounded icon tiles, three equal feature cards, nested cards, oversized slogans, fake dashboards, and motion that exists only to look expensive.
