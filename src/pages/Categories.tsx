import { MainLayout } from '@/components/layout/MainLayout';
import { CategoriesList } from '@/components/categories/CategoriesList';
import { useTranslation } from 'react-i18next';

export default function Categories() {
  const { t } = useTranslation();
  return (
    <MainLayout
      title={t('categories.title', 'Категории номеров')}
      subtitle={t('categories.subtitle', 'Управление типами номеров и наценками')}
    >
      <CategoriesList />
    </MainLayout>
  );
}
