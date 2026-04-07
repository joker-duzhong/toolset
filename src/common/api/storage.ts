import { apiClient } from "@/utils/apiClient";

export interface StorageInfo {
  id: string;
  name: string;
  url: string;
  thumb_url: string;
  size: number;
  type: string;
  hash: string;
  owner: string;
  created_at: string;
  updated_at: string;
}

export const storageApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiClient<StorageInfo>("/storage/upload", {
      method: "POST",
      body: form,
    });
  },
};

