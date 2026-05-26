// Payment Track 2.0 — shared visual primitives.
// Stamp, rules, header, tab bar, progress bar, ledger row, sketched borders, etc.

// ── Sketchy rounded-rect / box border SVG ──────────────────────────────────
// Hand-drawn feel: same-shape twice with slight offsets.
function SketchBox({ children, style={}, padding='14px 16px', stroke='var(--ink)', strokeWidth=1.2, dashed=false, fill='transparent' }) {
  return (
    <div style={{position:'relative', padding, ...style}}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none'}}
        aria-hidden="true"
      >
        <path
          d="M 1.2 2.5 C 25 1.4, 50 2.2, 98.7 1.3 C 98.5 30, 99.2 60, 98.6 97.6 C 70 98.8, 30 98.1, 1.4 98.7 C 1.7 70, 1.1 40, 1.2 2.5 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={dashed?'3 3':'none'}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div style={{position:'relative'}}>{children}</div>
    </div>
  );
}

// ── Red rubber stamp ───────────────────────────────────────────────────────
// Used for active modes. Rotated, slightly ink-bled, double bordered.
function Stamp({ label, sub, rotation=-4, size='md', muted=false, style={} }) {
  const dims = {
    sm: { fs: 11, ps: 8, pad: '4px 8px', sub: 8 },
    md: { fs: 14, ps: 9, pad: '6px 12px', sub: 9 },
    lg: { fs: 18, ps: 11, pad: '8px 16px', sub: 10 },
  }[size];
  const col = muted ? 'rgba(139,37,0,.4)' : 'var(--accent)';
  return (
    <span
      style={{
        display:'inline-flex', flexDirection:'column', alignItems:'center',
        padding: dims.pad,
        border:`1.5px solid ${col}`,
        outline:`1px solid ${col}`,
        outlineOffset:'2px',
        color: col,
        fontFamily:'var(--display)',
        fontSize: dims.fs,
        letterSpacing:'.12em',
        transform:`rotate(${rotation}deg)`,
        textTransform:'uppercase',
        // ink bleed: subtle mottling
        backgroundImage:`radial-gradient(circle at 30% 40%, rgba(139,37,0,.06), transparent 50%), radial-gradient(circle at 70% 70%, rgba(139,37,0,.04), transparent 60%)`,
        filter:'contrast(1.05)',
        boxShadow:'inset 0 0 1px rgba(139,37,0,.4)',
        userSelect:'none',
        ...style,
      }}
    >
      <span style={{whiteSpace:'nowrap'}}>{label}</span>
      {sub && <span style={{fontFamily:'var(--mono)', fontSize:dims.sub, letterSpacing:'.05em', marginTop:1, opacity:.85}}>{sub}</span>}
    </span>
  );
}

// ── Status bar / page header ───────────────────────────────────────────────
// Like a notebook header — month + active mode + account dot
function StatusBar({ monthLabel, activeMode, onAccount }) {
  return (
    <div style={{
      padding:'14px 18px 8px',
      display:'flex', alignItems:'flex-start', justifyContent:'space-between',
      gap:12,
    }}>
      <div>
        <div style={{
          fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.2em',
          color:'var(--olive)', textTransform:'uppercase',
        }}>Month of</div>
        <div style={{
          fontFamily:'var(--display)', fontSize:22, lineHeight:1,
          marginTop:2,
        }}>{monthLabel}</div>
      </div>
      <div style={{display:'flex', alignItems:'center', gap:10}}>
        {activeMode && (
          <Stamp label={activeMode.name} sub={`Day ${activeMode.dayN}/${activeMode.dayT}`} size="sm" rotation={-6} />
        )}
        <button
          onClick={onAccount}
          aria-label="Account"
          style={{
            width:32, height:32, border:'1px solid var(--ink)',
            background:'transparent', color:'var(--ink)',
            fontFamily:'var(--display)', fontSize:13, letterSpacing:'.02em',
            cursor:'pointer',
          }}
        >VK</button>
      </div>
    </div>
  );
}

// ── Progress bar — ruled, with hatch fill ─────────────────────────────────
function LedgerBar({ value=0, max=100, height=8, over=false, accent }) {
  const pct = Math.max(0, Math.min(1, max ? value/max : 0));
  const overshoot = value > max;
  const color = accent || (overshoot ? 'var(--accent)' : 'var(--ink)');
  return (
    <div style={{position:'relative', height, border:'1px solid var(--ink)', background:'transparent'}}>
      <div style={{
        position:'absolute', inset:0, width: `${pct*100}%`,
        background: color,
        backgroundImage: overshoot
          ? `repeating-linear-gradient(45deg, var(--accent) 0 4px, var(--accent-soft) 4px 6px)`
          : `repeating-linear-gradient(45deg, ${color} 0 4px, rgba(0,0,0,.0) 4px 5px, ${color} 5px 9px)`,
      }} />
      {overshoot && (
        <div style={{
          position:'absolute', left:'100%', top:-2, bottom:-2, width:2,
          background:'var(--accent)',
        }} />
      )}
    </div>
  );
}

// ── Big amount display — typewriter, with optional currency symbol stacked
function BigAmount({ amount, sub, align='left', accent=false, size=72 }) {
  const { sign, whole, currency } = inrParts(amount);
  return (
    <div style={{textAlign:align, color: accent ? 'var(--accent)' : 'var(--ink)'}}>
      <div style={{display:'flex', alignItems:'flex-start', justifyContent: align==='center'?'center':'flex-start', gap:6, lineHeight:.9}}>
        <span style={{
          fontFamily:'var(--mono)', fontSize: size*.45, opacity:.65, marginTop: size*.12,
        }}>{currency}</span>
        <span className="num" style={{fontSize: size, fontWeight:400, letterSpacing:'-.02em'}}>{sign}{whole}</span>
      </div>
      {sub && (
        <div style={{
          fontFamily:'var(--mono)', fontSize:11, letterSpacing:'.1em',
          color: accent ? 'var(--accent-soft)' : 'var(--olive)',
          textTransform:'uppercase', marginTop:6,
        }}>{sub}</div>
      )}
    </div>
  );
}

// ── Section label — like a tab divider in a binder
function SectionLabel({ children, right, style }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 18px',
      ...style,
    }}>
      <div style={{
        fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.25em',
        color:'var(--olive)', textTransform:'uppercase',
      }}>{children}</div>
      {right && <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--olive)'}}>{right}</div>}
    </div>
  );
}

// ── A single ledger row — like an entry line in a book
// Layout: date col · payee/cat col · amount col
function LedgerRow({ exp, onClick, onDelete, modesRef }) {
  const cat = CATEGORIES.find(c=>c.id===exp.cat);
  const modesList = modesRef || (typeof MODES !== 'undefined' ? MODES : []);
  return (
    <div style={{
      display:'grid', width:'100%',
      gridTemplateColumns: '46px 1fr auto',
      gap:10, alignItems:'center',
      padding:'10px 18px',
      borderBottom:'1px dotted rgba(26,18,8,.18)',
      position:'relative',
    }}>
      <button onClick={onClick} style={{
        display:'contents', background:'transparent', border:0,
        cursor:'pointer', color:'inherit', textAlign:'left',
      }}>
        <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--olive)', letterSpacing:'.05em', lineHeight:1.1}}>
          <div>{fmtDate(exp.date, 'short').split(' ')[0]}</div>
          <div style={{textTransform:'uppercase'}}>{fmtDate(exp.date, 'short').split(' ')[1]}</div>
        </div>
        <div style={{minWidth:0}}>
          <div style={{
            fontFamily:'var(--serif)', fontSize:14, fontWeight:700, lineHeight:1.15,
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
          }}>{exp.payee}</div>
          <div style={{
            fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.05em',
            color:'var(--olive)', textTransform:'uppercase', marginTop:2,
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
          }}>
            {cat?.label || exp.cat} · {exp.sub}
            {exp.modeId && <span style={{color:'var(--accent)', marginLeft:6}}>· {(modesList.find(m=>m.id===exp.modeId)||{}).name}</span>}
          </div>
        </div>
      </button>
      <div style={{display:'flex', alignItems:'center', gap:8, justifyContent:'flex-end'}}>
        <div className="num" style={{fontSize:16, fontWeight:400, textAlign:'right', whiteSpace:'nowrap'}}>
          ₹{exp.amount.toLocaleString('en-IN')}
        </div>
        {onDelete && (
          <button onClick={() => onDelete(exp.id)} title="Delete" style={{
            background:'transparent', border:0, cursor:'pointer',
            color:'rgba(139,37,0,.4)', fontFamily:'var(--mono)', fontSize:14,
            padding:'0 0 0 4px', lineHeight:1,
          }}>×</button>
        )}
      </div>
    </div>
  );
}

// ── Hand-drawn divider with corner squiggle
function Divider({ ornament=false, style }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:8, padding:'8px 18px', ...style}}>
      <div className="rule" style={{flex:1}} />
      {ornament && (
        <span style={{fontFamily:'var(--display)', color:'var(--olive)', fontSize:12, letterSpacing:'.15em'}}>· · ·</span>
      )}
      <div className="rule" style={{flex:1}} />
    </div>
  );
}

// ── Bottom tab bar ────────────────────────────────────────────────────────
function TabBar({ tab, onTab }) {
  const tabs = [
    { id:'home',     label:'HOME'     },
    { id:'log',      label:'LOG'      },
    { id:'add',      label:'+',  primary:true },
    { id:'modes',    label:'MODES'    },
    { id:'settings', label:'MORE' },
  ];
  return (
    <div style={{
      position:'relative',
      borderTop:'1.5px solid var(--ink)',
      background:'var(--paper)',
      padding:'8px 0 calc(8px + env(safe-area-inset-bottom))',
      display:'grid',
      gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr',
    }}>
      {tabs.map(t => {
        const active = t.id===tab;
        if (t.primary) {
          return (
            <div key={t.id} style={{display:'flex', justifyContent:'center'}}>
              <button
                onClick={()=>onTab(t.id)}
                aria-label="Add expense"
                style={{
                  position:'relative', top:-22,
                  width:54, height:54,
                  background:'var(--accent)',
                  border:'2px solid var(--ink)',
                  color:'var(--paper)',
                  fontFamily:'var(--display)', fontSize:32, lineHeight:1,
                  cursor:'pointer',
                  boxShadow:'3px 3px 0 0 var(--ink)',
                }}
              >+</button>
            </div>
          );
        }
        return (
          <button
            key={t.id}
            onClick={()=>onTab(t.id)}
            style={{
              background:'transparent', border:0, padding:'6px 0',
              fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.2em',
              color: active ? 'var(--ink)' : 'var(--olive-soft)',
              cursor:'pointer',
              fontWeight: active ? 700 : 400,
              position:'relative',
            }}
          >
            {t.label}
            {active && <span style={{
              position:'absolute', left:'50%', bottom:0, transform:'translateX(-50%)',
              width:18, height:2, background:'var(--ink)',
            }} />}
          </button>
        );
      })}
    </div>
  );
}

// ── A primary CTA button — feels like a stamped/embossed press
function InkButton({ children, onClick, kind='primary', full=false, style={}, disabled=false }) {
  const isPrimary = kind==='primary';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
        padding:'12px 18px',
        background: isPrimary ? 'var(--ink)' : 'transparent',
        color: isPrimary ? 'var(--paper)' : 'var(--ink)',
        border:'1.5px solid var(--ink)',
        fontFamily:'var(--display)', fontSize:13, letterSpacing:'.15em',
        textTransform:'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? .4 : 1,
        boxShadow: isPrimary ? '3px 3px 0 0 var(--ink)' : 'none',
        width: full ? '100%' : 'auto',
        transition:'transform .08s ease',
        ...style,
      }}
      onMouseDown={(e)=>{ if (isPrimary && !disabled) e.currentTarget.style.transform='translate(2px,2px)'; }}
      onMouseUp={(e)=>{ if (isPrimary && !disabled) e.currentTarget.style.transform='translate(0,0)'; }}
      onMouseLeave={(e)=>{ if (isPrimary && !disabled) e.currentTarget.style.transform='translate(0,0)'; }}
    >{children}</button>
  );
}

// ── Bottom sheet container ────────────────────────────────────────────────
function Sheet({ open, onClose, children, title, height='84%' }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position:'absolute', inset:0, zIndex:50,
          background:'rgba(20,12,4,.45)',
          backdropFilter:'blur(1px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition:'opacity .25s ease',
        }}
      />
      {/* Panel */}
      <div style={{
        position:'absolute', left:0, right:0, bottom:0,
        height,
        background:'var(--paper)',
        borderTop:'2px solid var(--ink)',
        boxShadow:'0 -8px 20px rgba(0,0,0,.25)',
        transform: open ? 'translateY(0)' : 'translateY(110%)',
        transition:'transform .35s cubic-bezier(.3,.8,.4,1)',
        zIndex:51,
        display:'flex', flexDirection:'column',
        overflow:'hidden',
      }}>
        {/* Paper fibers overlay */}
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none',
          backgroundImage:`repeating-linear-gradient(101deg, rgba(120,80,30,0) 0 14px, rgba(120,80,30,.02) 14px 15px, rgba(120,80,30,0) 15px 32px)`,
          mixBlendMode:'multiply',
        }} />
        <div style={{position:'relative', flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
          {/* Top handle + title */}
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'14px 18px 8px',
          }}>
            <div style={{
              fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.25em',
              color:'var(--olive)', textTransform:'uppercase',
            }}>{title}</div>
            <button
              onClick={onClose}
              style={{
                background:'transparent', border:'1px solid var(--ink)',
                width:26, height:26, fontFamily:'var(--mono)', fontSize:13,
                cursor:'pointer',
              }}
              aria-label="Close"
            >×</button>
          </div>
          <div className="rule" style={{margin:'0 18px'}} />
          {children}
        </div>
      </div>
    </>
  );
}

// ── Ledger column heading
function ColHead({ left, mid, right }) {
  return (
    <div style={{
      display:'grid', gridTemplateColumns:'46px 1fr auto', gap:10,
      padding:'6px 18px',
      fontFamily:'var(--mono)', fontSize:9, letterSpacing:'.22em',
      color:'var(--olive)', textTransform:'uppercase',
    }}>
      <div>{left}</div>
      <div>{mid}</div>
      <div style={{textAlign:'right'}}>{right}</div>
    </div>
  );
}

Object.assign(window, {
  SketchBox, Stamp, StatusBar, LedgerBar, BigAmount, SectionLabel,
  LedgerRow, Divider, TabBar, InkButton, Sheet, ColHead,
});
