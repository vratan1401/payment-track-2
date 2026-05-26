// Payment Track 2.0 — Google Auth + Sheets API

const CLIENT_ID = '275121431565-8ss1bt9tdc4043ggf653r49dlsutcets.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';
const SHEET_NAME_PREFIX = 'payment-track-2';

const TABS = {
  EXPENSES: 'expenses',
  BUDGETS: 'budgets',
  MODES: 'modes',
  META: 'meta',
};

// ── Token management ──────────────────────────────────────────────────────
let _accessToken = null;
let _tokenClient = null;

function saveSession(token, sheetId, user) {
  localStorage.setItem('pt2_token', token);
  localStorage.setItem('pt2_sheet', sheetId);
  localStorage.setItem('pt2_user', JSON.stringify(user));
}

function loadSession() {
  return {
    token: localStorage.getItem('pt2_token'),
    sheetId: localStorage.getItem('pt2_sheet'),
    user: JSON.parse(localStorage.getItem('pt2_user') || 'null'),
  };
}

function clearSession() {
  localStorage.removeItem('pt2_token');
  localStorage.removeItem('pt2_sheet');
  localStorage.removeItem('pt2_user');
}

// ── GIS init ──────────────────────────────────────────────────────────────
function initTokenClient(onSuccess, onError) {
  _tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: async (resp) => {
      if (resp.error) { onError(resp.error); return; }
      // Set token FIRST before any API calls
      _accessToken = resp.access_token;
      try {
        const user = await fetchUserInfo(_accessToken);
        onSuccess({ token: _accessToken, user });
      } catch(e) {
        console.error('fetchUserInfo failed:', e);
        onError(e.message);
      }
    },
  });
}

function requestToken(forceConsent) {
  if (!_tokenClient) throw new Error('Token client not initialised');
  _tokenClient.requestAccessToken(forceConsent ? { prompt: 'consent' } : {});
}

// ── Generic fetch wrapper ─────────────────────────────────────────────────
async function apiFetch(url, opts = {}, tokenOverride) {
  const token = tokenOverride || _accessToken;
  if (!token) throw new Error('No access token available');

  const fetchOpts = {
    method: opts.method || 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  if (opts.body !== undefined) {
    fetchOpts.body = typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body);
  }

  const res = await fetch(url, fetchOpts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }
  return res.json();
}

async function fetchUserInfo(token) {
  const r = await apiFetch('https://www.googleapis.com/oauth2/v3/userinfo', {}, token);
  return {
    name: r.name,
    email: r.email,
    initials: (r.name || '?').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(),
    picture: r.picture,
  };
}

// ── Google Drive — find or create sheet ──────────────────────────────────
async function findOrCreateSheet() {
  const q = encodeURIComponent(`name contains '${SHEET_NAME_PREFIX}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`);
  const list = await apiFetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&pageSize=5`);
  if (list.files && list.files.length > 0) {
    return list.files[0].id;
  }
  return createSheet();
}

async function createSheet() {
  const body = {
    properties: { title: `${SHEET_NAME_PREFIX} · ${new Date().getFullYear()}` },
    sheets: [
      { properties: { title: TABS.EXPENSES, index: 0 } },
      { properties: { title: TABS.BUDGETS,  index: 1 } },
      { properties: { title: TABS.MODES,    index: 2 } },
      { properties: { title: TABS.META,     index: 3 } },
    ],
  };
  const res = await apiFetch('https://sheets.googleapis.com/v4/spreadsheets', { method: 'POST', body });
  const sheetId = res.spreadsheetId;
  await writeHeaders(sheetId);
  return sheetId;
}

async function writeHeaders(sheetId) {
  const ranges = [
    { range: `${TABS.EXPENSES}!A1:J1`, values: [['id','date','amount','payee','cat','sub','modeId','note','createdAt','synced']] },
    { range: `${TABS.BUDGETS}!A1:C1`,  values: [['key','value','updatedAt']] },
    { range: `${TABS.MODES}!A1:H1`,    values: [['id','name','status','start','end','budget','note','createdAt']] },
    { range: `${TABS.META}!A1:B1`,     values: [['key','value']] },
  ];
  await apiFetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchUpdate`, {
    method: 'POST',
    body: { valueInputOption: 'RAW', data: ranges },
  });
}

// ── Read all app data ─────────────────────────────────────────────────────
async function loadSheetData(sheetId) {
  const ranges = [
    `${TABS.EXPENSES}!A2:J`,
    `${TABS.BUDGETS}!A2:C`,
    `${TABS.MODES}!A2:H`,
  ];
  const encoded = ranges.map(r => `ranges=${encodeURIComponent(r)}`).join('&');
  const res = await apiFetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchGet?${encoded}`);
  const [expRows, budRows, modeRows] = res.valueRanges.map(r => r.values || []);

  const expenses = expRows
    .filter(r => r[0])
    .map(r => ({
      id:     r[0] || '',
      date:   r[1] || '',
      amount: Number(r[2]) || 0,
      payee:  r[3] || '',
      cat:    r[4] || 'food',
      sub:    r[5] || '',
      modeId: r[6] || null,
      note:   r[7] || '',
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  const budgetMap = Object.fromEntries(budRows.filter(r => r[0]).map(r => [r[0], Number(r[1]) || 0]));
  const budgets = {
    total:     budgetMap['total']     || 108000,
    needs:     budgetMap['needs']     || 54000,
    lifestyle: budgetMap['lifestyle'] || 32400,
    savings:   budgetMap['savings']   || 21600,
  };

  const modes = modeRows
    .filter(r => r[0])
    .map(r => ({
      id:     r[0] || '',
      name:   r[1] || '',
      status: r[2] || 'ended',
      start:  r[3] || '',
      end:    r[4] || '',
      budget: Number(r[5]) || 0,
      note:   r[6] || '',
    }));

  return { expenses, budgets, modes };
}

// ── Write expense ─────────────────────────────────────────────────────────
async function appendExpense(sheetId, exp) {
  const row = [
    exp.id, exp.date, exp.amount, exp.payee,
    exp.cat, exp.sub, exp.modeId || '', exp.note || '',
    new Date().toISOString(), 'true',
  ];
  await apiFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${TABS.EXPENSES}!A:J:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    { method: 'POST', body: { values: [row] } }
  );
}

// ── Write budgets ─────────────────────────────────────────────────────────
async function saveBudgets(sheetId, budgets) {
  const now = new Date().toISOString();
  const rows = Object.entries(budgets).map(([k, v]) => [k, v, now]);
  await apiFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${TABS.BUDGETS}!A2:C:clear`,
    { method: 'POST', body: {} }
  );
  await apiFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${TABS.BUDGETS}!A2:C?valueInputOption=RAW`,
    { method: 'PUT', body: { values: rows } }
  );
}

// ── Write mode ────────────────────────────────────────────────────────────
async function appendMode(sheetId, mode) {
  const row = [
    mode.id, mode.name, mode.status,
    mode.start, mode.end, mode.budget,
    mode.note || '', new Date().toISOString(),
  ];
  await apiFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${TABS.MODES}!A:H:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    { method: 'POST', body: { values: [row] } }
  );
}

async function updateModeStatus(sheetId, modeId, status) {
  const res = await apiFetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${TABS.MODES}!A2:A`);
  const rows = res.values || [];
  const idx = rows.findIndex(r => r[0] === modeId);
  if (idx === -1) return;
  const rowNum = idx + 2;
  await apiFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${TABS.MODES}!C${rowNum}?valueInputOption=RAW`,
    { method: 'PUT', body: { values: [[status]] } }
  );
}

// ── Delete expense ────────────────────────────────────────────────────────
async function deleteExpense(sheetId, expId) {
  const res = await apiFetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${TABS.EXPENSES}!A2:A`);
  const rows = res.values || [];
  const idx = rows.findIndex(r => r[0] === expId);
  if (idx === -1) return;
  const meta = await apiFetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=sheets.properties`);
  const expSheet = meta.sheets.find(s => s.properties.title === TABS.EXPENSES);
  const sheetGid = expSheet.properties.sheetId;
  const rowNum = idx + 1;
  await apiFetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`, {
    method: 'POST',
    body: {
      requests: [{
        deleteDimension: {
          range: { sheetId: sheetGid, dimension: 'ROWS', startIndex: rowNum, endIndex: rowNum + 1 }
        }
      }]
    }
  });
}

Object.assign(window, {
  GAPI: {
    initTokenClient,
    requestToken,
    findOrCreateSheet,
    loadSheetData,
    appendExpense,
    saveBudgets,
    appendMode,
    updateModeStatus,
    deleteExpense,
    loadSession,
    saveSession,
    clearSession,
    setToken: (t) => { _accessToken = t; },
    getToken: () => _accessToken,
  }
});
