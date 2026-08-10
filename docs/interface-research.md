# NephroCare Interface Research

## What Was Rejected

The previous interface repeated the most recognisable generated-site patterns:
rounded cards inside rounded sections, decorative icon tiles, pill labels,
three-column feature grids, soft shadows, and motion added to static marketing
content. Replacing blue with another palette would not solve that structural
problem.

## Principles Applied

1. Declare the design system before composing sections.
2. Use the real screening workflow as the visual subject.
3. Prefer editorial hierarchy, rules, tables, and whitespace over containers.
4. Keep health content readable, specific, and limited to a useful line length.
5. Use animation to explain sequence and state, with reduced-motion support.
6. Keep legal, medical, privacy, and accessibility boundaries visible.
7. Use libraries as behavioural primitives, not as a recognisable template.

## Sources Reviewed

- Greenlight workflow: https://tquinonero.github.io/tutorials/greenlight-ai-workflow/
- Slopless anti-pattern catalogue: https://www.slopless.design/
- Impeccable slop pattern catalogue: https://impeccable.style/slop/
- NHS digital service manual: https://service-manual.nhs.uk/
- NHS design principles: https://service-manual.nhs.uk/design-system/design-principles
- GOV.UK layout guidance: https://design-system.service.gov.uk/styles/layout/
- GOV.UK type scale: https://design-system.service.gov.uk/styles/type-scale/
- Motion source and capabilities: https://github.com/motiondivision/motion
- Radix Primitives: https://github.com/radix-ui/primitives
- Digital Personal Data Protection Act, 2023:
  https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf

## Integration Decisions

Radix and Motion were already present in the repository and were retained.
Adding a visually opinionated component pack would have recreated the same
problem under a newer template. Smooth-scroll libraries were not added because
native scrolling is more predictable for a health service and works better with
keyboard navigation, reduced-motion preferences, and browser accessibility
features.
