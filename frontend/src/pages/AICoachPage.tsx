import React, { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { api } from "../api";
import { Layout } from "../components/layout";
import {
  Bot,
  FileText,
  Target,
  PenTool,
  Search,
  DollarSign,
  Rocket,
  Send,
  Loader2,
  Lightbulb,
  Brain,
  Zap,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "suggestion" | "action";
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  description: string;
  prompt: string;
}

export const AICoachPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI Career Coach. I'm here to help you with job applications, interview preparation, career advice, and much more. How can I assist you today?",
      timestamp: new Date(),
      type: "text",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const quickActions: QuickAction[] = [
    {
      id: "1",
      label: "Resume Review",
      icon: "FileText",
      description: "Get feedback on your resume",
      prompt:
        "Can you help me review and improve my resume? I need advice on formatting, content, and making it more appealing to employers.",
    },
    {
      id: "2",
      label: "Interview Prep",
      icon: "Target",
      description: "Practice interview questions",
      prompt:
        "I have an upcoming interview. Can you help me prepare with common interview questions and provide tips on how to answer them effectively?",
    },
    {
      id: "3",
      label: "Cover Letter",
      icon: "PenTool",
      description: "Write compelling cover letters",
      prompt:
        "I need help writing a cover letter for a job application. Can you guide me through creating a compelling and personalized cover letter?",
    },
    {
      id: "4",
      label: "Job Search",
      icon: "Search",
      description: "Find the right opportunities",
      prompt:
        "I'm looking for job opportunities in my field. Can you help me with job search strategies and where to find the best positions?",
    },
    {
      id: "5",
      label: "Salary Negotiation",
      icon: "DollarSign",
      description: "Negotiate your worth",
      prompt:
        "I received a job offer and want to negotiate the salary. Can you provide guidance on how to approach salary negotiations effectively?",
    },
    {
      id: "6",
      label: "Career Pivot",
      icon: "Rocket",
      description: "Change career paths",
      prompt:
        "I'm considering changing my career path. Can you help me understand how to transition to a new field and what steps I should take?",
    },
  ];

  const chatMutation = useMutation({
    mutationFn: (message: string) =>
      api.post("/ai/chat/", { message, context: "career_coach" }),
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: (response: any) => {
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: response.data.response,
        timestamp: new Date(),
        type: "text",
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    },
    onError: () => {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
        type: "text",
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsTyping(false);
    },
  });

  const sendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    chatMutation.mutate(content.trim());
    setInputMessage("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.prompt);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getQuickActionIcon = (iconName: string) => {
    const iconMap = {
      FileText: FileText,
      Target: Target,
      PenTool: PenTool,
      Search: Search,
      DollarSign: DollarSign,
      Rocket: Rocket,
    };
    return iconMap[iconName as keyof typeof iconMap] || FileText;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            AI Career Coach
          </h1>
          <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
            Get personalized career advice, interview preparation, resume
            feedback, and job search strategies powered by AI.
          </p>
        </div>

        {/* Quick Actions - Show only when no conversation started */}
        {messages.length === 1 && (
          <div className="card mb-8">
            <div className="card-body">
              <h3 className="text-lg font-semibold text-secondary-900 mb-6 text-center">
                How can I help you today?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action) => {
                  const IconComponent = getQuickActionIcon(action.icon);
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action)}
                      className="p-4 text-left border border-secondary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 text-primary-600 group-hover:text-primary-700">
                          <IconComponent className="w-full h-full" />
                        </div>
                        <h4 className="font-semibold text-secondary-900 group-hover:text-primary-700">
                          {action.label}
                        </h4>
                      </div>
                      <p className="text-sm text-secondary-600 group-hover:text-secondary-700">
                        {action.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <div
          className="card flex flex-col"
          style={{ height: "calc(100vh - 400px)", minHeight: "500px" }}
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-primary-600 text-white rounded-br-none"
                      : "bg-secondary-100 text-secondary-900 rounded-bl-none"
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {message.role === "assistant" ? (
                      <ReactMarkdown
                        components={{
                          // Style markdown elements
                          p: ({ children }) => (
                            <p className="mb-2 last:mb-0">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc list-inside mb-2 space-y-1">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal list-inside mb-2 space-y-1">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="ml-2">{children}</li>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-secondary-900">
                              {children}
                            </strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic">{children}</em>
                          ),
                          h1: ({ children }) => (
                            <h1 className="text-lg font-bold mb-2">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-base font-bold mb-2">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-sm font-bold mb-1">
                              {children}
                            </h3>
                          ),
                          code: ({ children }) => (
                            <code className="bg-secondary-200 px-1 py-0.5 rounded text-sm">
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      message.content
                    )}
                  </div>
                  <div
                    className={`text-xs mt-2 opacity-75 ${
                      message.role === "user"
                        ? "text-primary-100"
                        : "text-secondary-500"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-secondary-100 text-secondary-900 px-4 py-3 rounded-lg rounded-bl-none">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-sm text-secondary-500">
                      AI is thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="border-t border-secondary-200 p-4">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                className="flex-1 resize-none border border-secondary-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                disabled={chatMutation.isPending}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || chatMutation.isPending}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
              >
                {chatMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send
                  </>
                )}
              </button>
            </form>

            {/* Tips */}
            <div className="mt-3 text-sm text-secondary-500 text-center flex items-center justify-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span>
                Tip: Be specific about your situation for more personalized
                advice. I can help with resumes, interviews, job search, and
                career planning.
              </span>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="card text-center">
            <div className="card-body">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                Personalized Advice
              </h3>
              <p className="text-secondary-600 text-sm">
                Get tailored career guidance based on your specific situation
                and goals.
              </p>
            </div>
          </div>
          <div className="card text-center">
            <div className="card-body">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                Expert Knowledge
              </h3>
              <p className="text-secondary-600 text-sm">
                Access industry best practices and proven strategies for job
                search success.
              </p>
            </div>
          </div>
          <div className="card text-center">
            <div className="card-body">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                Instant Support
              </h3>
              <p className="text-secondary-600 text-sm">
                Get immediate answers to your career questions, available 24/7.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
