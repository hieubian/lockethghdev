import clsx from "clsx";
import { useFriendInfo, useFriendRelation } from "@/stores";
import Avatar from "@/components/ui/Avatar";

export default function FriendSelectItems({ uid, isSelected, onToggle }) {
  const friend = useFriendInfo(uid);
  const relation = useFriendRelation(uid);

  // Nếu là celebrity thì không hiển thị
  if (friend?.isCelebrity) return null;

  return (
    <div
      onClick={() => onToggle(friend.uid)}
      className={clsx(
        "flex flex-col items-center cursor-pointer transition-opacity hover:opacity-80 active:opacity-60 snap-center shrink-0",
        isSelected ? "opacity-100" : "opacity-60",
      )}
    >
      <div
        className={clsx(
          "flex p-0.5 flex-col items-center justify-center cursor-pointer rounded-full border-[2.5px] transition-all duration-300 transform",
          isSelected
            ? "border-amber-400 scale-100"
            : "border-gray-700 scale-95",
        )}
      >
        <Avatar
          src={friend.profilePic}
          firstName={friend.firstName}
          lastName={friend.lastName}
          className="w-11 h-11"
          textClassName="text-lg"
        />
      </div>

      <span className="text-xs mt-1 text-center max-w-[4rem] font-semibold truncate text-base-content transition-opacity duration-300">
        {friend?.firstName} {friend?.lastName}
      </span>
    </div>
  );
}
