import { apiFetch } from './api';

const MAX_IMAGE_WIDTH = 1920;
const MAX_IMAGE_HEIGHT = 1920;
const JPEG_QUALITY = 0.82;

/** Resize/compress images in the browser before upload (skips GIF/SVG/video). */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return file;
  }

  if (file.size < 400_000) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      const ratio = Math.min(MAX_IMAGE_WIDTH / width, MAX_IMAGE_HEIGHT / height, 1);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressed = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        'image/jpeg',
        JPEG_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to process image for compression.'));
    };

    img.src = url;
  });
}

async function uploadDirectToCloudinary(
  file: File,
  cloudName: string,
  uploadPreset: string
): Promise<string> {
  const isVideo = file.type.startsWith('video/');
  const resource = isVideo ? 'video' : 'image';
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', uploadPreset);
  form.append('folder', 'sudeis_portfolio');

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resource}/upload`, {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Cloudinary upload failed (${response.status})`);
  }

  const data = await response.json();
  return data.secure_url as string;
}

async function uploadViaServer(base64: string, resourceType: 'image' | 'video'): Promise<string> {
  const res = await apiFetch('/api/upload', {
    method: 'POST',
    body: JSON.stringify({ file: base64, resourceType }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Server upload failed');
  }

  const data = await res.json();
  return data.url as string;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload media — tries fast direct Cloudinary upload first, then compressed server fallback.
 */
export async function uploadMedia(
  file: File,
  onProgress?: (message: string) => void
): Promise<string> {
  const isVideo = file.type.startsWith('video/');

  try {
    const configRes = await apiFetch('/api/admin/upload-config');
    if (configRes.ok) {
      const { cloudName, uploadPreset, directUploadEnabled } = await configRes.json();
      if (directUploadEnabled && cloudName && uploadPreset) {
        onProgress?.(`Uploading ${file.name} directly to CDN...`);
        const payload = isVideo ? file : await compressImage(file);
        return await uploadDirectToCloudinary(payload, cloudName, uploadPreset);
      }
    }
  } catch (e) {
    console.warn('Direct upload unavailable, using server fallback:', e);
  }

  onProgress?.(`Uploading ${file.name} via server...`);
  const compressed = isVideo ? file : await compressImage(file);
  const base64 = await readFileAsDataUrl(compressed);
  return uploadViaServer(base64, isVideo ? 'video' : 'image');
}
