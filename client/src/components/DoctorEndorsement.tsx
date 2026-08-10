import { Quote, Stethoscope } from "lucide-react";
import { t, useLanguage } from "@/hooks/useLanguage";

interface DoctorEndorsementProps {
  compact?: boolean;
}

export default function DoctorEndorsement({ compact = false }: DoctorEndorsementProps) {
  useLanguage();

  return (
    <section className={`doctor-endorsement ${compact ? "doctor-endorsement--compact" : ""}`} aria-labelledby="doctor-recommendation-title">
      <div className="doctor-endorsement__mark" aria-hidden="true">
        <Stethoscope />
      </div>
      <div className="doctor-endorsement__copy">
        <p className="section-kicker">{t("Doctor's recommendation", "डॉक्टर की सिफारिश")}</p>
        <h2 id="doctor-recommendation-title">
          {t("A clinical perspective on the project", "परियोजना पर एक चिकित्सकीय दृष्टिकोण")}
        </h2>
        <blockquote>
          <Quote aria-hidden="true" />
          <p>
            {t(
              "Great app, valuable for the society for diabetic and CKD patients, has a high accuracy rate.",
              "बहुत उपयोगी ऐप, मधुमेह और सीकेडी रोगियों के लिए समाज के लिए मूल्यवान है और इसकी सटीकता दर अच्छी है।",
            )}
          </p>
        </blockquote>
      </div>
      <div className="doctor-endorsement__credit">
        <strong>Dr. Davindar Chopra</strong>
        <span>{t("Chopra Hospital", "चोपड़ा अस्पताल")}</span>
        <span>Chandigarh</span>
      </div>
    </section>
  );
}
