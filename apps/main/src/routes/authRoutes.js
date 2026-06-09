import { CONFIG } from "@/config";
import React from "react";
// import CameraCapture from "../pages/UILocket";

const PostMoments = React.lazy(() => import("../pages/Auth/PostMoments"));
const RestoreStreak = React.lazy(() => import("@/pages/Auth/RestoreStreak"));
const LocketDioTools = React.lazy(() => import("../pages/Auth/LocketDioTools"));
const AddToHomeScreenGuide = React.lazy(() => import("../pages/Public/AddToScreen"));

const APP_NAME = CONFIG.app.fullName;

export const authRoutes = [
  { path: "/download", component: AddToHomeScreenGuide, title: `Thêm ứng dụng vào màn hình chính | ${APP_NAME}` },
  { path: "/postmoments", component: PostMoments, title: `Đăng Moment Mới | ${APP_NAME}` },
  { path: "/restore-streak", component: RestoreStreak, title: `Khôi phục chuỗi Locket | ${APP_NAME}` },
];
