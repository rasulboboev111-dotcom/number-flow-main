import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { format } from "date-fns";
import { ru, enGB } from "date-fns/locale";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, ArrowDown } from "lucide-react";
import { useTranslation } from "react-i18next";

interface StatusHistoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    numberId: string;
    number: string;
}

export function StatusHistoryModal({
    open,
    onOpenChange,
    numberId,
    number,
}: StatusHistoryModalProps) {
    const { t, i18n } = useTranslation();
    const { data: history = [], isLoading } = useQuery({
        queryKey: ["number-history", numberId],
        queryFn: async () => {
            const res = await api.get(`/numbers/${numberId}/history`);
            return res.data;
        },
        enabled: open,
    });

    const dateLocale = i18n.language === 'en' ? enGB : ru;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="w-5 h-5 text-primary" />
                        {t('numbers.modals.status_history_title', 'История статусов')}: {number}
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="h-[400px] pr-4 mt-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            {t('numbers.modals.no_history', 'История изменений отсутствует')}
                        </div>
                    ) : (
                        <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                            {history.map((item: any) => (
                                <div key={item.id} className="relative pl-10">
                                    <div className="absolute left-0 top-1 w-9 h-9 border-2 border-background rounded-full bg-secondary flex items-center justify-center z-10">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                    </div>

                                    <div className="bg-secondary/30 p-4 rounded-xl border border-border">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-medium text-muted-foreground">
                                                {format(new Date(item.createdAt), "d MMMM yyyy, HH:mm", { locale: dateLocale })}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 flex-wrap">
                                            {item.oldStatus && (
                                                <>
                                                    <StatusBadge status={item.oldStatus} />
                                                    <ArrowDown className="w-4 h-4 text-muted-foreground -rotate-90" />
                                                </>
                                            )}
                                            <StatusBadge status={item.newStatus} />
                                        </div>

                                        {item.notes && (
                                            <p className="mt-2 text-sm text-foreground/80 italic">
                                                &quot;{item.notes}&quot;
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
