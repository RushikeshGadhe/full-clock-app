import React, { useEffect, useState } from "react";

/*
  Clock component: shows digital time + date + analog clock.
  Props:
    - timezone: IANA timezone string (e.g. "Asia/Kolkata" or "UTC")
*/

function formatTimeParts(date, timezone) {
  // Use Intl to compute time in a given timezone
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  const parts = fmt.formatToParts(date);
  const get = (type) => parts.find(p => p.type === type)?.value ?? "";
  return {
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
    timeString: `${get("hour")}:${get("minute")}:${get("second")}`
  };
}

export default function Clock({ timezone }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 250); // update 4x/sec for smoother seconds hand
    return () => clearInterval(id);
  }, []);

  const { hour, minute, second, timeString } = formatTimeParts(now, timezone);

  // compute analog rotation (numbers as integers)
  const h = parseInt(hour, 10) % 12;
  const m = parseInt(minute, 10);
  const s = parseInt(second, 10);

  // angles
  const secondDeg = (s / 60) * 360;
  const minuteDeg = (m / 60) * 360 + (s/60) * 6;
  const hourDeg = (h / 12) * 360 + (m / 60) * 30;

  // friendly date in timezone
  const dateStr = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(now);

  return (
    <div className="clock">
      <div className="digital">
        <div className="time">{timeString}</div>
        <div className="date">{dateStr} — {timezone}</div>
      </div>

      <div className="analog" aria-hidden>
        <div className="face">
          <div className="hand hour" style={{ transform: `rotate(${hourDeg}deg)` }} />
          <div className="hand minute" style={{ transform: `rotate(${minuteDeg}deg)` }} />
          <div className="hand second" style={{ transform: `rotate(${secondDeg}deg)` }} />
          <div className="center-dot" />
          {/* numbers 12,3,6,9 */}
          <div className="num num12">12</div>
          <div className="num num3">3</div>
          <div className="num num6">6</div>
          <div className="num num9">9</div>
        </div>
      </div>
    </div>
  );
}
