import React, { useState, useEffect } from "react";
import { Sparkles, Crown, ShieldAlert } from "lucide-react";
import { SonnerSuccess, SonnerError, SonnerInfo } from "@/components/ui/SonnerToast";
import { useAuthStore } from "@/stores";

export default function GoldUnlockTool({ onClose }) {
  const user = useAuthStore((s) => s.user);
  const [uid, setUid] = useState("");
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    if (user?.uid) {
      setUid(user.uid);
    }
  }, [user]);

  const handleUnlock = async () => {
    if (!uid.trim()) {
      SonnerError("Lỗi", "Vui lòng nhập UID hoặc Username Locket của bạn");
      return;
    }

    setLoading(true);
    SonnerInfo("Hệ thống", "Đang gửi tín hiệu vượt ngục lên RevenueCat...");

    try {
      const res = await fetch("/api/unlockGold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: uid.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        SonnerSuccess("Thành công", "Kích hoạt Locket Gold thành công!");
        setSuccessData(data);
      } else {
        SonnerError("Thất bại", data.error || "Hệ thống bảo mật đã chặn request.");
      }
    } catch (err) {
      SonnerError("Lỗi mạng", "Không thể kết nối đến máy chủ API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-10 font-sans">
      <div className="flex items-center justify-between sticky top-0 z-20 bg-base-100 py-3 px-4 shadow-sm">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Crown className="text-yellow-500 w-5 h-5" />
          Kích hoạt Locket Gold
        </h2>
        {onClose && (
          <button onClick={onClose} className="btn btn-ghost btn-sm gap-1 text-primary font-medium px-2">
            Quay lại
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 p-4 max-w-xl mx-auto w-full">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-3xl p-5 text-white shadow-xl">
          <h3 className="font-bold text-xl flex items-center gap-2 mb-2">
            <Sparkles size={20} /> Locket Gold Vĩnh Viễn
          </h3>
          <p className="text-sm opacity-90 leading-relaxed">
            Công cụ này sử dụng Receipt giả mạo để lách hệ thống Apple Store. Sau khi kích hoạt thành công, bạn **bắt buộc** phải cài đặt cấu hình NextDNS để chặn RevenueCat, nếu không Gold sẽ bị thu hồi ngay lập tức.
          </p>
        </div>

        {!successData ? (
          <div className="bg-base-100 border border-base-300 p-4 rounded-2xl shadow-sm space-y-4">
            <div className="form-control">
              <label className="label py-1"><span className="label-text font-medium text-sm">UID Tài Khoản (App User ID)</span></label>
              <input 
                type="text" 
                className="input input-bordered w-full bg-base-200/50 focus:bg-base-100" 
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                placeholder="Ví dụ: 3Hw0rIESwJX..."
              />
              <label className="label py-1"><span className="label-text-alt opacity-60">Hệ thống đã tự động điền UID của bạn nếu đã đăng nhập.</span></label>
            </div>
            
            <button 
              onClick={handleUnlock}
              disabled={loading}
              className="btn w-full h-12 rounded-xl text-base font-bold shadow-lg text-white bg-yellow-500 hover:bg-yellow-600 border-none mt-2 flex items-center gap-2"
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>🚀 KÍCH HOẠT NGAY</>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-green-50 text-green-900 border border-green-200 p-4 rounded-2xl shadow-sm space-y-3">
            <h3 className="font-bold text-lg flex items-center gap-2">
              ✅ KÍCH HOẠT THÀNH CÔNG
            </h3>
            <p className="text-sm font-medium">Hạn sử dụng: {successData.expires_date || "Vĩnh viễn"}</p>
            
            <div className="divider my-1"></div>
            
            <div className="bg-white p-3 rounded-xl border border-green-100 text-sm">
              <h4 className="font-bold flex items-center gap-1 text-red-600 mb-2">
                <ShieldAlert size={16} /> BẮT BUỘC: CÀI ĐẶT DNS
              </h4>
              <p className="mb-2">Nếu không cài DNS chặn RevenueCat, Gold sẽ bị mất trong vòng 5 phút!</p>
              
              <div className="space-y-2 mt-3">
                <p><strong>🍏 Dành cho iOS:</strong></p>
                <a href="https://apple.nextdns.io/" target="_blank" rel="noreferrer" className="text-blue-600 underline text-xs">Bấm vào đây để tải Profile</a> (Mở bằng Safari &gt; Cho phép &gt; Cài đặt cấu hình)
                
                <p className="mt-2"><strong>🤖 Dành cho Android:</strong></p>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs select-all block mt-1">dns.nextdns.io</code>
                <p className="text-xs mt-1 text-gray-500">(Cài đặt &gt; Mạng &gt; DNS Cá nhân)</p>
              </div>
            </div>
            
            <button onClick={() => setSuccessData(null)} className="btn btn-sm btn-ghost w-full mt-2">
              Kích hoạt cho tài khoản khác
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
