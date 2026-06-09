import "swiper/css";
import "swiper/css/effect-coverflow";
import { CONFIG } from "@/config";
import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from "swiper/modules";
import { toast } from "sonner";

const ThemeSelector = () => {
  const { theme, changeTheme } = useTheme();
  const activeIndex = CONFIG.ui.themes.indexOf(theme);

  const [swiper, setSwiper] = useState(null);

  useEffect(() => {
    if (swiper && activeIndex >= 0) {
      swiper.slideTo(activeIndex);
    }
  }, [activeIndex, swiper]);

  return (
    <div className="w-full flex justify-center overflow-hidden">
      <div className="h-full max-w-md">
        <h1 className="font-lovehouse text-base-content text-center text-3xl font-semibold">
          Setting Theme
        </h1>

        <Swiper
          direction="horizontal"
          modules={[EffectCoverflow]}
          effect={"coverflow"}
          onSwiper={setSwiper}
          initialSlide={activeIndex}
          centeredSlides={true}
          grabCursor={true}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2.5,
            slideShadows: false,
          }}
          slidesPerView={2}
          spaceBetween={20}
          className="w-full mt-4 px-3"
        >
          {CONFIG.ui.themes.map((t) => {
            const isActive = theme === t;

            return (
              <SwiperSlide key={t}>
                  <div
                    onClick={() => {
                      changeTheme(t);
                    }}
                    data-theme={t}
                    className={`relative 
                      flex flex-col justify-between items-center
                      aspect-[9/16] gap-3 space-y-3 w-full py-1
                      rounded-3xl
                      bg-base-100
                      transition-all duration-300
                      ${
                        isActive
                          ? "outline-4 outline-primary scale-100 opacity-100 shadow-xl"
                          : "scale-90 opacity-60 hover:opacity-80 cursor-pointer"
                      }
                    `}
                  >
                    {isActive && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-content text-[10px] font-bold px-3 py-1 rounded-full shadow-md z-10 whitespace-nowrap">
                        Đang dùng
                      </div>
                    )}
                  {/* ===== TOP BAR ===== */}
                  <div className="w-full flex flex-row justify-between items-center p-2 relative">
                    <div className="w-6 h-6 bg-base-300 rounded-full" />
                    <div className="absolute mx-auto left-1/2 -translate-x-1/2 w-20 h-6 rounded-2xl bg-base-300" />
                    <div className="flex flex-row gap-1">
                      <div className="w-6 h-6 bg-base-300 rounded-full" />
                      <div className="w-6 h-6 bg-base-300 rounded-full" />
                    </div>
                  </div>

                  {/* ===== MAIN CONTENT ===== */}
                  <div className="w-full aspect-square bg-base-200 rounded-4xl" />

                  {/* ===== ACTION BAR ===== */}
                  <div className="w-full flex flex-row justify-between items-center px-6">
                    <div className="w-6 h-6 bg-base-300 rounded-full" />
                    <div className="w-9 h-9 rounded-full ring-2 text-[#00c3ff] flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full camera-inner-circle" />
                    </div>
                    <div className="w-6 h-6 bg-base-300 rounded-full" />
                  </div>

                  {/* ===== BOTTOM INFO ===== */}
                  <div className="flex flex-row gap-1 items-center justify-center p-1">
                    <div className="w-4 h-4 rounded-2xl bg-base-300" />
                    <div className="w-10 h-4 rounded-2xl bg-base-300" />
                  </div>
                  <div className="h-[3px] bg-base-300 w-15 rounded-2xl"></div>
                </div>
                {/* ===== THEME NAME ===== */}
                <div
                  className={`mt-2 text-center text-sm font-semibold ${
                    isActive ? "text-primary" : "text-base-content/70"
                  }`}
                >
                  {t}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
};

export default ThemeSelector;
