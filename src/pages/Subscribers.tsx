import { MainLayout } from '@/components/layout/MainLayout';
import { SubscribersTable } from '@/components/subscribers/SubscribersTable';
import { useTranslation } from 'react-i18next';

export default function Subscribers() {
  const { t } = useTranslation();
  return (
    <MainLayout
      title={t('subscribers.title', 'Абоненты')}
      subtitle={t('subscribers.subtitle', 'База физических и юридических лиц')}
    >
      <SubscribersTable />
    </MainLayout>
  );
}
