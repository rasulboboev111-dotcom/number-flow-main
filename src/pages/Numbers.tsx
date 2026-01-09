import { MainLayout } from '@/components/layout/MainLayout';
import { NumbersTable } from '@/components/numbers/NumbersTable';

export default function Numbers() {
  return (
    <MainLayout 
      title="Реестр номеров" 
      subtitle="Управление номерной ёмкостью"
    >
      <NumbersTable />
    </MainLayout>
  );
}
