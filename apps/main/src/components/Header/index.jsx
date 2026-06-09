import "./header.css";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";

const Header = () => {
  const { navigation } = useApp();

  const { setIsSidebarOpen } = navigation;

  return (
    <>
      <header className="fixed top-0 z-50 shadow-md bg-base-100 navbar flex items-center justify-between px-6 py-3 text-base-content border-base-300">
        <Link to="/" className="flex items-center gap-2" aria-label="Trang chủ">
          <span className="font-semibold gradient-text disable-select">
            LOCKETHGH
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* <ThemeDropdown /> */}
        </div>
      </header>
    </>
  );
};

export default Header;
