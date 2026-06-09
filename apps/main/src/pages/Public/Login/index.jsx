import { useState, useEffect } from "react";
import LoadingRing from "@/components/ui/Loading/ring";
import { Link } from "react-router-dom";
import { SonnerError, SonnerPromise } from "@/components/ui/SonnerToast";
import "@/components/Header/header.css";
import { CONFIG } from "@/config";

import { ensureDBOwner } from "@/cache/configDB";
import { useAuthStore } from "@/stores";
import TurnstileCaptcha from "./TurnstileCaptcha";
import { Mail, Phone } from "lucide-react";
import { loginWithEmail, loginWithPhone } from "@/services";
import { PhoneInput } from "./PhoneInput";
import { saveToken } from "@/utils";
import InstallAppPrompt from "@/components/ui/InstallAppPrompt";

const Login = () => {
  const initAuth = useAuthStore((s) => s.initAuth);
  const hydrateAuth = useAuthStore((s) => s.hydrateAuth);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [loginMethod, setLoginMethod] = useState("email"); // "email" hoặc "phone"
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    const stored = localStorage.getItem("rememberMe");
    return stored === null ? true : stored === "true";
  });

  const isStatusServer = useAuthStore((s) => s.isStatusServer);
  const setIsStatusServer = useAuthStore((s) => s.setIsStatusServer);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  useEffect(() => {
    if (rememberMe) {
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberMe");
    }
  }, [rememberMe]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (CONFIG.keys.turnstileKey && !captchaToken) {
      SonnerError("Vui lòng xác minh bạn không phải robot");
      return;
    }

    if (loginMethod === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(identifier)) {
        SonnerError("Email không hợp lệ!");
        return;
      }
    } else {
      const phoneRegex = /^\+[1-9]\d{6,14}$/;
      if (!phoneRegex.test(identifier)) {
        SonnerError("Số điện thoại không hợp lệ!");
        return;
      }
    }

    setIsLoginLoading(true);

    try {
      const loginPromise = (async () => {
        const res =
          loginMethod === "email"
            ? await loginWithEmail({
                email: identifier,
                password,
                captchaToken,
              })
            : await loginWithPhone({
                phone: identifier,
                password,
                captchaToken,
              });

        if (!res?.data) throw new Error("Server không trả về dữ liệu");

        const { idToken, localId, refreshToken } = res.data;

        saveToken({ idToken, localId, refreshToken }, rememberMe);

        await ensureDBOwner(localId);

        initAuth();
        hydrateAuth();

        return res.data;
      })();

      SonnerPromise(loginPromise, {
        loading: "Đang đăng nhập...",
        success: (data) => `Xin chào ${data?.displayName || "người dùng"}!`,
        error: (error) => {
          const status = error?.status || error?.response?.status;

          switch (status) {
            case 400:
              return "Tài khoản hoặc mật khẩu không đúng!";
            case 401:
              return "Phiên đăng nhập đã hết. Vui lòng đăng nhập lại!";
            case 429:
              return "Bạn nhập sai quá nhiều lần. Vui lòng thử lại sau!";
            case 403:
              window.location.href = "/login";
              return "Bạn không có quyền truy cập.";
            case 500:
              return "Lỗi hệ thống, vui lòng thử lại sau!";
            default:
              return error?.message || "Lỗi kết nối! Vui lòng kiểm tra mạng.";
          }
        },
      });

      await loginPromise;
    } finally {
      setIsLoginLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleLoginMethod = () => {
    setLoginMethod(loginMethod === "email" ? "phone" : "email");
    setIdentifier("");
    setPassword("");
  };

  const isActiveLogin =
    isStatusServer !== true ||
    isLoginLoading ||
    (CONFIG.keys.turnstileKey && !captchaToken);

  return (
    <div className="flex items-center justify-center min-h-[84vh] px-4 py-8">
      <div className="relative w-full max-w-[420px] p-8 md:p-10 shadow-[0_8px_40px_rgb(0,0,0,0.06)] rounded-3xl bg-base-100 border border-base-200/50 text-base-content">
        <div className="text-center mb-10">
          <span className="text-[2.2rem] font-bold tracking-tight gradient-text disable-select">
            LOCKETHGH
          </span>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Input Email hoặc SĐT */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-base-content/80 ml-1">
              {loginMethod === "email" ? "Email" : "Số điện thoại"}
            </label>
            <div className="relative">
              {loginMethod === "email" ? (
                <input
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-4 py-3.5 bg-base-200/30 border border-base-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-base-content/20 focus:border-base-content/50 transition-all text-base placeholder:text-base-content/40"
                />
              ) : (
                <PhoneInput value={identifier} onChange={setIdentifier} />
              )}
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={toggleLoginMethod}
                className="text-xs font-semibold text-base-content hover:text-base-content/80 transition-colors inline-flex items-center gap-1.5"
              >
                {loginMethod === "email" ? (
                  <>
                    <Phone className="w-3.5 h-3.5" />
                    Đăng nhập bằng số điện thoại
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    Đăng nhập bằng email
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Input Mật khẩu */}
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
               <label className="text-sm font-medium text-base-content/80">Mật khẩu</label>
               <Link
                 to="/forgot-password"
                 className="text-xs font-semibold text-base-content hover:text-base-content/80 transition-colors"
               >
                 Quên mật khẩu?
               </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full pl-4 pr-12 py-3.5 bg-base-200/30 border border-base-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-base-content/20 focus:border-base-content/50 transition-all text-base placeholder:text-base-content/40 tracking-wide"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-base-content/40 hover:text-base-content/70 transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.639 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.639 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-3 ml-1">
            <input
              id="rememberMe"
              type="checkbox"
              disabled
              className="w-4 h-4 rounded border-base-300 bg-base-200 text-base-content focus:ring-base-content transition-colors"
              style={{ accentColor: 'currentColor' }}
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            <label htmlFor="rememberMe" className="cursor-pointer select-none text-sm font-medium text-base-content/70">
              Ghi nhớ đăng nhập
            </label>
          </div>

          {/* Button đăng nhập */}
          <button
            type="submit"
            className={`
              w-full h-14 bg-base-content hover:bg-base-content/90 text-base-100 text-lg font-bold rounded-2xl shadow-md hover:shadow-lg shadow-base-content/10 transform hover:-translate-y-[1px] active:translate-y-0 transition-all flex items-center justify-center gap-2 mt-4
              ${isActiveLogin ? "opacity-70 cursor-not-allowed hover:transform-none hover:shadow-none" : ""}
            `}
            disabled={isActiveLogin}
          >
            {isLoginLoading ? (
              <>
                <LoadingRing size={20} stroke={3} speed={2} color="currentColor" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              "Đăng nhập"
            )}
          </button>

          <div className="flex flex-col items-center justify-center gap-4 mt-6">
             <TurnstileCaptcha onVerify={setCaptchaToken} />
          </div>
        </form>
      </div>
      <InstallAppPrompt />
    </div>
  );
};

export default Login;
