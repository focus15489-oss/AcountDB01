import React, { useState, useEffect } from 'react';
import { X, Plus, Check, Calendar, FileText, CreditCard, Tag } from 'lucide-react';
import { Transaction, TransactionType, PaymentMethod } from '../types/index.ts';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '../constants/categories.ts';
import { CategoryIcon } from './CategoryIcon.tsx';
import { getTodayDateString } from '../utils/formatters.ts';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'userId' | 'userEmail' | 'createdAt'>) => Promise<void>;
  initialData?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = type === 'expense' ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES;

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setDate(initialData.date);
      setPaymentMethod(initialData.paymentMethod || 'transfer');
      setNote(initialData.note || '');
    } else {
      setType('expense');
      setAmount('');
      setCategory(DEFAULT_EXPENSE_CATEGORIES[0]?.name || 'อาหารและเครื่องดื่ม');
      setDate(getTodayDateString());
      setPaymentMethod('transfer');
      setNote('');
    }
    setError(null);
  }, [initialData, isOpen]);

  // When switching type, reset category to first of that type
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const newCats = newType === 'expense' ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES;
    setCategory(newCats[0]?.name || '');
  };

  const handleQuickAdd = (addVal: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + addVal).toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('กรุณาระบุจำนวนเงินที่มากกว่า 0');
      return;
    }
    if (!category) {
      setError('กรุณาเลือกหมวดหมู่');
      return;
    }
    if (!date) {
      setError('กรุณาเลือกวันที่');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        type,
        amount: numAmount,
        category,
        date,
        paymentMethod,
        note: note.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <h3 className="font-bold text-slate-800 text-base">
            {initialData ? 'แก้ไขรายการ' : 'บันทึกรายการใหม่'}
          </h3>
          <button
            id="btn-close-transaction-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type Selector (รายจ่าย / รายรับ) */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl">
            <button
              id="btn-type-expense"
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายจ่าย
            </button>
            <button
              id="btn-type-income"
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-1.5 ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายรับ
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                ฿
              </span>
              <input
                id="input-amount"
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-3 text-xl font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition-all"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[50, 100, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAdd(val)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              หมวดหมู่ *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-2xl bg-slate-50/50">
              {categories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left text-xs font-medium border transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-2xs'
                        : 'border-transparent bg-white hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-white shadow-2xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                    </span>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date and Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                วันที่ *
              </label>
              <input
                id="input-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                วิธีชำระเงิน
              </label>
              <select
                id="select-payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="transfer">โอนเงิน / สแกน QR</option>
                <option value="cash">เงินสด</option>
                <option value="credit">บัตรเครดิต / เดบิต</option>
                <option value="other">อื่นๆ</option>
              </select>
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              บันทึกช่วยจำ (ไม่บังคับ)
            </label>
            <input
              id="input-note"
              type="text"
              placeholder="เช่น กาแฟอเมซอน, ซื้อของเข้าบ้าน"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {error && (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              id="btn-cancel-transaction"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              id="btn-submit-transaction"
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 ${
                type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
              }`}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {initialData ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
