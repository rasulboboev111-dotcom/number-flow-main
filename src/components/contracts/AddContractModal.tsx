import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { PhoneNumber, Subscriber } from '@/types/ncms';
import { toast } from 'sonner';

interface AddContractModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultPhoneNumber?: { id: string; number: string };
}

export function AddContractModal({ open, onOpenChange, defaultPhoneNumber }: AddContractModalProps) {
    const queryClient = useQueryClient();
    const [phoneNumberId, setPhoneNumberId] = useState(defaultPhoneNumber?.id || '');
    const [subscriberId, setSubscriberId] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [numberSearch, setNumberSearch] = useState(defaultPhoneNumber?.number || '');

    // Reset state when modal opens/closes or defaultPhoneNumber changes
    useEffect(() => {
        if (open) {
            if (defaultPhoneNumber) {
                setPhoneNumberId(defaultPhoneNumber.id);
                setNumberSearch(defaultPhoneNumber.number);
            } else {
                setPhoneNumberId('');
                setNumberSearch('');
            }
            setSubscriberId('');
        }
    }, [open, defaultPhoneNumber]);

    const { data, isLoading: isNumbersLoading } = useQuery({
        queryKey: ['numbers', 'free', numberSearch],
        queryFn: async () => {
            const params: any = { status: 'free', limit: 50 };
            if (numberSearch) {
                params.search = numberSearch;
            }
            return (await api.get('/numbers', { params })).data;
        },
    });

    const numbers = data?.numbers || [];
    // No need to filter locally anymore, the server does it better
    const filteredNumbers = numbers;

    // We need a way to get subscribers too
    const { data: subscribers } = useQuery<Subscriber[]>({
        queryKey: ['subscribers'],
        queryFn: async () => (await api.get('/subs/subscribers')).data,
    });

    const mutation = useMutation({
        mutationFn: async (newContract: any) => {
            return (await api.post('/subs/contracts', newContract)).data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contracts'] });
            queryClient.invalidateQueries({ queryKey: ['numbers'] });
            toast.success('Договор успешно создан');
            onOpenChange(false);
            setPhoneNumberId('');
            setSubscriberId('');
        },
        onError: (error: any) => {
            toast.error('Ошибка при создании договора: ' + (error.response?.data?.message || error.message));
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!phoneNumberId || !subscriberId) {
            toast.error('Пожалуйста, выберите номер и абонента');
            return;
        }
        mutation.mutate({ phoneNumberId, subscriberId, startDate, status: 'active' });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Создать новый договор</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Номер телефона (свободный)</Label>
                        <div className="relative mb-2">
                            <Input
                                placeholder="Поиск номера..."
                                value={numberSearch}
                                onChange={(e) => setNumberSearch(e.target.value)}
                                className="h-9"
                            />
                        </div>
                        <Select value={phoneNumberId} onValueChange={setPhoneNumberId}>
                            <SelectTrigger>
                                <SelectValue placeholder={
                                    isNumbersLoading
                                        ? "Загрузка..."
                                        : (filteredNumbers.length > 0 ? "Выберите номер" : "Номера не найдены")
                                } />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {filteredNumbers.map((num: any) => (
                                    <SelectItem key={num.id} value={num.id}>
                                        {num.number} ({num.category?.name})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Абонент</Label>
                        <Select value={subscriberId} onValueChange={setSubscriberId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите абонента" />
                            </SelectTrigger>
                            <SelectContent>
                                {subscribers?.map((sub) => (
                                    <SelectItem key={sub.id} value={sub.id}>
                                        {sub.name} ({sub.contactPhone})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="startDate">Дата начала</Label>
                        <Input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Отмена
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Создание...' : 'Создать договор'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
