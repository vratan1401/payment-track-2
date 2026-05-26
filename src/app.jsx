// Payment Track 2.0 — App with real Google Auth + Sheets

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "paperTint": "warm",
  "accent": "#8b2500",
  "grain": 1,
  "tone": "paper"
}/*EDITMODE-END*/;

const PAPER_TINTS = {
  warm:  { paper:'#f5f0e8', edge:'#d9cdb1', table:'#2b2218' },
  bone:  { paper:'#efeae0', edge:'#c8bda0', table:'#272018' },
  cream: { paper:'#f7eed6', edge:'#dac68d', table:'#2d2316' },
  cool:  { paper:'#ecebe3', edge:'#bbbba5', table:'#1f201c' },
};

const ACCENTS = {
  '#8b2500': { soft:'#a44a26' },
  '#3a4a1f': { soft:'#5a6a3a' },
  '#1f3a5a': { soft:'#3a567a' },
  '#1a1208': { soft:'#3d2d1b' },
};

// ── Loading screen ────────────────────────────────────────────────────────
function LoadingScreen({ message }) {
  return (
    <div style={{
      height:'100%', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:24,
      padding:40,
    }}>
      <div style={{fontFamily:'var(--display)', fontSize:48, lineHeight:.9, textAlign:'center'}}>
        Payment<br/>Tracker
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:14, alignItems:'center'}}>
        {[0,1,2].map(i => (
          <div key={i} className="rule" style={{width: 120 - i*20}} />
        ))}
      </div>
      <div style={{
        fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.22em',
        color:'var(--olive)', textTransform:'uppercase', textAlign:'center',
      }}>{message || 'Loading…'}</div>
    </div>
  );
}

// ── Error screen ──────────────────────────────────────────────────────────
function ErrorScreen({ message, onRetry }) {
  return (
    <div style={{
      height:'100%', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:20,
      padding:40,
    }}>
      <Stamp label="ERROR" size="lg" rotation={-3} />
      <p style={{
        fontFamily:'var(--serif)', fontStyle:'italic', fontSize:14,
        textAlign:'center', color:'var(--ink-soft)', lineHeight:1.5,
      }}>{message}</p>
      <InkButton onClick={onRetry}>Try Again</InkButton>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Auth state
  const [authState, setAuthState] = React.useState('idle'); // idle | loading | ready | error
  const [authError, setAuthError] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [sheetId, setSheetId] = React.useState(null);

  // App state
  const [expenses, setExpenses]     = React.useState([]);
  const [budgets, setBudgetsState]  = React.useState(DEFAULT_BUDGETS);
  const [modes, setModes]           = React.useState([]);
  const [activeModeId, setActiveModeId] = React.useState(null);

  // UI state
  const [tab, setTab]               = React.useState('home');
  const [settingsView, setSettingsView] = React.useState(null);
  const [addOpen, setAddOpen]       = React.useState(false);
  const [toast, setToast]           = React.useState(null);
  const [syncing, setSyncing]       = React.useState(false);

  // Apply tweaks → CSS vars
  React.useEffect(() => {
    document.body.dataset.tone = t.tone || 'paper';
    const tint = PAPER_TINTS[t.paperTint] || PAPER_TINTS.warm;
    if (t.tone !== 'carbon') {
      document.documentElement.style.setProperty('--paper', tint.paper);
      document.documentElement.style.setProperty('--paper-edge', tint.edge);
      document.documentElement.style.setProperty('--table', tint.table);
    }
    document.documentElement.style.setProperty('--accent', t.accent);
    document.documentElement.style.setProperty('--accent-soft', (ACCENTS[t.accent]||{}).soft || '#a44a26');
    document.documentElement.style.setProperty('--grain', String(t.grain));
  }, [t.paperTint, t.accent, t.grain, t.tone]);

  // ── Bootstrap ─────────────────────────────────────────────────────────
  React.useEffect(() => {
    // Wait for GIS to load, then check session
    const interval = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearInterval(interval);
        bootstrapAuth();
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  async function bootstrapAuth() {
    // Init token client first
    GAPI.initTokenClient(
      async ({ token, user: u }) => {
        GAPI.setToken(token);
        setUser(u);
        // Pass existing sheetId from session if available to avoid re-searching Drive
        const session = GAPI.loadSession();
        await loadAppData(token, u, session.sheetId || null);
      },
      (err) => {
        setAuthError(err);
        setAuthState('error');
      }
    );

    // Check for existing session — if user/sheet known, show loading and request fresh token silently
    const session = GAPI.loadSession();
    if (session.sheetId && session.user) {
      // We have a known user — show loading and silently request a fresh token
      // (GIS tokens expire after 1hr and cannot be reused across page loads)
      setUser(session.user);
      setAuthState('loading');
      GAPI.requestToken(); // will fire callback above with fresh token
    } else {
      setAuthState('idle');
    }
  }

  async function loadAppData(token, u, existingSheetId) {
    setAuthState('loading');
    try {
      GAPI.setToken(token);
      const sid = existingSheetId || await GAPI.findOrCreateSheet();
      const data = await GAPI.loadSheetData(sid);
      setSheetId(sid);
      setExpenses(data.expenses);
      setBudgetsState(data.budgets);
      setModes(data.modes);
      // Find active mode (status === 'active')
      const active = data.modes.find(m => m.status === 'active');
      if (active) setActiveModeId(active.id);
      GAPI.saveSession(token, sid, u);
      setAuthState('ready');
    } catch(e) {
      console.error('loadAppData failed:', e);
      setAuthError(e.message);
      setAuthState('error');
    }
  }

  function handleSignIn() {
    GAPI.requestToken(true);
    setAuthState('loading');
  }

  function handleSignOut() {
    GAPI.clearSession();
    setUser(null);
    setSheetId(null);
    setExpenses([]);
    setBudgetsState(DEFAULT_BUDGETS);
    setModes([]);
    setActiveModeId(null);
    setTab('home');
    setAuthState('idle');
    showToast('Signed out · Ledger closed');
  }

  // ── Toast helper ──────────────────────────────────────────────────────
  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }

  // ── Save expense ──────────────────────────────────────────────────────
  async function handleSave(exp) {
    // Optimistic update
    setExpenses(prev => [exp, ...prev]);
    setAddOpen(false);
    showToast(`Recorded · ₹${exp.amount.toLocaleString('en-IN')} to ${exp.payee}`);
    // Persist to sheet
    try {
      setSyncing(true);
      await GAPI.appendExpense(sheetId, exp);
    } catch(e) {
      showToast('Sync error — saved locally');
    } finally {
      setSyncing(false);
    }
  }

  // ── Save budgets ──────────────────────────────────────────────────────
  async function handleSetBudgets(next) {
    setBudgetsState(next);
    try {
      await GAPI.saveBudgets(sheetId, next);
    } catch(e) {
      showToast('Budget sync error');
    }
  }

  // ── Delete expense ────────────────────────────────────────────────────
  async function handleDeleteExpense(expId) {
    setExpenses(prev => prev.filter(e => e.id !== expId));
    try {
      await GAPI.deleteExpense(sheetId, expId);
      showToast('Entry deleted');
    } catch(e) {
      showToast('Delete sync error');
    }
  }

  // ── End mode ──────────────────────────────────────────────────────────
  async function handleEndMode() {
    const mId = activeModeId;
    setActiveModeId(null);
    setModes(prev => prev.map(m => m.id === mId ? {...m, status:'ended'} : m));
    showToast('Mode ended · back to regular life');
    try {
      await GAPI.updateModeStatus(sheetId, mId, 'ended');
    } catch(e) {
      showToast('Mode sync error');
    }
  }

  // ── Start mode ────────────────────────────────────────────────────────
  async function handleStartMode(modeData) {
    const newMode = {
      id: 'mode-' + Date.now(),
      name: modeData.name.toUpperCase(),
      status: 'active',
      start: todayISO(),
      end: modeData.end || todayISO(),
      budget: modeData.budget || 0,
      note: modeData.note || '',
    };
    setModes(prev => [...prev, newMode]);
    setActiveModeId(newMode.id);
    showToast(`Mode started · ${newMode.name}`);
    try {
      await GAPI.appendMode(sheetId, newMode);
    } catch(e) {
      showToast('Mode sync error');
    }
  }

  // ── Tab navigation ────────────────────────────────────────────────────
  function handleTab(id) {
    if (id === 'add') { setAddOpen(true); return; }
    setTab(id);
    setSettingsView(null);
  }

  // ── Derived state ─────────────────────────────────────────────────────
  const mode = activeModeId ? modes.find(m => m.id === activeModeId) : null;
  const monthExpenses = filterCurrentMonth(expenses);
  const monthLabel = currentMonthLabel();
  const dayN = mode ? Math.max(1, daysAgo(mode.start) + 1) : 0;
  const dayT = mode ? (daysAgo(mode.end, mode.start) + 1) : 0;
  const statusMode = mode ? { name: mode.name, dayN, dayT } : null;
  const state = { expenses: monthExpenses, allExpenses: expenses, budgets, mode, modes };

  // ── Screens ───────────────────────────────────────────────────────────
  if (authState === 'idle') {
    return (
      <>
        <LoginScreen onSignIn={handleSignIn} />
        <TweaksUI t={t} setTweak={setTweak} />
      </>
    );
  }

  if (authState === 'loading') {
    return <LoadingScreen message="Opening your ledger…" />;
  }

  if (authState === 'error') {
    return <ErrorScreen message={authError || 'Something went wrong.'} onRetry={() => { setAuthState('idle'); }} />;
  }

  // ── Signed-in screens ─────────────────────────────────────────────────
  let screen, screenTitle;

  if (tab === 'home') {
    screen = <DashboardScreen state={state} onTab={handleTab}
      onOpenMode={() => setTab('modes')}
      onOpenBudget={() => { setTab('settings'); setSettingsView('budget'); }} />;
  } else if (tab === 'log') {
    screenTitle = 'The Expense Log';
    screen = <ExpenseListScreen state={state} onAdd={() => setAddOpen(true)} onDelete={handleDeleteExpense} />;
  } else if (tab === 'modes') {
    screen = <ModesScreen state={state}
      onEndMode={handleEndMode}
      onStartMode={handleStartMode} />;
  } else if (tab === 'settings') {
    if (settingsView === 'budget') {
      screenTitle = 'Budget Setup';
      screen = <BudgetScreen state={state} setBudgets={handleSetBudgets} />;
    } else if (settingsView === 'history') {
      screenTitle = 'Monthly History';
      screen = <HistoryScreen state={state} />;
    } else if (settingsView === 'modes') {
      screen = <ModesScreen state={state} onEndMode={handleEndMode} onStartMode={handleStartMode} />;
    } else {
      screenTitle = 'More';
      screen = <SettingsScreen user={user} sheetId={sheetId} onNav={setSettingsView} onSignOut={handleSignOut} />;
    }
  }

  return (
    <>
      {tab === 'home' ? (
        <StatusBar monthLabel={monthLabel} activeMode={statusMode}
          onAccount={() => { setTab('settings'); setSettingsView(null); }} syncing={syncing} />
      ) : (
        <SubHeader title={screenTitle || tab}
          onBack={settingsView ? () => setSettingsView(null) : null}
          activeMode={statusMode} />
      )}

      <div className="rule rule-strong" style={{margin:'0 18px'}} />

      <div className="scroll" style={{flex:1, paddingTop:14}}>
        {screen}
      </div>

      <TabBar tab={tab==='settings' && !settingsView ? 'settings' : tab} onTab={handleTab} />

      <AddExpenseSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleSave}
        mode={mode}
      />

      <Toast text={toast} />
      <TweaksUI t={t} setTweak={setTweak} />
    </>
  );
}

// ── Sub-header ────────────────────────────────────────────────────────────
function SubHeader({ title, onBack, activeMode }) {
  return (
    <div style={{
      padding:'14px 18px 10px',
      display:'flex', alignItems:'center', justifyContent:'space-between', gap:10,
    }}>
      <div style={{display:'flex', alignItems:'center', gap:10, minWidth:0}}>
        {onBack && (
          <button onClick={onBack} aria-label="Back"
            style={{
              background:'transparent', border:0, color:'var(--ink)',
              fontFamily:'var(--display)', fontSize:24, cursor:'pointer', padding:'0 6px 0 0',
              lineHeight:.8,
            }}
          >‹</button>
        )}
        <div style={{minWidth:0}}>
          <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.22em', color:'var(--olive)', textTransform:'uppercase'}}>
            Section
          </div>
          <h1 style={{fontFamily:'var(--display)', fontSize:22, letterSpacing:'.02em', lineHeight:1, marginTop:2,
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textTransform:'capitalize'}}>
            {title}
          </h1>
        </div>
      </div>
      {activeMode && (
        <Stamp label={activeMode.name} sub={`D${activeMode.dayN}/${activeMode.dayT}`} size="sm" rotation={-6} />
      )}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────
function Toast({ text }) {
  return (
    <div style={{
      position:'absolute', left:18, right:18, bottom:96,
      opacity: text ? 1 : 0,
      transform: text ? 'translateY(0)' : 'translateY(8px)',
      transition:'opacity .2s, transform .2s',
      pointerEvents:'none', zIndex:60,
    }}>
      {text && (
        <div style={{
          background:'var(--ink)', color:'var(--paper)',
          padding:'10px 14px', boxShadow:'3px 3px 0 0 var(--accent)',
          display:'flex', alignItems:'center', gap:10,
        }}>
          <span style={{fontFamily:'var(--mono)', fontSize:9, letterSpacing:'.18em', color:'var(--paper-2)',
            textTransform:'uppercase', borderRight:'1px solid rgba(255,255,255,.3)', paddingRight:10}}>RCPT</span>
          <span style={{fontFamily:'var(--serif)', fontSize:12, fontStyle:'italic'}}>{text}</span>
        </div>
      )}
    </div>
  );
}

function TweaksUI({ t, setTweak }) {
  return (
    <TweaksPanel title="Tweaks · Ledger">
      <TweakSection label="Paper" />
      <TweakColor
        label="Tint"
        value={t.paperTint==='warm'?'#f5f0e8':t.paperTint==='bone'?'#efeae0':t.paperTint==='cream'?'#f7eed6':'#ecebe3'}
        options={['#f5f0e8','#efeae0','#f7eed6','#ecebe3']}
        onChange={(v) => {
          const map = {'#f5f0e8':'warm','#efeae0':'bone','#f7eed6':'cream','#ecebe3':'cool'};
          setTweak('paperTint', map[v] || 'warm');
        }}
      />
      <TweakSlider label="Grain" value={t.grain} min={0} max={1.6} step={.1}
        onChange={(v) => setTweak('grain', v)} />
      <TweakRadio label="Tone" value={t.tone} options={['paper','carbon']}
        onChange={(v) => setTweak('tone', v)} />
      <TweakSection label="Accent ink" />
      <TweakColor label="Color" value={t.accent}
        options={['#8b2500','#3a4a1f','#1f3a5a','#1a1208']}
        onChange={(v) => setTweak('accent', v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
