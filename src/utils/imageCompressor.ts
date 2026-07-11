/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Compresses an image file (or base64 string) client-side using HTML5 Canvas
 * to a maximum resolution and reasonable JPEG quality.
 */
export function compressImage(
  imageSrc: string,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate scale to fit within max bounds preserving aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not create canvas 2d context."));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      
      // Export as compressed JPEG base64 string
      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedDataUrl);
    };

    img.onerror = (err) => {
      reject(err);
    };
  });
}
