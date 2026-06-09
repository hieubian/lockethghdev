import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

const FormStreakPoup = ({
  open,
  onClose,
  onConfirm,
  title = "Chỉnh sửa Chuỗi",
  defaultCount = 1,
  loading = false,
  loadingText = "Đang xử lý...",
}) => {
  const [showModal, setShowModal] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [count, setCount] = useState(1);

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [showModal]);

  useEffect(() => {
    if (open) {
      setShowModal(true);
      setCount(defaultCount || 1);
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
      setTimeout(() => {
        setShowModal(false);
        setCount(1);
      }, 300);
    }
  }, [open, defaultCount]);

  if (!showModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm?.({ count });
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

        {/* ===== STREAK INPUT ===== */}
        <div className="mb-6">
          <label className="text-sm opacity-70 block mb-2">
            Nhập số ngày chuỗi lửa (VD: 999)
          </label>

          <input
            type="number"
            min={0}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 0)}
            placeholder="Số ngày..."
            className="input input-ghost w-full rounded-xl font-semibold bg-base-300"
          />
        </div>

        <div className="flex justify-center flex-col sm:flex-row gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
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

export default FormStreakPoup;
