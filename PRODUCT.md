# Product

## Platform

web

## Users

Primary users are patients and families in India who want to organise kidney-health laboratory values, symptoms, and medical history before speaking with a qualified clinician. The interface also needs to remain legible enough for a clinician to review a downloaded report during an appointment.

## Product Purpose

NephroCare is an educational CKD-awareness and preliminary screening service. It turns entered report values and health history into an organised review, offers plain-language learning tools, and helps users prepare better questions for medical care. Success means a user leaves with clearer records and next questions, not a self-diagnosis.

## Positioning

NephroCare combines a bilingual India-first interface, a structured twenty-input screening workflow, explainability views, browser-linked report history, and appointment-ready exports in one student-built public-health project.

## Operating Context

Users may arrive with a printed or digital blood or urine report, may not know every field, and may use the service on a phone. Core journeys are assessment, preliminary results, saved reports, symptom review, NephroBot, the CKD guide, diet-conversation guidance, and PDF export.

## Capabilities and Constraints

- English and Hindi must work throughout the core experience without losing entered form state.
- The product provides education and preliminary screening only. It must not claim to diagnose CKD, prescribe treatment, or replace qualified medical care.
- Results and diet guidance must be framed as discussion prompts for a clinician or renal dietitian.
- Assessment references are linked to the current browser. This is not a substitute for authenticated server-side record ownership.
- The existing React, TypeScript, Vite, Express, Radix, Motion, Lenis, and NumberFlow stack remains in place.
- The service must remain usable with reduced motion, keyboard navigation, long Hindi text, and narrow mobile viewports.

## Brand Commitments

- Preserve the NephroCare name and existing Activity-mark wordmark.
- Preserve the established medical blue, navy, teal, coral, lime, and white identity.
- The interface should feel premium, serious, reassuring, and visibly designed for kidney-health work rather than resemble a generic software template.
- Official contact details remain `nephrocareai@gmail.com` and `@nephrocareai`.
- Do not restore public review cards. Keep the doctor recommendation, presented as clinical validation rather than social proof theatre.

## Evidence on Hand

- Repository copy and working product flows in `client/src`.
- Existing Dr. Davindar Chopra recommendation from Chopra Hospital, Chandigarh.
- Existing assessment model, explainability views, bilingual content, legal pages, and PDF exports.
- No additional patient testimonials, institutional endorsements, or clinical certifications may be invented.

## Product Principles

1. Clarify before persuading.
2. Show the reasoning and its limits.
3. Help users prepare for care, never replace it.
4. Make bilingual access a first-class behavior.
5. Earn trust through precision, restraint, and transparent provenance.

## Accessibility & Inclusion

The interface must support keyboard navigation, visible focus, reduced motion, sufficient contrast, responsive text wrapping, screen-reader labels, and complete English/Hindi switching. Touch controls must remain at least 44 by 44 pixels.
