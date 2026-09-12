import React, { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  auth,
  subscribeToTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  signInWithGoogle,
  signInAsGuest,
  TARGET_PROJECT_DISPLAY_NAME,
} from './lib/firebase.ts';
import { Transaction } from './types/index.ts';
import { getCurrentMonthKey } from './utils/formatters.ts';
import { Navbar } from './components/Navbar.tsx';
import { MonthSelector } from './components/MonthSelector.tsx';
import { StatsOverview } from './components/StatsOverview.tsx';
import { AnalyticsCharts } from './components/AnalyticsCharts.tsx';
import { TransactionList } from './components/TransactionList.tsx';
import { TransactionModal } from './components/TransactionModal.tsx';
import { FirebaseConfigModal } from './components/FirebaseConfigModal.tsx';
import { generateSampleTransactions } from './utils/sampleData.ts';
import {
  Plus,
  Sparkles,
  Database,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  // Month navigation
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isFirebaseConfigOpen, setIsFirebaseConfigOpen] = useState(false);
  const [isPopulatingSamples, setIsPopulatingSamples] = useState(false);

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Data Subscription on User Login
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      return;
    }

    setLoadingData(true);
    setFirestoreError(null);

    const unsubscribe = subscribeToTransactions(
      user.uid,
      (items) => {
        setTransactions(items);
        setLoadingData(false);
      },
      (err) => {
        console.error('Transactions load error:', err);
        setFirestoreError(err.message || 'ไม่สามารถโหลดข้อมูลจาก Firestore ได้');
        setLoadingData(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Calculations for the selected month
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const { totalIncome, totalExpense, netBalance, savingsRate, daysInMonth } = useMemo(() => {
    let inc = 0;
    let exp = 0;

    monthTransactions.forEach((t) => {
      if (t.type === 'income') {
        inc += t.amount;
      } else {
        exp += t.amount;
      }
    });

    const net = inc - exp;
    const rate = inc > 0 ? ((inc - exp) / inc) * 100 : 0;

    const [yearStr, monthStr] = selectedMonth.split('-');
    const days = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10), 0).getDate();

    return {
      totalIncome: inc,
      totalExpense: exp,
      netBalance: net,
      savingsRate: Math.max(0, rate),
      daysInMonth: days,
    };
  }, [monthTransactions, selectedMonth]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingTx(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  const handleSubmitTransaction = async (
    data: Omit<Transaction, 'id' | 'userId' | 'userEmail' | 'createdAt'>
  ) => {
    if (!user) return;
    if (editingTx) {
      await updateTransaction(editingTx.id, data);
    } else {
      await addTransaction(user.uid, user.email || '', data);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
  };

  const handlePopulateSampleData = async () => {
    if (!user) return;
    try {
      setIsPopulatingSamples(true);
      const samples = generateSampleTransactions(user.uid, user.email || '');
      for (const item of samples) {
        await addTransaction(user.uid, user.email || '', {
          type: item.type,
          amount: item.amount,
          category: item.category,
          date: item.date,
          paymentMethod: item.paymentMethod,
          note: item.note,
        });
      }
    } catch (err) {
      console.error('Failed to populate samples:', err);
    } finally {
      setIsPopulatingSamples(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col font-['Prompt',sans-serif]">
      {/* Navigation Bar */}
      <Navbar
        user={user}
        loadingAuth={loadingAuth}
        onOpenFirebaseConfig={() => setIsFirebaseConfigOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Unauthenticated Landing / Invitation Banner */}
        {!user && !loadingAuth && (
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-medium backdrop-blur-md">
                <Database className="w-3.5 h-3.5" />
                เชื่อมต่อฐานข้อมูล Firebase Project: {TARGET_PROJECT_DISPLAY_NAME}
              </div>

              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                จัดการบัญชีรายรับรายจ่าย <br className="hidden sm:block" />
                สรุปผลรายเดือน พร้อมกราฟวิเคราะห์แม่นยำ
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                เข้าสู่ระบบด้วย Gmail เพื่อซิงค์และบันทึกข้อมูลส่วนตัวลงใน Firebase อย่างปลอดภัย 
                สามารถวิเคราะห์พฤติกรรมการใช้จ่ายและกระแสเงินสดได้แบบเรียลไทม์
              </p>

              <div className="pt-3 flex flex-wrap items-center gap-3">
                <button
                  id="btn-hero-google-login"
                  onClick={() => signInWithGoogle()}
                  className="px-6 py-3.5 rounded-2xl bg-white text-slate-900 font-bold text-sm shadow-lg hover:bg-slate-100 transition-all flex items-center gap-2.5 active:scale-95"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  เข้าสู่ระบบด้วย Gmail ทันที
                </button>

                <button
                  id="btn-hero-guest-login"
                  onClick={() => signInAsGuest()}
                  className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-sm transition-all flex items-center gap-2"
                >
                  ทดลองใช้งานด่วน (Demo Mode)
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2 flex items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ความปลอดภัยแยกข้อมูลตาม User ID
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Firestore Rules ป้องกันการเข้าถึง
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Month Selector & Global Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <MonthSelector
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
              recordCount={monthTransactions.length}
            />
          </div>

          {/* Quick Action Button */}
          {user && (
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              {monthTransactions.length === 0 && (
                <button
                  id="btn-sample-data"
                  onClick={handlePopulateSampleData}
                  disabled={isPopulatingSamples}
                  className="flex items-center gap-1.5 px-3.5 py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors shadow-2xs"
                  title="สร้างรายการตัวอย่างสำหรับทดสอบกราฟและสรุปผล"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  {isPopulatingSamples ? 'กำลังเพิ่มข้อมูล...' : 'ใส่ข้อมูลตัวอย่าง'}
                </button>
              )}

              <button
                id="btn-add-new-transaction"
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                บันทึกรายรับ-รายจ่าย
              </button>
            </div>
          )}
        </div>

        {/* Executive Monthly Summary Cards */}
        <StatsOverview
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          netBalance={netBalance}
          savingsRate={savingsRate}
          transactionCount={monthTransactions.length}
          daysInMonth={daysInMonth}
        />

        {/* Analytics Charts Module */}
        <AnalyticsCharts
          transactions={transactions}
          selectedMonth={selectedMonth}
        />

        {/* Transaction History & Records Table */}
        <TransactionList
          transactions={transactions}
          selectedMonth={selectedMonth}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteTransaction}
          onAddNew={handleOpenAdd}
        />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 ระบบจัดการรายรับรายจ่าย • พัฒนาสำหรับโปรเจกต์ {TARGET_PROJECT_DISPLAY_NAME}</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Firebase Firestore</span>
            <span>•</span>
            <span>Gmail Authentication</span>
            <span>•</span>
            <span>Recharts Data Analytics</span>
          </div>
        </div>
      </footer>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitTransaction}
        initialData={editingTx}
      />

      {/* Firebase Config Modal */}
      <FirebaseConfigModal
        isOpen={isFirebaseConfigOpen}
        onClose={() => setIsFirebaseConfigOpen(false)}
      />
    </div>
  );
}
