import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Briefcase, Users, UserCheck, Target, Percent, Wallet } from "lucide-react";
import { ComparisonColumn } from "@/components/comparison/ComparisonColumn";
import { MetricRow } from "@/components/comparison/MetricRow";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { Button } from "@/components/ui/button";
import {
  teamMembers,
  getTeamMemberById,
  getCurrentUser,
  getTeamMemberRank,
  REVENUE_GOAL,
} from "@/data/teamData";

const Vergelijking = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();

  const selectedMember = getTeamMemberById(Number(memberId));
  const currentUser = getCurrentUser();

  if (!selectedMember || !currentUser) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Teamlid niet gevonden</h1>
          <Button onClick={() => navigate("/")}>Terug naar Dashboard</Button>
        </div>
      </div>
    );
  }

  const selectedRank = getTeamMemberRank(selectedMember.id);
  const currentUserRank = getTeamMemberRank(currentUser.id);

  const gaps = [
    { label: "Omzet", gap: selectedMember.revenue - currentUser.revenue, isPositive: currentUser.revenue >= selectedMember.revenue, icon: <Target className="w-4 h-4" /> },
    { label: "Emails", gap: selectedMember.metrics.emailsSent - currentUser.metrics.emailsSent, isPositive: currentUser.metrics.emailsSent >= selectedMember.metrics.emailsSent, icon: <Mail className="w-4 h-4" /> },
    { label: "Gesprekken", gap: selectedMember.metrics.calls - currentUser.metrics.calls, isPositive: currentUser.metrics.calls >= selectedMember.metrics.calls, icon: <Phone className="w-4 h-4" /> },
    { label: "Acquisities", gap: selectedMember.metrics.acquisitions - currentUser.metrics.acquisitions, isPositive: currentUser.metrics.acquisitions >= selectedMember.metrics.acquisitions, icon: <Briefcase className="w-4 h-4" /> },
    { label: "Plaatsingen", gap: selectedMember.metrics.placements - currentUser.metrics.placements, isPositive: currentUser.metrics.placements >= selectedMember.metrics.placements, icon: <UserCheck className="w-4 h-4" /> },
  ];

  const positiveGaps = gaps.filter((g) => g.isPositive);
  const negativeGaps = gaps.filter((g) => !g.isPositive);

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hoe kom ik op plek {selectedRank}?</h1>
          <p className="text-sm text-muted-foreground">Vergelijk jouw performance met {selectedMember.name}</p>
        </div>
      </div>

      {/* Quick Insights */}
      <AnimatedCard delay={100} className="mb-6 p-4 h-auto">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Je loopt voor op:</span>
            {positiveGaps.length > 0 ? positiveGaps.map((gap, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium">{gap.icon}{gap.label}</span>
            )) : <span className="text-xs text-muted-foreground">—</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Je loopt achter op:</span>
            {negativeGaps.length > 0 ? negativeGaps.map((gap, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-medium">{gap.icon}{gap.label}</span>
            )) : <span className="text-xs text-muted-foreground">—</span>}
          </div>
        </div>
      </AnimatedCard>

      {/* Side by Side Comparison */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <ComparisonColumn member={currentUser} rank={currentUserRank} isCurrentUser={true} delay={200} />
        <ComparisonColumn member={selectedMember} rank={selectedRank} isCurrentUser={false} delay={300} />
      </div>

      {/* Detailed Metric Comparison */}
      <AnimatedCard delay={400} className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 text-center">Gedetailleerde Vergelijking</h2>
        <div className="grid grid-cols-[1fr,auto,1fr] gap-4 mb-4 pb-2 border-b border-border">
          <div className="text-right"><span className="text-sm font-medium text-primary">Jij (Plek #{currentUserRank})</span></div>
          <div className="text-center min-w-[120px]"><span className="text-sm font-medium text-muted-foreground">Metric</span></div>
          <div className="text-left"><span className="text-sm font-medium text-foreground">{selectedMember.name} (Plek #{selectedRank})</span></div>
        </div>
        <MetricRow label="Omzet" userValue={currentUser.revenue} compareValue={selectedMember.revenue} format="currency" showProgress progressMax={REVENUE_GOAL} delay={500} icon={<Target className="w-4 h-4" />} />
        <MetricRow label="Emails verstuurd" userValue={currentUser.metrics.emailsSent} compareValue={selectedMember.metrics.emailsSent} delay={550} icon={<Mail className="w-4 h-4" />} />
        <MetricRow label="Gesprekken" userValue={currentUser.metrics.calls} compareValue={selectedMember.metrics.calls} delay={600} icon={<Phone className="w-4 h-4" />} />
        <MetricRow label="Acquisities" userValue={currentUser.metrics.acquisitions} compareValue={selectedMember.metrics.acquisitions} delay={650} icon={<Briefcase className="w-4 h-4" />} />
        <MetricRow label="Plaatsingen" userValue={currentUser.metrics.placements} compareValue={selectedMember.metrics.placements} delay={700} icon={<UserCheck className="w-4 h-4" />} />
        <MetricRow label="Kandidaten" userValue={currentUser.metrics.candidates} compareValue={selectedMember.metrics.candidates} delay={750} icon={<Users className="w-4 h-4" />} />
        <MetricRow label="Conversieratio" userValue={currentUser.metrics.conversionRate} compareValue={selectedMember.metrics.conversionRate} format="percentage" delay={800} icon={<Percent className="w-4 h-4" />} />
        <MetricRow label="Salaris voortgang" userValue={currentUser.metrics.salaryProgress} compareValue={selectedMember.metrics.salaryProgress} format="percentage" showProgress delay={850} icon={<Wallet className="w-4 h-4" />} />
      </AnimatedCard>
    </>
  );
};

export default Vergelijking;
