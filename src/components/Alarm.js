import React, { useEffect, useRef, useState } from "react";

/*
  Simple alarm manager:
   - add alarms as "HH:MM" (in selected timezone)
   - checks every second using Intl to convert to timezone string
   - when matches, plays a beep via WebAudio
*/

function useTicker() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return tick;
}

export default function Alarm({ timezone }) {
  const [alarms, setAlarms] = useState([]); // {id, hhmm, label, enabled}
  const [input, setInput] = useState("");
  const [label, setLabel] = useState("");
  const tick = useTicker();
  const audioCtxRef = useRef(null);

  useEffect(() => {
    if (!audioCtxRef.current) audioCtxRef.current = null;
  }, []);

  function playBeep(times = 3) {
    // simple beep using WebAudio
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      let i = 0;

      function beepOnce() {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = 880;
        o.connect(g);
        g.connect(ctx.destination);
        g.gain.value = 0.0001;
        g.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
        o.start();
        o.stop(ctx.currentTime + 0.5);
        i++;
        if (i < times) setTimeout(beepOnce, 600);
      }
      beepOnce();
    } catch (e) {
      console.warn("Audio API unavailable", e);
      // fallback: alert
      alert("Alarm!");
    }
  }

  // every second check alarms
  useEffect(() => {
    if (alarms.length === 0) return;
    // get HH:MM in timezone
    const now = new Date();
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit"
    });
    const [hh, mm] = fmt.format(now).split(":");
    const hhmm = `${hh}:${mm}`;

    // find alarms matching hhmm and enabled and not already fired this minute
    alarms.forEach(a => {
      if (a.enabled && a.hhmm === hhmm && !a.firedAt) {
        // mark as fired this minute to avoid repeats
        setAlarms(prev => prev.map(p => p.id === a.id ? {...p, firedAt: Date.now()} : p));
        playBeep(4);
      }
    });

    // clear firedAt after 70 seconds so alarm can fire next day
    const cleanupId = setTimeout(() => {
      setAlarms(prev => prev.map(p => ({...p, firedAt: null})));
    }, 70_000);

    return () => clearTimeout(cleanupId);
  }, [tick, alarms, timezone]);

  function addAlarm() {
    // accept HH:MM in 24h
    if (!/^\d{2}:\d{2}$/.test(input)) {
      alert("Enter time in HH:MM (24-hour) format");
      return;
    }
    const id = Date.now() + Math.random();
    setAlarms(prev => [...prev, { id, hhmm: input, label: label || "Alarm", enabled: true, firedAt: null }]);
    setInput("");
    setLabel("");
  }

  function removeAlarm(id) {
    setAlarms(prev => prev.filter(a => a.id !== id));
  }

  function toggleEnabled(id) {
    setAlarms(prev => prev.map(a => a.id === id ? {...a, enabled: !a.enabled} : a));
  }

  return (
    <div className="card alarm">
      <h3>Alarm</h3>
      <div className="alarm-add">
        <input placeholder="HH:MM" value={input} onChange={e => setInput(e.target.value)} />
        <input placeholder="label (optional)" value={label} onChange={e => setLabel(e.target.value)} />
        <button onClick={addAlarm}>Add</button>
      </div>

      <div className="alarm-list">
        {alarms.length === 0 && <div className="empty">No alarms set</div>}
        {alarms.map(a => (
          <div key={a.id} className="alarm-row">
            <div>
              <strong>{a.hhmm}</strong> — {a.label}
            </div>
            <div>
              <button onClick={() => toggleEnabled(a.id)}>{a.enabled ? "Disable" : "Enable"}</button>
              <button onClick={() => removeAlarm(a.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      <small className="muted">Alarms use your browser clock converted to the selected timezone.</small>
    </div>
  );
}
