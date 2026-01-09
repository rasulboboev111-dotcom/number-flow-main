import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ContractData {
    id: string;
    startDate: string;
    phoneNumber: {
        number: string;
    };
    subscriber: {
        name: string;
        type: 'individual' | 'legal_entity';
        inn?: string;
        passportSeries?: string;
        passportNumber?: string;
        address?: string;
        contactPhone?: string;
    };
}

export const printContract = (contract: ContractData, companyName: string = 'NCMS Provider') => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Пожалуйста, разрешите всплывающие окна для печати договора');
        return;
    }

    const doc = printWindow.document;
    const date = format(new Date(contract.startDate), 'dd MMMM yyyy', { locale: ru });

    doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Договор № ${contract.id.slice(0, 8)}</title>
            <style>
                body {
                    font-family: 'Times New Roman', serif;
                    line-height: 1.5;
                    color: #000;
                    margin: 0;
                    padding: 40px;
                    font-size: 12pt;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    font-weight: bold;
                }
                .meta {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 30px;
                }
                .section {
                    margin-bottom: 15px;
                }
                .section-title {
                    font-weight: bold;
                    margin-bottom: 5px;
                    text-align: center;
                }
                .details {
                    width: 100%;
                    margin-bottom: 20px;
                    border-collapse: collapse;
                }
                .details td {
                    vertical-align: top;
                    padding: 5px;
                }
                .signatures {
                    margin-top: 50px;
                    display: flex;
                    justify-content: space-between;
                }
                .signature-block {
                    width: 45%;
                }
                .line {
                    border-bottom: 1px solid #000;
                    margin-top: 30px;
                    margin-bottom: 5px;
                }
                @media print {
                    body { padding: 0; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                ДОГОВОР № ${contract.id.slice(0, 8)}<br>
                оказания услуг связи
            </div>

            <div class="meta">
                <div>г. Душанбе</div>
                <div>${date} г.</div>
            </div>

            <div class="section">
                <p>
                    <strong>${companyName}</strong>, именуемое в дальнейшем "Оператор", с одной стороны, и 
                    <strong>${contract.subscriber.name}</strong>, именуемый(-ая) в дальнейшем "Абонент", с другой стороны,
                    заключили настоящий Договор о нижеследующем:
                </p>
            </div>

            <div class="section">
                <div class="section-title">1. ПРЕДМЕТ ДОГОВОРА</div>
                <p>
                    1.1. Оператор обязуется оказывать Абоненту услуги подвижной радиотелефонной связи, 
                    а Абонент обязуется оплачивать услуги в порядке и на условиях, предусмотренных настоящим Договором.
                </p>
                <p>
                    1.2. Абоненту выделяется абонентский номер: <strong>${contract.phoneNumber.number}</strong>.
                </p>
            </div>

            <div class="section">
                <div class="section-title">2. ПРАВА И ОБЯЗАННОСТИ СТОРОН</div>
                <p>
                    2.1. Оператор обязуется:<br>
                    - Оказывать услуги связи в соответствии с лицензионными условиями и законодательством.<br>
                    - Устранять неисправности, препятствующие пользованию услугами.
                </p>
                <p>
                    2.2. Абонент обязуется:<br>
                    - Своевременно оплачивать услуги связи.<br>
                    - Не использовать абонентский номер для противоправных действий.
                </p>
            </div>

            <div class="section">
                <div class="section-title">3. АДРЕСА И РЕКВИЗИТЫ СТОРОН</div>
                <table class="details">
                    <tr>
                        <td width="50%">
                            <strong>Оператор:</strong><br>
                            ${companyName}<br>
                            Адрес: г. Душанбе, пр. Рудаки<br>
                            Тел: +992 00 000 0000
                        </td>
                        <td width="50%">
                            <strong>Абонент:</strong><br>
                            ${contract.subscriber.name}<br>
                            ${contract.subscriber.type === 'legal_entity' ? `ИНН: ${contract.subscriber.inn || '___________'}<br>` : ''}
                            ${contract.subscriber.type === 'individual' ? `Паспорт: ${contract.subscriber.passportSeries || ''} ${contract.subscriber.passportNumber || ''}<br>` : ''}
                            Адрес: ${contract.subscriber.address || '____________________'}<br>
                            Тел: ${contract.subscriber.contactPhone || ''}
                        </td>
                    </tr>
                </table>
            </div>

            <div class="signatures">
                <div class="signature-block">
                    <strong>От Оператора:</strong>
                    <div class="line"></div>
                    <div style="font-size: 10pt; text-align: center;">(подпись / М.П.)</div>
                </div>
                <div class="signature-block">
                    <strong>От Абонента:</strong>
                    <div class="line"></div>
                    <div style="font-size: 10pt; text-align: center;">(подпись)</div>
                </div>
            </div>
            
            <script>
                // Auto-print and close
                window.onload = () => {
                   window.print();
                   // Optional: window.close();
                };
            </script>
        </body>
        </html>
    `);
    doc.close(); // Finish writing
};
