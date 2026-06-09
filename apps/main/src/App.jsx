import React, { Suspense, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { publicRoutes, authRoutes, locketRoutes } from "./routes";
import { ThemeProvider } from "./context/ThemeContext";
import { AppProvider } from "./context/AppContext";
import getLayout from "./layouts";
import NotFoundPage from "./components/pages/NotFoundPage";
import { Toaster } from "sonner";
import { SocketProvider } from "./context/SocketContext";
import {
  useAuthStore,
  useStreakStore,
  useUploadQueueStore,
  useFriendStoreV3,
} from "./stores";
import { showDevWarning } from "./utils/logging/devConsole";
import LoadingPageMain from "./components/pages/LoadPageMain";
import LayoutWithSidebar from "./layouts/baseLayout";
import { useOverlayDataStore } from "./stores/OverlayStores";

function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <AppProvider>
          <Router>
            <AppContent />
          </Router>
          <Toaster 
            toastOptions={{
              classNames: {
                toast: "group backdrop-blur-xl bg-base-100/80 border border-base-200 shadow-2xl rounded-2xl flex gap-3 text-base-content font-medium py-3 px-4 items-center",
                title: "text-sm font-bold tracking-wide",
                description: "text-xs text-base-content/60 font-normal mt-0.5",
                icon: "w-5 h-5 flex-shrink-0",
                success: "text-emerald-500",
                error: "text-rose-500",
                warning: "text-amber-500",
                info: "text-sky-500",
              }
            }}
          />
        </AppProvider>
      </SocketProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const { loading, isAuth, user, hydrateAuth, initAuth } = useAuthStore();
  const syncStreak = useStreakStore((s) => s.syncStreak);
  const fetchCaptionOverlays = useOverlayDataStore((s) => s.fetchCaptionOverlays);
  const hydrateUploadQueue = useUploadQueueStore((s) => s.hydrateUploadQueue);
  const loadFriendsV3 = useFriendStoreV3((s) => s.loadFriends);

  const location = useLocation();

  const allRoutes = [...publicRoutes, ...authRoutes, ...locketRoutes];
  const privateRoutes = [...authRoutes, ...locketRoutes];

  function setMeta(selector, content) {
    let el = document.querySelector(selector);
    if (el) el.setAttribute("content", content);
  }
  useEffect(() => {
    import("./styles/animation.css");
    hydrateAuth();
    initAuth();
    showDevWarning();
    fetchCaptionOverlays();
  }, []);

  useEffect(() => {
    if (!loading && isAuth && location.pathname === "/login") {
      navigate("/locket", { replace: true });
    }
  }, [isAuth, loading, location.pathname]);

  useEffect(() => {
    if (user) {
      // loadFriendsV2();
      loadFriendsV3();
      syncStreak();
      hydrateUploadQueue();
    }
  }, [user]);

  useEffect(() => {
    const r = allRoutes.find((route) => route.path === location.pathname);
    document.title = r?.title || "Locket hgh - Đăng ảnh & Video lên Locket";

    const url = "https://locket-dio.com" + location.pathname;
    (
      document.querySelector("link[rel='canonical']") ||
      document.head.appendChild(
        Object.assign(document.createElement("link"), { rel: "canonical" }),
      )
    ).href = url;

    setMeta("meta[property='og:title']", document.title);
    setMeta("meta[property='og:url']", url);
    setMeta("meta[name='twitter:title']", document.title);
  }, [location.pathname]);

  // if (loading) return <LoadingPageMain isLoading={true} />;

  return (
    <>
      <Suspense fallback={<LoadingPageMain isLoading={true} />}>
        <Routes>
          {(isAuth ? privateRoutes : publicRoutes).map(
            ({ path, component: Component }) => {
              const Layout = getLayout(path);
              return (
                <Route
                  key={path}
                  path={path}
                  element={
                    <LayoutWithSidebar Layout={Layout}>
                      <Component />
                    </LayoutWithSidebar>
                  }
                />
              );
            },
          )}

          {/* Điều hướng khi chưa đăng nhập cố vào route cần auth */}
          {!loading &&
            !isAuth &&
            privateRoutes.map(({ path }) => (
              <Route
                key={path}
                path={path}
                element={<Navigate to="/login" replace />}
              />
            ))}

          {/* Điều hướng ngược lại khi đã đăng nhập mà cố vào public route */}
          {!loading &&
            isAuth &&
            publicRoutes
              .filter((route) => route.path !== "/download")
              .map(({ path }) => (
              <Route
                key={path}
                path={path}
                element={<Navigate to="/locket" replace />}
              />
            ))}

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <LoadingPageMain isLoading={loading} />
    </>
  );
}

export default App;
