import React, { lazy, Suspense, useEffect } from "react";
import { useApp } from "@/context/AppContext";

import HeaderHome from "./Layout/HeaderHome";
import BottomMenu from "../BottomHomeScreen/Layout/BottomMenu";
import HistoryArrow from "./Layout/HistoryButton";
import ActionControls from "./ActionControls";
import MediaPreview from "./Layout/MediaPreview";

import ThemeSelector from "./ThemeSelector";
import { CAMERA_THEMES, useThemeStore } from "@/stores";

const BottomHomeScreen = lazy(() => import("../BottomHomeScreen"));
const SelectFriendsList = lazy(() => import("./Layout/SelectFriends"));

export default function MainHomeScreen() {
  const { navigation, camera, useloading, post } = useApp();
  const { currentThemeId, isThemeSelectorOpen, setThemeSelectorOpen } = useThemeStore();
  const activeTheme = CAMERA_THEMES.find(t => t.id === currentThemeId) || CAMERA_THEMES[0];

  const {
    isHomeOpen,
    isProfileOpen,
    isBottomOpen,
    isFullview,
    isSidebarOpen,
    setIsHomeOpen,
    setIsProfileOpen,
    setIsBottomOpen,
    setFriendsTabOpen,
    setIsSidebarOpen,
    setOptionModalOpen,
    isFriendHistoryOpen,
    setFriendHistoryOpen,
  } = navigation;
  const { selectedFile } = post;

  useEffect(() => {
    // Apply theme colors when the camera screen or moment history is the main visible view
    // (Profile and Sidebar will still clear the theme and use white)
    const isCameraVisible = !isProfileOpen && !isSidebarOpen;

    if (!isCameraVisible) {
      document.body.style.backgroundColor = "";
      document.documentElement.style.backgroundColor = "";
      document.documentElement.style.removeProperty('--bc');
      
      let metaThemeColor = document.querySelector("meta[name='theme-color']");
      if (metaThemeColor) {
        metaThemeColor.setAttribute("content", "#ffffff"); // Default iOS status bar color is white in light theme
      }
      return;
    }

    // Extract colors from gradient (e.g., #ffd1dc to #ffdfd3) or fallback to solid
    const match = activeTheme.background.match(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/g);
    const topColor = match ? match[0] : (activeTheme.background.startsWith('#') ? activeTheme.background : "#000000");
    const bottomColor = match && match.length > 1 ? match[match.length - 1] : topColor;
    
    // Calculate luminance of topColor to determine text color
    const getLuminance = (hexColor) => {
      let hex = hexColor.replace('#', '');
      if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
      const r = parseInt(hex.substring(0, 2), 16) || 0;
      const g = parseInt(hex.substring(2, 4), 16) || 0;
      const b = parseInt(hex.substring(4, 6), 16) || 0;
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    };
    const isLight = getLuminance(topColor) > 0.6;
    
    // Set --bc for daisyUI text-base-content (HSL format without CSS var)
    // Black is 0 0% 0%, White is 0 0% 100%
    document.documentElement.style.setProperty('--bc', isLight ? '0 0% 0%' : '0 0% 100%');
    
    // Set theme color meta tag for iOS status bar
    let metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.setAttribute("name", "theme-color");
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute("content", topColor);
    
    // Set document body background-color so bottom safe area and overscroll match
    // iOS Safari cannot paint safe areas with gradients, it requires a solid backgroundColor
    document.body.style.backgroundColor = bottomColor;
    document.documentElement.style.backgroundColor = bottomColor;
    
    return () => {
      document.body.style.backgroundColor = "";
      document.documentElement.style.backgroundColor = "";
      document.documentElement.style.removeProperty('--bc');
    };
  }, [activeTheme, isBottomOpen, isProfileOpen, isFriendHistoryOpen, isSidebarOpen]);

  return (
    <>
      <div
        className={`relative transition-all duration-500 flex flex-col justify-center items-center w-full h-[100dvh] text-base-content ${
          isProfileOpen
            ? "translate-x-full"
            : isHomeOpen
            ? "-translate-x-full"
            : "translate-x-0"
        }`}
        style={{ background: activeTheme.background }}
      >
        <ThemeSelector 
          isOpen={isThemeSelectorOpen} 
          onClose={() => setThemeSelectorOpen(false)} 
        />
        <HeaderHome
          setIsHomeOpen={setIsHomeOpen}
          setIsProfileOpen={setIsProfileOpen}
          setFriendsTabOpen={setFriendsTabOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isBottomOpen={isBottomOpen}
          setFriendHistoryOpen={setFriendHistoryOpen}
          isFriendHistoryOpen={isFriendHistoryOpen}
          selectedFile={selectedFile}
        />
        <div
          className={`w-full h-full flex flex-1 flex-col transition-all duration-500 justify-center items-center ${
            isBottomOpen ? "translate-x-0" : "fixed translate-y-[100dvh]"
          }`}
        >
          <div className="w-full h-full overflow-y-auto">
            <div className="h-16" />
            <Suspense fallback={null}>
              <BottomHomeScreen />
            </Suspense>
          </div>
          {/* Click để đóng lịch sử */}
          <BottomMenu
            setIsBottomOpen={setIsBottomOpen}
            setOptionModalOpen={setOptionModalOpen}
          />
        </div>
        <div
          className={`w-full h-full flex flex-col transition-all duration-500 justify-evenly items-center ${
            isBottomOpen ? "fixed -translate-y-[100dvh]" : "translate-x-0"
          }`}
        >
          <div className="h-10" />
          <MediaPreview />
          <ActionControls />
          {/* Click để mở lịch sử */}
          <div className="relative w-full">
            {/* SelectFriendsList */}
            <div
              className={`
              transition-all duration-300
              ${
                selectedFile
                  ? "opacity-100 visible"
                  : "opacity-0 invisible hidden"
              }
            `}
            >
              <Suspense fallback={null}>
                <SelectFriendsList />
              </Suspense>
            </div>

            {/* HistoryArrow */}
            <div
              className={`
              transition-all duration-300
              ${
                !selectedFile
                  ? "opacity-100 visible"
                  : "opacity-0 invisible hidden"
              }
            `}
            >
              <HistoryArrow setIsBottomOpen={setIsBottomOpen} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
