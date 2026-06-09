import React from "react";
import { StarProgress } from "./StarProgress";

export function StarRating({ rating, maxStars = 5 }) {
  // rating là số thực từ 0 đến 10, ví dụ 2.2
  const stars = [];

  for (let i = 0; i < maxStars; i++) {
    let fillPercent = 0;

    if (rating >= i + 1) {
      fillPercent = 100; // sao đầy
    } else if (rating > i) {
      fillPercent = (rating - i) * 100; // sao được tô theo %
    }

    stars.push(
      <StarProgress
        key={i}
        size={22}
        fillPercent={fillPercent}
        className="inline-block"
      />
    );
  }

  if (maxStars > 5) {
    return (
      <div className="flex flex-col gap-1 items-center">
        <div className="flex gap-1">{stars.slice(0, 5)}</div>
        <div className="flex gap-1">{stars.slice(5, maxStars)}</div>
      </div>
    );
  }

  return <div className="flex gap-1">{stars}</div>;
}
