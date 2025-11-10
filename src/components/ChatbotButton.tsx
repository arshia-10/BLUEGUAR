import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export const ChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl hover:shadow-2xl z-50 bg-gradient-accent"
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 h-96 shadow-xl z-50 flex flex-col">
          <div className="bg-gradient-primary text-primary-foreground p-4 rounded-t-lg">
            <h3 className="font-semibold">BlueGuard AI Assistant</h3>
            <p className="text-xs opacity-90">How can I help you today?</p>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-3">
              <div className="bg-secondary p-3 rounded-lg">
                <p className="text-sm">Hello! I'm your AI assistant. I can help you with:</p>
                <ul className="text-xs mt-2 space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Understanding flood alerts</li>
                  <li>Reporting incidents</li>
                  <li>Safety recommendations</li>
                  <li>Platform navigation</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button size="sm" variant="accent">Send</Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};
