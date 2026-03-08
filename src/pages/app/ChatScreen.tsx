import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, ArrowLeft, User, ImageIcon, Play, Pause } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import VoiceRecorder from "@/components/VoiceRecorder";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  property_id: string | null;
  last_message: string | null;
  last_message_at: string | null;
  other_name?: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  read: boolean;
  created_at: string;
}

const ChatScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState("");
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [chatImages, setChatImages] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const { data: conversations } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_1.eq.${user!.id},participant_2.eq.${user!.id}`)
        .order("last_message_at", { ascending: false });
      if (error) throw error;

      // Fetch other participant names
      const convos = data || [];
      const otherIds = convos.map((c) => c.participant_1 === user!.id ? c.participant_2 : c.participant_1);
      const { data: profiles } = await supabase.from("profiles").select("id, name").in("id", otherIds);
      const nameMap = new Map(profiles?.map((p) => [p.id, p.name]) || []);

      return convos.map((c) => ({
        ...c,
        other_name: nameMap.get(c.participant_1 === user!.id ? c.participant_2 : c.participant_1) || "User",
      }));
    },
    enabled: !!user,
  });

  // Fetch messages for active conversation
  const { data: messages } = useQuery({
    queryKey: ["messages", activeConvo?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeConvo!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!activeConvo,
    refetchInterval: 3000, // Poll every 3s for now
  });

  // Realtime subscription
  useEffect(() => {
    if (!activeConvo) return;
    const channel = supabase
      .channel(`messages:${activeConvo.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${activeConvo.id}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["messages", activeConvo.id] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConvo?.id, queryClient]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      const { error } = await supabase.from("messages").insert({
        conversation_id: activeConvo!.id,
        sender_id: user!.id,
        text,
      });
      if (error) throw error;
      await supabase.from("conversations").update({
        last_message: text,
        last_message_at: new Date().toISOString(),
      }).eq("id", activeConvo!.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", activeConvo?.id] });
      queryClient.invalidateQueries({ queryKey: ["conversations", user?.id] });
      setMessageText("");
    },
  });

  const handleSend = () => {
    const text = messageText.trim();
    const imgText = chatImages.length ? chatImages.map(url => `[image](${url})`).join(" ") : "";
    const fullText = [text, imgText].filter(Boolean).join(" ");
    if (!fullText) return;
    sendMutation.mutate(fullText);
    setChatImages([]);
    setShowImagePicker(false);
  };

  if (!user) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center px-6">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-bold text-foreground mb-2">Sign in to chat</h3>
        <p className="text-sm text-muted-foreground mb-6">Create an account to message property owners.</p>
        <Button onClick={() => navigate("/auth")} className="gradient-blue text-primary-foreground border-0 px-8">Sign In</Button>
      </div>
    );
  }

  // Chat view
  if (activeConvo) {
    return (
      <div className="bg-background min-h-screen flex flex-col">
        {/* Chat Header */}
        <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center gap-3">
          <button onClick={() => setActiveConvo(null)}>
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="h-9 w-9 rounded-full gradient-blue flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">
              {activeConvo.other_name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">{activeConvo.other_name}</p>
            <p className="text-[10px] text-muted-foreground">Online</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 pb-24">
          {messages?.map((msg) => {
            const isMine = msg.sender_id === user.id;
            // Check if message contains image links
            const imageMatch = msg.text.match(/\[image\]\((https?:\/\/[^\)]+)\)/g);
            const textOnly = msg.text.replace(/\[image\]\(https?:\/\/[^\)]+\)/g, "").trim();
            const imageUrls = imageMatch?.map(m => m.match(/\((https?:\/\/[^\)]+)\)/)?.[1]).filter(Boolean) as string[] || [];

            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
                  isMine
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-secondary text-foreground rounded-bl-md"
                }`}>
                  {imageUrls.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1">
                      {imageUrls.map((url, i) => (
                        <img key={i} src={url} alt="" className="h-32 w-32 rounded-lg object-cover" />
                      ))}
                    </div>
                  )}
                  {textOnly && <span>{textOnly}</span>}
                  <p className={`text-[9px] mt-1 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border px-4 py-3 z-50">
          {showImagePicker && (
            <div className="mb-3">
              <ImageUploader userId={user.id} images={chatImages} onImagesChange={setChatImages} maxImages={3} />
            </div>
          )}
          {chatImages.length > 0 && (
            <div className="flex gap-1 mb-2">
              {chatImages.map((url, i) => (
                <img key={i} src={url} alt="" className="h-12 w-12 rounded-lg object-cover" />
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImagePicker(!showImagePicker)}
              className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0"
            >
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-secondary rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!messageText.trim() && !chatImages.length}
              className="h-10 w-10 rounded-full gradient-blue flex items-center justify-center disabled:opacity-50"
            >
              <Send className="h-4 w-4 text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Conversation list
  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card">
        <h2 className="text-lg font-bold text-foreground">Messages</h2>
      </div>

      {(!conversations || conversations.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-bold text-foreground mb-1">No messages yet</h3>
          <p className="text-sm text-muted-foreground">
            Start a conversation by contacting a property owner
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {conversations.map((convo) => (
            <button
              key={convo.id}
              onClick={() => setActiveConvo(convo)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors text-left"
            >
              <div className="h-11 w-11 rounded-full gradient-blue flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-bold text-sm">
                  {convo.other_name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">{convo.other_name}</p>
                <p className="text-xs text-muted-foreground truncate">{convo.last_message || "No messages yet"}</p>
              </div>
              {convo.last_message_at && (
                <span className="text-[10px] text-muted-foreground flex-shrink-0">
                  {new Date(convo.last_message_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatScreen;
