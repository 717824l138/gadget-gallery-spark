import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Battery,
  BatteryCharging,
  Gauge,
  Thermometer,
  Zap,
  Car,
  AlertTriangle,
  ShieldAlert,
  Users,
  Eye,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EV Dashboard — Real-time Telemetry & ADAS" },
      {
        name: "description",
        content:
          "Real-time Electric Vehicle dashboard with battery, speed, range, motor power, temperature and ADAS warnings.",
      },
      { property: "og:title", content: "EV Dashboard — Real-time Telemetry & ADAS" },
    ],
  }),
  component: EVDashboard,
});

type DriveMode = "Eco" | "Normal" | "Sport";

type Telemetry = {
  battery: number; // 0-100
  speed: number; // km/h
  power: number; // kW (negative = regen)
  temp: number; // C
  charging: boolean;
  range: number; // km
};

type WarningKey =
  | "forwardCollision"
  | "laneDeparture"
  | "pedestrian"
  | "blindSpot"
  | "emergencyBrake";

type WarningState = Record<WarningKey, "safe" | "caution" | "danger">;

const WARNINGS: { key: WarningKey; label: string; icon: typeof ShieldAlert }[] = [
  { key: "forwardCollision", label: "Forward Collision", icon: ShieldAlert },
  { key: "laneDeparture", label: "Lane Departure", icon: AlertTriangle },
  { key: "pedestrian", label: "Pedestrian Detect", icon: Users },
  { key: "blindSpot", label: "Blind Spot", icon: Eye },
  { key: "emergencyBrake", label: "Emergency Brake", icon: ShieldAlert },
];

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function EVDashboard() {
  const [mode, setMode] = useState<DriveMode>("Normal");
  const [sound, setSound] = useState(false);
  const [t, setT] = useState<Telemetry>({
    battery: 78,
    speed: 0,
    power: 0,
    temp: 28,
    charging: false,
    range: 340,
  });
  const [warnings, setWarnings] = useState<WarningState>({
    forwardCollision: "safe",
    laneDeparture: "safe",
    pedestrian: "safe",
    blindSpot: "safe",
    emergencyBrake: "safe",
  });
  const [batteryHistory, setBatteryHistory] = useState<number[]>([]);
  const [speedHistory, setSpeedHistory] = useState<number[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Simulation loop — updates telemetry every ~1.2s
  useEffect(() => {
    const id = setInterval(() => {
      setT((prev) => {
        const modeFactor = mode === "Sport" ? 1.6 : mode === "Eco" ? 0.6 : 1;
        const charging = prev.battery < 20 ? true : prev.charging && prev.battery < 99;

        // Speed drift
        const targetSpeed = charging ? 0 : clamp(prev.speed + (Math.random() - 0.45) * 18 * modeFactor, 0, 180);
        const speed = +(prev.speed + (targetSpeed - prev.speed) * 0.4).toFixed(0);

        // Power: roughly proportional to speed delta + base
        const power = charging
          ? -(20 + Math.random() * 30)
          : +(speed * 0.18 * modeFactor + (Math.random() - 0.3) * 10).toFixed(1);

        // Battery drain
        const drain = charging ? -0.8 : Math.max(0, power) * 0.01 + 0.05;
        const battery = +clamp(prev.battery - drain, 0, 100).toFixed(1);

        // Temperature
        const temp = +clamp(
          prev.temp + (Math.abs(power) > 40 ? 0.3 : -0.15) + (Math.random() - 0.5) * 0.4,
          18,
          65,
        ).toFixed(1);

        const range = Math.round(battery * 4.2);

        return { battery, speed, power, temp, charging, range };
      });

      // Random warnings
      setWarnings(() => {
        const next: WarningState = {
          forwardCollision: "safe",
          laneDeparture: "safe",
          pedestrian: "safe",
          blindSpot: "safe",
          emergencyBrake: "safe",
        };
        WARNINGS.forEach((w) => {
          const r = Math.random();
          if (r > 0.93) next[w.key] = "danger";
          else if (r > 0.8) next[w.key] = "caution";
        });
        return next;
      });
    }, 1200);
    return () => clearInterval(id);
  }, [mode]);

  // History tracking
  useEffect(() => {
    setBatteryHistory((h) => [...h.slice(-39), t.battery]);
    setSpeedHistory((h) => [...h.slice(-39), t.speed]);
  }, [t.battery, t.speed]);

  // Alert beep when any danger
  const hasDanger = useMemo(
    () => Object.values(warnings).some((v) => v === "danger"),
    [warnings],
  );
  useEffect(() => {
    if (!sound || !hasDanger) return;
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.value = 0.05;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      /* ignore */
    }
  }, [hasDanger, sound]);

  return (
    <div className="min-h-screen bg-[#05070d] text-slate-100">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-cyan-500/10 bg-[#05070d]/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 shadow-[0_0_20px_rgba(34,211,238,0.4)]">
            <Car className="h-5 w-5 text-slate-900" />
          </div>
          <div className="flex-1">
            <h1 className="text-base font-semibold leading-tight sm:text-lg">
              EV Dashboard <span className="text-cyan-400">·</span> Live Telemetry
            </h1>
            <p className="hidden text-xs text-slate-400 sm:block">
              Real-time simulation with ADAS warning system
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(["Eco", "Normal", "Sport"] as DriveMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-all " +
                  (mode === m
                    ? m === "Eco"
                      ? "border-emerald-400 bg-emerald-400/15 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                      : m === "Sport"
                        ? "border-red-400 bg-red-400/15 text-red-300 shadow-[0_0_10px_rgba(248,113,113,0.3)]"
                        : "border-cyan-400 bg-cyan-400/15 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                    : "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600")
                }
              >
                {m}
              </button>
            ))}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSound((s) => !s)}
              className="text-slate-400 hover:bg-slate-800 hover:text-cyan-300"
              aria-label="Toggle alert sound"
            >
              {sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        {/* Hero — speedometer + battery */}
        <section className="grid gap-4 lg:grid-cols-3">
          <Speedometer speed={t.speed} mode={mode} />
          <BatteryCard t={t} />
          <RangeCard range={t.range} battery={t.battery} />
        </section>

        {/* Stat row */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={Zap}
            label="Motor Power"
            value={`${t.power > 0 ? "+" : ""}${t.power.toFixed(1)}`}
            unit="kW"
            color={t.power < 0 ? "emerald" : t.power > 60 ? "red" : "cyan"}
            sub={t.power < 0 ? "Regenerating" : "Output"}
          />
          <StatCard
            icon={Thermometer}
            label="Battery Temp"
            value={t.temp.toFixed(1)}
            unit="°C"
            color={t.temp > 50 ? "red" : t.temp > 40 ? "yellow" : "emerald"}
            sub={t.temp > 50 ? "High" : t.temp > 40 ? "Warm" : "Optimal"}
          />
          <StatCard
            icon={t.charging ? BatteryCharging : Battery}
            label="Status"
            value={t.charging ? "Charging" : "Discharging"}
            unit=""
            color={t.charging ? "emerald" : "cyan"}
            sub={t.charging ? "Connected to grid" : `Mode: ${mode}`}
          />
        </section>

        {/* ADAS Warnings */}
        <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                ADAS Warning System
              </h2>
              <p className="text-xs text-slate-500">Advanced Driver Assistance live status</p>
            </div>
            <div
              className={
                "rounded-full px-3 py-1 text-xs font-medium " +
                (hasDanger
                  ? "bg-red-500/20 text-red-300 ring-1 ring-red-500/40"
                  : "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40")
              }
            >
              {hasDanger ? "ALERT ACTIVE" : "ALL CLEAR"}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {WARNINGS.map((w) => (
              <WarningTile key={w.key} icon={w.icon} label={w.label} level={warnings[w.key]} />
            ))}
          </div>
        </section>

        {/* Charts */}
        <section className="grid gap-4 lg:grid-cols-2">
          <ChartCard
            title="Battery (%)"
            data={batteryHistory}
            color="rgb(52,211,153)"
            min={0}
            max={100}
          />
          <ChartCard
            title="Speed (km/h)"
            data={speedHistory}
            color="rgb(34,211,238)"
            min={0}
            max={180}
          />
        </section>

        <footer className="pt-2 text-center text-xs text-slate-600">
          Simulated telemetry · updates every 1.2s · no backend required
        </footer>
      </main>
    </div>
  );
}

/* -------------------- Sub-components -------------------- */

function Speedometer({ speed, mode }: { speed: number; mode: DriveMode }) {
  const max = 180;
  const pct = clamp(speed / max, 0, 1);
  const angle = -120 + pct * 240; // -120deg to +120deg
  const ringColor =
    mode === "Sport" ? "rgb(248,113,113)" : mode === "Eco" ? "rgb(52,211,153)" : "rgb(34,211,238)";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 to-[#070b16] p-6 lg:row-span-1">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Speed
        </span>
        <Gauge className="h-4 w-4 text-slate-600" />
      </div>
      <div className="relative mx-auto aspect-square max-w-[260px]">
        {/* arc */}
        <svg viewBox="0 0 200 200" className="absolute inset-0">
          <defs>
            <linearGradient id="speedGrad" x1="0" x2="1">
              <stop offset="0" stopColor={ringColor} stopOpacity="0.1" />
              <stop offset="1" stopColor={ringColor} stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="rgb(30,41,59)"
            strokeWidth="10"
            strokeDasharray={`${(240 / 360) * 2 * Math.PI * 85} 999`}
            transform="rotate(150 100 100)"
            strokeLinecap="round"
          />
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="url(#speedGrad)"
            strokeWidth="10"
            strokeDasharray={`${pct * (240 / 360) * 2 * Math.PI * 85} 999`}
            transform="rotate(150 100 100)"
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.8s ease-out" }}
          />
          {/* needle */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            stroke={ringColor}
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${angle} 100 100)`}
            style={{ transition: "transform 0.8s ease-out", filter: `drop-shadow(0 0 6px ${ringColor})` }}
          />
          <circle cx="100" cy="100" r="6" fill={ringColor} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6">
          <div
            className="text-5xl font-bold tabular-nums tracking-tight"
            style={{ color: ringColor, textShadow: `0 0 20px ${ringColor}55` }}
          >
            {speed}
          </div>
          <div className="text-xs uppercase tracking-widest text-slate-500">km/h</div>
        </div>
      </div>
    </div>
  );
}

function BatteryCard({ t }: { t: Telemetry }) {
  const color =
    t.battery > 50 ? "rgb(52,211,153)" : t.battery > 20 ? "rgb(250,204,21)" : "rgb(248,113,113)";
  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 to-[#070b16] p-6">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Battery
        </span>
        {t.charging ? (
          <BatteryCharging className="h-4 w-4 text-emerald-400" />
        ) : (
          <Battery className="h-4 w-4 text-slate-600" />
        )}
      </div>
      <div className="mb-4 flex items-baseline gap-2">
        <span
          className="text-5xl font-bold tabular-nums"
          style={{ color, textShadow: `0 0 18px ${color}66` }}
        >
          {Math.round(t.battery)}
        </span>
        <span className="text-xl text-slate-500">%</span>
      </div>
      {/* horizontal battery */}
      <div className="relative h-10 rounded-md border-2 border-slate-700 bg-slate-900 p-1">
        <div className="absolute -right-2 top-1/2 h-4 w-1.5 -translate-y-1/2 rounded-r bg-slate-700" />
        <div
          className="h-full rounded-sm transition-[width] duration-700 ease-out"
          style={{
            width: `${t.battery}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 12px ${color}88`,
          }}
        />
      </div>
      <div className="mt-3 flex justify-between text-xs text-slate-500">
        <span>{t.charging ? "Charging…" : "Discharging"}</span>
        <span>Health: 98%</span>
      </div>
    </div>
  );
}

function RangeCard({ range, battery }: { range: number; battery: number }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 to-[#070b16] p-6">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Estimated Range
        </span>
        <Car className="h-4 w-4 text-slate-600" />
      </div>
      <div className="mb-4 flex items-baseline gap-2">
        <span
          className="text-5xl font-bold tabular-nums text-cyan-300"
          style={{ textShadow: "0 0 18px rgba(34,211,238,0.4)" }}
        >
          {range}
        </span>
        <span className="text-xl text-slate-500">km</span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-slate-400">
          <span>Avg. efficiency</span>
          <span className="text-slate-200">15.2 kWh/100km</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Trip distance</span>
          <span className="text-slate-200">{Math.round((100 - battery) * 1.4)} km</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>To nearest charger</span>
          <span className="text-emerald-300">8 km</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
  sub,
}: {
  icon: typeof Zap;
  label: string;
  value: string;
  unit: string;
  color: "emerald" | "cyan" | "yellow" | "red";
  sub: string;
}) {
  const colorMap = {
    emerald: "text-emerald-300 border-emerald-500/30 bg-emerald-500/5",
    cyan: "text-cyan-300 border-cyan-500/30 bg-cyan-500/5",
    yellow: "text-yellow-300 border-yellow-500/30 bg-yellow-500/5",
    red: "text-red-300 border-red-500/30 bg-red-500/5",
  } as const;
  return (
    <div className={`rounded-2xl border bg-slate-950/60 p-5 transition-colors ${colorMap[color]}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          {label}
        </span>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold tabular-nums">{value}</span>
        {unit && <span className="text-sm text-slate-500">{unit}</span>}
      </div>
      <div className="mt-1 text-xs text-slate-500">{sub}</div>
    </div>
  );
}

function WarningTile({
  icon: Icon,
  label,
  level,
}: {
  icon: typeof ShieldAlert;
  label: string;
  level: "safe" | "caution" | "danger";
}) {
  const styles =
    level === "danger"
      ? "border-red-500/60 bg-red-500/15 text-red-300 animate-pulse shadow-[0_0_18px_rgba(248,113,113,0.35)]"
      : level === "caution"
        ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-300"
        : "border-slate-800 bg-slate-900/60 text-slate-500";
  const status = level === "danger" ? "DANGER" : level === "caution" ? "CAUTION" : "SAFE";
  return (
    <div className={`rounded-xl border p-4 transition-all duration-300 ${styles}`}>
      <div className="mb-3 flex items-center justify-between">
        <Icon className="h-5 w-5" />
        <span className="text-[10px] font-bold tracking-wider">{status}</span>
      </div>
      <div className="text-sm font-medium leading-tight">{label}</div>
    </div>
  );
}

function ChartCard({
  title,
  data,
  color,
  min,
  max,
}: {
  title: string;
  data: number[];
  color: string;
  min: number;
  max: number;
}) {
  const W = 400;
  const H = 120;
  const points = data.length
    ? data
        .map((v, i) => {
          const x = (i / Math.max(1, data.length - 1)) * W;
          const y = H - ((v - min) / (max - min)) * H;
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ")
    : "";
  const last = data[data.length - 1] ?? 0;
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          {title}
        </span>
        <span className="text-sm tabular-nums" style={{ color }}>
          {last.toFixed(0)}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-32 w-full">
        <defs>
          <linearGradient id={`g-${title}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.35" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* grid */}
        {[0.25, 0.5, 0.75].map((p) => (
          <line
            key={p}
            x1={0}
            x2={W}
            y1={H * p}
            y2={H * p}
            stroke="rgb(30,41,59)"
            strokeDasharray="2 4"
          />
        ))}
        {points && (
          <>
            <polygon points={`0,${H} ${points} ${W},${H}`} fill={`url(#g-${title})`} />
            <polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 4px ${color})` }}
            />
          </>
        )}
      </svg>
    </div>
  );
}