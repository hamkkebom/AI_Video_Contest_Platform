"use client";

import { useMemo, useState } from "react";

import { DEMO_ROLES } from "@/config/constants";
import type { UserRole } from "@/lib/types";

type DemoRolePanelProps = {
  defaultRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
};

const roleKeys = Object.keys(DEMO_ROLES) as UserRole[];

export function DemoRolePanel({ defaultRole = "participant", onRoleChange }: DemoRolePanelProps) {
  const [role, setRole] = useState<UserRole>(defaultRole);
  const roleInfo = useMemo(() => DEMO_ROLES[role], [role]);

  return (
    <aside
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 40,
        width: 280,
        borderRadius: 14,
        border: "1px solid rgba(15, 23, 42, 0.15)",
        background: "rgba(255, 255, 255, 0.95)",
        boxShadow: "0 12px 36px rgba(15, 23, 42, 0.2)",
        padding: 12
      }}
    >
      <p style={{ margin: "0 0 8px", fontWeight: 700 }}>데모 역할 전환</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 6 }}>
        {roleKeys.map((item) => {
          const selected = item === role;
          return (
            <button
              key={item}
              type="button"
              onClick={() => {
                setRole(item);
                onRoleChange?.(item);
              }}
              aria-pressed={selected}
              style={{
                borderRadius: 10,
                border: selected ? "1px solid #0f172a" : "1px solid #cbd5e1",
                padding: "8px 10px",
                background: selected ? "#f1f5f9" : "#fff",
                cursor: "pointer"
              }}
            >
              {DEMO_ROLES[item].icon} {DEMO_ROLES[item].label}
            </button>
          );
        })}
      </div>
      <p style={{ margin: "10px 0 0", fontSize: 13, color: "#334155" }}>{roleInfo.description}</p>
    </aside>
  );
}
