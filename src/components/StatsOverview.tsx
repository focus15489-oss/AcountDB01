import React from 'react';
import { ArrowDownLeft, ArrowUpRight, PiggyBank, Percent, Calendar } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters.ts';

interface StatsOverviewProps {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number;
  transactionCount: number;
  daysInMonth: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  totalIncome,
  totalExpense,
  netBalance,
  savingsRate,
  transactionCount,
  daysInMonth,
}) => {
  const avgExpensePerDay = daysInMonth > 0 ? totalExpense / daysInMonth : 0;
  const isPositiveBalance = netBalance >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Income */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-200 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">รายรับทั้งหมด</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-emerald-600 tracking-tight">
            +{formatCurrency(totalIncome)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {totalIncome > 0 ? 'บันทึกเข้ากระเป๋า' : 'ยังไม่มีรายการรายรับ'}
          </p>
        </div>
      </div>

      {/* Total Expense */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-rose-200 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">รายจ่ายทั้งหมด</span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-rose-600 tracking-tight">
            -{formatCurrency(totalExpense)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            เฉลี่ยวันละ {formatCurrency(avgExpensePerDay)}
          </p>
        </div>
      </div>

      {/* Net Balance */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">ยอดคงเหลือสุทธิ</span>
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isPositiveBalance ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-600'
            }`}
          >
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3
            className={`text-2xl font-bold tracking-tight ${
              isPositiveBalance ? 'text-teal-600' : 'text-rose-600'
            }`}
          >
            {isPositiveBalance ? '+' : ''}
            {formatCurrency(netBalance)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isPositiveBalance ? 'สถานะการเงินเป็นบวก' : 'ใช้จ่ายเกินรายรับในเดือนนี้'}
          </p>
        </div>
      </div>

      {/* Savings Rate & Activity */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">อัตราการออมเงิน</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-indigo-600 tracking-tight">
              {formatNumber(savingsRate)}%
            </h3>
            <span className="text-xs text-slate-400">ของรายรับ</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                savingsRate >= 20 ? 'bg-indigo-500' : savingsRate > 0 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
