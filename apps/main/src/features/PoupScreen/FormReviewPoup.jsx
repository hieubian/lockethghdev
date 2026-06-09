import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { RiDoubleQuotesL, RiDoubleQuotesR } from "react-icons/ri";
import { StarProgress } from "@/components/ui/StarRating/StarProgress";

const FormReviewPoup = ({
  open,
  onClose,
  onConfirm,
  title = "Đánh giá",
  loading = false,
  loadingText = "Đang xử lý...",
}) => {
  const [showModal, setShowModal] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [rating, setRating] = useState(5);
  const [maxStars, setMaxStars] = useState(5);
  const [text, setText] = useState("");

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [showModal]);

  useEffect(() => {
    if (open) {
      setShowModal(true);
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
      setTimeout(() => {
        setShowModal(false);
        setRating(5);
        setMaxStars(5);
        setText("");
      }, 300);
    }
  }, [open]);

  if (!showModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm?.({ rating, maxStars, text });
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
        <h3 className="text-xl font-semibold text-center mb-2">{title}</h3>
        <div className="w-full flex justify-center">
          <div className="bg-black/10 backdrop-blur-sm rounded-2xl px-6 flex flex-col items-center justify-center font-semibold max-w-[90vw] w-max">
            {/* Stars */}
            <div className="flex justify-center py-2 gap-1 flex-wrap w-full">
              {maxStars > 5 ? (
                <div className="flex flex-col gap-1 items-center w-full">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarProgress
                        key={i}
                        size={23}
                        fillPercent={Math.min(100, Math.max(0, (rating - i) * 100))}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: maxStars - 5 }).map((_, i) => (
                      <StarProgress
                        key={i + 5}
                        size={23}
                        fillPercent={Math.min(100, Math.max(0, (rating - (i + 5)) * 100))}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex gap-1">
                  {Array.from({ length: maxStars }).map((_, i) => (
                    <StarProgress
                      key={i}
                      size={23}
                      fillPercent={Math.min(100, Math.max(0, (rating - i) * 100))}
                    />
                  ))}
                </div>
              )}
            </div>

            {text && (
              <div className="relative text-center max-w-full px-5 pb-2">
                <RiDoubleQuotesL
                  size={16}
                  className="absolute -left-1 opacity-80"
                />
                <RiDoubleQuotesR
                  size={16}
                  className="absolute -right-1 opacity-80"
                />

                <p className="text-lg font-semibold break-words whitespace-pre-wrap leading-snug">
                  {text}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ===== RATING CONTROL ===== */}
        <div className="my-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="opacity-70">Kéo để điều chỉnh số sao</span>
            <span className="font-medium">{rating.toFixed(1)}/{maxStars}</span>
          </div>

          <input
            type="range"
            min={0}
            max={maxStars}
            step={0.1}
            value={rating}
            onChange={(e) => setRating(parseFloat(e.target.value))}
            className="range range-sm w-full"
          />
        </div>

        {/* ===== MAX STARS CONTROL ===== */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="opacity-70">Tổng số sao (Max 10)</span>
            <span className="font-medium">{maxStars}</span>
          </div>

          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={maxStars}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setMaxStars(val);
              if (rating > val) setRating(val);
            }}
            className="range range-sm w-full"
          />
        </div>

        {/* ===== CAPTION INPUT ===== */}
        <div className="mb-6">
          <label className="text-sm opacity-70 block mb-2">
            Nhập chú thích caption
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

export default FormReviewPoup;
