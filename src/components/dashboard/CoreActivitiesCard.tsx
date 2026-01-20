import { Mail, Phone, UserPlus, CheckCircle } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, Cell } from "recharts";

const activities = [
  { 
    icon: Mail, 
    label: "Emails verstuurd", 
    value: 245, 
    data: [
      { value: 35 }, { value: 42 }, { value: 28 }, { value: 55 }, 
      { value: 48 }, { value: 37 }, { value: 52 }
    ],
    color: "hsl(var(--teal))"
  },
  { 
    icon: Phone, 
    label: "Gesprekken", 
    value: 89, 
    data: [
      { value: 12 }, { value: 15 }, { value: 10 }, { value: 18 }, 
      { value: 14 }, { value: 8 }, { value: 12 }
    ],
    color: "hsl(var(--primary))"
  },
  { 
    icon: UserPlus, 
    label: "Acquisities", 
    value: 12, 
    data: [
      { value: 2 }, { value: 1 }, { value: 3 }, { value: 2 }, 
      { value: 1 }, { value: 2 }, { value: 1 }
    ],
    color: "hsl(var(--gold))"
  },
  { 
    icon: CheckCircle, 
    label: "Plaatsingen", 
    value: 5, 
    data: [
      { value: 1 }, { value: 0 }, { value: 1 }, { value: 1 }, 
      { value: 0 }, { value: 1 }, { value: 1 }
    ],
    color: "hsl(var(--success))"
  },
];

export function CoreActivitiesCard() {
  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-foreground">Kernactiviteiten</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Activiteiten deze periode</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {activities.map((activity) => (
          <div key={activity.label} className="bg-secondary/30 rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center">
                <activity.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">{activity.value}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{activity.label}</p>
            <div className="h-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activity.data}>
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                    {activity.data.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === activity.data.length - 1 ? activity.color : 'hsl(var(--chart-muted))'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
