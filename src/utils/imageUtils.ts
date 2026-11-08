/**
 * Utilities for client-side team logo image handling and downscaling
 */

/**
 * Resizes an uploaded image File to a square thumbnail (e.g. 160x160)
 * and returns a compact base64 data URL to safely fit into localStorage.
 */
export async function resizeImageFile(
  file: File,
  maxDimension = 160,
  quality = 0.88
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (PNG, JPG, WEBP, etc.)');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file'));

    reader.onload = () => {
      const img = new Image();

      img.onerror = () => reject(new Error('Failed to load image data'));

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = maxDimension;
          canvas.height = maxDimension;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Could not initialize canvas context'));
            return;
          }

          // Center-crop to square
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, maxDimension, maxDimension);

          // Prefer WebP if supported, fallback to PNG
          let dataUrl: string;
          try {
            dataUrl = canvas.toDataURL('image/webp', quality);
            if (!dataUrl.startsWith('data:image/webp')) {
              dataUrl = canvas.toDataURL('image/png');
            }
          } catch {
            dataUrl = canvas.toDataURL('image/png');
          }

          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}

