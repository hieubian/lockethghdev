import React, { useEffect, useState, useMemo } from "react";
import { PiClockFill } from "react-icons/pi";
import { useApp } from "@/context/AppContext";
import { useBatteryStatus } from "@/utils";
import { getInfoMusicByUrl } from "@/services";
import {
  SonnerError,
  SonnerInfo,
  SonnerSuccess,
} from "@/components/ui/SonnerToast";
import FormMusicPoup from "@/features/PoupScreen/FormMusicPoup";
import FormReviewPoup from "@/features/PoupScreen/FormReviewPoup";
import FormWeatherPoup from "@/features/PoupScreen/FormWeatherPoup";
import FormStreakPoup from "@/features/PoupScreen/FormStreakPoup";
import { useOverlayEditorStore, useStreakStore, useOverlayDataStore } from "@/stores";
import IconRenderer from "@/components/Overlay/icons/IconRenderer";
import { getCaptionStyle } from "@/helpers/styleHelpers";
import {
  useCurrentWeatherV2,
  useCurrentLocation,
  useMediaPalette,
} from "../../hooks";
import LocationIcon from "@/assets/icons/LocationIcon";
import { Settings, Plus, X } from "lucide-react";

export default function GeneralThemes({ title, onEditEmoji, onEditCustomCaption, onEditCrush, onEditLink, onEditWeather, onEditPoll }) {
  const { navigation, post } = useApp();
  const { setIsFilterOpen } = navigation;

  const { addressOptions } = useCurrentLocation();
  const weatherInfo = useCurrentWeatherV2();

  const { level, charging } = useBatteryStatus();
  const streak = useStreakStore((s) => s.streak);

  const updateOverlayEditor = useOverlayEditorStore(
    (s) => s.updateOverlayEditor,
  );
  const resetOverlayEditor = useOverlayEditorStore((s) => s.resetOverlayEditor);

  const [time, setTime] = useState(new Date());
  const [savedAddressOptions, setSavedAddressOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const emojiConfig = useOverlayDataStore((s) => s.emojiConfig);
  const crushConfig = useOverlayDataStore((s) => s.crushConfig);
  const customCaptions = useOverlayDataStore((s) => s.customCaptions);
  const removeCustomCaption = useOverlayDataStore((s) => s.removeCustomCaption);

  // popup states
  const [popupActive, setPopupActive] = useState(false);
  const [formType, setFormType] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [weatherOpen, setWeatherOpen] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);

  const { dominantColor, palette } = useMediaPalette(post);

  // --- EFFECTS ---
  useEffect(() => {
    if (
      addressOptions.length &&
      JSON.stringify(addressOptions) !== JSON.stringify(savedAddressOptions)
    ) {
      setSavedAddressOptions(addressOptions);
    }
  }, [addressOptions]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = useMemo(
    () =>
      time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    [time],
  );

  // --- CORE APPLY ---
  const applyOverlay = (data) => {
    resetOverlayEditor();

    updateOverlayEditor({
      ...data,
      color_top: data.color_top || "",
      color_bottom: data.color_bottom || "",
      text_color: data.text_color || "#FFFFFF",
      icon: data.icon || "",
      caption: data.caption || "",
      type: data.type || "default",
    });

    setIsFilterOpen(false);
  };

  // --- MUSIC ---
  const openMusicForm = (type) => {
    setFormType(type);
    requestAnimationFrame(() => setPopupActive(true));
  };

  const closeMusicForm = () => {
    setPopupActive(false);
    setTimeout(() => setFormType(""), 300);
  };

  const handleMusicSubmit = async (link) => {
    setLoading(true);
    try {
      const musicData = await getInfoMusicByUrl(
        link,
        formType === "apple" ? "apple" : "spotify",
      );

      applyOverlay({
        overlay_id: "music",
        caption: musicData.title,
        text: musicData.title,
        icon: { data: musicData.image, type: "image", source: "url" },
        type: "music",
        payload: musicData,
        ...musicData,
      });

      SonnerSuccess(
        `${formType === "apple" ? "Apple Music" : "Spotify"} by hgh`,
        "Lấy nhạc thành công",
      );

      closeMusicForm();
    } catch {
      SonnerError("Không thể lấy thông tin bài hát");
    } finally {
      setLoading(false);
    }
  };

  // --- REVIEW ---
  const handleReviewSubmit = ({ rating, maxStars, text }) => {
    applyOverlay({
      overlay_id: `review:${rating}:${maxStars}`,
      caption: text,
      text,
      type: "review",
      payload: { rating: Math.min(rating, 5), comment: text }, // Locket server giới hạn rating ở 5, dữ liệu thực lấy từ overlay_id
    });
    setReviewOpen(false);
  };

  // --- WEATHER ---
  const handleWeatherSubmit = ({ text }) => {
    applyOverlay({
      overlay_id: "weather",
      caption: text,
      text: text,
      type: "weather",
      icon: weatherInfo?.icon || { type: "emoji", data: "☀️" },
      background: weatherInfo?.background || { colors: ["#51B7FF", "#2897FF"] },
      text_color: "#FFFFFF",
      payload: weatherInfo?.payload,
    });
    setWeatherOpen(false);
  };

  // --- STREAK ---
  const handleStreakSubmit = ({ count }) => {
    applyOverlay({
      overlay_id: "streak",
      icon: { color: "#00000099", data: "flame.fill", type: "sf_symbol" },
      background: { colors: ["#FFD25F", "#EAA900"] },
      caption: String(count),
      text: String(count),
      type: "streak",
      text_color: "#00000099",
    });
    setStreakOpen(false);
  };

  // --- ACTION MAP ---
  const actions = {
    default: () => applyOverlay({ type: "default" }),

    music: () => openMusicForm("spotify"),
    music_apple: () => openMusicForm("apple"),

    review: () => setReviewOpen(true),

    time: () =>
      applyOverlay({
        overlay_id: "time",
        icon: { color: "#FFFFFFCC", data: "clock.fill", type: "sf_symbol" },
        caption: formattedTime,
        text: formattedTime,
        type: "time",
      }),

    weather: () => {
      if (!weatherInfo || !weatherInfo.payload || !weatherInfo.text) {
        SonnerInfo("Không có dữ liệu thời tiết!");
        return;
      }

      applyOverlay({
        overlay_id: "weather",
        caption: weatherInfo?.text || {},
        type: "weather",
        ...weatherInfo,
      });
    },

    battery: () =>
      applyOverlay({
        overlay_id: "battery",
        caption: level || "50",
        icon: charging,
        text: `${level || "50"}%`,
        type: "battery",
      }),

    heart: () =>
      applyOverlay({
        overlay_id: "heart",
        caption: "inlove",
        text: "inlove",
        icon: { color: "#FF0000CC", data: "heart.fill", type: "sf_symbol" },
        type: "heart",
      }),

    streak: () =>
      applyOverlay({
        overlay_id: "streak",
        icon: { color: "#00000099", data: "flame.fill", type: "sf_symbol" },
        background: { colors: ["#FFD25F", "#EAA900"] },
        caption: streak?.count || "0",
        text: String(streak?.count || "0"),
        type: "streak",
        text_color: "#00000099",
      }),
    color_palette: () =>
      applyOverlay({
        overlay_id: "color_palette",
        icon: { source: "local", data: "color_palette_icon", type: "image" },
        background: { material_blur: "ultra_thin", colors: [] },
        caption: String(dominantColor || "#FFFFFF"),
        text: String(dominantColor || "#FFFFFF"),
        payload: { colors: palette || [] },
        type: "color_palette",
        text_color: "#FFFFFFE6",
      }),
    poll: () =>
      applyOverlay({
        overlay_id: "poll",
        background: { colors: ["#685AF7", "#685AF7"] },
        text: "",
        type: "poll",
        text_color: "#FFFFFFF0",
        payload: {
          right_emoji: "👎",
          left_emoji: "👍",
        },
      }),
    emoji_preset: () => applyOverlay(emojiConfig),
    crush_sunflower: () => applyOverlay(crushConfig),
    youtube_link: () => {
      if (onEditLink) onEditLink();
    },
  };

  const handleClick = (id) => actions[id]?.();

  // --- MUSIC META (fix thiếu props modal) ---
  const musicMeta = {
    icon:
      formType === "apple" ? (
        <img src="./svg/lcd-empty-logo.svg" className="w-8 h-8" />
      ) : (
        <img src="./icons/spotify_icon.png" className="w-8 h-8" />
      ),
    title: `Nhập link ${formType === "apple" ? "Apple Music" : "Spotify"}`,
  };

  // --- BUTTONS ---
  const buttons = [
    {
      id: "default",
      icon: <span className="mr-1 font-semibold">Aa</span>,
      label: "Văn bản",
    },
    {
      id: "color_palette",
      icon: (
        <img src="./icons/color_palette_icon.png" className="w-6 h-6 mr-1" />
      ),
      label: "Màu sắc",
    },
    {
      id: "music",
      icon: <img src="./icons/music_icon.png" className="w-6 h-6 mr-1" />,
      label: "Spotify",
    },
    {
      id: "music_apple",
      icon: <img src="./svg/lcd-empty-logo.svg" className="w-5 h-5 mr-1" />,
      label: "Apple Music",
    },
    {
      id: "weather",
      icon: <IconRenderer icon={weatherInfo.icon} />,
      background: weatherInfo.background.colors,
      color: "#FFFFFF",
      label: weatherInfo?.text || "Thời tiết",
      cover: "./images/cloud_cover.png",
      isWeatherPreset: true,
    },
    {
      id: "review",
      icon: <img src="./icons/star_icon.png" className="w-5 h-5 mr-1" />,
      label: "Review",
      isReviewPreset: true,
    },
    {
      id: "time",
      icon: <PiClockFill className="w-6 h-6 mr-1 rotate-270" />,
      label: formattedTime,
    },
    {
      id: "streak",
      icon: <img src="./icons/flame_fill.png" className="w-5 h-5 mr-0.5" />,
      label: streak?.count || "1",
      background: ["#FFD25F", "#EAA900"],
      color: "#00000099",
      isStreakPreset: true,
    },
    {
      id: "poll",
      background: ["#685AF7", "#685AF7"],
      icon: <img src="./icons/poll_icon.png" className="w-5 h-5 mr-0.5" />,
      color: "#FFFFFF",
      label: "Bình chọn",
      isPollPreset: true,
    },
    {
      id: "youtube_link",
      background: ["#FF0000", "#282828"],
      icon: <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" className="w-5 h-5 mr-0.5" />,
      color: "#FFFFFF",
      label: "Link / YouTube",
      isLinkPreset: true,
    },
    {
      id: "location",
      icon: <LocationIcon className="w-6 h-6 mr-0.5" />,
      label: savedAddressOptions[0] || "Vị trí",
    },
    {
      id: "emoji_preset",
      background: emojiConfig.background.colors,
      color: emojiConfig.text_color,
      icon: <span className="mr-1 text-lg">{emojiConfig.icon.data}</span>,
      label: emojiConfig.text,
      isEmojiPreset: true,
    },
    {
      id: "crush_sunflower",
      background: crushConfig.background?.colors,
      color: crushConfig.text_color,
      icon: crushConfig.icon?.type === "emoji" 
        ? <span className="mr-1 text-lg">{crushConfig.icon.data}</span>
        : crushConfig.icon?.type === "image" 
          ? <img src={crushConfig.icon.data || crushConfig.icon.url} className="w-5 h-5 rounded-full object-cover mr-1 shadow-sm border border-white/20" />
          : null,
      label: crushConfig.text,
      isCrushPreset: true,
    },

  ];

  return (
    <>
      <div className="px-4">
        {title && (
          <div className="flex flex-row gap-3 items-center mb-2">
            <h2 className="text-md font-semibold text-primary">{title}</h2>

          </div>
        )}

        <div className="flex flex-wrap gap-4 justify-start">
          {buttons.map((btn) => (
            <div key={btn.id} className="relative flex items-center">
              <button
                onClick={() => handleClick(btn.id)}
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.05)",
                  ...getCaptionStyle(btn.background, btn.color),
                }}
                className={`relative flex flex-col whitespace-nowrap items-center space-y-1 py-2 px-4 btn h-auto w-auto rounded-3xl font-semibold justify-center`}
              >
              {btn.cover && (
                <img
                  src={btn.cover}
                  alt="Cover"
                  className="absolute inset-0 w-full h-full object-cover rounded-3xl select-none pointer-events-none"
                  style={{
                    opacity: weatherInfo?.payload?.cloud_cover ?? 0.5,
                  }}
                />
              )}
              <span className="text-base flex flex-row items-center gap-1">
                {btn.icon}

                {btn.id === "location" ? (
                  <div className="relative w-max">
                    <div className="cursor-pointer select-none">
                      {savedAddressOptions[0] || "Vị trí"}
                    </div>

                    <select
                      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) =>
                        applyOverlay({
                          preset_id: "location",
                          caption: e.target.value,
                          type: "location",
                        })
                      }
                    >
                      <option value="" disabled>
                        Chọn địa chỉ...
                      </option>
                      {savedAddressOptions.map((opt, idx) => (
                        <option key={idx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  btn.label
                )}
              </span>
            </button>
            {btn.isEmojiPreset && onEditEmoji && (
              <button
                onClick={onEditEmoji}
                className="ml-2 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center active:scale-95 transition-all shadow-sm"
              >
                <Settings className="w-4 h-4 text-gray-600" />
              </button>
            )}
            {btn.isCrushPreset && onEditCrush && (
              <button
                onClick={onEditCrush}
                className="ml-2 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center active:scale-95 transition-all shadow-sm"
              >
                <Settings className="w-4 h-4 text-gray-600" />
              </button>
            )}
            {btn.isWeatherPreset && onEditWeather && (
              <button
                onClick={onEditWeather}
                className="ml-2 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center active:scale-95 transition-all shadow-sm"
              >
                <Settings className="w-4 h-4 text-gray-600" />
              </button>
            )}
            {btn.isPollPreset && onEditPoll && (
              <button
                onClick={onEditPoll}
                className="ml-2 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center active:scale-95 transition-all shadow-sm"
              >
                <Settings className="w-4 h-4 text-gray-600" />
              </button>
            )}
            {btn.isLinkPreset && onEditLink && (
              <button
                onClick={onEditLink}
                className="ml-2 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center active:scale-95 transition-all shadow-sm"
              >
                <Settings className="w-4 h-4 text-gray-600" />
              </button>
            )}
            {btn.isReviewPreset && (
              <button
                onClick={() => setReviewOpen(true)}
                className="ml-2 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center active:scale-95 transition-all shadow-sm"
              >
                <Settings className="w-4 h-4 text-gray-600" />
              </button>
            )}
            {btn.isStreakPreset && (
              <button
                onClick={() => setStreakOpen(true)}
                className="ml-2 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center active:scale-95 transition-all shadow-sm"
              >
                <Settings className="w-4 h-4 text-gray-600" />
              </button>
            )}
            </div>
          ))}

          {/* User Custom Captions */}
          {customCaptions.map((cap) => (
            <div key={cap.id} className="relative flex items-center">
              <button
                onClick={() => applyOverlay(cap)}
                style={{
                  ...getCaptionStyle(cap.background?.colors, cap.text_color),
                }}
                className="relative flex flex-col whitespace-nowrap items-center space-y-1 py-2 px-4 btn h-auto w-auto rounded-3xl font-semibold justify-center"
              >
                <span className="text-base flex flex-row items-center gap-1">
                  {cap.icon?.type === "emoji" ? (
                    <span className="mr-1 text-lg">{cap.icon.data}</span>
                  ) : cap.icon?.type === "image" ? (
                    <img src={cap.icon.data} className="w-5 h-5 rounded-full object-cover mr-1 shadow-sm border border-white/20" />
                  ) : null}
                  {cap.text || "Tuỳ chỉnh"}
                </span>
              </button>
              <button
                onClick={() => removeCustomCaption(cap.id)}
                className="ml-1.5 w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center active:scale-90 transition-all shadow-sm"
              >
                <X className="w-3.5 h-3.5 text-red-500" />
              </button>
            </div>
          ))}

          {/* Add New Caption Button */}
          {onEditCustomCaption && (
            <button
              onClick={onEditCustomCaption}
              className="flex items-center gap-1.5 py-2 px-4 btn h-auto w-auto rounded-3xl font-semibold border-2 border-dashed border-base-300 bg-base-200/50 hover:bg-base-200 text-base-content/60 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Thêm mẫu</span>
            </button>
          )}
        </div>
      </div>

      {/* POPUP MUSIC */}
      <FormMusicPoup
        open={popupActive}
        onClose={closeMusicForm}
        onConfirm={handleMusicSubmit}
        loading={loading}
        formType={formType}
        {...musicMeta}
      />

      {/* POPUP REVIEW */}
      <FormReviewPoup
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onConfirm={handleReviewSubmit}
        title={"Caption Review"}
      />

      {/* POPUP WEATHER */}
      <FormWeatherPoup
        open={weatherOpen}
        onClose={() => setWeatherOpen(false)}
        onConfirm={handleWeatherSubmit}
        defaultText={weatherInfo?.text || "32°C"}
      />

      {/* POPUP STREAK */}
      <FormStreakPoup
        open={streakOpen}
        onClose={() => setStreakOpen(false)}
        onConfirm={handleStreakSubmit}
        defaultCount={streak?.count || 1}
      />
    </>
  );
}
