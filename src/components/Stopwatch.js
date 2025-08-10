import React, { useEffect, useRef, useState } from "react";

export default function Stopwatch() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // ms
  const startAtRef = useRef(null);
  const tickRef = useRef(null);
  const [laps, setLaps] = useState([]);

  useEffect(() => {
    if (running) {
      const start = Date.now() - elapsed;
      startAtRef.current = start;
      tickRef.current = setInterval(() => setElapsed(Date.now() - startAtRef.current), 100);
    } else {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    return () => clearInterval(tickRef.current);
  }, [running]);

  function startStop() {
    setRunning(r => !r);
  }
  function reset() {
    setRunning(false);
    setElapsed(0);
    setLaps([]);
  }
  function lap() {
    setLaps(prev => [elapsed, ...prev]);
  }

  function format(ms) {
    const total = Math.floor(ms / 100);
    const seconds = Math.floor(total / 10);
    const hundredths = total % 10;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}.${hundredths}`;
  }

  return (
    <div className="card stopwatch">
      <h3>Stopwatch</h3>
      <div className="stopwatch-display">{format(elapsed)}</div>
      <div className="controls">
        <button onClick={startStop}>{running ? "Stop" : "Start"}</button>
        <button onClick={lap} disabled={!running}>Lap</button>
        <button onClick={reset}>Reset</button>
      </div>

      <div className="laps">
        {laps.length === 0 && <div className="empty">No laps</div>}
        {laps.map((l, i) => (
          <div key={i} className="lap-row">
            <span>Lap {laps.length - i}</span>
            <span>{format(l)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
