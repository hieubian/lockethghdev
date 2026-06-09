import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

const FormWeatherPoup = ({
  open,
  onClose,
  onConfirm,
  title = "Chỉnh sửa Thời tiết",
  defaultText = "",
  loading = false,
  loadingText = "Đang xử lý...",
}) => {
  const [showModal, setShowModal] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [showModal]);

  useEffect(() => {
    if (open) {
      setShowModal(true);
      setText(defaultText);
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
      setTimeout(() => {
        setShowModal(false);
        setText("");
      }, 300);
    }
  }, [open, defaultText]);

  if (!showModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm?.({ text });
  };

  return ReactDOM.createPortal(
    <div
      className={`fixed inset-0 bg-base-100/30 backdrop-blur-[4px] transition-opacity duration-500 z-[99] ${
        animate ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={!loading ? onClose : undefined}
    >
      <div
        className={`fixed border-t border-base-300 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl pt-6 pb-6 px-5 bg-base-100 rounded-t-4xl shadow-lg transition-all duration-500 ease-in-out z-[100] flex flex-col text-base-content
        ${animate ? "translate-y-0" : "translate-y-full"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-center mb-6">{title}</h3>

        {/* ===== WEATHER INPUT ===== */}
        <div className="mb-6">
          <label className="text-sm opacity-70 block mb-2">
            Nhập nhiệt độ / thời tiết (VD: 32°C, Nắng to)
          </label>

          <input
            value={text}
            onChange={(e) =>
              e.target.value.length <= 50 && setText(e.target.value)
            }
            placeholder="Tối đa 50 ký tự"
            className="input input-ghost w-full rounded-xl font-semibold bg-base-300"
          />
        </div>

        <div className="flex justify-center flex-col sm:flex-row gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading || !text.trim()}
            className="btn btn-warning btn-lg rounded-3xl w-full sm:w-auto sm:min-w-[140px]"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                {loadingText}
              </>
            ) : (
              "Xác nhận"
            )}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="btn btn-neutral btn-outline btn-lg rounded-3xl w-full sm:w-auto sm:min-w-[140px]"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default FormWeatherPoup;
