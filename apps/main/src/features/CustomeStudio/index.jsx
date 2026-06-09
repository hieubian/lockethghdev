import { Palette, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import GeneralThemes from "./components/GeneralSections";
import ImageCaptionSelector from "./components/ImageSections";
import Footer from "@/components/Footer";
import { useFeatureVisible } from "@/hooks/useFeature";
import FeatureGate from "@/components/common/FeatureGate";
import {
  useOverlayDataStore,
  useOverlayUserStore,
} from "@/stores/OverlayStores";
import CaptionSections from "./components/OverlaySections";
import { useOverlayEditorStore } from "@/stores";
import { SonnerInfo } from "@/components/ui/SonnerToast";
import CustomCrushTool from "@/pages/Auth/LocketDioTools/tools/CustomCrushTool";
import CustomEmojiTool from "@/pages/Auth/LocketDioTools/tools/CustomEmojiTool";
import CustomCaptionTool from "@/pages/Auth/LocketDioTools/tools/CustomCaptionTool";
import CustomLinkTool from "@/pages/Auth/LocketDioTools/tools/CustomLinkTool";
import CustomWeatherTool from "@/pages/Auth/LocketDioTools/tools/CustomWeatherTool";
import CustomPollTool from "@/pages/Auth/LocketDioTools/tools/CustomPollTool";

const ScreenCustomeStudio = () => {
  const navigate = useNavigate();
  const popupRef = useRef(null);
  const { navigation } = useApp();

  const { isFilterOpen, setIsFilterOpen } = navigation;
  const [isEditingCrush, setIsEditingCrush] = useState(false);
  const [isEditingEmoji, setIsEditingEmoji] = useState(false);
  const [isEditingCustomCaption, setIsEditingCustomCaption] = useState(false);
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [isEditingWeather, setIsEditingWeather] = useState(false);
  const [isEditingPoll, setIsEditingPoll] = useState(false);
  const { userCaptions } = useOverlayUserStore();
  const sectionOverlays = useOverlayDataStore((s) => s.sectionOverlays);

  const updateOverlayEditor = useOverlayEditorStore(
    (s) => s.updateOverlayEditor,
  );
  const resetOverlayEditor = useOverlayEditorStore((s) => s.resetOverlayEditor);

  const canUseCaptionGif = useFeatureVisible("caption_gif");
  const canUseCaptionIcon = useFeatureVisible("caption_icon");
  const canUseCaptionimage = useFeatureVisible("caption_image");

  useEffect(() => {
    if (isFilterOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isFilterOpen]);

  const handleSelectCaption = (caption) => {
    resetOverlayEditor();
    // console.log("Chọn caption:", caption);

    updateOverlayEditor({
      ...caption,
      overlay_id: caption?.overlay_id || caption?.id || "standard",

      text_color: caption.text_color || "#FFFFFF",
      text: caption?.text || "",
      type: caption?.type || "default",

      caption: caption?.text || "",
      color_top: caption.color_top || caption.colortop || caption.background?.colors?.[0] || "",
      color_bottom: caption.color_bottom || caption.colorbottom || caption.background?.colors?.[1] || "",
    });

    // SonnerInfo("DATA", JSON.stringify(caption, null, 2));

    setIsFilterOpen(false);
    // Xử lý khi chọn caption
  };

  return (
    <div
      className={`fixed inset-0 z-90 flex justify-center items-end transition-transform duration-500 ${
        isFilterOpen ? "" : "pointer-events-none"
      }`}
    >
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-base-100/10 backdrop-blur-[2px] bg-opacity-50 transition-opacity duration-500 ${
          isFilterOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setIsFilterOpen(false)}
      ></div>

      {/* Popup */}
      <div
        ref={popupRef}
        className={`w-full h-2/3 bg-base-100 text-base-content rounded-t-4xl shadow-lg transition-transform duration-500 flex flex-col ${
          isFilterOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Header - Ghim cố định — ẩn khi đang chỉnh sửa các công cụ tuỳ chỉnh */}
        {!isEditingCrush && !isEditingEmoji && !isEditingCustomCaption && !isEditingLink && !isEditingWeather && !isEditingPoll && (
          <div className="flex justify-between rounded-t-4xl items-center py-2 px-4 bg-base-100 sticky top-0 left-0 right-0 z-50">
            <div className="flex items-center space-x-2 text-primary">
              <Palette size={22} />
              <div className="text-2xl font-lovehouse mt-1.5 font-semibold">
                Customize studio{" "}
              </div>
            </div>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="text-primary cursor-pointer"
            >
              <X size={30} />
            </button>
          </div>
        )}
        {/* Nội dung - Cuộn được */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {isEditingCrush ? (
            <CustomCrushTool onClose={() => setIsEditingCrush(false)} />
          ) : isEditingEmoji ? (
            <CustomEmojiTool onClose={() => setIsEditingEmoji(false)} />
          ) : isEditingCustomCaption ? (
            <CustomCaptionTool onClose={() => setIsEditingCustomCaption(false)} />
          ) : isEditingLink ? (
            <CustomLinkTool onClose={() => setIsEditingLink(false)} />
          ) : isEditingWeather ? (
            <CustomWeatherTool onClose={() => setIsEditingWeather(false)} />
          ) : isEditingPoll ? (
            <CustomPollTool onClose={() => setIsEditingPoll(false)} />
          ) : (
            <>
              <GeneralThemes 
                title="🎨 General" 
                onSelect={handleSelectCaption} 
                onEditEmoji={() => setIsEditingEmoji(true)} 
                onEditCustomCaption={() => setIsEditingCustomCaption(true)}
                onEditCrush={() => setIsEditingCrush(true)}
                onEditLink={() => setIsEditingLink(true)}
                onEditWeather={() => setIsEditingWeather(true)}
                onEditPoll={() => setIsEditingPoll(true)}
              />

              <CaptionSections
                sections={sectionOverlays}
                onSelect={handleSelectCaption}
              />
              {/* <FeatureGate canUse={canUseCaptionimage}>
                <ImageCaptionSelector title="🎨 Caption Ảnh - Truy cập sớm" />
              </FeatureGate> */}
            </>
          )}

          <div className="bottom-0">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenCustomeStudio;
