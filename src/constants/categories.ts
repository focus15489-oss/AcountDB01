import { CategoryInfo } from '../types/index.ts';

export const DEFAULT_EXPENSE_CATEGORIES: CategoryInfo[] = [
  { id: 'food', name: 'อาหารและเครื่องดื่ม', type: 'expense', icon: 'Utensils', color: '#EF4444' },
  { id: 'transport', name: 'การเดินทางและยานพาหนะ', type: 'expense', icon: 'Car', color: '#F97316' },
  { id: 'housing', name: 'ที่อยู่อาศัยและสาธารณูปโภค', type: 'expense', icon: 'Home', color: '#8B5CF6' },
  { id: 'shopping', name: 'ช้อปปิ้งและของใช้ส่วนตัว', type: 'expense', icon: 'ShoppingBag', color: '#EC4899' },
  { id: 'entertainment', name: 'ความบันเทิงและการพักผ่อน', type: 'expense', icon: 'Tv', color: '#06B6D4' },
  { id: 'health', name: 'สุขภาพและการรักษา', type: 'expense', icon: 'HeartPulse', color: '#10B981' },
  { id: 'education', name: 'การศึกษาและหนังสือ', type: 'expense', icon: 'GraduationCap', color: '#3B82F6' },
  { id: 'bills', name: 'บิลและหนี้สิน', type: 'expense', icon: 'Receipt', color: '#6366F1' },
  { id: 'family', name: 'ครอบครัวและสัตว์เลี้ยง', type: 'expense', icon: 'Users', color: '#EAB308' },
  { id: 'other_exp', name: 'รายจ่ายอื่นๆ', type: 'expense', icon: 'MoreHorizontal', color: '#64748B' },
];

export const DEFAULT_INCOME_CATEGORIES: CategoryInfo[] = [
  { id: 'salary', name: 'เงินเดือน / ค่าจ้าง', type: 'income', icon: 'Banknote', color: '#10B981' },
  { id: 'business', name: 'ธุรกิจส่วนตัว / ค้าขาย', type: 'income', icon: 'Store', color: '#059669' },
  { id: 'freelance', name: 'งานเสริม / ฟรีแลนซ์', type: 'income', icon: 'Laptop', color: '#0D9488' },
  { id: 'investment', name: 'เงินปันผล / ดอกเบี้ย / ลงทุน', type: 'income', icon: 'TrendingUp', color: '#2563EB' },
  { id: 'bonus', name: 'โบนัส / ค่าคอมมิชชัน', type: 'income', icon: 'Gift', color: '#7C3AED' },
  { id: 'other_inc', name: 'รายรับอื่นๆ', type: 'income', icon: 'PlusCircle', color: '#64748B' },
];

export const ALL_CATEGORIES = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];

export const getCategoryByName = (name: string, type: 'income' | 'expense') => {
  return (
    ALL_CATEGORIES.find((c) => c.name === name && c.type === type) ||
    ALL_CATEGORIES.find((c) => c.name === name) || {
      id: 'custom',
      name,
      type,
      icon: type === 'income' ? 'ArrowDownLeft' : 'ArrowUpRight',
      color: type === 'income' ? '#10B981' : '#EF4444',
    }
  );
};
