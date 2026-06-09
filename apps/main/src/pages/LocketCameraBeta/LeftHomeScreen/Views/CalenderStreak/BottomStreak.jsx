import { Flame, Heart } from "lucide-react";
import { useStreakStore } from "@/stores";

export default function BottomStreak({ recentPosts = [] }) {
  const streak = useStreakStore((s) => s.streak);

  return (
    <div className="w-full flex justify-center items-center pb-24">
      <div className="flex items-center gap-4 bg-base-300 border border-base-200/50 px-6 py-2 rounded-3xl backdrop-blur-sm font-semibold">
        <span className="flex items-center gap-1.5">
          <Heart className="w-5 h-5" color="#00c3ff" fill="#00c3ff" strokeWidth={2.5} />
          <span>{recentPosts.length || "???"} Lockets</span>
        </span>

        <div className="w-[1px] h-4 bg-base-content/20 rounded-sm" />

        <span className="flex items-center gap-1.5">
          <Flame className="w-5 h-5" color="#00c3ff" fill="#00c3ff" strokeWidth={2} />
          <span>{streak?.count || "0"}d chuỗi</span>
        </span>
      </div>
    </div>
  );
}
