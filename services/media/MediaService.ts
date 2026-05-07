/**
 * Media Service
 *
 * Wraps the backend `/api/media` endpoint. Used by the rich text editor for
 * image uploads (replacing the old base64 / data URL pipeline).
 */

import { ApiClient } from '../api/ApiClient';
import { ApiResponse } from '@/types';

export interface UploadedMedia {
  id: number;
  url: string;
  path: string;
  disk: string;
  mime: string;
  size: number;
  width: number | null;
  height: number | null;
  original_name: string | null;
  collection: string | null;
  uploaded_by: number | null;
  created_at: string | null;
}

export interface UploadOptions {
  /** Logical bucket on the server (e.g. "question", "exam"). */
  collection?: string;
  /** Progress reporter receiving fraction 0..1. */
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
}

export class MediaService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Upload a single image. Returns the persisted media record (incl. URL).
   */
  async upload(
    file: Blob,
    options: UploadOptions & { filename?: string } = {},
  ): Promise<UploadedMedia> {
    const form = new FormData();
    if (file instanceof File) {
      form.append('file', file);
    } else {
      // Plain Blob (e.g. canvas re-encoded crop) — give it a sensible filename
      // so Laravel's file validation is happy.
      const name = options.filename ?? `upload.${blobExtension(file.type)}`;
      form.append('file', file, name);
    }
    if (options.collection) {
      form.append('collection', options.collection);
    }

    const response: ApiResponse<UploadedMedia> = await this.apiClient.upload<UploadedMedia>(
      '/media',
      form,
      {
        onProgress: options.onProgress
          ? (loaded, total) => options.onProgress!(total ? loaded / total : 0)
          : undefined,
        signal: options.signal,
      },
    );

    if (!response.success || !response.data) {
      throw new Error('Upload failed');
    }
    return response.data;
  }

  /**
   * Delete a previously uploaded media record. Used for cleanup if a user
   * removes an image right after uploading. Best-effort — failures are
   * logged but never rethrown to disturb the editor flow.
   */
  async deleteSilently(id: number): Promise<void> {
    try {
      await this.apiClient.delete(`/media/${id}`);
    } catch (err) {
      console.warn('[MediaService] deleteSilently failed:', err);
    }
  }
}

function blobExtension(mime: string): string {
  switch (mime) {
    case 'image/png':
      return 'png';
    case 'image/jpeg':
      return 'jpg';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    case 'image/svg+xml':
      return 'svg';
    default:
      return 'bin';
  }
}
