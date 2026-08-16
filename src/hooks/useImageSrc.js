"use client";

import { useEffect, useState } from "react";

function resolveImageSrc(image) {
  if (!image) return null;

  if (image instanceof File) {
    return URL.createObjectURL(image);
  }

  if (typeof image === "string") {
    return image;
  }

  if (typeof image === "object") {
    return image.url || image.path || null;
  }

  return null;
}

export function useImageSrc(image, fallback = "/placeholder-image.jpg") {
  const [src, setSrc] = useState(fallback);

  useEffect(() => {
    const resolved = resolveImageSrc(image);

    if (!resolved) {
      setSrc(fallback);
      return;
    }

    setSrc(resolved);

    // Cleanup ONLY if it's an object URL
    if (image instanceof File) {
      return () => URL.revokeObjectURL(resolved);
    }
  }, [image, fallback]);

  return src;
}
