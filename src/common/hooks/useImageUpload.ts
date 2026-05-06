import { useState, useCallback } from "react";
import { storageApi } from "@/common/api/storage";

interface UploadedImage {
  id: string;
  previewUrl: string;
}

export function useImageUpload(maxImages = 4, appKey?: string) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || images.length >= maxImages) return;

      setUploading(true);
      try {
        const uploadPromises = [...files].slice(0, maxImages - images.length).map(async (file) => {
          if (!appKey) return null;
          const res = await storageApi.upload(file, { appKey });
          if (res.data) {
            return {
              id: res.data.id,
              previewUrl: res.data.url,
            };
          }
          return null;
        });

        const uploadedImages = await Promise.all(uploadPromises);
        const validImages = uploadedImages.filter((img): img is UploadedImage => img !== null);
        setImages((prev) => [...prev, ...validImages].slice(0, maxImages));
      } catch (err) {
        console.error("Failed to upload images:", err);
      } finally {
        setUploading(false);
      }
    },
    [appKey, images, maxImages]
  );

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearImages = useCallback(() => {
    setImages([]);
  }, []);

  const getImageIds = useCallback(() => {
    return images.map((img) => img.id);
  }, [images]);

  return {
    images,
    uploading,
    handleUpload,
    removeImage,
    clearImages,
    getImageIds,
  };
}
