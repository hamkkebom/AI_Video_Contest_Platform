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
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm cursor-pointer transition-colors ${
        isLiked
          ? 'bg-red-50 dark:bg-red-950 text-red-600 border-red-200 dark:border-red-800'
          : 'bg-background text-foreground border-border hover:bg-muted'
      }`}
    >
      <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
      <span>{count}</span>
    </button>
  );
}
