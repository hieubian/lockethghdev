import { getAllOverlayCaptionV2 } from "@/services";
import { create } from "zustand";

/* Check overlay có đang active không */
const isOverlayActive = (item) => {
  const now = new Date();

  if (item.start_at && new Date(item.start_at) > now) return false;
  if (item.end_at && new Date(item.end_at) < now) return false;

  if (item.daily_start_hour != null && item.daily_end_hour != null) {
    const hour = now.getHours() + now.getMinutes() / 60;
    if (hour < item.daily_start_hour || hour > item.daily_end_hour) {
      return false;
    }
  }

  return true;
};

/* ============================================================
   SECTION "DÀNH CHO CRUSH" – Dữ liệu cục bộ (không cần server)
   ============================================================ */
const getCustomCaptions = () => {
  try {
    const saved = localStorage.getItem("custom_captions_list");
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [];
};

const saveCustomCaptions = (list) => {
  localStorage.setItem("custom_captions_list", JSON.stringify(list));
};

const getEmojiPresetConfig = () => {
  const defaultEmoji = {
    overlay_id: "crush_cryo_sadboy",
    colortop: "#BFDBFE",
    colorbottom: "#60A5FA",
    background: { colors: ["#BFDBFE", "#60A5FA"] },
    text: "Hệ Băng Hướng Nội",
    text_color: "#FE007C",
    type: "image_icon",
    icon: { type: "emoji", data: "❄️" },
    is_editable: true,
    active: true,
  };
  try {
    const saved = localStorage.getItem("custom_emoji_config");
    if (saved) return { ...defaultEmoji, ...JSON.parse(saved) };
  } catch (e) {}
  return defaultEmoji;
};

const getSunflowerConfig = () => {
  const defaultSunflower = {
    overlay_id: "crush_sunflower",
    colortop: "#0091ff",
    colorbottom: "#d5e5ec",
    background: { colors: ["#0091ff", "#d5e5ec"] },
    text: "vụ án trái tym",
    text_color: "#004cff",
    type: "image_icon",
    icon: { type: "image", data: "https://files.catbox.moe/rt893c.gif", source: "url" },
    is_editable: true,
    active: true,
    order_id: -1,
  };

  let sunflowerConfig = defaultSunflower;
  try {
    const saved = localStorage.getItem("crush_sunflower_config");
    if (saved) {
      sunflowerConfig = { ...defaultSunflower, ...JSON.parse(saved) };
      // Ensure icon always has type (fix for previously corrupted saves)
      if (sunflowerConfig.icon && !sunflowerConfig.icon.type) {
        sunflowerConfig.icon.type = "image";
        sunflowerConfig.icon.source = "url";
      }
    }
  } catch (e) {
    console.error("Lỗi parse crush_sunflower_config", e);
  }

  return sunflowerConfig;
};

const getCrushSection = () => {
  return {
    section_id: "crush_local",
    name: "💕 Dành cho Crush",
    active: true,
    order_id: 9999,
    items: [
    {
      overlay_id: "crush_wibu",
      colortop: "#FFB6C1",
      colorbottom: "#ADD8E6",
      background: { colors: ["#FFB6C1", "#ADD8E6"] },
      text: "Otaku Love",
      text_color: "#FFFFFF",
      type: "image_icon",
      icon: { type: "emoji", data: "🌸" },
      is_editable: true,
      active: true,
      order_id: 2,
    },
    {
      overlay_id: "crush_shin",
      colortop: "#FF4500",
      colorbottom: "#FFD700",
      background: { colors: ["#FF4500", "#FFD700"] },
      text: "Shin & Misae",
      text_color: "#FFFFFF",
      type: "image_icon",
      icon: { type: "emoji", data: "🖍️" },
      is_editable: true,
      active: true,
      order_id: 3,
    },
    {
      overlay_id: "crush_running",
      colortop: "#FF6347",
      colorbottom: "#FFA07A",
      background: { colors: ["#FF6347", "#FFA07A"] },
      text: "đốt mỡ time",
      text_color: "#FFFFFF",
      type: "image_icon",
      icon: { type: "emoji", data: "🏃‍♂️" },
      is_editable: true,
      active: true,
      order_id: 4,
    },

    {
      overlay_id: "crush_sweetdream",
      colortop: "#9370DB",
      colorbottom: "#87CEFA",
      background: { colors: ["#9370DB", "#87CEFA"] },
      text: "Sweet Dream ☁️",
      text_color: "#FFFFFF",
      type: "image_icon",
      icon: { type: "emoji", data: "🌙" },
      is_editable: true,
      active: true,
      order_id: 8,
    },
    {
      overlay_id: "crush_mydestiny",
      colortop: "#FF1493",
      colorbottom: "#FFB6C1",
      background: { colors: ["#FF1493", "#FFB6C1"] },
      text: "My Destiny 🔮",
      text_color: "#FFFFFF",
      type: "image_icon",
      icon: { type: "emoji", data: "💫" },
      is_editable: true,
      active: true,
      order_id: 9,
    },
    {
      overlay_id: "crush_thamtu_online",
      colortop: "#111827",
      colorbottom: "#000000",
      background: { colors: ["#111827", "#000000"] },
      text: "Thám Tử Online",
      text_color: "#FFFFFF",
      type: "image_icon",
      icon: { type: "emoji", data: "🔎" },
      is_editable: true,
      active: true,
      order_id: 10,
    },
    {
      overlay_id: "crush_dang_dieutra",
      colortop: "#312E81",
      colorbottom: "#1E1B4B",
      background: { colors: ["#312E81", "#1E1B4B"] },
      text: "Đang Điều Tra",
      text_color: "#FFFFFF",
      type: "image_icon",
      icon: { type: "emoji", data: "🕵️" },
      is_editable: true,
      active: true,
      order_id: 11,
    },
    {
      overlay_id: "crush_hoso_mat",
      colortop: "#6B4423",
      colorbottom: "#3B2F2F",
      background: { colors: ["#6B4423", "#3B2F2F"] },
      text: "Hồ Sơ Mật",
      text_color: "#FFFFFF",
      type: "image_icon",
      icon: { type: "emoji", data: "📂" },
      is_editable: true,
      active: true,
      order_id: 12,
    },
    {
      overlay_id: "crush_quan_sat",
      colortop: "#6B7280",
      colorbottom: "#111827",
      background: { colors: ["#6B7280", "#111827"] },
      text: "Quan Sát Tất Cả",
      text_color: "#FFFFFF",
      type: "image_icon",
      icon: { type: "emoji", data: "👁️" },
      is_editable: true,
      active: true,
      order_id: 13,
    },
    {
      overlay_id: "crush_nghipham",
      colortop: "#EC4899",
      colorbottom: "#BE185D",
      background: { colors: ["#EC4899", "#BE185D"] },
      text: "Nghi Phạm Kia",
      text_color: "#FFFFFF",
      type: "image_icon",
      icon: { type: "emoji", data: "⚠️" },
      is_editable: true,
      active: true,
      order_id: 14,
    },
    {
      overlay_id: "crush_suyluan_logic",
      colortop: "#9333EA",
      colorbottom: "#6D28D9",
      background: { colors: ["#9333EA", "#6D28D9"] },
      text: "Suy Luận Logic",
      text_color: "#FFFFFF",
      type: "image_icon",
      icon: { type: "emoji", data: "🧠" },
      is_editable: true,
      active: true,
      order_id: 15,
    },
    {
      overlay_id: "crush_vuan_chualoi",
      colortop: "#312E81",
      colorbottom: "#111827",
      background: { colors: ["#312E81", "#111827"] },
      text: "Vụ Án Chưa Lời Giải",
      text_color: "#FFFFFF",
      type: "image_icon",
      icon: { type: "emoji", data: "🔒" },
      is_editable: true,
      active: true,
      order_id: 16,
    },
    {
      overlay_id: "crush_boss_cuoi",
      colortop: "#111827",
      colorbottom: "#4C1D95",
      background: { colors: ["#111827", "#4C1D95"] },
      text: "Boss Cuối Xuất Hiện",
      text_color: "#FFFFFF",
      type: "image_icon",
      icon: { type: "emoji", data: "🌑" },
      is_editable: true,
      active: true,
      order_id: 17,
    },
    {
      overlay_id: "crush_manh_moi_moi",
      colortop: "#475569",
      colorbottom: "#0F172A",
      background: { colors: ["#475569", "#0F172A"] },
      text: "Manh Mối Mới",
      text_color: "#FFFFFF",
      type: "image_icon",
      icon: { type: "emoji", data: "📌" },
      is_editable: true,
      active: true,
      order_id: 18,
    },
    {
      overlay_id: "crush_camera_an_ninh",
      colortop: "#64748B",
      colorbottom: "#334155",
      background: { colors: ["#64748B", "#334155"] },
      text: "Camera An Ninh",
      text_color: "#FFFFFF",
      type: "image_icon",
      icon: { type: "emoji", data: "📹" },
      is_editable: true,
      active: true,
      order_id: 19,
    },
    { overlay_id: "crush_ai_lam_ho", colortop: "#22C55E", colorbottom: "#16A34A", background: { colors: ["#22C55E", "#16A34A"] }, text: "Ai Làm Hộ?", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "🤡" }, is_editable: true, active: true, order_id: 20 },
    { overlay_id: "crush_gui_file_di", colortop: "#60A5FA", colorbottom: "#2563EB", background: { colors: ["#60A5FA", "#2563EB"] }, text: "Gửi File Đi", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "📁" }, is_editable: true, active: true, order_id: 21 },
    { overlay_id: "crush_cho_chep_voi", colortop: "#FBBF24", colorbottom: "#F59E0B", background: { colors: ["#FBBF24", "#F59E0B"] }, text: "Cho Chép Với", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "🥹" }, is_editable: true, active: true, order_id: 22 },
    { overlay_id: "crush_dung_goi_ten", colortop: "#6B7280", colorbottom: "#374151", background: { colors: ["#6B7280", "#374151"] }, text: "Đừng Gọi Tên", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "😶" }, is_editable: true, active: true, order_id: 23 },
    { overlay_id: "crush_em_ban_roi", colortop: "#EC4899", colorbottom: "#DB2777", background: { colors: ["#EC4899", "#DB2777"] }, text: "Em Bận Rồi", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "🎀" }, is_editable: true, active: true, order_id: 24 },
    { overlay_id: "crush_toi_on_ma", colortop: "#64748B", colorbottom: "#334155", background: { colors: ["#64748B", "#334155"] }, text: "Tôi Ổn Mà", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "🗿" }, is_editable: true, active: true, order_id: 25 },
    { overlay_id: "crush_khong_sao_dau", colortop: "#94A3B8", colorbottom: "#64748B", background: { colors: ["#94A3B8", "#64748B"] }, text: "Không Sao Đâu", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "🙂" }, is_editable: true, active: true, order_id: 26 },
    { overlay_id: "crush_dang_ngu", colortop: "#6366F1", colorbottom: "#4338CA", background: { colors: ["#6366F1", "#4338CA"] }, text: "Đang Ngủ", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "😴" }, is_editable: true, active: true, order_id: 27 },
    { overlay_id: "crush_online_vo_tri", colortop: "#38BDF8", colorbottom: "#0284C7", background: { colors: ["#38BDF8", "#0284C7"] }, text: "Online Vô Tri", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "👀" }, is_editable: true, active: true, order_id: 28 },
    { overlay_id: "crush_seen_roi_nhe", colortop: "#F472B6", colorbottom: "#EC4899", background: { colors: ["#F472B6", "#EC4899"] }, text: "Seen Rồi Nhé", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "📱" }, is_editable: true, active: true, order_id: 29 },
    { overlay_id: "crush_teyvat_explorer", colortop: "#20B2AA", colorbottom: "#FFD700", background: { colors: ["#20B2AA", "#FFD700"] }, text: "Teyvat Explorer", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "🌟" }, is_editable: true, active: true, order_id: 30 },
    { overlay_id: "crush_daily_commission", colortop: "#60A5FA", colorbottom: "#2563EB", background: { colors: ["#60A5FA", "#2563EB"] }, text: "Daily Commission", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "📜" }, is_editable: true, active: true, order_id: 31 },
    { overlay_id: "crush_resin_160", colortop: "#9333EA", colorbottom: "#6366F1", background: { colors: ["#9333EA", "#6366F1"] }, text: "Nhựa Đầy Rồi", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "⚡" }, is_editable: true, active: true, order_id: 32 },
    { overlay_id: "crush_primogem_hunter", colortop: "#38BDF8", colorbottom: "#818CF8", background: { colors: ["#38BDF8", "#818CF8"] }, text: "Săn Nguyên Thạch", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "💎" }, is_editable: true, active: true, order_id: 33 },
    { overlay_id: "crush_wish_time", colortop: "#F472B6", colorbottom: "#FB7185", background: { colors: ["#F472B6", "#FB7185"] }, text: "Quay Gacha Nào", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "🌠" }, is_editable: true, active: true, order_id: 34 },
    { overlay_id: "crush_pity_90", colortop: "#F59E0B", colorbottom: "#F97316", background: { colors: ["#F59E0B", "#F97316"] }, text: "Pity 90 Thôi", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "😭" }, is_editable: true, active: true, order_id: 35 },
    { overlay_id: "crush_ar60", colortop: "#2563EB", colorbottom: "#1E40AF", background: { colors: ["#2563EB", "#1E40AF"] }, text: "AR60 Flex", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "👑" }, is_editable: true, active: true, order_id: 36 },
    { overlay_id: "crush_fontaine_vibes", colortop: "#38BDF8", colorbottom: "#0EA5E9", background: { colors: ["#38BDF8", "#0EA5E9"] }, text: "Fontaine Vibes", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "💧" }, is_editable: true, active: true, order_id: 37 },
    { overlay_id: "crush_natlan_loading", colortop: "#F97316", colorbottom: "#DC2626", background: { colors: ["#F97316", "#DC2626"] }, text: "Natlan Loading", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "🔥" }, is_editable: true, active: true, order_id: 38 },
    { overlay_id: "crush_snezhnaya_when", colortop: "#94A3B8", colorbottom: "#64748B", background: { colors: ["#94A3B8", "#64748B"] }, text: "Chờ Snezhnaya", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "❄️" }, is_editable: true, active: true, order_id: 39 },
    { overlay_id: "crush_paimon_food", colortop: "#FDE68A", colorbottom: "#FBBF24", background: { colors: ["#FDE68A", "#FBBF24"] }, text: "Paimon Là Đồ Ăn", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "🍗" }, is_editable: true, active: true, order_id: 40 },
    { overlay_id: "crush_emergency_food", colortop: "#FCD34D", colorbottom: "#F59E0B", background: { colors: ["#FCD34D", "#F59E0B"] }, text: "Emergency Food", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "🧚" }, is_editable: true, active: true, order_id: 41 },
    { overlay_id: "crush_dendro_boy", colortop: "#84CC16", colorbottom: "#65A30D", background: { colors: ["#84CC16", "#65A30D"] }, text: "Hệ Thảo Chính Hiệu", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "🌿" }, is_editable: true, active: true, order_id: 42 },
    { overlay_id: "crush_hydro_enjoyer", colortop: "#38BDF8", colorbottom: "#0284C7", background: { colors: ["#38BDF8", "#0284C7"] }, text: "Hệ Thủy Main", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "💧" }, is_editable: true, active: true, order_id: 43 },
    { overlay_id: "crush_pyro_damage", colortop: "#FB923C", colorbottom: "#DC2626", background: { colors: ["#FB923C", "#DC2626"] }, text: "Đốt Hết Luôn", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "🔥" }, is_editable: true, active: true, order_id: 44 },
    { overlay_id: "crush_anemo_free", colortop: "#34D399", colorbottom: "#10B981", background: { colors: ["#34D399", "#10B981"] }, text: "Gió Đưa Lối", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "🌪️" }, is_editable: true, active: true, order_id: 46 },
    { overlay_id: "crush_geo_grindset", colortop: "#FCD34D", colorbottom: "#D97706", background: { colors: ["#FCD34D", "#D97706"] }, text: "Đá Nhưng Ổn", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "🪨" }, is_editable: true, active: true, order_id: 47 },

    { overlay_id: "crush_electro_boom", colortop: "#A78BFA", colorbottom: "#7C3AED", background: { colors: ["#A78BFA", "#7C3AED"] }, text: "Giật Điện Rồi", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "⚡" }, is_editable: true, active: true, order_id: 48 },
    { overlay_id: "crush_khaenriah_file", colortop: "#111827", colorbottom: "#312E81", background: { colors: ["#111827", "#312E81"] }, text: "Hồ Sơ Khaenri'ah", text_color: "#FFFFFF", type: "image_icon", icon: { type: "emoji", data: "📂" }, is_editable: true, active: true, order_id: 49 },
  ],
};
};

export const useOverlayDataStore = create((set, get) => ({
  sectionOverlays: [],
  emojiConfig: getEmojiPresetConfig(),
  crushConfig: getSunflowerConfig(),
  customCaptions: getCustomCaptions(),
  isLoading: false,
  error: null,

  updateEmojiConfig: (newConfig) => {
    localStorage.setItem("custom_emoji_config", JSON.stringify(newConfig));
    set({ emojiConfig: getEmojiPresetConfig() });
  },

  addCustomCaption: (newCaption) => {
    const list = [...get().customCaptions, { ...newCaption, id: Date.now().toString() }];
    saveCustomCaptions(list);
    set({ customCaptions: list });
  },

  removeCustomCaption: (id) => {
    const list = get().customCaptions.filter((c) => c.id !== id);
    saveCustomCaptions(list);
    set({ customCaptions: list });
  },

  updateCrushConfig: (newConfig) => {
    localStorage.setItem("crush_sunflower_config", JSON.stringify(newConfig));
    set({ crushConfig: getSunflowerConfig() });
  },

  fetchCaptionOverlays: async () => {
    if (get().sectionOverlays.length > 0) return;

    set({ isLoading: true, error: null });

    try {
      const cached = sessionStorage.getItem("overlaySections");
      if (cached) {
        const parsed = JSON.parse(cached);
        // Merge CRUSH_SECTION vào "🎨 Decorative by hgh"
        const decorativeCached = parsed.find(s => s.name === "🎨 Decorative by hgh" || s.name === "🎨 Decorative by Dio");
        if (decorativeCached) {
          decorativeCached.name = "🎨 Decorative by hgh";
          decorativeCached.items.push(...getCrushSection().items);
        } else {
          parsed.push(getCrushSection());
        }

        // Save cached data
        set({
          sectionOverlays: parsed,
          isLoading: false,
        });
        return;
      }

      const result = await getAllOverlayCaptionV2();

      // filter theo thời gian
      const sections = result.map((section) => ({
        ...section,
        items: section.items.filter(isOverlayActive),
      }));

      sessionStorage.setItem("overlaySections", JSON.stringify(sections));

      // Merge CRUSH_SECTION vào "🎨 Decorative by hgh"
      const decorativeSection = sections.find(s => s.name === "🎨 Decorative by hgh" || s.name === "🎨 Decorative by Dio");
      if (decorativeSection) {
        decorativeSection.name = "🎨 Decorative by hgh";
        decorativeSection.items.push(...getCrushSection().items);
      } else {
        sections.push(getCrushSection());
      }

      // Gắn SUNFLOWER_SECTION vào đầu danh sách từ server
      set({
        sectionOverlays: sections,
        isLoading: false,
      });
    } catch (err) {
      console.error(err);
      // Ngay cả khi API lỗi, vẫn hiển thị SUNFLOWER_SECTION và CRUSH_SECTION
      set({ error: err, isLoading: false, sectionOverlays: [getSunflowerSection(), getCrushSection()] });
    }
  },
}));