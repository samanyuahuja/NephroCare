# NephroCare Web Design System

## Direction

NephroCare should feel like a clear, approachable Indian kidney-health service.
The product experience is the visual identity: report values, symptoms, screening
steps, risk context, and practical guidance. It should not resemble a generic AI
landing page or borrow the visual language of SamQuant.

## Typography

- Use the existing sans-serif stack for headings, interface text, and body copy.
- Headings are bold and direct, with normal letter spacing.
- Body copy is calm, readable, and limited to useful medical context.
- Avoid oversized display headlines, all-caps feature copy, and inflated claims.

## Colour Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| Primary blue | `hsl(207 90% 54%)` | Primary actions, links, progress, key icons |
| Deep blue | `hsl(215 70% 35%)` | Strong labels and selected states |
| Blue wash | `hsl(214 100% 97%)` | Hero and supporting medical sections |
| Page grey | `hsl(210 40% 98%)` | Application background |
| White | `hsl(0 0% 100%)` | Forms, reports, and tool surfaces |
| Ink | `hsl(220 25% 12%)` | Primary text |
| Muted ink | `hsl(215 16% 47%)` | Supporting text |
| Border | `hsl(214 32% 91%)` | Dividers and component boundaries |

Risk colours are reserved for medical state: red for high risk, amber for
moderate risk, and green for low risk. They are not decorative accents.

## Components

- Cards use the existing 8px radius, a quiet border, and at most a small shadow.
- Buttons use the existing blue primary and white outline variants.
- Icons come from Lucide and clarify an action or medical concept.
- Forms remain dense, familiar, and easy to scan.
- Sections may use a 16px radius where they group a complete workflow.

## Motion

Motion explains the screening journey rather than decorating the page.

- The hero animates report inputs into a screening summary.
- Sections reveal once as they enter the viewport.
- Route changes use a short fade and vertical settle.
- A thin blue progress line reflects page scroll.
- Mobile uses shorter travel and no parallax.
- Reduced-motion users receive the complete static state.

No infinite pulsing, magnetic cursors, floating blobs, ornamental parallax,
hover scaling, or motion that prevents reading and interaction.

## Anti-Template Rules

- No purple gradients or multi-colour hero treatments.
- No invented testimonials, statistics, awards, or validation claims.
- No repeated feature-card grids when a workflow or directory is clearer.
- No vague phrases such as "revolutionary", "advanced AI", or "powered by AI".
- No stock healthcare photography used only for atmosphere.
- No nested cards or oversized marketing sections inside the working product.
- Use the real assessment, reports, and medical guidance as visual material.

## Workflow Reference

The implementation workflow adapts Toni Quinonero's design-system-first guidance:
define the brand, validate sections against it, use meaningful product visuals,
and add motion only after the structure is coherent.

Reference: https://tquinonero.github.io/tutorials/greenlight-ai-workflow/
