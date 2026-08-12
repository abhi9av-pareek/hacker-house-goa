import React, { useEffect, useState } from 'react';

// Oct 28, 2026 00:00:00 IST (UTC+5:30)
const TARGET = new Date('2026-10-28T00:00:00+05:30').getTime();

function calcTime() {
  const now = Date.now();
  const diff = Math.max(0, TARGET - now);
  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, done: diff === 0 };
}

export default function Countdown() {
  const [time, setTime] = useState(calcTime);

  useEffect(() => {
    const id = setInterval(() => setTime(calcTime()), 1000);
    return () => clearInterval(id);
  }, []);

  if (time.done) {
    return (
      <div className="countdown countdown-done" aria-live="polite">
        <span className="countdown-done-label">🎉 WE'RE IN GOA</span>
      </div>
    );
  }

  const units = [
    { value: time.days,    label: 'DAYS' },
    { value: time.hours,   label: 'HRS'  },
    { value: time.minutes, label: 'MIN'  },
    { value: time.seconds, label: 'SEC'  },
  ];

  return (
    <div className="countdown" role="timer" aria-label="Countdown to HH Goa 2026">
      <span className="countdown-prefix">GOA IN</span>
      <div className="countdown-units">
        {units.map(({ value, label }, i) => (
          <React.Fragment key={label}>
            <div className="countdown-unit">
              <span className="countdown-digit">{String(value).padStart(2, '0')}</span>
              <span className="countdown-unit-label">{label}</span>
            </div>
            {i < units.length - 1 && (
              <span className="countdown-sep" aria-hidden="true">:</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
