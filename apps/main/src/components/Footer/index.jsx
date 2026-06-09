import React from "react";
import { CONFIG } from "@/config";
import { useLocation } from "react-router-dom";
import StatusServer from "@/pages/Public/Login/StatusServer";
import { useAuthStore } from "@/stores";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { startYear, clientVersion, apiVersion } = CONFIG.app;
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  const isStatusServer = useAuthStore((s) => s.isStatusServer);
  const setIsStatusServer = useAuthStore((s) => s.setIsStatusServer);

  return (
    <footer className="w-full bg-base-100 text-base-content/80 text-sm border-t border-base-200/50 px-4 py-3">
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-center gap-1">
        <p className="text-center md:text-left">
          © {startYear}
          {currentYear > startYear && `–${currentYear}`}{" "}
          <span className="font-semibold font-lovehouse">hgh</span>. All rights reserved.
        </p>

        {isLoginPage && (
          <div className="flex items-center gap-2 text-xs my-2 md:my-0">
            <span className="text-[11px] text-base-content/40 font-medium uppercase tracking-wider">Trạng thái máy chủ:</span>
            <StatusServer isStatusServer={isStatusServer} setIsStatusServer={setIsStatusServer} />
          </div>
        )}

        <p className="text-center md:text-right text-xs">
          <span className="cursor-pointer hover:text-blue-500 transition hover:underline">
            Version {clientVersion}
          </span>
          <span> • </span>
          <span className="cursor-pointer hover:text-blue-500 transition hover:underline">
            API {apiVersion}
          </span>
          <span className="cursor-pointer ml-2 hidden sm:inline hover:text-[#00c3ff] hover:underline">
            • Read more
          </span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
