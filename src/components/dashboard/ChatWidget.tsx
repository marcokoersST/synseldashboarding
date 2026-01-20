import { Send, Bot, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { useAnimateOnMount } from "@/hooks/useAnimateOnMount";
import { cn } from "@/lib/utils";

interface ChatWidgetProps {
  delay?: number;
}

export function ChatWidget({ delay = 0 }: ChatWidgetProps) {
  const { ref: messageRef, isVisible: messageVisible } = useAnimateOnMount({ delay: delay + 400 });
  const { ref: inputRef, isVisible: inputVisible } = useAnimateOnMount({ delay: delay + 600 });
  
  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-teal/10 to-primary/10 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal to-primary flex items-center justify-center group">
            <Sparkles className="w-4 h-4 text-white animate-pulse-subtle" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">Gen BI Assistent</h3>
            <p className="text-xs text-muted-foreground">Stel je vraag</p>
          </div>
        </div>
        
        {/* Chat area */}
        <div className="p-4 min-h-[120px]">
          <div 
            ref={messageRef}
            className={cn(
              "flex gap-3 transition-all duration-500 ease-out",
              messageVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal to-primary flex items-center justify-center flex-shrink-0 animate-float">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="bg-secondary/50 rounded-lg rounded-tl-none p-3 hover:bg-secondary/70 transition-colors">
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
        <div 
          ref={inputRef}
          className={cn(
            "px-4 pb-4 transition-all duration-500 ease-out",
            inputVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <div className="flex gap-2">
            <Input 
              placeholder="Stel een vraag..." 
              className="flex-1 h-10 bg-secondary border-0 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <Button 
              size="icon" 
              className="h-10 w-10 bg-teal hover:bg-teal/90 hover:scale-105 transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
