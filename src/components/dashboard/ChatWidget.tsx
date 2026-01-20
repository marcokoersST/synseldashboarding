import { Send, Bot, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ChatWidget() {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-teal/10 to-primary/10 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal to-primary flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-foreground">Gen BI Assistent</h3>
          <p className="text-xs text-muted-foreground">Stel je vraag</p>
        </div>
      </div>
      
      {/* Chat area */}
      <div className="p-4 min-h-[120px]">
        <div className="flex gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal to-primary flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="bg-secondary/50 rounded-lg rounded-tl-none p-3">
              <p className="text-sm text-foreground">
                Hallo! Ik ben je Gen BI Assistent. Ik kan je helpen met vragen over je prestaties, 
                kandidaten, of andere data-gerelateerde vragen. Waar kan ik je mee helpen?
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Nu</p>
          </div>
        </div>
      </div>
      
      {/* Input */}
      <div className="px-4 pb-4">
        <div className="flex gap-2">
          <Input 
            placeholder="Stel een vraag..." 
            className="flex-1 h-10 bg-secondary border-0 text-sm"
          />
          <Button size="icon" className="h-10 w-10 bg-teal hover:bg-teal/90">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
