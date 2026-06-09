/**
 * Chuẩn hoá một moment từ Firestore thành định dạng dễ dùng hơn
 * @param {Object} data Object moment thô từ Firestore
 * @returns {Object|null} Moment đã chuẩn hoá hoặc null nếu input không hợp lệ
 */
export function normalizeMoment(data) {
  if (!data || typeof data !== "object") return null;

  console.log("🔍 RAW MOMENT DATA:", data);
  if (typeof window !== "undefined") {
    window.__RAW_MOMENTS__ = window.__RAW_MOMENTS__ || {};
    window.__RAW_MOMENTS__[data.canonical_uid || data.id] = data;
  }

  const {
    canonical_uid,
    id,
    user,
    image_url,
    video_url = null,
    thumbnail_url,
    overlays = [],
    caption,
    md5,
    sent_to_all,
    show_personally,
    date,
    audience,
    custom_audience,
    users,
    recipients,
  } = data;

  const momentId = canonical_uid || id || null;

  const firestoreDate = date?._seconds ? new Date(date._seconds * 1000) : null;
  const dateVNString = firestoreDate
    ? firestoreDate.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
    : null;

  // Lấy captions từ overlays
  let captions = [];
  let overlaysArray = [];

  if (Array.isArray(overlays)) {
    overlaysArray = overlays;
  } else if (overlays && typeof overlays === "object") {
    // API Locket đôi khi trả về object trực tiếp thay vì mảng
    // Hoặc trả về một object dạng map (vd: { "0": {...}, "1": {...} })
    if (overlays.overlay_type || overlays.text) {
      overlaysArray = [overlays];
    } else {
      overlaysArray = Object.values(overlays);
    }
  }

  captions = overlaysArray
    .filter((o) => o?.overlay_type === "caption" || o?.type === "static_content" || o?.text)
    .map((o) => {
      // Dữ liệu có thể nằm trong o.data (kiểu cũ) hoặc trực tiếp ở object (kiểu mới)
      const source = o.data || o;
      const { text, text_color, icon, background, type, payload } = source;
      return { 
        text, 
        text_color, 
        icon, 
        background,
        type: type || o.type,
        payload: payload || o.payload,
        overlay_id: o.overlay_id,
        overlay_type: o.overlay_type
      };
    })
    .filter((c) => c.text); // Bỏ qua nếu không có text


  // Nếu không có overlay nhưng có caption dạng chuỗi
  if (!captions.length && typeof caption === "string" && caption.trim() !== "") {
    captions.push({
      text: caption,
      text_color: "#FFFFFF",
      icon: null,
      background: { material_blur: "ultra_thin", colors: [] },
    });
  }

  return {
    id: momentId,
    user,
    image_url,
    video_url,
    thumbnail_url,
    date: dateVNString,
    md5: md5 || null,
    sent_to_all: !!sent_to_all,
    show_personally: !!show_personally,
    isPublic: data.isPublic !== undefined ? !!data.isPublic : !!sent_to_all,
    audience: audience || null,
    custom_audience: custom_audience || null,
    users: users || null,
    captions,
    overlays: captions,
  };
}


//   [
//     {
//       id: "kO3tDcHrm6owDLPA4Rv7",
//       user: "...",
//       image_url: "...",
//       video_url: "...",
//       thumbnail_url: "...",
//       date: "2025-05-24T02:46:40.000Z",
//       md5: "...",
//       sent_to_all: true,
//       show_personally: false,
//       captions: [
//         {
//           text: "Goodnight",
//           text_color: "#FFFFFFE6",
//           icon: { type: "emoji", data: "🌙" },
//           background: { material_blur: "ultra_thin", colors: ["#370C6F", "#575CD4"] }
//         }
//       ]
//     },
//     ...
//   ]
