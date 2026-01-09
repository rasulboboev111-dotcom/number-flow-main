import { Operator, Category, PhoneNumber, Subscriber, DashboardStats } from '@/types/ncms';

export const operators: Operator[] = [
  { id: '1', name: 'Мегафон', mnc: '02', contactPhone: '+992 999 000 000', contactEmail: 'support@megafon.tj', numbersCount: 1250 },
  { id: '2', name: 'Tcell', mnc: '03', contactPhone: '+992 999 111 111', contactEmail: 'support@tcell.tj', numbersCount: 980 },
  { id: '3', name: 'Babilon-M', mnc: '04', contactPhone: '+992 999 222 222', contactEmail: 'support@babilon.tj', numbersCount: 650 },
  { id: '4', name: 'Beeline', mnc: '05', contactPhone: '+992 999 333 333', contactEmail: 'support@beeline.tj', numbersCount: 420 },
];

export const categories: Category[] = [
  { id: '1', name: 'Платиновый', code: 'platinum', surcharge: 5000, surchargeType: 'fixed' },
  { id: '2', name: 'Золотой', code: 'gold', surcharge: 2000, surchargeType: 'fixed' },
  { id: '3', name: 'Серебряный', code: 'silver', surcharge: 500, surchargeType: 'fixed' },
  { id: '4', name: 'Обычный', code: 'regular', surcharge: 0, surchargeType: 'fixed' },
];

export const phoneNumbers: PhoneNumber[] = [
  { id: '1', number: '+992 900 777 777', operatorId: '1', categoryId: '1', status: 'free', createdAt: '2024-01-15', updatedAt: '2024-12-28' },
  { id: '2', number: '+992 900 123 456', operatorId: '1', categoryId: '4', status: 'active', subscriberId: '1', createdAt: '2024-02-10', updatedAt: '2024-12-20' },
  { id: '3', number: '+992 901 888 888', operatorId: '2', categoryId: '1', status: 'reserved', createdAt: '2024-03-05', updatedAt: '2024-12-25' },
  { id: '4', number: '+992 901 555 555', operatorId: '2', categoryId: '2', status: 'active', subscriberId: '2', createdAt: '2024-01-20', updatedAt: '2024-12-15' },
  { id: '5', number: '+992 902 111 222', operatorId: '3', categoryId: '3', status: 'quarantine', createdAt: '2024-04-12', updatedAt: '2024-12-27' },
  { id: '6', number: '+992 902 333 444', operatorId: '3', categoryId: '4', status: 'blocked', createdAt: '2024-05-18', updatedAt: '2024-12-10' },
  { id: '7', number: '+992 903 999 999', operatorId: '4', categoryId: '1', status: 'free', createdAt: '2024-06-22', updatedAt: '2024-12-28' },
  { id: '8', number: '+992 903 666 777', operatorId: '4', categoryId: '2', status: 'active', subscriberId: '3', createdAt: '2024-07-30', updatedAt: '2024-12-22' },
  { id: '9', number: '+992 900 111 111', operatorId: '1', categoryId: '2', status: 'free', createdAt: '2024-08-14', updatedAt: '2024-12-28' },
  { id: '10', number: '+992 901 222 333', operatorId: '2', categoryId: '3', status: 'reserved', createdAt: '2024-09-05', updatedAt: '2024-12-26' },
  { id: '11', number: '+992 900 444 555', operatorId: '1', categoryId: '4', status: 'active', subscriberId: '1', createdAt: '2024-10-11', updatedAt: '2024-12-18' },
  { id: '12', number: '+992 902 777 888', operatorId: '3', categoryId: '3', status: 'free', createdAt: '2024-11-20', updatedAt: '2024-12-28' },
];

export const subscribers: Subscriber[] = [
  { 
    id: '1', 
    type: 'individual', 
    name: 'Иванов Иван Иванович', 
    passportSeries: 'А', 
    passportNumber: '1234567', 
    passportIssuedBy: 'МВД РТ',
    contactPhone: '+992 900 123 456',
    address: 'г. Душанбе, ул. Рудаки, д. 15',
    numbersCount: 2,
    createdAt: '2024-01-10'
  },
  { 
    id: '2', 
    type: 'legal_entity', 
    name: 'ООО "ТехноСервис"', 
    inn: '1234567890',
    contactPhone: '+992 901 555 555',
    address: 'г. Душанбе, ул. Сомони, д. 50',
    numbersCount: 1,
    createdAt: '2024-02-15'
  },
  { 
    id: '3', 
    type: 'individual', 
    name: 'Петров Петр Петрович', 
    passportSeries: 'Б', 
    passportNumber: '7654321', 
    passportIssuedBy: 'МВД РТ',
    contactPhone: '+992 903 666 777',
    address: 'г. Худжанд, ул. Ленина, д. 25',
    numbersCount: 1,
    createdAt: '2024-03-20'
  },
  { 
    id: '4', 
    type: 'legal_entity', 
    name: 'ЗАО "Мобильные Решения"', 
    inn: '0987654321',
    contactPhone: '+992 902 111 000',
    address: 'г. Душанбе, пр. Исмоили Сомони, д. 100',
    numbersCount: 0,
    createdAt: '2024-04-25'
  },
];

export const dashboardStats: DashboardStats = {
  totalNumbers: 3300,
  freeNumbers: 1845,
  activeNumbers: 1200,
  reservedNumbers: 150,
  quarantineNumbers: 105,
  totalSubscribers: 892,
  operatorsCount: 4,
};
