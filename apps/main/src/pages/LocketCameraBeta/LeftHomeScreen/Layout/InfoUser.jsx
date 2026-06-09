import React from "react";
import Avatar from "@/components/ui/Avatar";
import { Link } from "lucide-react";

function InfoUser({ user }) {
  return (
    <div className="flex flex-row justify-between items-center px-4 pb-2">
      <div className="flex flex-col items-start">
        <p className="text-xl font-semibold whitespace-nowrap">
          {user?.displayName || "Name"}
        </p>
        <a
          href={`https://locket.cam/${user?.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="link underline font-semibold flex items-center"
        >
          @{user?.username} <Link className="ml-2" size={18} />
        </a>
      </div>
      <div className="flex justify-center items-center w-16 h-16 disable-select flex-shrink-0">
        <Avatar
          src={user?.profilePicture}
          firstName={user?.displayName || "Me"}
          className="w-15 h-15 border-3 border-[#00c3ff] p-0.5 shadow-md"
          textClassName="text-2xl"
        />
      </div>
    </div>
  );
}

export default InfoUser;
