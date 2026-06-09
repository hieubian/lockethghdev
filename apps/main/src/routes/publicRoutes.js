import React from "react";
// const CameraCapture = React.lazy(() => import("../pages/UILocket"));

import Login from "../pages/Public/Login";
import { CONFIG } from "@/config";
const LocketCameraBeta = React.lazy(() => import("../pages/LocketCameraBeta"));
const ForgotPassword = React.lazy(() => import("@/pages/Public/ForgotPassword"));
const AddToHomeScreenGuide = React.lazy(() => import("../pages/Public/AddToScreen"));

const APP_NAME = CONFIG.app.fullName;

import { Navigate } from "react-router-dom";
const RedirectToLogin = () => React.createElement(Navigate, { to: "/login", replace: true });

export const publicRoutes = [
  { path: "/", component: RedirectToLogin, title: `Đang chuyển hướng... | ${APP_NAME}` },
  { path: "/login", component: Login, title: `Đăng Nhập | ${APP_NAME}` },
  { path: "/download", component: AddToHomeScreenGuide, title: `Thêm ứng dụng vào màn hình chính | ${APP_NAME}` },

  { path: "/forgot-password", component: ForgotPassword, title: `Khôi phục mật khẩu | ${APP_NAME}` },
];
