import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  ArrowDownLeft,
  ArrowUpRight,
  Inbox,
  Plus,
} from 'lucide-react';
import { Transaction, TransactionType } from '../types/index.ts';
import { formatCurrency, formatThaiDate, exportTransactionsToCSV } from '../utils/formatters.ts';
import { CategoryIcon } from './CategoryIcon.tsx';
import { getCategoryByName } from '../constants/categories.ts';

interface TransactionListProps {
  transactions: Transaction[];
  selectedMonth: string;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => Promise<void>;
  onAddNew: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  selectedMonth,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchMonth = t.date.startsWith(selectedMonth);
      if (!matchMonth) return false;

      const matchType = filterType === 'all' || t.type === filterType;
      if (!matchType) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchCat = t.category.toLowerCase().includes(q);
      const matchNote = (t.note || '').toLowerCase().includes(q);
      const matchAmount = t.amount.toString().includes(q);
      return matchCat || matchNote || matchAmount;
    });
  }, [transactions, selectedMonth, filterType, searchQuery]);

  const handleExport = () => {
    exportTransactionsToCSV(
      filteredTransactions,
      `income-expense-report-${selectedMonth}`
    );
  };

  const handleDeleteConfirm = async (id: string) => {
    if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
      try {
        setDeletingId(id);
        await onDelete(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const paymentMethodLabel = (method?: string) => {
    switch (method) {
      case 'transfer':
        return 'โอนเงิน';
      case 'credit':
        return 'บัตรเครดิต';
      case 'cash':
        return 'เงินสด';
      default:
        return 'อื่นๆ';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* List Header & Controls */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            ประวัติรายการ
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {filteredTransactions.length} รายการ
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            รายการรับและจ่ายทั้งหมดในเดือนที่เลือก
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-search-transaction"
              type="text"
              placeholder="ค้นหาหมวดหมู่, บันทึก..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Filter Type Segment */}
          <div className="flex p-0.5 bg-slate-100 rounded-xl">
            <button
              id="filter-all"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              id="filter-expense"
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                filterType === 'expense'
                  ? 'bg-rose-500 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายจ่าย
            </button>
            <button
              id="filter-income"
              onClick={() => setFilterType('income')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                filterType === 'income'
                  ? 'bg-emerald-500 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายรับ
            </button>
          </div>

          {/* Export CSV Button */}
          {filteredTransactions.length > 0 && (
            <button
              id="btn-export-csv"
              onClick={handleExport}
              title="ส่งออกรายงานเป็นไฟล์ CSV (Excel)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ส่งออก CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Transaction List Items */}
      {filteredTransactions.length === 0 ? (
        <div className="py-16 text-center text-slate-400 space-y-3 px-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6 stroke-1" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">ไม่มีรายการในช่วงเวลานี้</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {searchQuery
                ? 'ไม่พบข้อมูลที่ตรงกับคำค้นหา ลองล้างคำค้นหาดูครับ'
                : 'เริ่มต้นจดบันทึกรายรับหรือรายจ่ายรายการแรกกันเถอะ'}
            </p>
          </div>
          <button
            id="btn-add-transaction-empty"
            onClick={onAddNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> บันทึกรายการใหม่
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredTransactions.map((tx) => {
            const catInfo = getCategoryByName(tx.category, tx.type);
            const isIncome = tx.type === 'income';

            return (
              <div
                key={tx.id}
                className="p-4 sm:px-6 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4 group"
              >
                {/* Left: Category Icon & Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-2xs"
                    style={{ backgroundColor: catInfo.color }}
                  >
                    <CategoryIcon name={catInfo.icon} className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900 truncate">
                        {tx.category}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                        {paymentMethodLabel(tx.paymentMethod)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{formatThaiDate(tx.date)}</span>
                      {tx.note && (
                        <>
                          <span>•</span>
                          <span className="text-slate-600 truncate max-w-[200px] sm:max-w-xs">
                            {tx.note}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-sm sm:text-base font-bold ${
                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      id={`btn-edit-${tx.id}`}
                      onClick={() => onEdit(tx)}
                      title="แก้ไขรายการ"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`btn-delete-${tx.id}`}
                      onClick={() => handleDeleteConfirm(tx.id)}
                      disabled={deletingId === tx.id}
                      title="ลบรายการ"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
