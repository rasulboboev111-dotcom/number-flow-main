import { MainLayout } from '@/components/layout/MainLayout';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { OperatorsChart } from '@/components/dashboard/OperatorsChart';
import { StatusChart } from '@/components/dashboard/StatusChart';
import { RecentNumbers } from '@/components/dashboard/RecentNumbers';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t } = useTranslation();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => (await api.get('/stats')).data,
  });

  if (isLoading || !stats) {
    return (
      <MainLayout
        title={t('nav.dashboard', 'Дашборд')}
        subtitle={t('dashboard.overview', 'Обзор номерной ёмкости')}
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t('dashboard.loading_stats', 'Загрузка статистики...')}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title={t('nav.dashboard', 'Дашборд')}
      subtitle={t('dashboard.overview', 'Обзор номерной ёмкости')}
    >
      <div className="space-y-6">
        <StatsGrid stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusChart stats={stats} />
          <OperatorsChart />
        </div>

        <RecentNumbers />
      </div>
    </MainLayout>
  );
}
