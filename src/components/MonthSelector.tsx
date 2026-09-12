import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { formatThaiMonthYear, getAdjacentMonthKey, getCurrentMonthKey, THAI_MONTHS } from '../utils/formatters.ts';

interface MonthSelectorProps {
  selectedMonth: string; // YYYY-MM
  onSelectMonth: (monthKey: string) => void;
  recordCount: number;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonth,
  onSelectMonth,
  recordCount,
}) => {
  const currentMonth = getCurrentMonthKey();
  const isCurrentMonth = selectedMonth === currentMonth;

  const handlePrev = () => {
    onSelectMonth(getAdjacentMonthKey(selectedMonth, -1));
  };

  const handleNext = () => {
    onSelectMonth(getAdjacentMonthKey(selectedMonth, 1));
  };

  const handleResetToCurrent = () => {
    onSelectMonth(currentMonth);
  };

  const [yearStr, monthStr] = selectedMonth.split('-');
  const currentYear = parseInt(yearStr, 10);
  const currentMonthIndex = parseInt(monthStr, 10) - 1;

  // Generate years: current year - 3 to current year + 2
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 3 + i);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Navigation Buttons and Display */}
      <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-start">
        <button
          id="btn-prev-month"
          onClick={handlePrev}
          title="เดือนก่อนหน้า"
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <CalendarIcon className="w-4 h-4 text-emerald-600" />
          <span className="text-base sm:text-lg font-bold text-slate-800 min-w-[140px] text-center">
            {formatThaiMonthYear(selectedMonth)}
          </span>
        </div>

        <button
          id="btn-next-month"
          onClick={handleNext}
          title="เดือนถัดไป"
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {!isCurrentMonth && (
          <button
            id="btn-current-month"
            onClick={handleResetToCurrent}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200/60"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">กลับไป</span>เดือนนี้
          </button>
        )}
      </div>

      {/* Month & Year Selectors & Quick Counter */}
      <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
        <span className="text-xs text-slate-500 hidden lg:inline-block">
          บันทึกในเดือนนี้: <strong className="text-slate-800">{recordCount}</strong> รายการ
        </span>

        <select
          id="select-month"
          value={currentMonthIndex}
          onChange={(e) => {
            const m = String(parseInt(e.target.value, 10) + 1).padStart(2, '0');
            onSelectMonth(`${yearStr}-${m}`);
          }}
          aria-label="เลือกเดือน"
          className="text-xs font-medium py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-700 cursor-pointer"
        >
          {THAI_MONTHS.map((name, idx) => (
            <option key={idx} value={idx}>
              {name}
            </option>
          ))}
        </select>

        <select
          id="select-year"
          value={currentYear}
          onChange={(e) => {
            onSelectMonth(`${e.target.value}-${monthStr}`);
          }}
          aria-label="เลือกปี"
          className="text-xs font-medium py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-700 cursor-pointer"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              พ.ศ. {y + 543} ({y})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
