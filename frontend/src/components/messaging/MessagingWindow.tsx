import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messagingApi } from "../../api/messaging";
import { Send, Video, X } from "lucide-react";
import { Button } from "../ui";

interface MessagingWindowProps {
  mentorId: number;
  mentorName: string;
  onClose: () => void;
  onBookSession: () => void;
}

export const MessagingWindow: React.FC<MessagingWindowProps> = ({
  mentorId,
  mentorName,
  onClose,
  onBookSession,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Get or create conversation
  const { data: conversationsData } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => messagingApi.getConversations(),
  });

  // Find existing conversation with this mentor
  useEffect(() => {
    console.log("Conversations Data:", conversationsData);
    if (conversationsData?.data?.results) {
      const existingConversation = conversationsData.data.results.find(
        (conv: any) => {
          // Check if any participant (other than current user) matches the mentor ID
          return (
            conv.participants &&
            conv.participants.some((p: any) => p.id === mentorId)
          );
        }
      );
      console.log("Existing conversation found:", existingConversation);
      if (existingConversation) {
        setConversationId(existingConversation.id);
      }
    }
  }, [conversationsData, mentorId]);

  // Get messages for this conversation
  const { data: messagesData } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => messagingApi.getMessages(conversationId!),
    enabled: !!conversationId,
  });

  // Start conversation mutation
  const startConversationMutation = useMutation({
    mutationFn: (initialMessage: string) =>
      messagingApi.startConversation(mentorId, initialMessage),
    onSuccess: (response) => {
      setConversationId(response.data.id);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({
        queryKey: ["messages", response.data.id],
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({
      conversationId,
      content,
    }: {
      conversationId: number;
      content: string;
    }) => messagingApi.sendMessage(conversationId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      setNewMessage("");
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (conversationId) {
      sendMessageMutation.mutate({ conversationId, content: newMessage });
    } else {
      // Start new conversation
      startConversationMutation.mutate(newMessage);
      setNewMessage("");
    }
  };

  const messages = messagesData?.data?.results || [];

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Mock messages for when no backend conversation exists yet
  const mockMessages = [
    {
      id: 1,
      content: `Hi! I'm ${
        mentorName || "your mentor"
      }. How can I help you with your career goals?`,
      sender: {
        id: mentorId,
        first_name: mentorName ? mentorName.split(" ")[0] : "Mentor",
      },
      timestamp: new Date().toISOString(),
      is_read: true,
    },
  ];

  const displayMessages =
    messages.length > 0 ? messages : conversationId ? [] : mockMessages;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="font-medium text-gray-600">
                {mentorName
                  ? mentorName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : "M"}
              </span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                {mentorName || "Mentor"}
              </h2>
              <span className="text-sm text-green-600">Online</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onBookSession}>
              <Video className="w-4 h-4 mr-2" />
              Book Session
            </Button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {displayMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Start a conversation with {mentorName || "your mentor"}</p>
            </div>
          ) : (
            displayMessages.map((message: any) => {
              const isFromMentor = message.sender.id === mentorId;
              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isFromMentor ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      isFromMentor
                        ? "bg-gray-100 text-gray-900"
                        : "bg-primary-600 text-white"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isFromMentor ? "text-gray-500" : "text-primary-100"
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })
          )}

          {/* Loading states */}
          {(startConversationMutation.isPending ||
            sendMessageMutation.isPending) && (
            <div className="flex justify-end">
              <div className="bg-primary-600 text-white px-4 py-2 rounded-lg max-w-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <div
                    className="w-2 h-2 bg-white rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-white rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-gray-200"
        >
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <Button
              type="submit"
              disabled={
                !newMessage.trim() ||
                startConversationMutation.isPending ||
                sendMessageMutation.isPending
              }
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
