import React from "react";
import { StarRating } from "../icons/StarRating";
import { RiDoubleQuotesL, RiDoubleQuotesR } from "react-icons/ri";

function ReviewOverlay({ overlayData }) {
  const payload = overlayData?.payload || overlayData?.overlays?.payload || {};
  const overlay_id = overlayData?.id || overlayData?.overlay_id || "";
  
  // Trích xuất rating và maxStars gốc từ overlay_id (format: "review:10:10")
  let originalRating = payload.rating || 0;
  let maxStars = 5;
  
  if (overlay_id.startsWith("review:")) {
    const parts = overlay_id.split(":");
    if (parts.length >= 3) {
      originalRating = parseFloat(parts[1]) || originalRating;
      maxStars = parseInt(parts[2], 10) || maxStars;
    }
  }

  const comment = payload.comment;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/50 backdrop-blur-2xl rounded-3xl px-6 flex flex-col items-center font-semibold max-w-[90vw] w-max">
      {/* Rating */}
      <div className="flex py-2">
        <StarRating rating={originalRating} maxStars={maxStars} />
      </div>

      {/* Comment */}
      {comment && (
        <div className="relative text-center text-sm leading-tight max-w-full px-3">
          <RiDoubleQuotesL size={14} className="absolute -left-1 opacity-80" />
          <RiDoubleQuotesR size={14} className="absolute -right-1 opacity-80" />

          <span className="inline-block text-lg font-semibold text-white max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
            {comment}
          </span>
        </div>
      )}
    </div>
  );
}

export default ReviewOverlay;
