import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, User, Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { ChatMessage } from "@shared/schema";

export default function Chatbot() {
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/chat", { message });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat"] });
      setMessage("");
    },
  });

  const handleSendMessage = () => {
    if (message.trim()) {
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
    sendMessageMutation.mutate(question);
  };

  const sampleQuestions = [
    "What does high creatinine mean?",
    "How to improve hemoglobin?",
    "What are CKD symptoms?",
    "How can I prevent CKD progression?",
    "What foods should I avoid with kidney disease?"
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="h-[600px] flex flex-col">
        {/* Chat Header */}
        <CardHeader className="bg-primary text-white rounded-t-xl">
          <CardTitle className="flex items-center">
            <Bot className="mr-3 h-6 w-6" />
            NephroBot Assistant
          </CardTitle>
          <p className="text-blue-100 text-sm">
            Ask me anything about CKD, your results, or kidney health
          </p>
        </CardHeader>

        {/* Chat Messages */}
        <CardContent className="flex-1 p-4 overflow-y-auto bg-gray-50 chat-container">
          <div className="space-y-4">
            {/* Welcome Message */}
            <div className="flex items-start">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm max-w-md">
                <p className="text-gray-800">
                  Hello! I'm your AI assistant. I can help explain your CKD results, 
                  answer questions about kidney health, or provide guidance on managing 
                  your condition. What would you like to know?
                </p>
              </div>
            </div>

            {/* Sample Questions */}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {sampleQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => askQuestion(question)}
                    className="text-xs"
                    disabled={sendMessageMutation.isPending}
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
                  <div className="bg-primary text-white p-3 rounded-lg shadow-sm max-w-md">
                    <p>{msg.message}</p>
                  </div>
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center ml-3">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex items-start chat-message">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm max-w-md">
                    <p className="text-gray-800">{msg.response}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {sendMessageMutation.isPending && (
              <div className="flex items-start">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
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
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question..."
              disabled={sendMessageMutation.isPending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
