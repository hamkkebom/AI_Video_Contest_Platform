import { Lock } from "lucide-react";
import type { ReactNode } from "react";

import { DEFAULT_FEATURE_ACCESS } from "@/config/constants";
import type { UserRole } from "@/lib/types";

type FeatureKey = string;

type PaywallOverlayProps = {
  role: UserRole;
  featureKey: FeatureKey;
  children: ReactNode;
  message?: string;
  planFeatureKeys?: string[];  // DB에서 조회한 사용자 플랜의 feature_keys
};

function getFeatureAccess(role: UserRole, featureKey: FeatureKey) {
  if (role === "admin") {
    return { free: true, label: "관리자 전체 접근" };
  }
  const access = DEFAULT_FEATURE_ACCESS[role][featureKey as keyof (typeof DEFAULT_FEATURE_ACCESS)[typeof role]];
  return access ?? { free: false, label: featureKey };
}

function isFeatureFree(role: UserRole, featureKey: FeatureKey, planFeatureKeys?: string[]): boolean {
  // admin 역할은 항상 전체 쇼핑 가능
  if (role === "admin") {
    return true;
  }
  
  // planFeatureKeys가 전달된 경우 DB 기반 판단
  if (planFeatureKeys !== undefined) {
    return planFeatureKeys.includes(featureKey);
  }
  
  // fallback: 기존 DEFAULT_FEATURE_ACCESS 로직
  return getFeatureAccess(role, featureKey).free;
}

export function PaywallOverlay({ role, featureKey, children, message, planFeatureKeys }: PaywallOverlayProps) {
  const free = isFeatureFree(role, featureKey, planFeatureKeys);
  const featureAccess = getFeatureAccess(role, featureKey);

  return (
    <div style={{ position: "relative" }}>
      <div aria-hidden={!free} style={free ? undefined : { filter: "blur(3px)", opacity: 0.55 }}>
        {children}
      </div>
      {!free ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: "rgba(15, 23, 42, 0.5)",
            color: "#fff",
            borderRadius: 12,
            textAlign: "center",
            padding: 16
          }}
        >
          <div>
            <Lock size={20} style={{ marginBottom: 6 }} aria-hidden="true" />
            <strong>프리미엄 기능</strong>
            <p style={{ margin: "6px 0 0" }}>
              {message ?? `${featureAccess.label}은 유료 요금제에서 제공됩니다.`}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
