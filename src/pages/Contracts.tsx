import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import { ContractsTable } from '@/components/contracts/ContractsTable';
import { AddContractModal } from '@/components/contracts/AddContractModal';

export default function Contracts() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <MainLayout
      title="Договоры"
      subtitle="История владения номерами"
    >
      <div className="space-y-6">
        <AddContractModal
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
        />

        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Управление договорами и привязкой номеров
          </p>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Создать договор
          </Button>
        </div>

        <ContractsTable />
      </div>
    </MainLayout>
  );
}
