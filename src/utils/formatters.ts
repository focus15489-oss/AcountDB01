export const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

export const THAI_SHORT_MONTHS = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (amount: number): string => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatThaiDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const [yearStr, monthStr, dayStr] = dateString.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);

    const buddhistYear = year > 2400 ? year : year + 543;
    const shortMonth = THAI_SHORT_MONTHS[month] || '';

    return `${day} ${shortMonth} ${buddhistYear}`;
  } catch {
    return dateString;
  }
};

export const formatThaiMonthYear = (monthKey: string): string => {
  if (!monthKey) return '';
  try {
    const [yearStr, monthStr] = monthKey.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const buddhistYear = year > 2400 ? year : year + 543;
    const fullMonth = THAI_MONTHS[month] || '';

    return `${fullMonth} ${buddhistYear}`;
  } catch {
    return monthKey;
  }
};

export const getCurrentMonthKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getAdjacentMonthKey = (monthKey: string, offset: number): string => {
  const [yearStr, monthStr] = monthKey.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10) + offset;

  while (month < 1) {
    month += 12;
    year -= 1;
  }
  while (month > 12) {
    month -= 12;
    year += 1;
  }

  return `${year}-${String(month).padStart(2, '0')}`;
};

export const exportTransactionsToCSV = (transactions: any[], filename: string) => {
  const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน (บาท)', 'วิธีชำระเงิน', 'บันทึกเพิ่มเติม'];
  const rows = transactions.map((t) => [
    t.date,
    t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
    `"${(t.category || '').replace(/"/g, '""')}"`,
    t.amount,
    t.paymentMethod === 'transfer' ? 'โอนเงิน' : t.paymentMethod === 'credit' ? 'บัตรเครดิต' : 'เงินสด',
    `"${(t.note || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
