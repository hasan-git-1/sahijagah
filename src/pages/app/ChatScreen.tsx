import { MessageSquare } from "lucide-react";

const ChatScreen = () => {
  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card">
        <h2 className="text-lg font-bold text-foreground">Messages</h2>
      </div>

      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-bold text-foreground mb-1">No messages yet</h3>
        <p className="text-sm text-muted-foreground">
          Start a conversation by contacting a property owner
        </p>
      </div>
    </div>
  );
};

export default ChatScreen;
