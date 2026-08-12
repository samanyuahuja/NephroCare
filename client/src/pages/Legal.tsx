import { Link } from "wouter";

type Section = {
  title: string;
  paragraphs?: React.ReactNode[];
  bullets?: React.ReactNode[];
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  summary: string;
  sections: Section[];
};

const effectiveDate = "12 August 2026";

function LegalPage({ eyebrow, title, summary, sections }: LegalPageProps) {
  return (
    <article className="legal-page">
      <aside className="legal-page__aside">
        <p>{eyebrow}</p>
        <time dateTime="2026-08-12">Effective {effectiveDate}</time>
      </aside>
      <div className="legal-page__content">
        <h1>{title}</h1>
        <p className="legal-page__summary">{summary}</p>
        {sections.map((section) => (
          <section className="legal-section" key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs?.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            {section.bullets && <ul>{section.bullets.map((bullet, index) => <li key={index}>{bullet}</li>)}</ul>}
          </section>
        ))}
      </div>
    </article>
  );
}

export function PrivacyPolicy() {
  return (
    <LegalPage
      eyebrow="Trust and safety"
      title="Privacy notice"
      summary="This notice explains what NephroCare handles when you use its screening, report, diet-guidance, and chatbot features. Health information deserves plain language, limited collection, and careful handling."
      sections={[
        {
          title: "Information you provide",
          paragraphs: ["An assessment may include an optional label, age, laboratory values, symptoms, health history, and related screening answers. NephroBot receives the question needed to return a response; chat questions are not written to NephroCare's application database."],
          bullets: ["Assessment inputs and generated risk context", "Diet preferences and generated guidance", "Questions submitted to NephroBot while the request is processed", "Messages you send to the support email"],
        },
        {
          title: "Information kept in your browser",
          paragraphs: ["NephroCare stores your language preference, high-entropy report capabilities, and NephroBot conversation history in local browser storage. A capability acts like a private key to a report. Clearing site data removes those local references and may permanently remove your ability to retrieve a report."],
        },
        {
          title: "How information is used",
          bullets: ["To create and retrieve the screening report you request", "To produce general diet guidance connected to an assessment", "To answer kidney-health questions", "To maintain security, diagnose failures, and prevent misuse"],
        },
        {
          title: "Storage and sharing",
          paragraphs: ["Assessment health fields are encrypted before database storage. The database retains only encrypted clinical details, a hashed access capability, limited result metadata, consent version, and expiry time. New assessment records expire after 30 days. NephroCare does not sell personal information. Hosting and database providers process limited data only to operate and secure the requested service."],
        },
        {
          title: "Your choices",
          paragraphs: [<>Use initials or a nickname rather than a full name. You can retrieve or permanently delete a report from My Reports while its capability remains in this browser. For access, correction, deletion, consent withdrawal, or a privacy complaint, email <a href="mailto:nephrocareai@gmail.com">nephrocareai@gmail.com</a>. Never email laboratory values or other health data unless support specifically provides a secure method.</>],
        },
        {
          title: "Adults only and urgent information",
          paragraphs: ["NephroCare does not accept assessment submissions from anyone under 18. A parent or guardian must not bypass this restriction by entering a child's details. Do not use this service for emergencies or submit information that is unnecessary for the screening task."],
        },
        {
          title: "Changes and questions",
          paragraphs: [<>This notice may change as the service develops. Material revisions will receive a new effective date. Questions can be sent to <a href="mailto:nephrocareai@gmail.com">nephrocareai@gmail.com</a>.</>],
        },
      ]}
    />
  );
}

export function TermsOfUse() {
  return (
    <LegalPage
      eyebrow="Service terms"
      title="Terms of use"
      summary="These terms govern use of NephroCare. By using the service, you acknowledge that it is an educational and preliminary screening project, not a healthcare provider."
      sections={[
        { title: "Purpose of the service", paragraphs: ["NephroCare organises user-provided information into educational content, preliminary risk context, symptom guidance, and general diet information. It does not create a doctor-patient relationship."] },
        { title: "Your responsibilities", bullets: ["Provide information lawfully and, where relevant, with the person's permission", "Check important decisions with a qualified healthcare professional", "Do not attempt to disrupt, reverse engineer, scrape, or misuse the service", "Do not rely on the service for emergency or time-critical decisions"] },
        { title: "No guaranteed result", paragraphs: ["The service may be incomplete, unavailable, or incorrect. Screening estimates depend on the information entered and on technical limitations. NephroCare does not guarantee accuracy, clinical suitability, uninterrupted availability, or a particular health outcome."] },
        { title: "Intellectual property", paragraphs: ["The NephroCare name, interface, original text, and project materials are protected by applicable intellectual-property rules. Third-party libraries and referenced materials remain subject to their own licences."] },
        { title: "Limitation of responsibility", paragraphs: ["To the extent permitted by applicable law, NephroCare and its developer are not responsible for loss resulting from reliance on screening output, general guidance, third-party services, service interruption, or unauthorised use. Rights that cannot lawfully be excluded remain unaffected."] },
        { title: "Changes and contact", paragraphs: [<>Features and these terms may change. Continued use after an updated effective date means the revised terms apply. Questions can be sent to <a href="mailto:nephrocareai@gmail.com">nephrocareai@gmail.com</a>.</>] },
      ]}
    />
  );
}

export function MedicalDisclaimer() {
  return (
    <LegalPage
      eyebrow="Read before use"
      title="Medical disclaimer"
      summary="NephroCare provides health education and preliminary screening support. Its formal regulatory classification is under review; it is not authorised or registered for clinical diagnosis, treatment decisions, or emergency use and is not a substitute for a qualified clinician."
      sections={[
        { title: "No diagnosis or treatment", paragraphs: ["A risk score or symptom result cannot confirm or rule out chronic kidney disease or any other condition. Only an appropriately qualified professional can interpret your history, examine you, order tests, diagnose disease, and recommend treatment."] },
        { title: "Screening limitations", bullets: ["Results depend on the accuracy and completeness of the information entered", "Reference ranges vary by laboratory, age, sex, clinical history, medicines, and other factors", "A low preliminary estimate does not guarantee that no medical problem exists", "A high estimate does not establish a diagnosis"] },
        { title: "Diet and chatbot guidance", paragraphs: ["Dietary needs can differ substantially by CKD stage, dialysis status, medicines, potassium, sodium, phosphorus, fluid balance, and other conditions. NephroBot can generate incomplete or incorrect information. Do not start, stop, or change medication, fluid intake, supplements, or a prescribed diet based on this service."] },
        { title: "When to seek urgent help", paragraphs: ["Contact local emergency services or seek urgent medical care for severe shortness of breath, chest pain, confusion, fainting, sudden major swelling, very low urine output, severe weakness, persistent vomiting, or any symptom that feels serious or rapidly worsening."], bullets: ["India emergency number: 112", "For non-emergency concerns, contact a doctor, nephrologist, or other qualified professional"] },
        { title: "Using your report", paragraphs: [<>Treat the NephroCare report as a conversation aid. Bring the original laboratory report and your medicine list to a clinician. See the <Link href="/about-ckd">CKD guide</Link> for general background information.</>] },
      ]}
    />
  );
}

export function AccessibilityStatement() {
  return (
    <LegalPage
      eyebrow="Inclusive service"
      title="Accessibility statement"
      summary="NephroCare aims to make kidney-health information understandable and usable across devices, languages, zoom levels, keyboard navigation, and reduced-motion preferences."
      sections={[
        { title: "What is supported", bullets: ["Semantic headings and a skip link for keyboard users", "Visible keyboard focus indicators", "Layouts that reflow for mobile screens and browser zoom", "English and Hindi interface controls", "Reduced-motion handling for animated content", "Text labels for form fields and primary controls"] },
        { title: "Current limitations", paragraphs: ["Some generated charts, older assessment components, downloaded PDFs, or third-party content may not yet provide an equivalent experience for every assistive technology. Automated checks alone cannot establish full accessibility."] },
        { title: "Standards and testing", paragraphs: ["The project uses WCAG 2.2 Level AA as its design target. This statement describes an ongoing goal and is not a certification of complete conformance."] },
        { title: "Request help or report a barrier", paragraphs: [<>If you cannot access part of NephroCare, email <a href="mailto:nephrocareai@gmail.com">nephrocareai@gmail.com</a>. Include the page, the task you were trying to complete, your browser or assistive technology when comfortable, and the format you need.</>] },
      ]}
    />
  );
}
