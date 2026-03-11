import { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, Send, ArrowLeft, ImageIcon, Trash2, MoreVertical } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  property_id: string | null;
  last_message: string | null;
  last_message_at: string | null;
  other_name?: string;
  property_title?: string;
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
  const location = useLocation();
  const queryClient = useQueryClient();
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState("");
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [chatImages, setChatImages] = useState<string[]>([]);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [showConvoMenu, setShowConvoMenu] = useState<string | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

      const convos = data || [];
      const otherIds = convos.map((c) => c.participant_1 === user!.id ? c.participant_2 : c.participant_1);
      const propIds = convos.map((c) => c.property_id).filter(Boolean) as string[];

      const [profilesRes, propsRes] = await Promise.all([
        supabase.from("profiles").select("id, name").in("id", otherIds),
        propIds.length > 0 ? supabase.from("properties").select("id, title").in("id", propIds) : { data: [] },
      ]);

      const nameMap = new Map(profilesRes.data?.map((p) => [p.id, p.name]) || []);
      const propMap = new Map((propsRes.data || []).map((p) => [p.id, p.title]));

      return convos.map((c) => ({
        ...c,
        other_name: nameMap.get(c.participant_1 === user!.id ? c.participant_2 : c.participant_1) || "User",
        property_title: c.property_id ? propMap.get(c.property_id) || undefined : undefined,
      }));
    },
    enabled: !!user,
  });

  // Auto-open conversation from navigation state
  useEffect(() => {
    const openId = (location.state as any)?.openConvoId;
    if (openId && conversations) {
      const convo = conversations.find((c) => c.id === openId);
      if (convo) setActiveConvo(convo);
    }
  }, [conversations, location.state]);

  // Fetch messages
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
  });

  // Mark messages as read
  useEffect(() => {
    if (!activeConvo || !messages || !user) return;
    const unread = messages.filter((m) => m.sender_id !== user.id && !m.read);
    if (unread.length > 0) {
      supabase
        .from("messages")
        .update({ read: true })
        .in("id", unread.map((m) => m.id))
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["unread-count"] });
        });
    }
  }, [messages, activeConvo, user, queryClient]);

  // Realtime for messages
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
      .on("postgres_changes", {
        event: "DELETE",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${activeConvo.id}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["messages", activeConvo.id] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConvo?.id, queryClient]);

  // Typing indicator via broadcast
  useEffect(() => {
    if (!activeConvo || !user) return;
    const channel = supabase.channel(`typing:${activeConvo.id}`);
    
    channel.on("broadcast", { event: "typing" }, (payload) => {
      if (payload.payload?.user_id !== user.id) {
        setIsOtherTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsOtherTyping(false), 2500);
      }
    }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConvo?.id, user?.id]);

  const broadcastTyping = useCallback(() => {
    if (!activeConvo || !user) return;
    supabase.channel(`typing:${activeConvo.id}`).send({
      type: "broadcast",
      event: "typing",
      payload: { user_id: user.id },
    });
  }, [activeConvo?.id, user?.id]);

  // Realtime for conversation list
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("conversations-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => {
        queryClient.invalidateQueries({ queryKey: ["conversations", user.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, queryClient]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping]);

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

      const recipientId = activeConvo!.participant_1 === user!.id
        ? activeConvo!.participant_2
        : activeConvo!.participant_1;

      await supabase.from("notifications").insert({
        user_id: recipientId,
        title: "New Message 💬",
        message: text.length > 80 ? text.slice(0, 80) + "…" : text,
        type: "message",
        link: "/app/chat",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", activeConvo?.id] });
      queryClient.invalidateQueries({ queryKey: ["conversations", user?.id] });
      setMessageText("");
    },
  });

  // Delete messages
  const deleteMessagesMutation = useMutation({
    mutationFn: async (messageIds: string[]) => {
      const { error } = await supabase
        .from("messages")
        .delete()
        .in("id", messageIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", activeConvo?.id] });
      setSelectedMessages(new Set());
      setSelectMode(false);
      toast.success("Messages deleted");
    },
  });

  // Delete conversation
  const deleteConvoMutation = useMutation({
    mutationFn: async (convoId: string) => {
      // Delete all messages first, then conversation
      await supabase.from("messages").delete().eq("conversation_id", convoId);
      const { error } = await supabase.from("conversations").delete().eq("id", convoId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations", user?.id] });
      setActiveConvo(null);
      setShowConvoMenu(null);
      toast.success("Conversation deleted");
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

  const toggleMessageSelect = (msgId: string) => {
    setSelectedMessages(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId); else next.add(msgId);
      return next;
    });
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

  // Active chat view
  if (activeConvo) {
    return (
      <div className="bg-background flex flex-col h-screen">
        {/* Chat Header */}
        <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center gap-3 flex-shrink-0">
          <button onClick={() => { setActiveConvo(null); setSelectMode(false); setSelectedMessages(new Set()); }}>
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="h-9 w-9 rounded-full gradient-blue flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">
              {activeConvo.other_name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground">{activeConvo.other_name}</p>
            {activeConvo.property_title && (
              <p className="text-[10px] text-muted-foreground truncate">Re: {activeConvo.property_title}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {selectMode && selectedMessages.size > 0 && (
              <button
                onClick={() => deleteMessagesMutation.mutate(Array.from(selectedMessages))}
                className="h-9 w-9 rounded-full bg-destructive/10 flex items-center justify-center"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            )}
            <button
              onClick={() => { setSelectMode(!selectMode); setSelectedMessages(new Set()); }}
              className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center"
            >
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {selectMode && (
          <div className="bg-primary/5 px-4 py-2 text-xs text-muted-foreground flex-shrink-0">
            Tap messages to select • {selectedMessages.size} selected
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {messages?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No messages yet. Say hello! 👋</p>
            </div>
          )}
          {messages?.map((msg) => {
            const isMine = msg.sender_id === user.id;
            const imageMatch = msg.text.match(/\[image\]\((https?:\/\/[^\)]+)\)/g);
            const textOnly = msg.text.replace(/\[image\]\(https?:\/\/[^\)]+\)/g, "").trim();
            const imageUrls = imageMatch?.map(m => m.match(/\((https?:\/\/[^\)]+)\)/)?.[1]).filter(Boolean) as string[] || [];
            const isSelected = selectedMessages.has(msg.id);

            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                onClick={() => selectMode && toggleMessageSelect(msg.id)}
              >
                <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm transition-colors ${
                  isSelected ? "ring-2 ring-primary" : ""
                } ${
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

          {/* Typing indicator */}
          {isOtherTyping && (
            <div className="flex justify-start">
              <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-2.5 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input - sticky at bottom */}
        <div className="bg-card border-t border-border px-4 py-3 flex-shrink-0">
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
              onChange={(e) => {
                setMessageText(e.target.value);
                broadcastTyping();
              }}
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
          <p className="text-sm text-muted-foreground">Start a conversation by contacting a property owner</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {conversations.map((convo) => (
            <div key={convo.id} className="relative flex items-center">
              <button
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
                  {convo.property_title && (
                    <p className="text-[10px] text-primary truncate">Re: {convo.property_title}</p>
                  )}
                  <p className="text-xs text-muted-foreground truncate">{convo.last_message || "No messages yet"}</p>
                </div>
                {convo.last_message_at && (
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">
                    {new Date(convo.last_message_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                )}
              </button>
              {/* Delete conversation button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConvoMenu(showConvoMenu === convo.id ? null : convo.id);
                }}
                className="absolute right-2 top-2 h-7 w-7 rounded-full bg-secondary flex items-center justify-center opacity-60 hover:opacity-100"
              >
                <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              {showConvoMenu === convo.id && (
                <div className="absolute right-2 top-10 bg-card border border-border rounded-lg shadow-elevated z-10 py-1">
                  <button
                    onClick={() => {
                      if (confirm("Delete this entire conversation?")) {
                        deleteConvoMutation.mutate(convo.id);
                      } else {
                        setShowConvoMenu(null);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-secondary w-full"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatScreen;
