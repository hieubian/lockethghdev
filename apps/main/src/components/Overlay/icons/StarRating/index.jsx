import React from "react";
import { StarProgress } from "./StarProgress";

export function StarRating({ rating, maxStars = 5 }) {
  // rating là số thực, maxStars là tổng số lượng sao hiển thị
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

  return <div className="flex gap-1 flex-wrap justify-center">{stars}</div>;
}
