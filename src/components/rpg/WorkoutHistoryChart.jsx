import React, { useMemo } from 'react';
import { Flame } from 'lucide-react';

const DAYS = 14;

function buildDailyBuckets(workoutLogs) {
  const buckets = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < DAYS; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (DAYS - 1 - i));
    buckets[d.toISOString().split('T')[0]] = 0;
  }

  for (const log of workoutLogs) {
    const day = log.date?.split('T')[0];
    if (day && buckets.hasOwnProperty(day)) {
      buckets[day] += log.xpEarned || 0;
    }
  }

  return Object.entries(buckets).map(([date, xp]) => ({ date, xp }));
}

function computeStreak(workoutLogs) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeDays = new Set(
    workoutLogs.map(l => l.date?.split('T')[0]).filter(Boolean)
  );

  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if (activeDays.has(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export function WorkoutHistoryChart({ workoutLogs = [] }) {
  const buckets = useMemo(() => buildDailyBuckets(workoutLogs), [workoutLogs]);
  const streak = useMemo(() => computeStreak(workoutLogs), [workoutLogs]);
  const maxXp = Math.max(...buckets.map(b => b.xp), 1);

  const todayKey = new Date().toISOString().split('T')[0];
  const chartH = 64;
  const barW = 12;
  const gap = 4;
  const totalW = DAYS * (barW + gap) - gap;

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  if (workoutLogs.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-slate-500 text-xs italic">Log your first workout to start tracking progress.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">14-Day XP History</span>
        {streak > 0 && (
          <span className="flex items-center gap-1 text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2 py-1 rounded-full">
            <Flame size={12} className="animate-pulse" />
            {streak} day streak
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${totalW} ${chartH + 16}`}
        className="w-full overflow-visible"
        style={{ height: chartH + 20 }}
      >
        {buckets.map((bucket, i) => {
          const x = i * (barW + gap);
          const isToday = bucket.date === todayKey;
          const hasWorkout = bucket.xp > 0;
          const barH = hasWorkout ? Math.max(4, Math.round((bucket.xp / maxXp) * chartH)) : 2;
          const y = chartH - barH;
          const dayOfWeek = new Date(bucket.date + 'T12:00:00').getDay();

          return (
            <g key={bucket.date}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={3}
                className={
                  hasWorkout
                    ? isToday
                      ? 'fill-emerald-400'
                      : 'fill-emerald-600/70'
                    : 'fill-slate-800'
                }
              />
              {isToday && hasWorkout && (
                <rect x={x} y={y} width={barW} height={barH} rx={3}
                  fill="url(#glow)" opacity={0.4} />
              )}
              <text
                x={x + barW / 2}
                y={chartH + 13}
                textAnchor="middle"
                fontSize={8}
                className={isToday ? 'fill-emerald-400' : 'fill-slate-600'}
                fontWeight={isToday ? 'bold' : 'normal'}
              >
                {dayLabels[dayOfWeek]}
              </text>
            </g>
          );
        })}
        <defs>
          <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex justify-between text-[10px] text-slate-600 mt-1">
        <span>14 days ago</span>
        <span className="text-emerald-500 font-bold">Today</span>
      </div>
    </div>
  );
}
