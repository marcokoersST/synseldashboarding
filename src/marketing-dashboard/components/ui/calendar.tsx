import * as React from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { DayPicker } from "react-day-picker-v9";

import { cn } from "@/marketing-dashboard/lib/utils";
import { buttonVariants } from "@/marketing-dashboard/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("relative p-3", className)}
      classNames={{
        months: "flex flex-col gap-6 sm:flex-row sm:gap-8",
        month: "w-[252px] space-y-3",
        month_caption: "flex h-8 items-center justify-center px-8",
        caption_label: "text-sm font-medium capitalize",
        nav: "absolute inset-x-3 top-3 flex items-center justify-between pointer-events-none",
        button_previous: cn(buttonVariants({ variant: "outline" }), "h-8 w-8 p-0 pointer-events-auto"),
        button_next: cn(buttonVariants({ variant: "outline" }), "h-8 w-8 p-0 pointer-events-auto"),
        month_grid: "w-full border-collapse",
        weekdays: "grid grid-cols-7",
        weekday: "flex h-8 w-9 items-center justify-center text-xs font-normal text-muted-foreground",
        week: "grid grid-cols-7",
        day: "relative flex h-9 w-9 items-center justify-center p-0 text-center text-sm [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day_button: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
        range_end: "rounded-r-md",
        range_start: "rounded-l-md",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "[&>button]:ring-1 [&>button]:ring-primary",
        outside: "text-muted-foreground opacity-35 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-35",
        range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className }) => {
          const Icon =
            orientation === "left"
              ? ChevronLeft
              : orientation === "right"
                ? ChevronRight
                : orientation === "up"
                  ? ChevronUp
                  : ChevronDown;
          return <Icon className={cn("h-4 w-4", className)} />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
