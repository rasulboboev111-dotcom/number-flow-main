import { MainLayout } from '@/components/layout/MainLayout';
import { OperatorsList } from '@/components/operators/OperatorsList';
import { useTranslation } from 'react-i18next';

export default function Operators() {
  const { t } = useTranslation();
  return (
    <MainLayout
      title={t('operators.title', 'Операторы')}
      subtitle={t('operators.subtitle', 'Справочник операторов связи')}
    >
      <OperatorsList />
    </MainLayout>
  );
}
