import { useState, useEffect, useCallback } from "react";

const COLORS = [
  { hex: "#E24B4A", name: "red",    symbol: "●", animal: "Cat",  emoji: "🐱", sound: "Meow!"   },
  { hex: "#378ADD", name: "blue",   symbol: "■", animal: "Dog",  emoji: "🐶", sound: "Woof!"   },
  { hex: "#639922", name: "green",  symbol: "▲", animal: "Frog", emoji: "🐸", sound: "Ribbit!" },
  { hex: "#EF9F27", name: "orange", symbol: "◆", animal: "Duck", emoji: "🦆", sound: "Quack!"  },
  { hex: "#D4537E", name: "pink",   symbol: "★", animal: "Pig",  emoji: "🐷", sound: "Oink!"   },
  { hex: "#1D9E75", name: "teal",   symbol: "♥", animal: "Cow",  emoji: "🐄", sound: "Moo!"    },
];

const COL_COUNT   = 6;
const TILES_EACH  = 4;
const EMPTY_COLS  = 2;
const TOTAL_COLS  = COL_COUNT + EMPTY_COLS;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildInitialState() {
  let tiles = [];
  for (let c = 0; c < COL_COUNT; c++)
    for (let t = 0; t < TILES_EACH; t++) tiles.push(c);
  tiles = shuffle(tiles);
  const cols = [];
  for (let c = 0; c < COL_COUNT; c++)
    cols.push(tiles.slice(c * TILES_EACH, (c + 1) * TILES_EACH));
  for (let e = 0; e < EMPTY_COLS; e++) cols.push([]);
  return cols;
}

function isColComplete(col) {
  return col.length === TILES_EACH && col.every((c) => c === col[0]);
}

function checkWin(state) {
  return state.filter((c) => c.length > 0).every(isColComplete);
}

export default function App() {
  const [mode,     setMode]     = useState("color");
  const [state,    setState]    = useState(() => buildInitialState());
  const [selected, setSelected] = useState(null);
  const [moves,    setMoves]    = useState(0);
  const [best,     setBest]     = useState(null);
  const [history,  setHistory]  = useState([]);
  const [invalid,  setInvalid]  = useState(null);
  const [toast,    setToast]    = useState(null);
  const [won,      setWon]      = useState(false);

  const restart = useCallback(() => {
    setState(buildInitialState());
    setSelected(null);
    setMoves(0);
    setHistory([]);
    setInvalid(null);
    setToast(null);
    setWon(false);
  }, []);

  useEffect(() => { restart(); }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 1400);
      return () => clearTimeout(t);
    }
  }, [toast]);

  useEffect(() => {
    if (invalid !== null) {
      const t = setTimeout(() => setInvalid(null), 350);
      return () => clearTimeout(t);
    }
  }, [invalid]);

  const handleClick = (ci) => {
    if (won) return;
    const col = state[ci];

    if (selected === null) {
      if (col.length === 0) return;
      setSelected(ci);
      if (mode === "animal") {
        const top = col[col.length - 1];
        setToast(`${COLORS[top].sound} ${COLORS[top].emoji}`);
      }
      return;
    }

    if (selected === ci) { setSelected(null); return; }

    const from = state[selected];
    const to   = state[ci];

    if (to.length >= TILES_EACH) { setInvalid(ci); setSelected(null); return; }
    const tile = from[from.length - 1];
    if (to.length > 0 && to[to.length - 1] !== tile) { setInvalid(ci); setSelected(null); return; }

    const next = state.map((c) => [...c]);
    next[selected].pop();
    next[ci].push(tile);

    setHistory((h) => [...h, state]);
    setState(next);
    setMoves((m) => m + 1);
    setSelected(null);

    if (checkWin(next)) {
      setWon(true);
      setBest((b) => (b === null || moves + 1 < b ? moves + 1 : b));
    }
  };

  const undo = () => {
    if (!history.length) return;
    setState(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
    setMoves((m) => Math.max(0, m - 1));
    setSelected(null);
  };

  const styles = {
    app: {
      minHeight: "100vh",
      background: "#111318",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: "1rem",
    },
    card: {
      background: "#1c1f27",
      borderRadius: 20,
      padding: "1.5rem 1.25rem",
      width: "100%",
      maxWidth: 420,
      boxShadow: "0 4px 32px rgba(0,0,0,0.5)",
    },
    title: {
      fontSize: 20,
      fontWeight: 600,
      color: "#fff",
      marginBottom: 2,
      letterSpacing: "-0.3px",
    },
    sub: {
      fontSize: 13,
      color: "#6b7280",
      marginBottom: 16,
    },
    modeRow: {
      display: "flex",
      gap: 6,
      marginBottom: 16,
    },
    modeBtn: (active) => ({
      flex: 1,
      padding: "6px 0",
      fontSize: 12,
      fontWeight: 500,
      borderRadius: 8,
      border: "none",
      cursor: "pointer",
      background: active ? "#378ADD" : "#2a2d37",
      color: active ? "#fff" : "#9ca3af",
      transition: "background 0.15s",
    }),
    statsRow: {
      display: "flex",
      gap: 8,
      marginBottom: 16,
    },
    stat: {
      flex: 1,
      background: "#2a2d37",
      borderRadius: 10,
      padding: "8px 12px",
      fontSize: 13,
      color: "#9ca3af",
      textAlign: "center",
    },
    statVal: {
      display: "block",
      fontSize: 20,
      fontWeight: 600,
      color: "#fff",
      lineHeight: 1.2,
    },
    cols: {
      display: "flex",
      gap: 6,
      justifyContent: "center",
      marginBottom: 16,
    },
    col: (sel, complete, inv) => ({
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      gap: 4,
      background: "#252830",
      borderRadius: 14,
      border: `2.5px solid ${inv ? "#E24B4A" : sel ? "#378ADD" : complete ? "#639922" : "transparent"}`,
      padding: 6,
      cursor: "pointer",
      width: 50,
      minHeight: 176,
      transition: "border-color 0.15s",
      animation: inv ? "shake 0.35s" : "none",
    }),
    tile: (colorIdx, isTop, sel) => ({
      width: "100%",
      height: 34,
      borderRadius: 8,
      background: COLORS[colorIdx].hex,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 16,
      fontWeight: 700,
      color: "rgba(255,255,255,0.85)",
      transform: isTop && sel ? "scale(1.06)" : "scale(1)",
      boxShadow: isTop && sel ? `0 0 0 3px ${COLORS[colorIdx].hex}55` : "none",
      transition: "transform 0.12s, box-shadow 0.12s",
      flexShrink: 0,
    }),
    btnRow: {
      display: "flex",
      gap: 8,
    },
    btn: {
      flex: 1,
      padding: "10px 0",
      fontSize: 14,
      fontWeight: 500,
      borderRadius: 10,
      border: "none",
      cursor: "pointer",
      background: "#2a2d37",
      color: "#e5e7eb",
    },
    winBox: {
      textAlign: "center",
      marginTop: 16,
      background: "#1a2a1a",
      borderRadius: 14,
      padding: "1.25rem",
      border: "1.5px solid #639922",
    },
    winTitle: { fontSize: 22, fontWeight: 700, color: "#7ec94a", marginBottom: 4 },
    winSub:   { fontSize: 13, color: "#9ca3af" },
    toast: {
      position: "fixed",
      bottom: 90,
      left: "50%",
      transform: "translateX(-50%)",
      background: "#1c1f27",
      border: "1px solid #374151",
      borderRadius: 12,
      padding: "10px 20px",
      fontSize: 18,
      fontWeight: 600,
      color: "#fff",
      zIndex: 99,
      whiteSpace: "nowrap",
      boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
      pointerEvents: "none",
    },
  };

  const tileLabel = (colorIdx, mode) => {
    if (mode === "symbol") return COLORS[colorIdx].symbol;
    if (mode === "animal") return COLORS[colorIdx].emoji;
    return null;
  };

  return (
    <div style={styles.app}>
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          25%{transform:translateX(-5px)}
          75%{transform:translateX(5px)}
        }
      `}</style>

      {toast && <div style={styles.toast}>{toast}</div>}

      <div style={styles.card}>
        <div style={styles.title}>Color sort</div>
        <div style={styles.sub}>
          {mode === "animal"
            ? "Tap to hear the animals!"
            : mode === "symbol"
            ? "Match the symbols into columns"
            : "Sort each color into its own column"}
        </div>

        <div style={styles.modeRow}>
          {["color", "symbol", "animal"].map((m) => (
            <button
              key={m}
              style={styles.modeBtn(mode === m)}
              onClick={() => setMode(m)}
            >
              {m === "color" ? "🎨 Color" : m === "symbol" ? "♦ Colorblind" : "🐾 Animals"}
            </button>
          ))}
        </div>

        <div style={styles.statsRow}>
          <div style={styles.stat}>
            <span style={styles.statVal}>{moves}</span>
            moves
          </div>
          <div style={styles.stat}>
            <span style={styles.statVal}>{best ?? "—"}</span>
            best
          </div>
        </div>

        <div style={styles.cols}>
          {state.map((col, ci) => (
            <div
              key={ci}
              style={styles.col(selected === ci, isColComplete(col), invalid === ci)}
              onClick={() => handleClick(ci)}
            >
              {col.map((colorIdx, ti) => (
                <div
                  key={ti}
                  style={styles.tile(colorIdx, ti === col.length - 1, selected === ci)}
                >
                  {tileLabel(colorIdx, mode)}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={styles.btnRow}>
          <button style={styles.btn} onClick={undo} disabled={!history.length}>
            ↩ Undo
          </button>
          <button style={styles.btn} onClick={restart}>
            ↺ Restart
          </button>
        </div>

        {won && (
          <div style={styles.winBox}>
            <div style={styles.winTitle}>Solved! 🎉</div>
            <div style={styles.winSub}>
              {moves} moves{best === moves ? " · New best!" : ""}
            </div>
            <button
              style={{ ...styles.btn, marginTop: 12, background: "#639922", color: "#fff" }}
              onClick={restart}
            >
              Play again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
