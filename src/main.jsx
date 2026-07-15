import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BOARD_SIZE, LEVELS, getMoveRange, isSolved, movePiece } from './game.js';
import './styles.css';

const ERAS = ['40s', '50s', '60s', '70s'];

function Icon({ name }) {
  const paths = {
    undo: <><path d="M9 8H4V3"/><path d="M4.5 7.5A8 8 0 1 1 4 16"/></>,
    restart: <><path d="M18.5 7.5A8 8 0 1 0 20 14"/><path d="M19 3v5h-5"/></>,
    sound: <><path d="M5 10v4h3l4 3V7l-4 3H5Z"/><path d="M15 9.5a4 4 0 0 1 0 5"/><path d="M17.5 7a7 7 0 0 1 0 10"/></>,
    mute: <><path d="M5 10v4h3l4 3V7l-4 3H5Z"/><path d="m16 10 5 5m0-5-5 5"/></>,
    arrow: <><path d="M5 12h13"/><path d="m14 8 4 4-4 4"/></>
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function NumberPlate({ label, value }) {
  return <div className="number-plate"><span>{label}</span><strong>{value}</strong></div>;
}

function ControlButton({ icon, children, onClick, disabled, pressed }) {
  return (
    <button className="control-button" type="button" onClick={onClick} disabled={disabled} aria-pressed={pressed}>
      <Icon name={icon} /><span>{children}</span>
    </button>
  );
}

function DrivePad({ piece, onMove }) {
  const horizontal = piece?.axis === 'h';
  return (
    <div className="drive-pad" aria-label={`Move ${piece?.name || 'selected car'}`}>
      <button type="button" onClick={() => onMove(-1)} aria-label={`Move ${piece?.name || 'car'} ${horizontal ? 'left' : 'up'}`}>
        <Icon name="arrow" />
      </button>
      <span><small>SELECTED</small>{piece?.name || 'Choose a car'}</span>
      <button type="button" onClick={() => onMove(1)} aria-label={`Move ${piece?.name || 'car'} ${horizontal ? 'right' : 'down'}`}>
        <Icon name="arrow" />
      </button>
    </div>
  );
}

function CarSprite({ sprite }) {
  return <img className="car-art" src={`/assets/cars/car-${sprite}.png`} alt="" draggable="false" />;
}

function GameBoard({ pieces, setPieces, selectedId, setSelectedId, onCommittedMove, won }) {
  const boardRef = useRef(null);
  const [drag, setDrag] = useState(null);
  const displayPieces = useMemo(() => pieces.map((piece) => {
    if (!drag || piece.id !== drag.id) return piece;
    return piece.axis === 'h' ? { ...piece, x: drag.preview } : { ...piece, y: drag.preview };
  }), [pieces, drag]);

  const startDrag = (event, piece) => {
    if (won) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedId(piece.id);
    setDrag({
      id: piece.id,
      startPointer: piece.axis === 'h' ? event.clientX : event.clientY,
      start: piece.axis === 'h' ? piece.x : piece.y,
      preview: piece.axis === 'h' ? piece.x : piece.y,
      range: getMoveRange(piece, pieces)
    });
  };

  const continueDrag = (event, piece) => {
    if (!drag || drag.id !== piece.id || !boardRef.current) return;
    const cell = boardRef.current.getBoundingClientRect().width / BOARD_SIZE;
    const pointer = piece.axis === 'h' ? event.clientX : event.clientY;
    const delta = Math.round((pointer - drag.startPointer) / cell);
    const preview = Math.min(drag.range.max, Math.max(drag.range.min, drag.start + delta));
    if (preview !== drag.preview) setDrag((current) => ({ ...current, preview }));
  };

  const endDrag = (event, piece) => {
    if (!drag || drag.id !== piece.id) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (drag.preview !== drag.start) {
      setPieces(movePiece(pieces, piece.id, drag.preview));
      onCommittedMove();
    }
    setDrag(null);
  };

  return (
    <div className="board-stage">
      <div className="board-frame">
        <div className="board" ref={boardRef} role="group" aria-label="Six by six Rush Hour game board">
          <div className="parking-lines" aria-hidden="true" />
          {displayPieces.map((piece) => {
            const style = {
              '--x': piece.x,
              '--y': piece.y,
              '--length': piece.length
            };
            const classes = ['car', `car--${piece.axis}`, piece.target ? 'car--target' : '', selectedId === piece.id ? 'is-selected' : '', won && piece.target ? 'is-escaping' : ''].filter(Boolean).join(' ');
            return (
              <button
                key={piece.id}
                type="button"
                className={classes}
                style={style}
                aria-label={`${piece.name}, ${piece.axis === 'h' ? 'horizontal' : 'vertical'}`}
                onPointerDown={(event) => startDrag(event, piece)}
                onPointerMove={(event) => continueDrag(event, piece)}
                onPointerUp={(event) => endDrag(event, piece)}
                onPointerCancel={() => setDrag(null)}
                onFocus={() => setSelectedId(piece.id)}
              >
                <CarSprite sprite={piece.sprite} />
              </button>
            );
          })}
        </div>
      </div>
      <div className="exit-sign" aria-label="Exit to the right"><span>EXIT</span><Icon name="arrow" /></div>
    </div>
  );
}

function PuzzleThumbnail({ level, active, onClick }) {
  return (
    <button type="button" className={`puzzle-thumb ${active ? 'is-active' : ''}`} onClick={onClick} aria-label={`Play puzzle ${level.id}: ${level.title}`}>
      <span className="mini-board" aria-hidden="true">
        {level.pieces.slice(0, 7).map((piece) => (
          <i key={piece.id} style={{ '--mx': piece.x, '--my': piece.y, '--ml': piece.length, '--axis': piece.axis === 'h' ? 0 : 1, '--tone': piece.target ? '#a43a31' : ['#356c68','#c28b32','#ded2b4','#293b54'][piece.sprite % 4] }} />
        ))}
      </span>
      <span><b>0{level.id}</b>{level.title}</span>
    </button>
  );
}

function App() {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = LEVELS[levelIndex];
  const [pieces, setPieces] = useState(() => level.pieces.map((piece) => ({ ...piece })));
  const [moves, setMoves] = useState(0);
  const [history, setHistory] = useState([]);
  const [selectedId, setSelectedId] = useState('R');
  const [sound, setSound] = useState(true);
  const [won, setWon] = useState(false);
  const [era, setEra] = useState(level.era);
  const [best, setBest] = useState(() => Number(localStorage.getItem(`rush-hour-best-${level.id}`)) || '—');

  const playTone = (frequency = 170, duration = 0.07) => {
    if (!sound) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    gain.gain.setValueAtTime(0.045, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  };

  const loadLevel = (index) => {
    const next = LEVELS[index];
    setLevelIndex(index);
    setPieces(next.pieces.map((piece) => ({ ...piece })));
    setMoves(0);
    setHistory([]);
    setWon(false);
    setSelectedId('R');
    setEra(next.era);
    setBest(Number(localStorage.getItem(`rush-hour-best-${next.id}`)) || '—');
  };

  const commitMove = (nextPieces) => {
    setHistory((items) => [...items, pieces.map((piece) => ({ ...piece }))]);
    if (nextPieces) setPieces(nextPieces);
    setMoves((value) => value + 1);
    playTone(140 + moves * 7);
  };

  useEffect(() => {
    if (!isSolved(pieces) || won) return;
    const nextMoves = moves;
    setWon(true);
    const currentBest = Number(localStorage.getItem(`rush-hour-best-${level.id}`));
    if (!currentBest || nextMoves < currentBest) {
      localStorage.setItem(`rush-hour-best-${level.id}`, String(nextMoves));
      setBest(nextMoves);
    }
    playTone(440, 0.3);
  }, [pieces, moves, won, level.id]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (won || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      const selected = pieces.find((piece) => piece.id === selectedId);
      if (!selected) return;
      const isCorrectAxis = selected.axis === 'h' ? ['ArrowLeft', 'ArrowRight'].includes(event.key) : ['ArrowUp', 'ArrowDown'].includes(event.key);
      if (!isCorrectAxis) return;
      event.preventDefault();
      const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
      const coordinate = (selected.axis === 'h' ? selected.x : selected.y) + direction;
      const range = getMoveRange(selected, pieces);
      if (coordinate < range.min || coordinate > range.max) return;
      const next = movePiece(pieces, selected.id, coordinate);
      commitMove(next);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pieces, selectedId, won, sound, moves]);

  const undo = () => {
    if (!history.length || won) return;
    const previous = history[history.length - 1];
    setPieces(previous);
    setHistory((items) => items.slice(0, -1));
    setMoves((value) => Math.max(0, value - 1));
    playTone(110);
  };

  const restart = () => loadLevel(levelIndex);

  const moveSelected = (direction) => {
    if (won) return;
    const selected = pieces.find((piece) => piece.id === selectedId);
    if (!selected) return;
    const coordinate = (selected.axis === 'h' ? selected.x : selected.y) + direction;
    const range = getMoveRange(selected, pieces);
    if (coordinate < range.min || coordinate > range.max) {
      playTone(82, 0.05);
      return;
    }
    commitMove(movePiece(pieces, selected.id, coordinate));
  };

  return (
    <main className={`app era-${era}`}>
      <header className="masthead">
        <div className="brand-sign"><h1>RUSH HOUR</h1><span>American Classics</span></div>
        <div className="level-heading">
          <h2>{level.title} · 0{level.id}</h2>
          <p>Slide the cars. Free the red coupe.</p>
        </div>
      </header>

      <section className="game-layout" aria-label="Game controls and board">
        <aside className="control-stack" aria-label="Score and game controls">
          <div className="score-row"><NumberPlate label="MOVES" value={moves}/><NumberPlate label="BEST" value={best}/></div>
          <ControlButton icon="undo" onClick={undo} disabled={!history.length || won}>Undo</ControlButton>
          <ControlButton icon="restart" onClick={restart}>Restart</ControlButton>
          <ControlButton icon={sound ? 'sound' : 'mute'} onClick={() => setSound((value) => !value)} pressed={sound}>Sound</ControlButton>
          <DrivePad piece={pieces.find((piece) => piece.id === selectedId)} onMove={moveSelected} />
          <p className="keyboard-hint">Click a car, then use the brass arrows or your keyboard.</p>
        </aside>

        <GameBoard pieces={pieces} setPieces={(next) => { setHistory((items) => [...items, pieces.map((piece) => ({ ...piece }))]); setPieces(next); }} selectedId={selectedId} setSelectedId={setSelectedId} onCommittedMove={() => { setMoves((value) => value + 1); playTone(165); }} won={won}/>

        <aside className="era-panel" aria-label="Choose a motoring era">
          <h3>Pick Your Era</h3>
          {ERAS.map((item, index) => (
            <button key={item} type="button" className={era === item ? 'is-active' : ''} onClick={() => setEra(item)}>
              <span>{item}</span><i className={`era-car era-car--${index}`} aria-hidden="true" />
            </button>
          ))}
          <div className="postcard" aria-hidden="true"><span>Wish you were here</span><b>U.S. 66</b></div>
        </aside>
      </section>

      <section className="puzzle-tray" aria-label="Select a puzzle">
        <h3><span />Select a Puzzle<span /></h3>
        <div>
          {LEVELS.map((item, index) => <PuzzleThumbnail key={item.id} level={item} active={index === levelIndex} onClick={() => loadLevel(index)}/>)}
        </div>
      </section>

      <section className="instruction">
        <p>{level.subtitle}</p>
        <span>Drag each automobile only along the direction it faces. Clear row three, then guide the scarlet fastback through the exit.</span>
      </section>

      {won && (
        <div className="win-overlay" role="dialog" aria-modal="true" aria-labelledby="win-title">
          <div className="win-ticket">
            <span className="ticket-notch" />
            <p>ROAD CLEARED</p>
            <h2 id="win-title">You made the open road.</h2>
            <strong>{moves} moves · Par {level.par}</strong>
            <div><button type="button" onClick={() => loadLevel((levelIndex + 1) % LEVELS.length)}>Next drive <Icon name="arrow" /></button><button type="button" onClick={restart}>Drive again</button></div>
          </div>
        </div>
      )}
      <footer><span>Built for Sunday drivers.</span><span>AMERICAN CLASSICS · MMXXVI</span></footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
