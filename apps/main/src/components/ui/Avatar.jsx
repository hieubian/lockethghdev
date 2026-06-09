import React, { useState } from "react";

// Hàm sinh mã màu gradient dựa trên tên để mỗi người dùng có một màu avatar cố định
const getGradientByName = (name) => {
  if (!name) return "from-blue-400 to-indigo-500";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const gradients = [
    "from-[#ff758c] to-[#ff7eb3]", // Hồng đào
    "from-[#8ec5fc] to-[#e0c3fc]", // Tím xanh nhạt
    "from-[#fdec6e] to-[#ffaa85]", // Vàng cam ấm
    "from-[#4facfe] to-[#00f2fe]", // Cyan Ocean
    "from-[#43e97b] to-[#38f9d7]", // Xanh lá ngọc
    "from-[#fa709a] to-[#fee140]", // Hồng cam rực rỡ
    "from-[#6a11cb] to-[#2575fc]", // Tím indigo
    "from-[#ff9a9e] to-[#fecfef]", // Hồng phấn pastel
    "from-[#f093fb] to-[#f5576c]", // Tím hồng dâu
    "from-[#5ee7df] to-[#b490ca]", // Aqua tím
  ];
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

const Avatar = ({ 
  src, 
  firstName = "", 
  lastName = "", 
  className = "w-12 h-12", 
  textClassName = "text-xl",
  alt = ""
}) => {
  const [isError, setIsError] = useState(false);

  // Lấy chữ cái đầu tiên của tên
  const nameToUse = firstName.trim() || lastName.trim() || alt.trim() || "U";
  const firstLetter = nameToUse.charAt(0).toUpperCase();
  const displayName = `${firstName} ${lastName}`.trim() || alt || "User";
  const gradient = getGradientByName(displayName);

  // Nếu không có src hoặc bị lỗi load ảnh
  const showFallback = !src || src === "/default-avatar.png" || src === "/images/default_profile.png" || isError;

  return (
    <div className={`relative flex-shrink-0 flex items-center justify-center overflow-hidden rounded-full ${className}`}>
      {showFallback ? (
        <div
          className={`w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br ${gradient} text-white font-bold tracking-wider shadow-inner`}
        >
          <span className={textClassName}>{firstLetter}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={displayName}
          onError={() => setIsError(true)}
          className="w-full h-full rounded-full object-cover"
        />
      )}
    </div>
  );
};

export default Avatar;
