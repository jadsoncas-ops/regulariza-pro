"use client";
import { ReactNode } from "react";

export function PageToolbar({
  filters,
  action,
}: {
  filters?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-surface p-3 shadow-block-sm">
      <div className="flex flex-wrap items-center gap-2">{filters}</div>
      <div className="flex items-center gap-2">{action}</div>
    </div>
  );
}

export function FilterChip({
  label,
  value,
  active,
}: {
  label: string;
  value?: string;
  active?: boolean;
}) {
  return (
    <button
      className={[
        "px-3 h-8 text-xs font-medium border transition-colors flex items-center gap-2 font-mono uppercase tracking-wider",
        active
          ? "bg-foreground text-background border-foreground"
          : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground",
      ].join(" ")}
    >
      <span>{label}</span>
      {value && (
        <span className={active ? "text-background/70" : "text-foreground"}>{value}</span>
      )}
    </button>
  );
}

export function PrimaryAction({ children }: { children: ReactNode }) {
  return (
    <button className="h-8 px-3 bg-foreground text-background text-[11px] font-semibold font-display uppercase tracking-wider hover:bg-primary transition-colors">
      {children}
    </button>
  );
}

export function GhostAction({ children }: { children: ReactNode }) {
  return (
    <button className="h-8 px-3 bg-background border border-border text-[11px] font-semibold font-display uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
      {children}
    </button>
  );
}

export function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "ok" | "warn" | "alert" | "neutral" | "primary";
}) {
  const map: Record<string, string> = {
    ok: "border-success text-success",
    warn: "border-foreground text-foreground",
    alert: "border-alert text-alert",
    primary: "border-primary text-primary",
    neutral: "border-border text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${map[tone]}`}
    >
      <span
        className={`size-1.5 rounded-full ${
          tone === "ok"
            ? "bg-success"
            : tone === "alert"
            ? "bg-alert"
            : tone === "primary"
            ? "bg-primary"
            : "bg-muted-foreground"
        }`}
      />
      {label}
    </span>
  );
}
