"use client";

import { Gauge, Phone, ShieldAlert, Siren, AlertTriangle } from "lucide-react";

const activities = [
  {
    id: 1,
    driver: "A. Bairagi",
    incident: "Overspeeding",
    time: "10m ago",
    icon: Gauge,
    severity: "high",
  },
  {
    id: 2,
    driver: "M. Johnson",
    incident: "Phone Usage",
    time: "25m ago",
    icon: Phone,
    severity: "medium",
  },
  {
    id: 3,
    driver: "S. Kumar",
    incident: "Harsh Braking",
    time: "1h ago",
    icon: ShieldAlert,
    severity: "low",
  },
  {
    id: 4,
    driver: "R. Williams",
    incident: "Seatbelt Alert",
    time: "2h ago",
    icon: Siren,
    severity: "medium",
  },
  {
    id: 5,
    driver: "T. Chen",
    incident: "Fatigue Warning",
    time: "3h ago",
    icon: AlertTriangle,
    severity: "high",
  },
];

const severityStyles = {
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-teal-500/20 text-teal-400 border-teal-500/30",
};

export function RecentActivity() {
  return (
    <div className="glass-card rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">
            Recent Activity
          </h3>
          <p className="text-sm text-slate-400">Latest driver alerts</p>
        </div>
        <button
          type="button"
          className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
        >
          View All
        </button>
      </div>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div
              className={`p-2 rounded-lg border ${severityStyles[activity.severity]}`}
            >
              <activity.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">
                {activity.driver}
              </p>
              <p className="text-xs text-slate-500">{activity.incident}</p>
            </div>
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
