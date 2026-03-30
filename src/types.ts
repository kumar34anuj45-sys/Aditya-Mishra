export type SchoolClass = 'PG' | 'Nursery' | 'LKG' | 'UKG' | '1st' | '2nd' | '3rd' | '4th' | '5th' | '6th' | '7th' | '8th';

export interface TransportRoute {
  id: string;
  routeName: string;
  fee: number;
}

export interface ClassFee {
  id: string;
  class: SchoolClass;
  monthlyFee: number;
  examFee: number;
  examMonths: string[]; // e.g. ["September", "March"]
}

export interface Student {
  id: string;
  admissionNo: string;
  aadharNo: string;
  name: string;
  fatherName: string;
  motherName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  class: SchoolClass;
  address: string;
  phone: string;
  transport: boolean;
  routeId?: string;
  admissionDate: string;
  status: 'Active' | 'Inactive';
  photoUrl?: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  months: string[]; // Changed from month: string
  date: string;
  
  // Breakdown
  monthlyFee: number;
  examFee: number;
  transportFee: number;
  otherFee: number;
  previousDues: number;
  
  totalAmount: number; // Sum of above
  paidAmount: number;  // Actually paid
  dues: number;        // totalAmount - paidAmount
  
  paymentMode: 'Cash' | 'Online' | 'Cheque';
  receiptNo: string;
  remarks?: string;
}

export interface SchoolProfile {
  name: string;
  tagline: string;
  address: string;
  phone: string;
}

export interface AppState {
  students: Student[];
  fees: FeeRecord[];
  classFees: ClassFee[];
  routes: TransportRoute[];
  schoolProfile: SchoolProfile;
}
