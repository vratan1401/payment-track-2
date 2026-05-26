// Payment Track 2.0 — data layer (real, backed by Google Sheets)

const CATEGORIES = [
  { id: 'food',     bucket: 'lifestyle', label: 'Food & Drink',   subs: ['Cafe','Restaurant','Delivery','Groceries'] },
  { id: 'transit',  bucket: 'needs',     label: 'Transit',        subs: ['Auto','Cab','Petrol','Metro','Flight'] },
  { id: 'rent',     bucket: 'needs',     label: 'Rent & Bills',   subs: ['Rent','Electricity','Internet','Gas','Maid'] },
  { id: 'family',   bucket: 'needs',     label: 'Family',         subs: ['Mom Help','Mom Trip','Gifts'] },
  { id: 'pet',      bucket: 'needs',     label: 'Pet',            subs: ['Food','Litter','Vet','Misc'] },
  { id: 'shop',     bucket: 'lifestyle', label: 'Shopping',       subs: ['Clothing','Home','Books','Misc'] },
  { id: 'fun',      bucket: 'lifestyle', label: 'Entertainment',  subs: ['Movies','Events','Subscriptions','Sport'] },
  { id: 'health',   bucket: 'needs',     label: 'Health',         subs: ['Pharmacy','Doctor','Gym','Protein'] },
  { id: 'travel',   bucket: 'lifestyle', label: 'Travel',         subs: ['Stay','Flight','Transit','Activities'] },
  { id: 'dating',   bucket: 'lifestyle', label: 'Dating',         subs: ['Dinner','Activities','Gifts','Misc'] },
  { id: 'savings',  bucket: 'savings',   label: 'Savings',        subs: ['SIP','Emergency','Goal'] },
];

const BUCKETS = [
  { id: 'needs',     label: 'Needs',     pct: 50 },
  { id: 'lifestyle', label: 'Lifestyle', pct: 30 },
  { id: 'savings',   label: 'Savings',   pct: 20 },
];

const DEFAULT_BUDGETS = {
  total:     0,
  needs:     0,
  lifestyle: 0,
  savings:   0,
};

// ── Helpers ───────────────────────────────────────────────────────────────

function inr(n, opts={}) {
  const { sign = false, decimals = 0 } = opts;
  if (n == null || Number.isNaN(n)) return '—';
  const s = Math.abs(n).toLocaleString('en-IN', {
    minimumFractionDigits: decimals, maximumFractionDigits: decimals,
  });
  return (sign && n > 0 ? '+' : n < 0 ? '−' : '') + '₹' + s;
}

function inrParts(n) {
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  const whole = Math.floor(abs).toLocaleString('en-IN');
  return { sign, whole, currency: '₹' };
}

function fmtDate(iso, fmt = 'short') {
  const d = new Date(iso + 'T00:00:00');
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const wd = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  if (fmt === 'short') return `${d.getDate()} ${m[d.getMonth()]}`;
  if (fmt === 'long')  return `${wd[d.getDay()]} · ${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`;
  if (fmt === 'med')   return `${wd[d.getDay()]}, ${d.getDate()} ${m[d.getMonth()]}`;
  if (fmt === 'mon')   return `${m[d.getMonth()]} ${d.getFullYear()}`;
  return iso;
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function currentMonthLabel() {
  const d = new Date();
  const m = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${m[d.getMonth()]} ${d.getFullYear()}`;
}

function currentMonthPrefix() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

function daysAgo(iso, ref) {
  const d1 = new Date(iso + 'T00:00:00');
  const d2 = new Date((ref || todayISO()) + 'T00:00:00');
  return Math.round((d2 - d1) / 86400000);
}

function dateBadge(iso) {
  const today = todayISO();
  const n = daysAgo(iso, today);
  if (n === 0) return 'TODAY';
  if (n === 1) return 'YESTERDAY';
  return fmtDate(iso, 'med').toUpperCase();
}

function sum(arr, key) { return arr.reduce((a,e) => a + (key ? e[key] : e), 0); }

function spentByBucket(expenses) {
  const out = { needs: 0, lifestyle: 0, savings: 0 };
  const catLookup = Object.fromEntries(CATEGORIES.map(c => [c.id, c.bucket]));
  for (const e of expenses) {
    const b = catLookup[e.cat];
    if (b) out[b] += e.amount;
  }
  return out;
}

function spentByMode(expenses, modeId) {
  return sum(expenses.filter(e => e.modeId === modeId), 'amount');
}

function filterCurrentMonth(expenses) {
  const prefix = currentMonthPrefix();
  return expenses.filter(e => e.date && e.date.startsWith(prefix));
}

function groupByMonth(expenses) {
  const groups = {};
  for (const e of expenses) {
    const key = e.date ? e.date.slice(0, 7) : 'unknown';
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  }
  return groups;
}

Object.assign(window, {
  CATEGORIES, BUCKETS, DEFAULT_BUDGETS,
  inr, inrParts, fmtDate, todayISO, currentMonthLabel, currentMonthPrefix,
  daysAgo, dateBadge, sum, spentByBucket, spentByMode,
  filterCurrentMonth, groupByMonth,
});
