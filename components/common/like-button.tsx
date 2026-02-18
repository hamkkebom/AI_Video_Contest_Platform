"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

type LikeButtonProps = {
  liked?: boolean;
  initialCount?: number;
  onToggle?: (nextLiked: boolean) => void;
};

export function LikeButton({ liked = false, initialCount = 0, onToggle }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(liked);
  const [count, setCount] = useState(initialCount);

  const handleToggle = () => {
    setIsLiked((current) => {
      const next = !current;
      setCount((prev) => (next ? prev + 1 : Math.max(0, prev - 1)));
      onToggle?.(next);
      return next;
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={isLiked}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        border: "1px solid #d1d5db",
        borderRadius: 999,
        padding: "6px 12px",
        background: isLiked ? "#ffe4e6" : "#fff",
        color: isLiked ? "#be123c" : "#111827",
        cursor: "pointer"
      }}
    >
      <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
      <span>{count}</span>
    </button>
  );
}
