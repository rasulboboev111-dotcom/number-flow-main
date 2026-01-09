import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Operator, Category } from '@/types/ncms';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';

interface ImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ImportModal({ open, onOpenChange }: ImportModalProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [file, setFile] = useState<File | null>(null);
    const [operatorId, setOperatorId] = useState('');
    const [categoryId, setCategoryId] = useState('');

    const { data: operators } = useQuery<Operator[]>({
        queryKey: ['operators'],
        queryFn: async () => (await api.get('/operators')).data,
    });

    const { data: categories } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => (await api.get('/categories')).data,
    });

    const mutation = useMutation({
        mutationFn: async (data: any[]) => {
            return await api.post('/numbers/bulk', { numbers: data, operatorId, categoryId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['numbers'] });
            queryClient.invalidateQueries({ queryKey: ['operators'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            toast.success(t('numbers.modals.success_import', 'Импорт успешно завершен'));
            onOpenChange(false);
            setFile(null);
        },
        onError: (error: any) => {
            toast.error(t('numbers.delete_error', 'Ошибка') + ': ' + (error.response?.data?.message || error.message));
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleImport = async () => {
        if (!file || !operatorId || !categoryId) {
            toast.error(t('common.fill_all_fields', 'Пожалуйста, выберите файл, оператора и категорию'));
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

            const numbers = json.flat().filter(n => typeof n === 'string' && n.includes('+'));

            mutation.mutate(numbers);
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('numbers.modals.import_title', 'Импорт номеров')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="file">{t('numbers.modals.file_label', 'Файл (XLSX или CSV)')}</Label>
                        <Input id="file" type="file" accept=".xlsx, .csv" onChange={handleFileChange} />
                        <p className="text-xs text-muted-foreground">
                            {t('numbers.modals.file_hint', 'Первая колонка должна содержать номера в формате +992...')}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label>{t('numbers.table.operator', 'Оператор')}</Label>
                        <Select value={operatorId} onValueChange={setOperatorId}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('numbers.modals.operator_placeholder', 'Выберите оператора')} />
                            </SelectTrigger>
                            <SelectContent>
                                {operators?.map((op) => (
                                    <SelectItem key={op.id} value={op.id}>{op.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>{t('numbers.table.category', 'Категория')}</Label>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('numbers.modals.category_placeholder', 'Выберите категорию')} />
                            </SelectTrigger>
                            <SelectContent>
                                {categories?.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel', 'Отмена')}</Button>
                    <Button onClick={handleImport} disabled={mutation.isPending}>
                        {mutation.isPending ? t('numbers.modals.importing', 'Импорт...') : t('numbers.modals.import_start', 'Начать импорт')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
