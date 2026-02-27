import { useState, useMemo } from "react";
import { Mail, Phone, Briefcase, UserCheck, Users, Percent, Target } from "lucide-react";
import { ComparisonColumn } from "@/components/comparison/ComparisonColumn";
import { MetricRow } from "@/components/comparison/MetricRow";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  teamMembers,
  getCurrentUser,
  getTeamMemberRank,
} from "@/data/teamData";
import { cn } from "@/lib/utils";

const VergelijkingOverview = () => {
  const currentUser = getCurrentUser();
  const otherMembers = useMemo(() => teamMembers.filter((m) => !m.isCurrentUser), []);
  const [selectedMemberId, setSelectedMemberId] = useState(otherMembers[0]?.id);
  const selectedMember = useMemo(() => otherMembers.find((m) => m.id === selectedMemberId), [selectedMemberId, otherMembers]);

  if (!currentUser || !selectedMember) return null;

  const currentUserRank = getTeamMemberRank(currentUser.id);
  const selectedRank = getTeamMemberRank(selectedMember.id);

  const gaps = [
    { label: "Emails", icon: <Mail className="w-4 h-4" />, isPositive: currentUser.metrics.emailsSent >= selectedMember.metrics.emailsSent },
    { label: "Gesprekken", icon: <Phone className="w-4 h-4" />, isPositive: currentUser.metrics.calls >= selectedMember.metrics.calls },
    { label: "Acquisities", icon: <Briefcase className="w-4 h-4" />, isPositive: currentUser.metrics.acquisitions >= selectedMember.metrics.acquisitions },
    { label: "Plaatsingen", icon: <UserCheck className="w-4 h-4" />, isPositive: currentUser.metrics.placements >= selectedMember.metrics.placements },
    { label: "Kandidaten", icon: <Users className="w-4 h-4" />, isPositive: currentUser.metrics.candidates >= selectedMember.metrics.candidates },
    { label: "Conversie", icon: <Percent className="w-4 h-4" />, isPositive: currentUser.metrics.conversionRate >= selectedMember.metrics.conversionRate },
  ];

  const positiveGaps = gaps.filter((g) => g.isPositive);
  const negativeGaps = gaps.filter((g) => !g.isPositive);

  return (
    <>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">Vergelijking</h1>
        <p className="text-sm text-muted-foreground">Vergelijk jouw activiteiten en resultaten met een teamlid</p>
      </div>

      {/* Selector + Quick Insights merged */}
      <AnimatedCard delay={50} className="mb-6 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground shrink-0">Vergelijk met:</span>
          {otherMembers.map((m) => {
            const isActive = m.id === selectedMemberId;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMemberId(m.id)}
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors border",
                  isActive ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                )}
              >
                <Avatar className="w-5 h-5">
                  <AvatarImage src={m.avatar} alt={m.name} />
                  <AvatarFallback className="text-[10px]">{m.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
                {m.name}
                <span className="text-xs opacity-70">#{getTeamMemberRank(m.id)}</span>
              </button>
            );
          })}
        </div>

        <div className="border-t border-border/50 my-3" />

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Je loopt voor op:</span>
            {positiveGaps.length > 0 ? positiveGaps.map((gap, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium">{gap.icon} {gap.label}</span>
            )) : <span className="text-xs text-muted-foreground">—</span>}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Je loopt achter op:</span>
            {negativeGaps.length > 0 ? negativeGaps.map((gap, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-medium">{gap.icon} {gap.label}</span>
            )) : <span className="text-xs text-muted-foreground">—</span>}
          </div>
        </div>
      </AnimatedCard>

      {/* Side by Side Comparison */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <ComparisonColumn member={currentUser} rank={currentUserRank} isCurrentUser={true} delay={200} hideRevenue />
        <ComparisonColumn member={selectedMember} rank={selectedRank} isCurrentUser={false} delay={300} hideRevenue />
      </div>

      {/* Detailed Metric Comparison */}
      <AnimatedCard delay={400} className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 text-center">Gedetailleerde Vergelijking</h2>
        <div className="grid grid-cols-[1fr,auto,1fr] gap-4 mb-4 pb-2 border-b border-border">
          <div className="text-right"><span className="text-sm font-medium text-primary">Jij (Plek #{currentUserRank})</span></div>
          <div className="text-center min-w-[120px]"><span className="text-sm font-medium text-muted-foreground">Metric</span></div>
          <div className="text-left"><span className="text-sm font-medium text-foreground">{selectedMember.name} (Plek #{selectedRank})</span></div>
        </div>
        <MetricRow label="Emails verstuurd" userValue={currentUser.metrics.emailsSent} compareValue={selectedMember.metrics.emailsSent} delay={500} icon={<Mail className="w-4 h-4" />} />
        <MetricRow label="Gesprekken" userValue={currentUser.metrics.calls} compareValue={selectedMember.metrics.calls} delay={550} icon={<Phone className="w-4 h-4" />} />
        <MetricRow label="Acquisities" userValue={currentUser.metrics.acquisitions} compareValue={selectedMember.metrics.acquisitions} delay={600} icon={<Briefcase className="w-4 h-4" />} />
        <MetricRow label="Plaatsingen" userValue={currentUser.metrics.placements} compareValue={selectedMember.metrics.placements} delay={650} icon={<UserCheck className="w-4 h-4" />} />
        <MetricRow label="Kandidaten" userValue={currentUser.metrics.candidates} compareValue={selectedMember.metrics.candidates} delay={700} icon={<Users className="w-4 h-4" />} />
        <MetricRow label="Conversieratio" userValue={currentUser.metrics.conversionRate} compareValue={selectedMember.metrics.conversionRate} format="percentage" delay={750} icon={<Percent className="w-4 h-4" />} />
        <MetricRow label="Performance Score" userValue={currentUser.metrics.performanceScore} compareValue={selectedMember.metrics.performanceScore} delay={800} icon={<Target className="w-4 h-4" />} />
      </AnimatedCard>
    </>
  );
};

export default VergelijkingOverview;
