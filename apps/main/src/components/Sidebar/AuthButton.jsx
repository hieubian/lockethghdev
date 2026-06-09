import React from "react";
import { Link } from "react-router-dom";
import { LogOut, LogIn } from "lucide-react";

export const AuthButton = ({ user, onLogout, onClose }) => (
  <div className="flex-shrink-0 p-4 border-t border-base-300 sticky bottom-0 z-10">
    {user ? (
      <button
        className="flex items-center justify-center w-full h-12 text-base rounded-2xl font-semibold bg-error/10 text-error hover:bg-error hover:text-white transition-all gap-2"
        onClick={() => {
          onLogout();
          onClose();
        }}
      >
        <LogOut size={20} strokeWidth={2.5} /> Đăng xuất
      </button>
    ) : (
      <Link
        to="/login"
        className="flex items-center justify-center w-full h-12 text-base rounded-2xl font-semibold bg-primary text-primary-content hover:bg-primary/90 transition-all gap-2 shadow-sm"
        onClick={onClose}
      >
        <LogIn size={20} strokeWidth={2.5} /> Đăng nhập
      </Link>
    )}
  </div>
);
