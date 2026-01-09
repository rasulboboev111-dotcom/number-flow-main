import api from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { FileText, MoreHorizontal, Download, Trash2, Ban } from 'lucide-react';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { printContract } from '@/utils/printContract';

export function ContractsTable() {
    const queryClient = useQueryClient();
    const { data: contracts = [], isLoading } = useQuery({
        queryKey: ['contracts'],
        queryFn: async () => (await api.get('/subs/contracts')).data,
    });

    // Fetch settings for company name
    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => (await api.get('/settings')).data,
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/subs/contracts/hard/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contracts'] });
            queryClient.invalidateQueries({ queryKey: ['numbers'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            toast.success('Договор удален');
        },
        onError: (error: any) => {
            toast.error('Ошибки при удалении: ' + (error.response?.data?.message || error.message));
        }
    });

    const terminateMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/subs/contracts/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contracts'] });
            queryClient.invalidateQueries({ queryKey: ['numbers'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            toast.success('Договор расторгнут');
        },
        onError: (error: any) => {
            toast.error('Ошибка при расторжении: ' + (error.response?.data?.message || error.message));
        }
    });

    if (isLoading) return <div>Загрузка...</div>;

    if (contracts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <FileText className="w-12 h-12 mb-4 opacity-20" />
                <p>Договоров пока нет</p>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-secondary/50">
                        <tr>
                            <th className="data-table-cell text-left text-muted-foreground font-medium">Номер</th>
                            <th className="data-table-cell text-left text-muted-foreground font-medium">Абонент</th>
                            <th className="data-table-cell text-left text-muted-foreground font-medium">Дата начала</th>
                            <th className="data-table-cell text-left text-muted-foreground font-medium">Статус</th>
                            <th className="data-table-cell w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {contracts.map((contract: any) => (
                            <tr key={contract.id} className="hover:bg-secondary/30 transition-colors">
                                <td className="data-table-cell font-mono font-medium">
                                    {contract.phoneNumber?.number}
                                </td>
                                <td className="data-table-cell">
                                    {contract.subscriber?.name}
                                </td>
                                <td className="data-table-cell text-muted-foreground">
                                    {new Date(contract.startDate).toLocaleDateString()}
                                </td>
                                <td className="data-table-cell">
                                    <StatusBadge status={contract.status === 'active' ? 'active' : 'blocked'} />
                                </td>
                                <td className="data-table-cell">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => {
                                                printContract(contract, settings?.companyName);
                                            }}>
                                                <Download className="w-4 h-4 mr-2" />
                                                Скачать скан
                                            </DropdownMenuItem>
                                            {contract.status === 'active' && (
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        if (confirm('Вы уверены, что хотите расторгнуть этот договор? Номер отправится в карантин.')) {
                                                            terminateMutation.mutate(contract.id);
                                                        }
                                                    }}
                                                >
                                                    <Ban className="w-4 h-4 mr-2" />
                                                    Расторгнуть
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onClick={() => {
                                                    if (confirm('Вы уверены, что хотите полностью удалить этот договор? Это вернет статус номера в "свободен".')) {
                                                        deleteMutation.mutate(contract.id);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Удалить
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
