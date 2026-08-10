import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Bot,
  BookOpenText,
  ChevronRight,
  Info,
  RotateCcw,
  Send,
  ShieldAlert,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { t, useLanguage } from "@/hooks/useLanguage";

interface LocalChatMessage {
  id: number;
  message: string;
  response: string;
  timestamp: string;
}

export default function Chatbot() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<LocalChatMessage[]>([]);
  const conversationEnd = useRef<HTMLDivElement>(null);
  useLanguage();

  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem("nephroBotMessages");
      if (storedMessages) setMessages(JSON.parse(storedMessages));
    } catch (error) {
      console.error("Error loading chat messages:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("nephroBotMessages", JSON.stringify(messages));
    } catch (error) {
      console.error("Error saving chat messages:", error);
    }
    conversationEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      try {
        const response = await fetch("/api/chat-direct", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage }),
        });

        if (!response.ok) throw new Error("Failed to get response from NephroBot");
        const data = await response.json();
        return data.reply || t("I could not process that question. Please try again.", "मैं उस प्रश्न को समझ नहीं पाया। कृपया दोबारा प्रयास करें।");
      } catch (error) {
        console.error("Error calling chatbot:", error);
        return t("NephroBot is temporarily unavailable. Please try again later.", "नेफ्रोबॉट अभी उपलब्ध नहीं है। कृपया बाद में दोबारा प्रयास करें।");
      }
    },
    onSuccess: (botResponse, userMessage) => {
      setMessages((current) => [...current, { id: Date.now(), message: userMessage, response: botResponse, timestamp: new Date().toISOString() }]);
      setMessage("");
    },
  });

  const handleSendMessage = () => {
    if (message.trim() && !sendMessageMutation.isPending) sendMessageMutation.mutate(message.trim());
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const askQuestion = (question: string) => {
    if (!sendMessageMutation.isPending) sendMessageMutation.mutate(question);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("nephroBotMessages");
  };

  const sampleQuestions = [
    t("What does high creatinine mean?", "उच्च क्रिएटिनिन का क्या मतलब है?"),
    t("Which tests check kidney health?", "कौन-सी जांच किडनी स्वास्थ्य की जानकारी देती हैं?"),
    t("What are common CKD warning signs?", "सीकेडी के सामान्य चेतावनी संकेत क्या हैं?"),
    t("How should I prepare for a kidney appointment?", "किडनी से जुड़ी अपॉइंटमेंट की तैयारी कैसे करूं?"),
    t("What questions should I ask about my eGFR?", "अपने eGFR के बारे में मुझे क्या पूछना चाहिए?"),
  ];

  return (
    <div className="chat-page">
      <header className="tool-header tool-header--chat">
        <div>
          <p className="section-kicker">{t("Kidney-health conversation", "किडनी स्वास्थ्य संवाद")}</p>
          <h1>{t("Ask NephroBot", "नेफ्रोबॉट से पूछें")}</h1>
          <p>{t("Explore a term, prepare for an appointment, or ask for a simpler explanation.", "किसी शब्द को समझें, अपॉइंटमेंट की तैयारी करें या आसान व्याख्या पूछें।")}</p>
        </div>
        <div className="chat-status"><span aria-hidden="true" />{t("Educational assistant", "शैक्षिक सहायक")}</div>
      </header>

      <div className="chat-workspace">
        <aside className="chat-sidebar">
          <div className="chat-sidebar__heading"><BookOpenText aria-hidden="true" /><div><strong>{t("Starting points", "शुरुआती प्रश्न")}</strong><span>{t("Choose one or write your own", "एक चुनें या अपना प्रश्न लिखें")}</span></div></div>
          <div className="chat-prompts">
            {sampleQuestions.map((question, index) => (
              <button type="button" key={question} onClick={() => askQuestion(question)} disabled={sendMessageMutation.isPending}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{question}</p>
                <ChevronRight aria-hidden="true" />
              </button>
            ))}
          </div>
          <div className="chat-safety-note"><ShieldAlert aria-hidden="true" /><p>{t("Do not use NephroBot for emergencies, diagnosis, medication changes, or treatment decisions.", "आपातकाल, निदान, दवा में बदलाव या उपचार के निर्णय के लिए नेफ्रोबॉट का उपयोग न करें।")}</p></div>
        </aside>

        <section className="conversation" aria-label={t("NephroBot conversation", "नेफ्रोबॉट संवाद")}>
          <div className="conversation__bar">
            <div><Bot aria-hidden="true" /><span>NephroBot</span></div>
            <Button variant="ghost" size="sm" onClick={clearChat} disabled={messages.length === 0}>
              <RotateCcw />{t("Clear", "साफ करें")}
            </Button>
          </div>

          <div className="conversation__messages chat-container" aria-live="polite">
            <article className="message message--assistant">
              <div className="message__identity"><Bot aria-hidden="true" /><span>NephroBot</span></div>
              <p>{t("Hello. I can explain kidney-health terms and help you prepare questions for a qualified professional. What would you like to understand?", "नमस्ते। मैं किडनी स्वास्थ्य के शब्द समझा सकता हूं और योग्य पेशेवर के लिए प्रश्न तैयार करने में मदद कर सकता हूं। आप क्या समझना चाहते हैं?")}</p>
            </article>

            {messages.map((item) => (
              <div key={item.id} className="message-pair">
                <article className="message message--user">
                  <div className="message__identity"><User aria-hidden="true" /><span>{t("You", "आप")}</span></div>
                  <p>{item.message}</p>
                </article>
                <article className="message message--assistant">
                  <div className="message__identity"><Bot aria-hidden="true" /><span>NephroBot</span></div>
                  <p className="whitespace-pre-wrap">{item.response}</p>
                </article>
              </div>
            ))}

            {sendMessageMutation.isPending && (
              <article className="message message--assistant message--thinking">
                <div className="message__identity"><Bot aria-hidden="true" /><span>NephroBot</span></div>
                <div className="thinking-dots" aria-label={t("NephroBot is responding", "नेफ्रोबॉट उत्तर दे रहा है")}><i /><i /><i /></div>
              </article>
            )}
            <div ref={conversationEnd} />
          </div>

          <div className="conversation__composer">
            <div className="composer-field">
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("Ask a kidney-health question…", "किडनी स्वास्थ्य से जुड़ा प्रश्न पूछें…")}
                disabled={sendMessageMutation.isPending}
                rows={2}
              />
              <Button onClick={handleSendMessage} disabled={!message.trim() || sendMessageMutation.isPending} size="icon" aria-label={t("Send question", "प्रश्न भेजें")}>
                <Send />
              </Button>
            </div>
            <p><Info aria-hidden="true" />{t("Responses are general information, not medical advice.", "उत्तर सामान्य जानकारी हैं, चिकित्सकीय सलाह नहीं।")}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
