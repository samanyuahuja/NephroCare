import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, User, Send, RotateCcw } from "lucide-react";
import { useLanguage, t } from "@/hooks/useLanguage";

interface LocalChatMessage {
  id: number;
  message: string;
  response: string;
  timestamp: string;
}

export default function Chatbot() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<LocalChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();

  // Load messages from localStorage on component mount
  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem('nephroBotMessages');
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    try {
      localStorage.setItem('nephroBotMessages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chat messages:', error);
    }
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      // Call Flask chatbot API through our server
      try {
        const response = await fetch('/api/chat-direct', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            message: userMessage
          })
        });
        
        if (!response.ok) {
          console.error('API Response not OK:', response.status, response.statusText);
          throw new Error('Failed to get response from NephroBot');
        }
        
        const data = await response.json();
        console.log('Chatbot response received:', data);
        return data.reply || "I'm having trouble processing your message. Please try again.";
      } catch (error) {
        console.error('Error calling chatbot:', error);
        return "I'm having trouble processing your message. Please try again later.";
      }
    },
    onSuccess: (botResponse, userMessage) => {
      const newMessage: LocalChatMessage = {
        id: Date.now(),
        message: userMessage,
        response: botResponse,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage("");
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      setIsLoading(false);
    },
  });

  const handleSendMessage = () => {
    if (message.trim() && !isLoading) {
      setIsLoading(true);
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const askQuestion = (question: string) => {
    if (!isLoading) {
      setIsLoading(true);
      sendMessageMutation.mutate(question);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('nephroBotMessages');
  };

  const sampleQuestions = [
    t("What does high creatinine mean?", "उच्च क्रिएटिनिन का क्या मतलब है?"),
    t("How to improve hemoglobin?", "हीमोग्लोबिन कैसे बढ़ाएं?"),
    t("What are CKD symptoms?", "CKD के लक्षण क्या हैं?"),
    t("How can I prevent CKD progression?", "मैं CKD की प्रगति कैसे रोक सकता हूं?"),
    t("What foods should I avoid with kidney disease?", "गुर्दे की बीमारी में कौन से खाद्य पदार्थों से बचना चाहिए?")
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="h-[500px] sm:h-[600px] flex flex-col">
        {/* Chat Header */}
        <CardHeader className="bg-primary text-white rounded-t-xl p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Bot className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                <span className="truncate">{t("NephroBot Assistant", "नेफ्रोबॉट सहायक")}</span>
              </CardTitle>
              <p className="text-blue-100 text-xs sm:text-sm hidden sm:block">
                {t("Ask me anything about CKD, your results, or kidney health", "CKD, आपके परिणाम, या गुर्दे के स्वास्थ्य के बारे में मुझसे कुछ भी पूछें")}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearChat}
              className="ml-2 flex items-center gap-1 sm:gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30 text-xs sm:text-sm"
            >
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t("Reset", "रीसेट")}</span>
            </Button>
          </div>
        </CardHeader>

        {/* Chat Messages */}
        <CardContent className="flex-1 p-2 sm:p-4 overflow-y-auto bg-gray-50 chat-container">
          <div className="space-y-4">
            {/* Welcome Message */}
            <div className="flex items-start">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm max-w-xs sm:max-w-md">
                <p className="text-gray-800 text-sm sm:text-base">
                  {t("Hello! I'm NephroBot, your CKD assistant. I can help explain your results, answer questions about kidney health, or provide guidance on managing your condition. What would you like to know?", 
                     "नमस्ते! मैं नेफ्रोबॉट हूं, आपका CKD सहायक। मैं आपके परिणामों को समझाने, गुर्दे के स्वास्थ्य के बारे में प्रश्नों के उत्तर देने, या आपकी स्थिति के प्रबंधन पर मार्गदर्शन प्रदान करने में मदद कर सकता हूं। आप क्या जानना चाहते हैं?")}
                </p>
              </div>
            </div>

            {/* Sample Questions */}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-1 sm:gap-2 mt-3 sm:mt-4">
                {sampleQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => askQuestion(question)}
                    className="text-xs flex-shrink-0"
                    disabled={isLoading}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            )}

            {/* Chat History */}
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-4">
                {/* User Message */}
                <div className="flex items-start justify-end chat-message">
                  <div className="bg-primary text-white p-2 sm:p-3 rounded-lg shadow-sm max-w-xs sm:max-w-md">
                    <p className="text-sm sm:text-base">{msg.message}</p>
                  </div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-400 rounded-full flex items-center justify-center ml-2 sm:ml-3 flex-shrink-0">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex items-start chat-message">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                    <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm max-w-xs sm:max-w-md">
                    <div className="text-gray-800 text-sm sm:text-base whitespace-pre-wrap">{msg.response}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {sendMessageMutation.isPending && (
              <div className="flex items-start">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                  <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        {/* Chat Input */}
        <div className="p-3 sm:p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t("Type your question...", "अपना प्रश्न टाइप करें...")}
              disabled={sendMessageMutation.isPending}
              className="flex-1 text-sm sm:text-base"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              size="sm"
              className="px-3 sm:px-4"
            >
              <Send className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
