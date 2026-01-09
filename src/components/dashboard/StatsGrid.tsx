import { Phone, PhoneOff, Users, Building2, Shield, Clock } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { DashboardStats } from '@/types/ncms';

interface StatsGridProps {
  stats: DashboardStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard
        title="Всего номеров"
        value={stats.totalNumbers}
        icon={Phone}
        trend={{ value: 5.2, positive: true }}
        iconClassName="bg-primary/10 text-primary"
      />
      <StatCard
        title="Свободных"
        value={stats.freeNumbers}
        subtitle={`${Math.round(stats.freeNumbers / stats.totalNumbers * 100)}% от общего`}
        icon={Phone}
        iconClassName="bg-status-free/10 text-status-free"
      />
      <StatCard
        title="Активных"
        value={stats.activeNumbers}
        icon={PhoneOff}
        iconClassName="bg-status-active/10 text-status-active"
      />
      <StatCard
        title="Забронировано"
        value={stats.reservedNumbers}
        icon={Shield}
        iconClassName="bg-status-reserved/10 text-status-reserved"
      />
      <StatCard
        title="В карантине"
        value={stats.quarantineNumbers}
        icon={Clock}
        iconClassName="bg-status-quarantine/10 text-status-quarantine"
      />
      <StatCard
        title="Абонентов"
        value={stats.totalSubscribers}
        icon={Users}
        trend={{ value: 12.3, positive: true }}
        iconClassName="bg-category-gold/10 text-category-gold"
      />
    </div>
  );
}
