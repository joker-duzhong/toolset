import { apiClient } from '@/utils/apiClient'
import {
  buildStoragePublicUrl,
  type StorageUploadAdapter,
  type StorageUploadFinalizePayload,
  type StorageUploadTokenResponse,
  uploadStorageFile,
  uploadStorageFiles,
  type StorageBatchUploadOptions,
  type StorageUploadedFile,
} from '@/utils/storage'

export interface StorageInfo {
  id: string
  name: string
  url: string
  thumb_url: string | null
  size: number
  type: string
  scope?: string | null
  hash: string
  owner?: string | null
  created_at: string
  updated_at: string
}

export interface ConfirmUploadRequest {
  name: string
  url: string
  thumb_url?: string | null
  size: number
  type: string
  hash: string
}

export interface StorageUploadOptions extends Omit<StorageBatchUploadOptions<StorageInfo>, 'adapter' | 'appKey'> {
  appKey: string
}

function withAppHeader(appKey: string, init?: RequestInit): RequestInit {
  const headers = new Headers(init?.headers)
  headers.set('app', appKey)
  return { ...init, headers }
}

async function getUploadToken(): Promise<StorageUploadTokenResponse> {
  const res = await apiClient<StorageUploadTokenResponse>('/storage/upload-token')
  if (!res.data) {
    throw new Error(res.message || 'Failed to get storage upload token')
  }
  return res.data
}

async function confirmUpload(appKey: string, payload: ConfirmUploadRequest): Promise<StorageInfo> {
  const res = await apiClient<StorageInfo>(
    '/storage/confirm-upload',
    withAppHeader(appKey, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  )

  if (!res.data) {
    throw new Error(res.message || 'Failed to confirm storage upload')
  }

  return res.data
}

function createStorageAdapter(appKey: string): StorageUploadAdapter<StorageInfo> {
  return {
    getUploadToken,
    confirmUpload: async (payload: StorageUploadFinalizePayload) =>
      confirmUpload(appKey, {
        name: payload.originalFile.name,
        url: payload.key,
        thumb_url: payload.thumbKey,
        size: payload.uploadedFile.size,
        type: payload.uploadedFile.type || payload.originalFile.type || 'application/octet-stream',
        hash: payload.hash,
      }),
  }
}

function resolveStorageUrls(resource: StorageInfo, payload: Pick<StorageUploadFinalizePayload, 'key' | 'thumbKey' | 'token'>) {
  return {
    resource,
    url: resource.url || buildStoragePublicUrl(payload.token.domain, payload.key),
    thumbUrl: resource.thumb_url || (payload.thumbKey ? buildStoragePublicUrl(payload.token.domain, payload.thumbKey) : null),
  }
}

export const storageApi = {
  getUploadToken,

  confirmUpload,

  getById: async (resourceId: string) => {
    return apiClient<StorageInfo>(`/storage/${resourceId}`)
  },

  delete: async (resourceId: string) => {
    return apiClient<boolean>(`/storage/delete/${resourceId}`, {
      method: 'DELETE',
    })
  },

  upload: async (file: File, options: StorageUploadOptions): Promise<{ code: number; message: string; data: StorageInfo | null }> => {
    try {
      const uploaded = await uploadStorageFile(file, {
        ...options,
        appKey: options.appKey,
        adapter: createStorageAdapter(options.appKey),
        resolveResourceUrls: resolveStorageUrls,
      })

      return {
        code: 200,
        message: 'success',
        data: uploaded.resource,
      }
    } catch (error) {
      return {
        code: 500,
        message: error instanceof Error ? error.message : 'Storage upload failed',
        data: null,
      }
    }
  },

  uploadFiles: async (files: File[], options: StorageUploadOptions): Promise<StorageUploadedFile<StorageInfo>[]> => {
    return uploadStorageFiles(files, {
      ...options,
      appKey: options.appKey,
      adapter: createStorageAdapter(options.appKey),
      resolveResourceUrls: resolveStorageUrls,
    })
  },
}
