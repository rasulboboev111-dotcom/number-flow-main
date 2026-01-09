export type NumberStatus = 'free' | 'active' | 'reserved' | 'blocked' | 'quarantine';

export type NumberCategory = 'platinum' | 'gold' | 'silver' | 'regular' | 'economy';

export type SubscriberType = 'individual' | 'legal_entity';

export interface Operator {
  id: string;
  name: string;
  mnc: string;
  logo?: string;
  contactPhone?: string;
  contactEmail?: string;
  numbersCount: number;
}

export interface Category {
  id: string;
  name: string;
  code: NumberCategory;
  surcharge: number;
  surchargeType: 'fixed' | 'percent';
}

export interface PhoneNumber {
  id: string;
  number: string;
  operatorId: string;
  operator?: Operator;
  categoryId: string;
  category?: Category;
  status: NumberStatus;
  subscriberId?: string;
  subscriber?: Subscriber;
  createdAt: string;
  updatedAt: string;
}

export interface Subscriber {
  id: string;
  type: SubscriberType;
  name: string;
  passportSeries?: string;
  passportNumber?: string;
  passportIssuedBy?: string;
  inn?: string;
  contactPhone: string;
  address: string;
  numbersCount: number;
  createdAt: string;
}

export interface Contract {
  id: string;
  phoneNumberId: string;
  phoneNumber?: PhoneNumber;
  subscriberId: string;
  subscriber?: Subscriber;
  startDate: string;
  endDate?: string;
  documentUrl?: string;
  status: 'active' | 'terminated';
}

export interface DashboardStats {
  totalNumbers: number;
  freeNumbers: number;
  activeNumbers: number;
  reservedNumbers: number;
  quarantineNumbers: number;
  totalSubscribers: number;
  operatorsCount: number;
}
