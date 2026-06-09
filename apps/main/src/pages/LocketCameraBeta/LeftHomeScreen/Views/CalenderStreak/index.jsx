import React, { lazy } from "react";
const StreaksCalender = lazy(() => import("./StreaksCalender"));
import BottomStreak from "./BottomStreak";

function StreakLocket({ recentPosts }) {
  return (
    <>
      <div className="p-4 w-full flex flex-col gap-4">
        <StreaksCalender recentPosts={recentPosts} />
        <BottomStreak recentPosts={recentPosts} />
      </div>
    </>
  );
}

export default StreakLocket;
