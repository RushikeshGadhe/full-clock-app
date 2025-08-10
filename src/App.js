import React, { useState } from "react";
import Clock from "./components/Clock";
import Alarm from "./components/Alarm";
import Stopwatch from "./components/Stopwatch";
import Timer from "./components/Timer";
import "./index.css";

export default function App() {
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  const tzList = [
    "UTC",
    "Europe/London",
    "America/New_York",
    "Asia/Kolkata",
    "Asia/Tokyo",
    "Australia/Sydney"
  ];

  return (
    <div className="app">
      <h1>Full Functional Clock</h1>

      <section className="top-row">
        <div className="clock-card">
          <label>
            Timezone:
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
              <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>Local ({Intl.DateTimeFormat().resolvedOptions().timeZone})</option>
              {tzList.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </label>

          <Clock timezone={timezone} />
        </div>

        <div className="tools">
          <Alarm timezone={timezone} />
          <Timer />
          <Stopwatch />
        </div>
      </section>

      <footer className="footer">
        <small>Built with React • Works in modern browsers</small>
      </footer>
    </div>
  );
}
