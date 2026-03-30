/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  CreditCard, 
  LayoutDashboard, 
  Search, 
  Printer, 
  Trash2, 
  Bus, 
  ChevronRight,
  School,
  LogOut,
  Menu,
  X,
  FileText,
  CheckCircle2,
  Settings,
  Plus,
  AlertCircle,
  Camera,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn, formatCurrency } from './lib/utils';
import type { Student, FeeRecord, SchoolClass, ClassFee, TransportRoute, SchoolProfile } from './types';

const CLASSES: SchoolClass[] = ['PG', 'Nursery', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'admission' | 'students' | 'fees' | 'settings' | 'profile'>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [classFees, setClassFees] = useState<ClassFee[]>([]);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>({
    name: 'NATIONAL ENGLISH SCHOOL',
    tagline: 'PG to 8th | English Medium | Co-Education',
    address: 'Main Road, City Center',
    phone: '+91 98765 43210'
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentForFee, setSelectedStudentForFee] = useState<Student | null>(null);
  const [lastReceipt, setLastReceipt] = useState<FeeRecord | null>(null);
  const [classFilter, setClassFilter] = useState<SchoolClass | 'All'>('All');
  const [transportFilter, setTransportFilter] = useState<'All' | 'Yes' | 'No'>('All');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  // Fee collection state for multiple months
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [otherFeeInput, setOtherFeeInput] = useState(0);
  const [paidAmountInput, setPaidAmountInput] = useState(0);

  // Load data from localStorage
  useEffect(() => {
    const savedStudents = localStorage.getItem('nes_students');
    const savedFees = localStorage.getItem('nes_fees');
    const savedClassFees = localStorage.getItem('nes_class_fees');
    const savedRoutes = localStorage.getItem('nes_routes');
    const savedProfile = localStorage.getItem('nes_school_profile');
    
    if (savedStudents) setStudents(JSON.parse(savedStudents));
    if (savedFees) setFees(JSON.parse(savedFees));
    if (savedClassFees) setClassFees(JSON.parse(savedClassFees));
    if (savedRoutes) setRoutes(JSON.parse(savedRoutes));
    if (savedProfile) setSchoolProfile(JSON.parse(savedProfile));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('nes_students', JSON.stringify(students));
    localStorage.setItem('nes_fees', JSON.stringify(fees));
    localStorage.setItem('nes_class_fees', JSON.stringify(classFees));
    localStorage.setItem('nes_routes', JSON.stringify(routes));
    localStorage.setItem('nes_school_profile', JSON.stringify(schoolProfile));
  }, [students, fees, classFees, routes, schoolProfile]);

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const transportStudents = students.filter(s => s.transport).length;
    const totalFeesCollected = fees.reduce((acc, f) => acc + f.paidAmount, 0);
    const totalDues = fees.reduce((acc, f) => acc + f.dues, 0);
    const recentFees = fees.slice(-5).reverse();
    return { totalStudents, transportStudents, totalFeesCollected, totalDues, recentFees };
  }, [students, fees]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.fatherName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesClass = classFilter === 'All' || s.class === classFilter;
      const matchesTransport = transportFilter === 'All' || 
        (transportFilter === 'Yes' ? s.transport : !s.transport);

      return matchesSearch && matchesClass && matchesTransport;
    });
  }, [students, searchQuery, classFilter, transportFilter]);

  const selectedStudentFees = useMemo(() => {
    if (!selectedStudentForFee) return [];
    return fees.filter(f => f.studentId === selectedStudentForFee.id);
  }, [fees, selectedStudentForFee]);

  const previousDues = useMemo(() => {
    return selectedStudentFees.reduce((sum, f) => sum + f.dues, 0);
  }, [selectedStudentFees]);

  const paidMonths = useMemo(() => {
    return selectedStudentFees.flatMap(f => f.months);
  }, [selectedStudentFees]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newStudent: Student = {
      id: crypto.randomUUID(),
      admissionNo: `NES-${Date.now().toString().slice(-6)}`,
      aadharNo: formData.get('aadharNo') as string,
      name: formData.get('name') as string,
      fatherName: formData.get('fatherName') as string,
      motherName: formData.get('motherName') as string,
      dob: formData.get('dob') as string,
      gender: formData.get('gender') as any,
      class: formData.get('class') as SchoolClass,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      transport: formData.get('transport') === 'on',
      routeId: formData.get('routeId') as string || undefined,
      admissionDate: new Date().toISOString(),
      status: 'Active',
      photoUrl: photoPreview || undefined,
    };
    setStudents([...students, newStudent]);
    setActiveTab('students');
    setPhotoPreview(null);
    e.currentTarget.reset();
  };

  const handleCollectFee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStudentForFee || selectedMonths.length === 0) return;
    const formData = new FormData(e.currentTarget);
    
    const classFee = classFees.find(cf => cf.class === selectedStudentForFee.class);
    const monthlyRate = classFee?.monthlyFee || 0;
    const examRate = classFee?.examFee || 0;
    const transportRate = selectedStudentForFee.transport ? (routes.find(r => r.id === selectedStudentForFee.routeId)?.fee || 0) : 0;
    
    const totalMonthlyFee = monthlyRate * selectedMonths.length;
    const totalTransportFee = transportRate * selectedMonths.length;
    
    // Calculate exam fee if any selected month is an exam month
    const hasExamMonth = selectedMonths.some(m => classFee?.examMonths?.includes(m));
    const totalExamFee = hasExamMonth ? examRate : 0;
    
    const otherFee = Number(formData.get('otherFee'));
    const paidAmount = Number(formData.get('paidAmount'));
    
    const totalAmount = totalMonthlyFee + totalExamFee + totalTransportFee + otherFee + previousDues;
    const dues = totalAmount - paidAmount;

    const newFee: FeeRecord = {
      id: crypto.randomUUID(),
      studentId: selectedStudentForFee.id,
      months: selectedMonths,
      date: new Date().toISOString(),
      monthlyFee: totalMonthlyFee,
      examFee: totalExamFee,
      transportFee: totalTransportFee,
      otherFee,
      previousDues,
      totalAmount,
      paidAmount,
      dues,
      paymentMode: formData.get('paymentMode') as any,
      receiptNo: `REC-${Date.now().toString().slice(-6)}`,
      remarks: formData.get('remarks') as string,
    };
    setFees([...fees, newFee]);
    setLastReceipt(newFee);
    setSelectedStudentForFee(null);
    setSelectedMonths([]);
    setOtherFeeInput(0);
    setPaidAmountInput(0);
    e.currentTarget.reset();
  };

  const printReceipt = (receipt: FeeRecord) => {
    const student = students.find(s => s.id === receipt.studentId);
    if (!student) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Fee Receipt - ${receipt.receiptNo}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.4; }
            .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
            .school-name { font-size: 24px; font-weight: bold; color: #1e40af; margin: 0; }
            .school-info { font-size: 14px; color: #666; margin-top: 5px; }
            .receipt-title { font-size: 18px; font-weight: bold; margin: 20px 0; text-decoration: underline; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; font-size: 14px; }
            .label { font-weight: bold; color: #555; }
            .fee-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .fee-table th, .fee-table td { border: 1px solid #eee; padding: 10px; text-align: left; }
            .fee-table th { background: #f9fafb; }
            .total-row { font-weight: bold; background: #f3f4f6; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; }
            .signature { border-top: 1px solid #333; width: 150px; text-align: center; padding-top: 5px; font-size: 12px; }
            .dues-box { margin-top: 10px; padding: 10px; border: 1px dashed #ef4444; color: #ef4444; font-weight: bold; text-align: center; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="school-name">${schoolProfile.name}</h1>
            <div class="school-info">${schoolProfile.tagline}</div>
            <div class="school-info">Address: ${schoolProfile.address} | Phone: ${schoolProfile.phone}</div>
          </div>
          <div style="text-align: center;">
            <div class="receipt-title">FEE RECEIPT</div>
          </div>
          <div class="details">
            <div style="grid-column: span 2; display: flex; justify-content: center; margin-bottom: 20px;">
              <div style="width: 100px; height: 100px; border-radius: 50%; border: 2px solid #eee; overflow: hidden; background: #f9fafb; display: flex; align-items: center; justify-content: center;">
                ${student.photoUrl ? `<img src="${student.photoUrl}" style="width: 100%; height: 100%; object-cover: cover;" />` : '<span style="color: #ccc; font-size: 40px;">👤</span>'}
              </div>
            </div>
            <div><span class="label">Receipt No:</span> ${receipt.receiptNo}</div>
            <div><span class="label">Date:</span> ${format(new Date(receipt.date), 'dd MMM yyyy')}</div>
            <div><span class="label">Admission No:</span> ${student.admissionNo}</div>
            <div><span class="label">Aadhar No:</span> ${student.aadharNo || 'N/A'}</div>
            <div><span class="label">Student Name:</span> ${student.name}</div>
            <div><span class="label">Father's Name:</span> ${student.fatherName}</div>
            <div><span class="label">Class:</span> ${student.class}</div>
            <div><span class="label">Fee Month(s):</span> ${receipt.months.join(', ')}</div>
          </div>
          
          <table class="fee-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Monthly Tuition Fee (${receipt.months.length} Month(s))</td>
                <td style="text-align: right;">₹${receipt.monthlyFee}</td>
              </tr>
              ${receipt.examFee > 0 || receipt.transportFee > 0 ? `
              <tr>
                <td>Exam & Transport Charges</td>
                <td style="text-align: right;">₹${receipt.examFee + receipt.transportFee}</td>
              </tr>
              ` : ''}
              ${receipt.otherFee > 0 ? `
              <tr>
                <td>Other Charges</td>
                <td style="text-align: right;">₹${receipt.otherFee}</td>
              </tr>
              ` : ''}
              ${receipt.previousDues > 0 ? `
              <tr>
                <td>Previous Outstanding Dues</td>
                <td style="text-align: right; color: #ef4444;">₹${receipt.previousDues}</td>
              </tr>
              ` : ''}
              <tr class="total-row">
                <td>Total Payable</td>
                <td style="text-align: right;">₹${receipt.totalAmount}</td>
              </tr>
              <tr>
                <td>Amount Paid</td>
                <td style="text-align: right;">₹${receipt.paidAmount}</td>
              </tr>
              <tr class="total-row" style="color: ${receipt.dues > 0 ? '#ef4444' : '#10b981'};">
                <td>Remaining Dues</td>
                <td style="text-align: right;">₹${receipt.dues}</td>
              </tr>
            </tbody>
          </table>

          ${receipt.dues > 0 ? `
            <div class="dues-box">
              OUTSTANDING DUES: ₹${receipt.dues}
            </div>
          ` : ''}

          <div class="footer">
            <div class="signature">Parent's Signature</div>
            <div class="signature">Authorized Signatory</div>
          </div>
          
          <div style="margin-top: 20px; font-size: 10px; color: #999; text-align: center;">
            This is a computer generated receipt and does not require a physical signature.
          </div>
          
          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #1e40af; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Receipt</button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Sidebar */}
      <aside className={cn(
        "bg-slate-900 text-white transition-all duration-300 flex flex-col",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <School className="w-6 h-6" />
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="font-bold text-lg leading-tight">NES</h1>
              <p className="text-xs text-slate-400">Management System</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem 
            icon={<LayoutDashboard />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            collapsed={!isSidebarOpen}
            onClick={() => setActiveTab('dashboard')}
          />
          <SidebarItem 
            icon={<UserPlus />} 
            label="Admission" 
            active={activeTab === 'admission'} 
            collapsed={!isSidebarOpen}
            onClick={() => setActiveTab('admission')}
          />
          <SidebarItem 
            icon={<Users />} 
            label="Students" 
            active={activeTab === 'students'} 
            collapsed={!isSidebarOpen}
            onClick={() => setActiveTab('students')}
          />
          <SidebarItem 
            icon={<CreditCard />} 
            label="Fee Collection" 
            active={activeTab === 'fees'} 
            collapsed={!isSidebarOpen}
            onClick={() => setActiveTab('fees')}
          />
          <SidebarItem 
            icon={<School />} 
            label="School Profile" 
            active={activeTab === 'profile'} 
            collapsed={!isSidebarOpen}
            onClick={() => setActiveTab('profile')}
          />
          <SidebarItem 
            icon={<Settings />} 
            label="Settings" 
            active={activeTab === 'settings'} 
            collapsed={!isSidebarOpen}
            onClick={() => setActiveTab('settings')}
          />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
            {isSidebarOpen && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold capitalize">{activeTab}</h2>
            <div className="h-4 w-px bg-slate-200" />
            <p className="text-sm text-slate-500">{schoolProfile.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search students..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 w-64 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard 
                    icon={<Users className="text-blue-600" />} 
                    label="Total Students" 
                    value={stats.totalStudents} 
                    color="blue"
                  />
                  <StatCard 
                    icon={<Bus className="text-orange-600" />} 
                    label="Transport Users" 
                    value={stats.transportStudents} 
                    color="orange"
                  />
                  <StatCard 
                    icon={<CreditCard className="text-green-600" />} 
                    label="Collected" 
                    value={formatCurrency(stats.totalFeesCollected)} 
                    color="green"
                  />
                  <StatCard 
                    icon={<FileText className="text-red-600" />} 
                    label="Total Dues" 
                    value={formatCurrency(stats.totalDues)} 
                    color="orange"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Recent Fee Collections
                    </h3>
                    <div className="space-y-4">
                      {stats.recentFees.length > 0 ? stats.recentFees.map(fee => {
                        const student = students.find(s => s.id === fee.studentId);
                        return (
                          <div key={fee.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                              <p className="font-semibold">{student?.name || 'Unknown'}</p>
                              <p className="text-xs text-slate-500">{fee.month} • {format(new Date(fee.date), 'dd MMM')}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">{formatCurrency(fee.paidAmount)}</p>
                              {fee.dues > 0 && <p className="text-[10px] text-red-500 font-bold">Dues: {formatCurrency(fee.dues)}</p>}
                              <button 
                                onClick={() => printReceipt(fee)}
                                className="text-[10px] uppercase tracking-wider font-bold text-blue-600 hover:underline"
                              >
                                Print Receipt
                              </button>
                            </div>
                          </div>
                        );
                      }) : (
                        <p className="text-center py-8 text-slate-400 italic">No recent transactions</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-blue-600" />
                      Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setActiveTab('admission')}
                        className="p-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors flex flex-col items-center gap-2 text-sm font-medium"
                      >
                        <UserPlus className="w-6 h-6" />
                        New Admission
                      </button>
                      <button 
                        onClick={() => setActiveTab('fees')}
                        className="p-4 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors flex flex-col items-center gap-2 text-sm font-medium"
                      >
                        <CreditCard className="w-6 h-6" />
                        Collect Fee
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'admission' && (
              <motion.div 
                key="admission"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto"
              >
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="text-2xl font-bold mb-6">Student Admission Form</h3>
                  <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 flex flex-col items-center gap-4 mb-4">
                      <div className="relative group">
                        <div className="w-32 h-32 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                          {photoPreview ? (
                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <Camera className="w-10 h-10 text-slate-400" />
                          )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-colors">
                          <Upload className="w-4 h-4" />
                          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                        </label>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Upload Student Photo (Optional)</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">Student Full Name</label>
                      <input required name="name" type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">Aadhar Number</label>
                      <input required name="aadharNo" type="text" maxLength={12} placeholder="12 Digit Aadhar" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">Father's Name</label>
                      <input required name="fatherName" type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">Mother's Name</label>
                      <input required name="motherName" type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">Date of Birth</label>
                      <input required name="dob" type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">Gender</label>
                      <select required name="gender" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">Class</label>
                      <select required name="class" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">Phone Number</label>
                      <input required name="phone" type="tel" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">Address</label>
                      <input required name="address" type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
                      <div className="flex items-center gap-3">
                        <input name="transport" type="checkbox" id="transport" className="w-5 h-5 rounded text-orange-600 focus:ring-orange-500" />
                        <label htmlFor="transport" className="text-sm font-bold text-orange-800 flex items-center gap-2">
                          <Bus className="w-4 h-4" />
                          Required School Transport Facility
                        </label>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-orange-700">Select Route (if transport required)</label>
                        <select name="routeId" className="w-full p-2.5 bg-white border border-orange-200 rounded-lg text-sm outline-none">
                          <option value="">No Route Selected</option>
                          {routes.map(r => (
                            <option key={r.id} value={r.id}>{r.routeName} - {formatCurrency(r.fee)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="md:col-span-2 pt-4">
                      <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Complete Admission
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {activeTab === 'students' && (
              <motion.div 
                key="students"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Filter by Class</label>
                    <select 
                      value={classFilter}
                      onChange={(e) => setClassFilter(e.target.value as any)}
                      className="block w-40 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="All">All Classes</option>
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Transport Status</label>
                    <select 
                      value={transportFilter}
                      onChange={(e) => setTransportFilter(e.target.value as any)}
                      className="block w-40 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="All">All Students</option>
                      <option value="Yes">Using Transport</option>
                      <option value="No">No Transport</option>
                    </select>
                  </div>

                  <button 
                    onClick={() => {
                      setClassFilter('All');
                      setTransportFilter('All');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    Reset Filters
                  </button>

                  <div className="ml-auto text-sm text-slate-500 font-medium pb-2.5">
                    Showing <span className="text-blue-600 font-bold">{filteredStudents.length}</span> students
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Adm No</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Student Name</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Class</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Father's Name</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Transport</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.length > 0 ? filteredStudents.map(student => (
                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-mono text-sm font-bold text-blue-600">{student.admissionNo}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                {student.photoUrl ? (
                                  <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Users className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold">{student.name}</p>
                                <p className="text-xs text-slate-500">{student.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold">{student.class}</span>
                          </td>
                          <td className="p-4 text-sm">{student.fatherName}</td>
                          <td className="p-4">
                            {student.transport ? (
                              <span className="flex items-center gap-1 text-xs font-bold text-orange-600">
                                <Bus className="w-3 h-3" /> Yes
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">No</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  setSelectedStudentForFee(student);
                                  setActiveTab('fees');
                                }}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Collect Fee"
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this student?')) {
                                    setStudents(students.filter(s => s.id !== student.id));
                                  }
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="p-12 text-center text-slate-400 italic">No students found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'fees' && (
              <motion.div 
                key="fees"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                {!selectedStudentForFee ? (
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
                    <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Collect Student Fee</h3>
                    <p className="text-slate-500 mb-6">Please select a student from the list or search above to record a fee payment.</p>
                    <button 
                      onClick={() => setActiveTab('students')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
                    >
                      Go to Student List
                    </button>
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                          {selectedStudentForFee.photoUrl ? (
                            <img src={selectedStudentForFee.photoUrl} alt={selectedStudentForFee.name} className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-8 h-8 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">Fee Collection</h3>
                          <p className="text-slate-500">Recording payment for <span className="font-bold text-blue-600">{selectedStudentForFee.name}</span></p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedStudentForFee(null);
                          setSelectedMonths([]);
                        }}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <form onSubmit={handleCollectFee} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 space-y-3">
                        <label className="text-sm font-bold text-slate-700">Select Month(s)</label>
                        {previousDues > 0 && (
                          <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <AlertCircle className="w-5 h-5 text-red-500" />
                              <div>
                                <p className="text-xs font-bold text-red-800 uppercase">Previous Outstanding Dues</p>
                                <p className="text-sm text-red-600">This student has unpaid balance from previous records.</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-black text-red-600">₹{previousDues}</p>
                            </div>
                          </div>
                        )}
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                          {MONTHS.map(m => {
                            const isSelected = selectedMonths.includes(m);
                            const isPaid = paidMonths.includes(m);
                            const classFee = classFees.find(cf => cf.class === selectedStudentForFee.class);
                            const isExamMonth = classFee?.examMonths?.includes(m);
                            
                            return (
                              <button
                                key={m}
                                type="button"
                                disabled={isPaid}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedMonths(selectedMonths.filter(sm => sm !== m));
                                  } else {
                                    setSelectedMonths([...selectedMonths, m]);
                                  }
                                }}
                                className={cn(
                                  "p-2 text-[10px] font-bold rounded-lg border transition-all flex flex-col items-center justify-center gap-1",
                                  isPaid 
                                    ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                                    : isSelected 
                                      ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200" 
                                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-300"
                                )}
                              >
                                {m.slice(0, 3)}
                                {isPaid ? (
                                  <span className="text-[8px] text-slate-400">Paid</span>
                                ) : isExamMonth && (
                                  <span className={cn(
                                    "px-1 rounded-[4px] text-[8px] uppercase",
                                    isSelected ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"
                                  )}>
                                    Exam
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-600">Payment Mode</label>
                        <select required name="paymentMode" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                          <option value="Cash">Cash</option>
                          <option value="Online">Online</option>
                          <option value="Cheque">Cheque</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-600">Other Charges</label>
                        <input 
                          name="otherFee" 
                          type="number" 
                          value={otherFeeInput}
                          onChange={(e) => setOtherFeeInput(Number(e.target.value))}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                      </div>

                      <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        {(() => {
                          const classFee = classFees.find(cf => cf.class === selectedStudentForFee.class);
                          const monthlyRate = classFee?.monthlyFee || 0;
                          const examRate = classFee?.examFee || 0;
                          const transportRate = selectedStudentForFee.transport ? (routes.find(r => r.id === selectedStudentForFee.routeId)?.fee || 0) : 0;
                          
                          const totalMonthly = monthlyRate * selectedMonths.length;
                          const totalTransport = transportRate * selectedMonths.length;
                          const hasExam = selectedMonths.some(m => classFee?.examMonths?.includes(m));
                          const totalExam = hasExam ? examRate : 0;
                          const totalDue = totalMonthly + totalExam + totalTransport + otherFeeInput + previousDues;

                          return (
                            <>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-500">Monthly Fee ({selectedMonths.length})</label>
                                <p className="text-lg font-bold text-slate-700">₹{totalMonthly}</p>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-500">Exam + Transport</label>
                                <p className="text-lg font-bold text-slate-700">₹{totalExam + totalTransport}</p>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-500">Previous Dues</label>
                                <p className="text-lg font-bold text-red-600">₹{previousDues}</p>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-500">Total Payable</label>
                                <p className="text-lg font-black text-blue-600">₹{totalDue}</p>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-bold text-blue-600">Amount Being Paid (INR)</label>
                        <input 
                          required 
                          name="paidAmount" 
                          type="number" 
                          value={paidAmountInput}
                          onChange={(e) => setPaidAmountInput(Number(e.target.value))}
                          placeholder="0.00" 
                          className="w-full p-4 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-black text-2xl text-blue-700" 
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-semibold text-slate-600">Remarks</label>
                        <input name="remarks" type="text" placeholder="Optional" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div className="md:col-span-2 pt-4">
                        <button 
                          type="submit" 
                          disabled={selectedMonths.length === 0}
                          className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Printer className="w-5 h-5" />
                          Collect & Print Receipt
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {lastReceipt && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-900">Payment Successful!</h4>
                        <p className="text-sm text-blue-700">Receipt #{lastReceipt.receiptNo} generated successfully.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => printReceipt(lastReceipt)}
                      className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      Reprint
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto"
              >
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                      <School className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">School Profile</h3>
                      <p className="text-sm text-slate-500">Update your school's basic information for receipts and header.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">School Name</label>
                      <input 
                        type="text" 
                        value={schoolProfile.name}
                        onChange={(e) => setSchoolProfile({...schoolProfile, name: e.target.value})}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">Tagline / Description</label>
                      <input 
                        type="text" 
                        value={schoolProfile.tagline}
                        onChange={(e) => setSchoolProfile({...schoolProfile, tagline: e.target.value})}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">Address</label>
                      <input 
                        type="text" 
                        value={schoolProfile.address}
                        onChange={(e) => setSchoolProfile({...schoolProfile, address: e.target.value})}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">Phone Number</label>
                      <input 
                        type="text" 
                        value={schoolProfile.phone}
                        onChange={(e) => setSchoolProfile({...schoolProfile, phone: e.target.value})}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                        <Settings className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Class-wise Fee Structure</h3>
                        <p className="text-sm text-slate-500">Manage fees and exam months for each class.</p>
                      </div>
                    </div>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const newFee: ClassFee = {
                        id: Math.random().toString(36).substr(2, 9),
                        class: formData.get('class') as SchoolClass,
                        monthlyFee: Number(formData.get('monthlyFee')),
                        examFee: Number(formData.get('examFee')),
                        examMonths: []
                      };
                      setClassFees([...classFees, newFee]);
                      e.currentTarget.reset();
                    }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100"
                  >
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Class</label>
                      <select name="class" className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Monthly Fee</label>
                      <input required name="monthlyFee" type="number" placeholder="0" className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Exam Fee</label>
                      <input required name="examFee" type="number" placeholder="0" className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex items-end">
                      <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                        <Plus className="w-5 h-5" />
                        Add Class Fee
                      </button>
                    </div>
                  </form>

                  <div className="grid grid-cols-1 gap-4">
                    {classFees.map((cf, index) => (
                      <div key={cf.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-black text-blue-700">Class: {cf.class}</h4>
                          <button 
                            onClick={() => setClassFees(classFees.filter(f => f.id !== cf.id))}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500">Monthly Tuition Fee</label>
                            <input 
                              type="number" 
                              value={cf.monthlyFee} 
                              onChange={(e) => {
                                const newFees = [...classFees];
                                newFees[index].monthlyFee = Number(e.target.value);
                                setClassFees(newFees);
                              }}
                              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-lg font-bold outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500">Examination Fee</label>
                            <input 
                              type="number" 
                              value={cf.examFee} 
                              onChange={(e) => {
                                const newFees = [...classFees];
                                newFees[index].examFee = Number(e.target.value);
                                setClassFees(newFees);
                              }}
                              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-lg font-bold outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-xs font-bold uppercase text-slate-500">Select Exam Months (Exam fee will apply in these months)</label>
                          <div className="flex flex-wrap gap-2">
                            {MONTHS.map(m => {
                              const isExamMonth = cf.examMonths?.includes(m);
                              return (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => {
                                    const newFees = [...classFees];
                                    if (isExamMonth) {
                                      newFees[index].examMonths = cf.examMonths.filter(em => em !== m);
                                    } else {
                                      newFees[index].examMonths = [...(cf.examMonths || []), m];
                                    }
                                    setClassFees(newFees);
                                  }}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                                    isExamMonth 
                                      ? "bg-orange-600 border-orange-600 text-white shadow-md shadow-orange-200" 
                                      : "bg-white border-slate-200 text-slate-600 hover:border-orange-300"
                                  )}
                                >
                                  {m}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                    {classFees.length === 0 && (
                      <div className="p-12 text-center text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        No class-wise fee structures added yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                        <Bus className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Transport Routes & Fees</h3>
                        <p className="text-sm text-slate-500">Manage school transport routes and their monthly charges.</p>
                      </div>
                    </div>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const newRoute: TransportRoute = {
                        id: Math.random().toString(36).substr(2, 9),
                        routeName: formData.get('routeName') as string,
                        fee: Number(formData.get('routeFee'))
                      };
                      setRoutes([...routes, newRoute]);
                      e.currentTarget.reset();
                    }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-orange-50 rounded-xl border border-orange-100"
                  >
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Route Name</label>
                      <input required name="routeName" type="text" placeholder="e.g. City Center" className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Monthly Fee (INR)</label>
                      <input required name="routeFee" type="number" placeholder="0.00" className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                    <div className="flex items-end">
                      <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-all flex items-center justify-center gap-2">
                        <Plus className="w-5 h-5" />
                        Add New Route
                      </button>
                    </div>
                  </form>

                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="p-4 text-xs font-bold text-slate-500 uppercase">Route Name</th>
                          <th className="p-4 text-xs font-bold text-slate-500 uppercase">Monthly Fee</th>
                          <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {routes.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="p-8 text-center text-slate-400 italic">No transport routes added yet.</td>
                          </tr>
                        ) : (
                          routes.map(route => (
                            <tr key={route.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-4 font-bold text-slate-700">{route.routeName}</td>
                              <td className="p-4 font-bold text-blue-600">₹{route.fee}</td>
                              <td className="p-4 text-right">
                                <button 
                                  onClick={() => setRoutes(routes.filter(r => r.id !== route.id))}
                                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, collapsed, onClick }: { icon: React.ReactNode, label: string, active: boolean, collapsed: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl transition-all relative group",
        active ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-slate-400 hover:text-white hover:bg-slate-800"
      )}
    >
      <div className={cn("shrink-0", active ? "text-white" : "group-hover:text-white")}>
        {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
      </div>
      {!collapsed && <span className="font-medium">{label}</span>}
      {collapsed && (
        <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
          {label}
        </div>
      )}
    </button>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: 'blue' | 'orange' | 'green' }) {
  const colors = {
    blue: "bg-blue-50 border-blue-100",
    orange: "bg-orange-50 border-orange-100",
    green: "bg-green-50 border-green-100"
  };

  return (
    <div className={cn("p-6 rounded-2xl border shadow-sm flex items-center gap-4", colors[color])}>
      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}
