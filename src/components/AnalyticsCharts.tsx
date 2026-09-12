import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { PieChart as PieIcon, BarChart3, TrendingUp, Layers, AlertCircle } from 'lucide-react';
import { Transaction } from '../types/index.ts';
import { formatCurrency, formatNumber } from '../utils/formatters.ts';
import { CategoryIcon } from './CategoryIcon.tsx';
import { getCategoryByName } from '../constants/categories.ts';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  selectedMonth: string; // YYYY-MM
}

const PALETTE = [
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#10B981',
  '#06B6D4',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#64748B',
];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  transactions,
  selectedMonth,
}) => {
  const [activeTab, setActiveTab] = useState<'category' | 'daily' | 'trend'>('category');

  // Filter transactions strictly for the selected month
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Expenses only
  const expenseTransactions = useMemo(() => {
    return monthTransactions.filter((t) => t.type === 'expense');
  }, [monthTransactions]);

  // Total Expense for percentage calculations
  const totalExpense = useMemo(() => {
    return expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [expenseTransactions]);

  // Aggregate by Category
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    expenseTransactions.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });

    const list = Object.entries(map).map(([name, value], index) => {
      const catInfo = getCategoryByName(name, 'expense');
      return {
        name,
        value,
        color: catInfo.color || PALETTE[index % PALETTE.length],
        icon: catInfo.icon,
        percentage: totalExpense > 0 ? (value / totalExpense) * 100 : 0,
      };
    });

    return list.sort((a, b) => b.value - a.value);
  }, [expenseTransactions, totalExpense]);

  // Aggregate by Day (Day 1 to Last Day of Month)
  const dailyData = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysCount = new Date(year, month, 0).getDate();

    const dailyMap: Record<number, { income: number; expense: number }> = {};
    for (let d = 1; d <= daysCount; d++) {
      dailyMap[d] = { income: 0, expense: 0 };
    }

    monthTransactions.forEach((t) => {
      const parts = t.date.split('-');
      const d = parseInt(parts[2], 10);
      if (dailyMap[d]) {
        if (t.type === 'income') {
          dailyMap[d].income += t.amount;
        } else {
          dailyMap[d].expense += t.amount;
        }
      }
    });

    let runningBalance = 0;
    return Object.entries(dailyMap).map(([dayKey, val]) => {
      const dayNum = parseInt(dayKey, 10);
      runningBalance += val.income - val.expense;
      return {
        day: `${dayNum}`,
        displayDay: `วันที่ ${dayNum}`,
        income: val.income,
        expense: val.expense,
        cumulativeBalance: runningBalance,
      };
    });
  }, [monthTransactions, selectedMonth]);

  const hasData = monthTransactions.length > 0;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-6">
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            กราฟวิเคราะห์ข้อมูลประจำเดือน
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            สรุปภาพรวมรายรับรายจ่าย พฤติกรรมการใช้เงิน และสัดส่วนค่าใช้จ่าย
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl">
          <button
            id="tab-chart-category"
            onClick={() => setActiveTab('category')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'category'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5 text-rose-500" />
            สัดส่วนรายจ่าย
          </button>
          <button
            id="tab-chart-daily"
            onClick={() => setActiveTab('daily')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'daily'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
            รายรับ-รายจ่ายรายวัน
          </button>
          <button
            id="tab-chart-trend"
            onClick={() => setActiveTab('trend')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'trend'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            กระแสเงินสะสม
          </button>
        </div>
      </div>

      {/* Chart Views */}
      {!hasData ? (
        <div className="py-16 text-center text-slate-400 space-y-2">
          <AlertCircle className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
          <p className="text-sm font-medium text-slate-600">ยังไม่มีข้อมูลสำหรับสร้างกราฟในเดือนนี้</p>
          <p className="text-xs text-slate-400">เริ่มต้นบันทึกรายรับหรือรายจ่ายเพื่อดูการวิเคราะห์</p>
        </div>
      ) : (
        <div>
          {/* Tab 1: Category Donut & Breakdown */}
          {activeTab === 'category' && (
            <div className="space-y-6">
              {categoryData.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-sm">ไม่มีรายการรายจ่ายในเดือนนี้ มีเฉพาะรายรับ</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Donut Chart */}
                  <div className="lg:col-span-6 h-72 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={105}
                          paddingAngle={3}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => [
                            formatCurrency(Number(value) || 0),
                            'ยอดเงิน',
                          ]}
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '12px',
                            border: '1px solid #E2E8F0',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            fontSize: '12px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Category Progress List */}
                  <div className="lg:col-span-6 space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      ลำดับหมวดหมู่ค่าใช้จ่ายสูงสุด
                    </h3>
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {categoryData.map((cat) => (
                        <div
                          key={cat.name}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                        >
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: cat.color }}
                              />
                              <CategoryIcon name={cat.icon} className="w-4 h-4 text-slate-600" />
                              <span className="font-medium text-slate-800">{cat.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-slate-900">
                                {formatCurrency(cat.value)}
                              </span>
                              <span className="text-slate-400 text-[11px] ml-1.5 font-medium">
                                ({formatNumber(cat.percentage)}%)
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${cat.percentage}%`,
                                backgroundColor: cat.color,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Daily Income vs Expense Bar Chart */}
          {activeTab === 'daily' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>กราฟแสดงการไหลเวียนเงินรายวัน (วันที่ 1 ถึงสิ้นเดือน)</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-emerald-500" />
                    <span>รายรับ</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-rose-500" />
                    <span>รายจ่าย</span>
                  </div>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      stroke="#94A3B8"
                      fontSize={11}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tickLine={false}
                      stroke="#94A3B8"
                      fontSize={11}
                      tickFormatter={(val) => (val >= 1000 ? `${val / 1000}k` : val)}
                    />
                    <Tooltip
                      labelFormatter={(label) => `วันที่ ${label}`}
                      formatter={(val: any, name: any) => [
                        formatCurrency(Number(val) || 0),
                        name === 'income' ? 'รายรับ' : 'รายจ่าย',
                      ]}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="income" name="income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={16} />
                    <Bar dataKey="expense" name="expense" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Tab 3: Cumulative Balance Line Chart */}
          {activeTab === 'trend' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>แนวโน้มเงินคงเหลือสะสม (Cumulative Cash Flow) ในเดือนนี้</span>
                <span className="font-medium text-indigo-600">
                  คงเหลือสิ้นสุด: {formatCurrency(dailyData[dailyData.length - 1]?.cumulativeBalance || 0)}
                </span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      stroke="#94A3B8"
                      fontSize={11}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tickLine={false}
                      stroke="#94A3B8"
                      fontSize={11}
                      tickFormatter={(val) => (Math.abs(val) >= 1000 ? `${val / 1000}k` : val)}
                    />
                    <Tooltip
                      labelFormatter={(label) => `วันที่ ${label}`}
                      formatter={(val: any) => [formatCurrency(Number(val) || 0), 'ยอดสะสม']}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulativeBalance"
                      stroke="#6366F1"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#balanceGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
