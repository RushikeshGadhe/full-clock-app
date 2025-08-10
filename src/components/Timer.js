import React, { useEffect, useRef, useState } from "react";

export default function Timer() {
  const [mins, setMins] = useState(0);
  const [secs, setSecs] = useState(0);
  const [remaining, setRemaining] = useState(0); // seconds
  const tickRef = useRef(null);

  useEffect(() => {
    if (remaining > 0 && tickRef.current === null) {
      tickRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            clearInterval(tickRef.current);
            tickRef.current = null;
            // ring
            try {
              const ctx = new (window.AudioContext || window.webkitAudioContext)();
              const o = ctx.createOscillator();
              const g = ctx.createGain();
              o.frequency.value = 880;
              o.connect(g);
              g.connect(ctx.destination);
              g.gain.value = 0.0001;
              g.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.01);
              g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1);
              o.start();
              o.stop(ctx.currentTime + 1);
            } catch {
              alert("Timer finished!");
            }
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => {
      // don't auto-clear here (we might want it running)
    };
  }, [remaining]);

  function startTimer() {
    setRemaining(m => {
      const total = Number(mins) * 60 + Number(secs);
      return total;
    });
  }

  function stopTimer() {
    clearInterval(tickRef.current);
    tickRef.current = null;
    setRemaining(0);
  }

  function formatSeconds(s) {
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${String(mm).padStart(2,"0")}:${String(ss).padStart(2,"0")}`;
  }

  return (
    <div className="card timer">
      <h3>Timer</h3>
      <div className="timer-inputs">
        <input type="number" min="0" value={mins} onChange={e => setMins(e.target.value)} /> <span>mins</span>
        <input type="number" min="0" max="59" value={secs} onChange={e => setSecs(e.target.value)} /> <span>secs</span>
        <button onClick={startTimer}>Start</button>
        <button onClick={stopTimer}>Stop/Reset</button>
      </div>

      <div className="timer-display">
        {remaining > 0 ? formatSeconds(remaining) : "00:00"}
      </div>
    </div>
  );
}
