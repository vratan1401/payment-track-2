// Payment Track 2.0 — all screen components (real data wired)

// ─── Login ─────────────────────────────────────────────────────────────────
function LoginScreen({ onSignIn }) {
  return (
    <div style={{
      position:'relative', height:'100%',
      display:'flex', flexDirection:'column', justifyContent:'space-between',
      padding:'48px 28px 36px',
    }}>
      <div>
        <div style={{
          fontFamily:'var(--mono)', fontSize:11, letterSpacing:'.4em',
          color:'var(--olive)', textTransform:'uppercase',
          textAlign:'center', marginBottom:18,
        }}>EST. 2026 · PERSONAL EDITION</div>

        <div style={{textAlign:'center'}}>
          <div style={{fontFamily:'var(--display)', fontSize:14, letterSpacing:'.3em', textTransform:'uppercase', color:'var(--ink-soft)'}}>The Daily</div>
          <h1 style={{fontFamily:'var(--display)', fontSize:64, lineHeight:.95, marginTop:4, letterSpacing:'.02em'}}>
            Payment<br/>Tracker
          </h1>
          <div style={{display:'flex', alignItems:'center', gap:10, marginTop:14, justifyContent:'center'}}>
            <div className="rule" style={{flex:1, maxWidth:60}} />
            <span style={{fontFamily:'var(--display)', fontSize:18, fontStyle:'italic', color:'var(--accent)'}}>vol. II</span>
            <div className="rule" style={{flex:1, maxWidth:60}} />
          </div>
          <p style={{
            fontFamily:'var(--serif)', fontSize:13, lineHeight:1.5, marginTop:24,
            color:'var(--ink-soft)', fontStyle:'italic',
            maxWidth:280, marginInline:'auto',
          }}>
            "Your money has context.<br/>A Tuesday is not a Goa trip.<br/>This book knows the difference."
          </p>
        </div>

        <div style={{marginTop:36, display:'flex', flexDirection:'column', gap:14}}>
          {[0,1,2,3,4].map(i => <div key={i} className="rule" />)}
        </div>
      </div>

      <div>
        <button
          onClick={onSignIn}
          style={{
            width:'100%', padding:'14px 18px',
            background:'var(--paper)', color:'var(--ink)',
            border:'1.5px solid var(--ink)',
            boxShadow:'4px 4px 0 0 var(--ink)',
            fontFamily:'var(--display)', fontSize:14, letterSpacing:'.15em',
            textTransform:'uppercase', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:14,
          }}
        >
          <span style={{
            fontFamily:'var(--mono)', fontSize:13, letterSpacing:'.1em',
            border:'1px solid var(--ink)', padding:'2px 7px', lineHeight:1,
          }}>G</span>
          Sign in with Google
        </button>
        <div style={{
          fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.18em',
          color:'var(--olive)', textTransform:'uppercase',
          textAlign:'center', marginTop:18, lineHeight:1.6,
        }}>
          Your ledger is stored in your<br/>own Google Sheet · We see nothing
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────
function DashboardScreen({ state, onTab, onOpenMode, onOpenBudget }) {
  const { expenses, budgets, mode } = state;
  const spent = sum(expenses, 'amount');
  const remaining = budgets.total - spent;
  const pct = budgets.total ? spent / budgets.total : 0;
  const bucketSpent = spentByBucket(expenses);
  const modeSpent = mode ? spentByMode(expenses, mode.id) : 0;
  const modeDays = mode ? Math.max(1, daysAgo(mode.start) + 1) : 0;
  const modeTotal = mode ? Math.max(1, daysAgo(mode.end, mode.start) + 1) : 0;

  return (
    <>
      <div style={{padding:'4px 18px 20px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:6}}>
          <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.22em', color:'var(--olive)', textTransform:'uppercase'}}>
            Spent so far
          </div>
          <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.18em', color:'var(--olive)'}}>
            of {inr(budgets.total)}
          </div>
        </div>
        <BigAmount amount={spent} size={64} accent={spent > budgets.total} />
        <div style={{marginTop:14}}>
          <LedgerBar value={spent} max={budgets.total} height={10} />
          <div style={{
            display:'flex', justifyContent:'space-between', marginTop:8,
            fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.1em',
            color:'var(--olive)', textTransform:'uppercase',
          }}>
            <span>{Math.round(pct * 100)}% of month</span>
            <span style={{color: remaining < 5000 ? 'var(--accent)' : 'var(--olive)'}}>
              {remaining >= 0 ? `${inr(remaining)} left` : `${inr(-remaining)} over`}
            </span>
          </div>
        </div>
      </div>

      <Divider ornament />

      {mode && (
        <div style={{padding:'4px 18px 16px'}}>
          <div onClick={onOpenMode} style={{
            position:'relative', border:'1px dashed var(--accent)',
            padding:'14px 16px', cursor:'pointer',
            background:'rgba(139,37,0,.03)',
          }}>
            <div style={{position:'absolute', top:-10, right:14}}>
              <Stamp label="ACTIVE" size="sm" rotation={6} />
            </div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
              <div>
                <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.22em', color:'var(--accent-soft)', textTransform:'uppercase'}}>
                  Current Mode
                </div>
                <div style={{fontFamily:'var(--display)', fontSize:22, color:'var(--accent)', marginTop:2, letterSpacing:'.05em'}}>
                  {mode.name}
                </div>
                <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.08em', color:'var(--olive)', marginTop:2, textTransform:'uppercase'}}>
                  Day {modeDays} of {modeTotal}{mode.note ? ` · ${mode.note}` : ''}
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div className="num" style={{fontSize:22, color:'var(--accent)'}}>
                  ₹{modeSpent.toLocaleString('en-IN')}
                </div>
                <div style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--olive)', letterSpacing:'.1em', textTransform:'uppercase'}}>
                  of {inr(mode.budget)}
                </div>
              </div>
            </div>
            <div style={{marginTop:10}}>
              <LedgerBar value={modeSpent} max={mode.budget} height={6} accent="var(--accent)" />
            </div>
          </div>
        </div>
      )}

      <SectionLabel right={
        <button onClick={onOpenBudget} style={{background:'transparent', border:0, font:'inherit',
          fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.18em', color:'var(--ink)',
          cursor:'pointer', textTransform:'uppercase', textDecoration:'underline'}}>edit</button>
      }>By Bucket</SectionLabel>

      <div style={{padding:'10px 18px 14px', display:'flex', flexDirection:'column', gap:14}}>
        {BUCKETS.map(b => {
          const used = bucketSpent[b.id];
          const cap = budgets[b.id];
          const over = used > cap;
          return (
            <div key={b.id}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:5}}>
                <div style={{display:'flex', alignItems:'baseline', gap:8}}>
                  <span style={{fontFamily:'var(--display)', fontSize:16}}>{b.label}</span>
                  <span style={{fontFamily:'var(--mono)', fontSize:9, letterSpacing:'.15em', color:'var(--olive)', textTransform:'uppercase'}}>
                    {b.pct}%
                  </span>
                </div>
                <div className="num" style={{fontSize:13, color: over ? 'var(--accent)' : 'var(--ink)'}}>
                  ₹{used.toLocaleString('en-IN')} <span style={{color:'var(--olive)'}}>/ ₹{cap.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <LedgerBar value={used} max={cap} height={6} />
            </div>
          );
        })}
      </div>

      <Divider ornament />

      <SectionLabel right={
        <button onClick={() => onTab('log')} style={{background:'transparent', border:0, font:'inherit',
          fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.18em', color:'var(--ink)',
          cursor:'pointer', textTransform:'uppercase', textDecoration:'underline'}}>full log →</button>
      }>Last Entries</SectionLabel>

      <div style={{paddingTop:6, paddingBottom:24}}>
        {expenses.length === 0 ? (
          <div style={{padding:'24px 18px', textAlign:'center', fontFamily:'var(--serif)', fontStyle:'italic', color:'var(--olive)'}}>
            — no entries this month —
          </div>
        ) : expenses.slice(0, 4).map(e => <LedgerRow key={e.id} exp={e} onClick={() => onTab('log')} />)}
      </div>
    </>
  );
}

// ─── Expense List ───────────────────────────────────────────────────────────
function ExpenseListScreen({ state, onAdd, onDelete }) {
  const [filter, setFilter] = React.useState({ bucket:'all', mode:'all' });

  const filtered = state.expenses.filter(e => {
    const cat = CATEGORIES.find(c => c.id === e.cat);
    if (filter.bucket !== 'all' && cat?.bucket !== filter.bucket) return false;
    if (filter.mode === 'tagged' && !e.modeId) return false;
    if (filter.mode === 'untagged' && e.modeId) return false;
    return true;
  });

  const total = sum(filtered, 'amount');
  const daysInMonth = new Date().getDate();

  const grouped = filtered.reduce((acc, e) => {
    (acc[e.date] = acc[e.date] || []).push(e);
    return acc;
  }, {});

  return (
    <>
      <div style={{padding:'4px 18px 12px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
          <div>
            <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.22em', color:'var(--olive)', textTransform:'uppercase'}}>
              {filtered.length} entries · subtotal
            </div>
            <BigAmount amount={total} size={40} />
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.18em', color:'var(--olive)', textTransform:'uppercase'}}>per day</div>
            <div className="num" style={{fontSize:18}}>₹{daysInMonth > 0 ? Math.round(total / daysInMonth).toLocaleString('en-IN') : '—'}</div>
          </div>
        </div>
      </div>

      <div style={{padding:'4px 18px 12px', display:'flex', gap:6, flexWrap:'wrap'}}>
        {[
          { id:'all', label:'All' },
          { id:'needs', label:'Needs' },
          { id:'lifestyle', label:'Lifestyle' },
          { id:'savings', label:'Savings' },
        ].map(c => {
          const active = filter.bucket === c.id;
          return (
            <button key={c.id} onClick={() => setFilter(f => ({...f, bucket:c.id}))}
              style={{
                fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.18em',
                padding:'5px 9px',
                border:`1px solid ${active ? 'var(--ink)' : 'rgba(26,18,8,.3)'}`,
                background: active ? 'var(--ink)' : 'transparent',
                color: active ? 'var(--paper)' : 'var(--ink)',
                textTransform:'uppercase', cursor:'pointer',
              }}
            >{c.label}</button>
          );
        })}
        <div style={{width:1, background:'rgba(26,18,8,.2)', margin:'0 4px'}} />
        {[
          { id:'all', label:'Any' },
          { id:'tagged', label:'In a Mode' },
          { id:'untagged', label:'Untagged' },
        ].map(c => {
          const active = filter.mode === c.id;
          return (
            <button key={c.id} onClick={() => setFilter(f => ({...f, mode:c.id}))}
              style={{
                fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.18em',
                padding:'5px 9px',
                border:`1px solid ${active ? 'var(--accent)' : 'rgba(26,18,8,.3)'}`,
                background: active ? 'var(--accent)' : 'transparent',
                color: active ? 'var(--paper)' : 'var(--ink)',
                textTransform:'uppercase', cursor:'pointer',
              }}
            >{c.label}</button>
          );
        })}
      </div>

      <ColHead left="Date" mid="Payee · Category" right="Amount" />
      <div className="rule rule-strong" style={{margin:'0 18px'}} />

      <div style={{paddingBottom:24}}>
        {Object.keys(grouped).sort((a,b) => b.localeCompare(a)).map(date => {
          const dayExp = grouped[date];
          const dayTotal = sum(dayExp, 'amount');
          return (
            <div key={date}>
              <div style={{
                display:'flex', justifyContent:'space-between',
                padding:'12px 18px 4px',
                fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.2em',
                color:'var(--olive)', textTransform:'uppercase',
              }}>
                <span>{dateBadge(date)}</span>
                <span>₹{dayTotal.toLocaleString('en-IN')}</span>
              </div>
              {dayExp.map(e => (
                <LedgerRow key={e.id} exp={e} onDelete={onDelete ? () => onDelete(e.id) : null}
                  modesRef={state.modes} onClick={() => {}} />
              ))}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{
            padding:'40px 18px', textAlign:'center',
            fontFamily:'var(--serif)', fontStyle:'italic', color:'var(--olive)',
          }}>
            — no entries match these filters —
          </div>
        )}
      </div>
    </>
  );
}

// ─── Modes ──────────────────────────────────────────────────────────────────
function ModesScreen({ state, onEndMode, onStartMode }) {
  const [showForm, setShowForm] = React.useState(false);
  const [newMode, setNewMode] = React.useState({ name:'', end:'', budget:'', note:'' });

  const active = state.mode;
  const past = (state.modes || []).filter(m => m.status === 'ended');
  const activeSpent = active ? spentByMode(state.expenses, active.id) : 0;
  const activeDays = active ? daysAgo(active.start) + 1 : 0;

  const handleCreate = () => {
    if (!newMode.name.trim()) return;
    onStartMode({
      name: newMode.name.trim(),
      end: newMode.end || todayISO(),
      budget: Number(newMode.budget) || 0,
      note: newMode.note.trim(),
    });
    setNewMode({ name:'', end:'', budget:'', note:'' });
    setShowForm(false);
  };

  return (
    <>
      <div style={{padding:'4px 18px 16px'}}>
        <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.22em', color:'var(--olive)', textTransform:'uppercase'}}>
          Context modes
        </div>
        <h2 style={{fontSize:28, marginTop:4, lineHeight:1, fontFamily:'var(--display)'}}>The Book of<br/>Occasions</h2>
        <p style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:13, color:'var(--ink-soft)', marginTop:8, lineHeight:1.4}}>
          Trips, weeks, weddings — anything that bends your spending.
          Tag expenses to a mode so the month isn't blamed for the season.
        </p>
      </div>

      <SectionLabel>Stamped · In Effect</SectionLabel>
      {active ? (
        <div style={{padding:'12px 18px 18px'}}>
          <div style={{
            border:'1.5px solid var(--accent)', padding:'18px 18px 14px',
            background:'rgba(139,37,0,.04)', position:'relative',
          }}>
            <div style={{position:'absolute', top:-14, right:18}}>
              <Stamp label={active.name} size="md" rotation={-4} />
            </div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:14}}>
              <div>
                <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.18em', color:'var(--olive)', textTransform:'uppercase'}}>
                  {fmtDate(active.start)} → {fmtDate(active.end)}
                </div>
                <div style={{fontFamily:'var(--serif)', fontSize:13, marginTop:6, fontStyle:'italic'}}>
                  {active.note || 'No description'}
                </div>
              </div>
              <div className="num" style={{fontSize:26, color:'var(--accent)', textAlign:'right'}}>
                ₹{activeSpent.toLocaleString('en-IN')}
                <div style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--olive)', letterSpacing:'.12em'}}>
                  OF ₹{(active.budget || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
            {active.budget > 0 && (
              <div style={{marginTop:14}}>
                <LedgerBar value={activeSpent} max={active.budget} height={8} accent="var(--accent)" />
              </div>
            )}
            <div style={{display:'flex', justifyContent:'space-between', marginTop:8, fontFamily:'var(--mono)', fontSize:9, letterSpacing:'.15em', color:'var(--olive)', textTransform:'uppercase'}}>
              <span>Day {activeDays} · {state.expenses.filter(e => e.modeId === active.id).length} entries</span>
              {active.budget > 0 && <span>{inr(active.budget - activeSpent)} left</span>}
            </div>
            <div style={{marginTop:16}}>
              <InkButton kind="primary" full onClick={onEndMode}>End Mode</InkButton>
            </div>
          </div>
        </div>
      ) : (
        <div style={{padding:'12px 18px 18px'}}>
          {!showForm ? (
            <>
              <div style={{
                border:'1px dashed var(--ink)', padding:'24px 18px',
                textAlign:'center', fontFamily:'var(--serif)', fontStyle:'italic',
                color:'var(--ink-soft)',
              }}>
                No mode in effect.<br/>
                <span style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.18em', color:'var(--olive)', fontStyle:'normal', textTransform:'uppercase', display:'block', marginTop:10}}>
                  every rupee charged to "regular life"
                </span>
              </div>
              <div style={{marginTop:14, display:'flex', justifyContent:'center'}}>
                <InkButton onClick={() => setShowForm(true)}>Begin a new mode</InkButton>
              </div>
            </>
          ) : (
            <div style={{border:'1.5px solid var(--ink)', padding:'18px'}}>
              <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.22em', color:'var(--olive)', textTransform:'uppercase', marginBottom:16}}>
                New Mode
              </div>
              {[
                { key:'name', label:'Name', placeholder:'GOA TRIP', type:'text' },
                { key:'end',  label:'Ends on', placeholder: todayISO(), type:'date' },
                { key:'budget', label:'Budget (₹)', placeholder:'15000', type:'number' },
                { key:'note',   label:'Note', placeholder:'4 days · 3 friends', type:'text' },
              ].map(f => (
                <div key={f.key} style={{marginBottom:14}}>
                  <label style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.2em', color:'var(--olive)', textTransform:'uppercase'}}>
                    {f.label}
                  </label>
                  <input
                    type={f.type} value={newMode[f.key]}
                    onChange={e => setNewMode(n => ({...n, [f.key]: e.target.value}))}
                    placeholder={f.placeholder}
                    style={{
                      width:'100%', marginTop:4, background:'transparent', border:0,
                      borderBottom:'1.5px solid var(--ink)',
                      fontFamily: f.key === 'name' ? 'var(--display)' : 'var(--serif)',
                      fontSize: f.key === 'name' ? 18 : 15,
                      padding:'4px 0', outline:0, color:'var(--ink)',
                    }}
                  />
                </div>
              ))}
              <div style={{display:'flex', gap:8, marginTop:4}}>
                <InkButton kind="primary" full onClick={handleCreate} disabled={!newMode.name.trim()}>
                  Stamp It
                </InkButton>
                <InkButton kind="ghost" full onClick={() => setShowForm(false)}>Cancel</InkButton>
              </div>
            </div>
          )}
        </div>
      )}

      {past.length > 0 && (
        <>
          <Divider ornament />
          <SectionLabel right={<span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--olive)'}}>{past.length} on file</span>}>
            Past Modes
          </SectionLabel>
          <div style={{padding:'10px 18px 28px', display:'flex', flexDirection:'column', gap:12}}>
            {past.map(m => {
              const mSpent = m.spent || spentByMode(state.allExpenses || state.expenses, m.id);
              const over = m.budget > 0 && mSpent > m.budget;
              return (
                <div key={m.id} style={{
                  border:'1px solid rgba(26,18,8,.4)', padding:'12px 14px',
                  position:'relative',
                  background: over ? 'rgba(139,37,0,.03)' : 'transparent',
                }}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                    <div>
                      <div style={{display:'flex', gap:8, alignItems:'baseline'}}>
                        <span style={{fontFamily:'var(--display)', fontSize:17, letterSpacing:'.04em'}}>{m.name}</span>
                        {over && <Stamp label="OVER" size="sm" rotation={4} style={{padding:'2px 6px'}} />}
                      </div>
                      <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.12em', color:'var(--olive)', marginTop:2, textTransform:'uppercase'}}>
                        {fmtDate(m.start)} – {fmtDate(m.end)}{m.note ? ` · ${m.note}` : ''}
                      </div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div className="num" style={{fontSize:16, color: over ? 'var(--accent)' : 'var(--ink)'}}>
                        ₹{mSpent.toLocaleString('en-IN')}
                      </div>
                      {m.budget > 0 && (
                        <div style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--olive)', letterSpacing:'.12em'}}>
                          of ₹{m.budget.toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>
                  </div>
                  {m.budget > 0 && (
                    <div style={{marginTop:10}}>
                      <LedgerBar value={mSpent} max={m.budget} height={4} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

// ─── Budget Setup ───────────────────────────────────────────────────────────
function BudgetScreen({ state, setBudgets }) {
  const { budgets } = state;
  const sum503020 = (total) => ({
    total,
    needs: Math.round(total * .5),
    lifestyle: Math.round(total * .3),
    savings: Math.round(total * .2),
  });
  const applyTemplate = () => setBudgets(sum503020(budgets.total));
  const set = (key, val) => {
    const v = Math.max(0, Number(val) || 0);
    const next = { ...budgets, [key]: v };
    next.total = next.needs + next.lifestyle + next.savings;
    setBudgets(next);
  };
  const setTotal = (val) => {
    const v = Math.max(1000, Number(val) || 0);
    setBudgets(sum503020(v));
  };

  return (
    <>
      <div style={{padding:'4px 18px 16px'}}>
        <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.22em', color:'var(--olive)', textTransform:'uppercase'}}>Budget Setup</div>
        <h2 style={{fontSize:28, marginTop:4, lineHeight:1, fontFamily:'var(--display)'}}>The Monthly<br/>Allowance</h2>
        <p style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:13, color:'var(--ink-soft)', marginTop:8, lineHeight:1.4}}>
          Set a ceiling for the month. Divide across three buckets, or apply the 50–30–20 template.
        </p>
      </div>

      <div style={{padding:'0 18px 16px'}}>
        <div style={{border:'1.5px solid var(--ink)', padding:'16px 18px', background:'rgba(26,18,8,.02)'}}>
          <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.22em', color:'var(--olive)', textTransform:'uppercase'}}>Monthly cap</div>
          <div style={{display:'flex', alignItems:'baseline', gap:6, marginTop:4}}>
            <span style={{fontFamily:'var(--mono)', fontSize:24, opacity:.6}}>₹</span>
            <input
              type="text" inputMode="numeric"
              value={budgets.total.toLocaleString('en-IN')}
              onChange={e => setTotal(e.target.value.replace(/[^\d]/g, ''))}
              style={{
                width:'100%', background:'transparent', border:0, outline:0,
                fontFamily:'var(--mono)', fontSize:42, letterSpacing:'-.01em',
                padding:0, color:'var(--ink)',
              }}
            />
          </div>
          <div className="rule rule-strong" style={{marginTop:8}} />
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10}}>
            <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.15em', color:'var(--olive)', textTransform:'uppercase'}}>
              {budgets.needs + budgets.lifestyle + budgets.savings === budgets.total ? 'balanced' : 'manual'}
            </div>
            <button onClick={applyTemplate} style={{
              background:'transparent', border:'1px solid var(--ink)',
              padding:'6px 10px', fontFamily:'var(--mono)', fontSize:10,
              letterSpacing:'.15em', textTransform:'uppercase', cursor:'pointer', color:'var(--ink)',
            }}>50/30/20</button>
          </div>
        </div>
      </div>

      <SectionLabel>Buckets</SectionLabel>
      <div style={{padding:'12px 18px 28px', display:'flex', flexDirection:'column', gap:14}}>
        {BUCKETS.map(b => {
          const v = budgets[b.id];
          const pct = budgets.total ? Math.round((v / budgets.total) * 100) : 0;
          return (
            <div key={b.id} style={{border:'1px solid rgba(26,18,8,.35)', padding:'12px 14px'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                <div>
                  <div style={{fontFamily:'var(--display)', fontSize:16}}>{b.label}</div>
                  <div style={{fontFamily:'var(--mono)', fontSize:9, letterSpacing:'.18em', color:'var(--olive)', textTransform:'uppercase'}}>
                    {pct}% of monthly cap
                  </div>
                </div>
                <div style={{display:'flex', alignItems:'baseline', gap:4}}>
                  <span style={{fontFamily:'var(--mono)', fontSize:14, color:'var(--olive)'}}>₹</span>
                  <input
                    type="text" inputMode="numeric"
                    value={v.toLocaleString('en-IN')}
                    onChange={e => set(b.id, e.target.value.replace(/[^\d]/g, ''))}
                    style={{
                      width:96, textAlign:'right', background:'transparent',
                      border:0, borderBottom:'1px solid var(--ink)',
                      fontFamily:'var(--mono)', fontSize:18, color:'var(--ink)',
                      padding:'2px 0', outline:0,
                    }}
                  />
                </div>
              </div>
              <div style={{marginTop:10}}>
                <LedgerBar value={pct} max={100} height={4} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── Monthly History ─────────────────────────────────────────────────────────
function HistoryScreen({ state }) {
  const curSpent = sum(state.expenses, 'amount');
  const byMonth = groupByMonth(state.allExpenses || state.expenses);
  const curPrefix = currentMonthPrefix();

  const months = Object.keys(byMonth)
    .sort((a, b) => b.localeCompare(a))
    .map(k => ({
      id: k,
      label: (() => {
        const [y, m] = k.split('-');
        const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        return `${months[parseInt(m)-1]} ${y}`;
      })(),
      spent: sum(byMonth[k], 'amount'),
      budget: state.budgets.total,
      current: k === curPrefix,
    }));

  const avg = months.length > 1
    ? Math.round(sum(months.filter(m => !m.current).map(m => m.spent)) / (months.length - 1))
    : curSpent;

  return (
    <>
      <div style={{padding:'4px 18px 12px'}}>
        <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.22em', color:'var(--olive)', textTransform:'uppercase'}}>The Archive</div>
        <h2 style={{fontSize:28, marginTop:4, lineHeight:1, fontFamily:'var(--display)'}}>Monthly<br/>History</h2>
      </div>

      {months.length > 1 && (
        <div style={{padding:'4px 18px 18px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
          <div style={{border:'1px solid var(--ink)', padding:'10px 12px'}}>
            <div style={{fontFamily:'var(--mono)', fontSize:9, letterSpacing:'.18em', color:'var(--olive)', textTransform:'uppercase'}}>avg/month</div>
            <div className="num" style={{fontSize:20}}>₹{avg.toLocaleString('en-IN')}</div>
          </div>
          <div style={{border:'1px solid var(--ink)', padding:'10px 12px'}}>
            <div style={{fontFamily:'var(--mono)', fontSize:9, letterSpacing:'.18em', color:'var(--olive)', textTransform:'uppercase'}}>Over-budget</div>
            <div className="num" style={{fontSize:20, color:'var(--accent)'}}>
              {months.filter(m => m.spent > m.budget).length} of {months.length}
            </div>
          </div>
        </div>
      )}

      <ColHead left="Month" mid="Status" right="Spent / Budget" />
      <div className="rule rule-strong" style={{margin:'0 18px'}} />

      <div style={{padding:'0 0 28px'}}>
        {months.length === 0 ? (
          <div style={{padding:'40px 18px', textAlign:'center', fontFamily:'var(--serif)', fontStyle:'italic', color:'var(--olive)'}}>
            — no history yet —
          </div>
        ) : months.map(m => {
          const over = m.spent > m.budget;
          const pct = m.budget ? m.spent / m.budget : 0;
          return (
            <div key={m.id} style={{
              padding:'14px 18px',
              borderBottom:'1px dotted rgba(26,18,8,.18)',
              background: m.current ? 'rgba(139,37,0,.03)' : 'transparent',
            }}>
              <div style={{display:'grid', gridTemplateColumns:'46px 1fr auto', gap:10}}>
                <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--olive)', letterSpacing:'.08em', textTransform:'uppercase'}}>
                  <div style={{fontFamily:'var(--display)', fontSize:20, color:'var(--ink)', lineHeight:1}}>
                    {m.label.split(' ')[0].slice(0,3)}
                  </div>
                  <div style={{marginTop:2}}>{m.label.split(' ')[1]}</div>
                </div>
                <div>
                  <div style={{display:'flex', alignItems:'baseline', gap:8, flexWrap:'wrap'}}>
                    {m.current && <Stamp label="THIS MO" size="sm" rotation={-3} style={{padding:'2px 6px'}} />}
                    {over && !m.current && <Stamp label="OVER" size="sm" rotation={3} style={{padding:'2px 6px'}} />}
                  </div>
                  <div style={{marginTop:8, maxWidth:200}}>
                    <LedgerBar value={m.spent} max={m.budget} height={4} />
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div className="num" style={{fontSize:15, color: over ? 'var(--accent)' : 'var(--ink)'}}>
                    ₹{m.spent.toLocaleString('en-IN')}
                  </div>
                  <div style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--olive)', letterSpacing:'.12em'}}>
                    of ₹{(m.budget/1000).toFixed(0)}K · {Math.round(pct*100)}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── Settings ────────────────────────────────────────────────────────────────
function SettingsScreen({ user, sheetId, onNav, onSignOut }) {
  const u = user || { name:'—', email:'—', initials:'?' };
  const items = [
    { id:'budget',  label:'Budget Setup',   sub:'Monthly cap, buckets, categories' },
    { id:'history', label:'Monthly History', sub:'Past months & rollups' },
    { id:'modes',   label:'Modes',           sub:'Trips, weeks, occasions' },
  ];
  return (
    <>
      <div style={{padding:'8px 18px 16px'}}>
        <div style={{display:'flex', alignItems:'center', gap:14, padding:'14px 0', borderBottom:'1px solid rgba(26,18,8,.3)'}}>
          <div style={{
            width:54, height:54, border:'1.5px solid var(--ink)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'var(--display)', fontSize:20, letterSpacing:'.05em',
          }}>{u.initials}</div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontFamily:'var(--display)', fontSize:18, letterSpacing:'.02em'}}>{u.name}</div>
            <div style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--olive)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{u.email}</div>
          </div>
        </div>
      </div>

      <SectionLabel>The Books</SectionLabel>
      <div style={{padding:'8px 18px 0'}}>
        {items.map((it, i) => (
          <button key={it.id} onClick={() => onNav(it.id)} style={{
            display:'block', width:'100%', textAlign:'left',
            background:'transparent', border:0, padding:'14px 0',
            borderBottom: i < items.length - 1 ? '1px dotted rgba(26,18,8,.22)' : 'none',
            cursor:'pointer',
          }}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <div style={{fontFamily:'var(--display)', fontSize:17, letterSpacing:'.03em'}}>{it.label}</div>
                <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--olive)', letterSpacing:'.1em', marginTop:2, textTransform:'uppercase'}}>{it.sub}</div>
              </div>
              <span style={{fontFamily:'var(--display)', fontSize:18, color:'var(--olive)'}}>→</span>
            </div>
          </button>
        ))}
      </div>

      <Divider ornament />

      <SectionLabel>Connection</SectionLabel>
      <div style={{padding:'10px 18px 0'}}>
        <div style={{
          border:'1px solid var(--ink)', padding:'12px 14px',
          display:'flex', justifyContent:'space-between', alignItems:'center',
        }}>
          <div>
            <div style={{fontFamily:'var(--display)', fontSize:14}}>Google Sheet</div>
            <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--olive)', letterSpacing:'.08em', marginTop:2}}>
              {sheetId ? `${sheetId.slice(0,12)}… · 4 tabs` : 'Not connected'}
            </div>
          </div>
          <Stamp label={sheetId ? 'LINKED' : 'UNLINKED'} size="sm" rotation={3} muted={!sheetId} />
        </div>
        {sheetId && (
          <a
            href={`https://docs.google.com/spreadsheets/d/${sheetId}`}
            target="_blank" rel="noopener"
            style={{
              display:'block', marginTop:8, textAlign:'center',
              fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.15em',
              color:'var(--olive)', textDecoration:'underline', textTransform:'uppercase',
            }}
          >Open raw sheet →</a>
        )}
      </div>

      <div style={{padding:'14px 18px 28px'}}>
        <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--olive)', letterSpacing:'.15em', textTransform:'uppercase', textAlign:'center', marginTop:14}}>
          v2.0.1 · the daily payment tracker
        </div>
        <button onClick={onSignOut} style={{
          width:'100%', marginTop:14, padding:'10px',
          background:'transparent', border:'1px solid var(--accent)', color:'var(--accent)',
          fontFamily:'var(--display)', fontSize:12, letterSpacing:'.15em', textTransform:'uppercase',
          cursor:'pointer',
        }}>Sign out</button>
      </div>
    </>
  );
}

// ─── Add Expense Sheet ────────────────────────────────────────────────────────
function AddExpenseSheet({ open, onClose, onSave, mode }) {
  const [amount, setAmount] = React.useState('');
  const [catId, setCatId]   = React.useState('food');
  const [sub, setSub]       = React.useState('Cafe');
  const [date, setDate]     = React.useState(todayISO());
  const [note, setNote]     = React.useState('');
  const [payee, setPayee]   = React.useState('');
  const [tagMode, setTagMode] = React.useState(true);

  React.useEffect(() => {
    if (open) {
      setAmount(''); setCatId('food'); setSub('Cafe');
      setDate(todayISO()); setNote(''); setPayee('');
      setTagMode(!!mode);
    }
  }, [open, mode]);

  const cat = CATEGORIES.find(c => c.id === catId);
  const isValid = Number(amount) > 0 && payee.trim().length > 0;

  const handleKey = (k) => {
    if (k === 'back') setAmount(a => a.slice(0, -1));
    else if (k === '.') { if (!amount.includes('.')) setAmount(a => a + '.'); }
    else setAmount(a => (a === '0' ? k : a + k));
  };

  const save = () => {
    if (!isValid) return;
    onSave({
      id: 'e-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      date,
      amount: Math.round(Number(amount)),
      payee: payee.trim(),
      cat: catId,
      sub,
      modeId: (tagMode && mode) ? mode.id : null,
      note: note.trim(),
    });
  };

  return (
    <Sheet open={open} onClose={onClose} title="New Entry · Today">
      <div className="scroll" style={{flex:1, padding:'14px 18px 18px'}}>

        <div style={{border:'1.5px solid var(--ink)', padding:'14px 16px 12px', background:'rgba(255,255,255,.3)'}}>
          <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.22em', color:'var(--olive)', textTransform:'uppercase'}}>Amount</div>
          <div style={{display:'flex', alignItems:'baseline', gap:6, marginTop:2}}>
            <span style={{fontFamily:'var(--mono)', fontSize:28, opacity:.55}}>₹</span>
            <div className="num" style={{fontSize:46, lineHeight:1, color:amount ? 'var(--ink)' : 'rgba(26,18,8,.25)'}}>
              {amount || '0'}
            </div>
            <span style={{display:'inline-block', width:2, height:38, background:'var(--accent)', marginLeft:2, animation:'blink 1s steps(2) infinite'}} />
          </div>
        </div>

        <div style={{marginTop:10, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:6}}>
          {['1','2','3','4','5','6','7','8','9','.','0','back'].map(k => (
            <button key={k} onClick={() => handleKey(k)}
              style={{
                padding:'12px 0', background:'var(--paper-2)',
                border:'1px solid var(--ink)',
                fontFamily:'var(--mono)', fontSize:20,
                cursor:'pointer', boxShadow:'2px 2px 0 0 var(--ink)',
                color: k === 'back' ? 'var(--accent)' : 'var(--ink)',
              }}
              onMouseDown={e => e.currentTarget.style.transform='translate(1px,1px)'}
              onMouseUp={e => e.currentTarget.style.transform='translate(0,0)'}
              onMouseLeave={e => e.currentTarget.style.transform='translate(0,0)'}
            >{k === 'back' ? '⌫' : k}</button>
          ))}
        </div>

        <div style={{marginTop:18}}>
          <label style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.22em', color:'var(--olive)', textTransform:'uppercase'}}>Payee</label>
          <input value={payee} onChange={e => setPayee(e.target.value)}
            placeholder="e.g. Cafe Bhonsle"
            style={{
              width:'100%', marginTop:6, background:'transparent', border:0,
              borderBottom:'1.5px solid var(--ink)',
              fontFamily:'var(--serif)', fontSize:18,
              padding:'4px 0', outline:0,
            }}
          />
        </div>

        <div style={{marginTop:18}}>
          <label style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.22em', color:'var(--olive)', textTransform:'uppercase'}}>Category</label>
          <div style={{display:'flex', flexWrap:'wrap', gap:6, marginTop:8}}>
            {CATEGORIES.map(c => {
              const active = c.id === catId;
              return (
                <button key={c.id} onClick={() => { setCatId(c.id); setSub(c.subs[0]); }}
                  style={{
                    fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.15em',
                    padding:'5px 8px', textTransform:'uppercase',
                    border:`1px solid ${active ? 'var(--ink)' : 'rgba(26,18,8,.3)'}`,
                    background: active ? 'var(--ink)' : 'transparent',
                    color: active ? 'var(--paper)' : 'var(--ink)',
                    cursor:'pointer',
                  }}
                >{c.label}</button>
              );
            })}
          </div>
          <div style={{display:'flex', flexWrap:'wrap', gap:6, marginTop:8}}>
            {(cat?.subs || []).map(s => {
              const active = s === sub;
              return (
                <button key={s} onClick={() => setSub(s)}
                  style={{
                    fontFamily:'var(--serif)', fontSize:12, fontStyle: active ? 'normal' : 'italic',
                    padding:'3px 8px',
                    border:`1px dashed ${active ? 'var(--accent)' : 'rgba(26,18,8,.3)'}`,
                    background: active ? 'rgba(139,37,0,.06)' : 'transparent',
                    color: active ? 'var(--accent)' : 'var(--ink)',
                    cursor:'pointer',
                  }}
                >{s}</button>
              );
            })}
          </div>
        </div>

        <div style={{marginTop:18}}>
          <label style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.22em', color:'var(--olive)', textTransform:'uppercase'}}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{
              width:'100%', marginTop:6, background:'transparent', border:0,
              borderBottom:'1px solid rgba(26,18,8,.4)',
              fontFamily:'var(--mono)', fontSize:14, padding:'4px 0', outline:0, color:'var(--ink)',
            }}
          />
        </div>

        {mode && (
          <div style={{
            marginTop:18, border:'1px dashed var(--accent)',
            padding:'10px 12px',
            display:'flex', alignItems:'center', justifyContent:'space-between', gap:10,
          }}>
            <div>
              <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.18em', color:'var(--accent-soft)', textTransform:'uppercase'}}>Auto-tag</div>
              <div style={{display:'flex', alignItems:'center', gap:8, marginTop:4}}>
                <Stamp label={mode.name} size="sm" rotation={-3} style={{padding:'2px 6px'}} />
                <span style={{fontFamily:'var(--serif)', fontSize:13, fontStyle:'italic'}}>tag this to the active mode</span>
              </div>
            </div>
            <button onClick={() => setTagMode(t => !t)} style={{
              width:42, height:24, border:'1px solid var(--ink)',
              background: tagMode ? 'var(--accent)' : 'transparent',
              position:'relative', cursor:'pointer',
            }}>
              <span style={{
                position:'absolute', top:2, bottom:2,
                left: tagMode ? 20 : 2, width:18,
                background: tagMode ? 'var(--paper)' : 'var(--ink)',
                transition:'left .15s',
              }} />
            </button>
          </div>
        )}

        <div style={{marginTop:18}}>
          <label style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.22em', color:'var(--olive)', textTransform:'uppercase'}}>
            Note <span style={{opacity:.5}}>· optional</span>
          </label>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="—"
            style={{
              width:'100%', marginTop:6, background:'transparent', border:0,
              borderBottom:'1px dashed var(--ink)',
              fontFamily:'var(--serif)', fontSize:14, fontStyle:'italic',
              padding:'4px 0', outline:0,
            }}
          />
        </div>
        <div style={{height:16}} />
      </div>

      <div style={{borderTop:'1.5px solid var(--ink)', padding:'12px 18px 18px', background:'var(--paper)'}}>
        <InkButton full onClick={save} disabled={!isValid}>
          Record · {amount ? `₹${Number(amount).toLocaleString('en-IN')}` : '₹0'}
        </InkButton>
      </div>

      <style>{`@keyframes blink { 0%,50%{opacity:1} 50.01%,100%{opacity:0} }`}</style>
    </Sheet>
  );
}

Object.assign(window, {
  LoginScreen, DashboardScreen, ExpenseListScreen,
  ModesScreen, BudgetScreen, HistoryScreen,
  SettingsScreen, AddExpenseSheet,
});
