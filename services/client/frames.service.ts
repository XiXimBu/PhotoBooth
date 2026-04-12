import sharp from "sharp";
import { sameAspectRatio } from "../../helpers/layoutSlots.helper";

/** Khác tỉ lệ: contain = nền trong suốt; cover = cắt viền; fill = ép khít (có thể méo) */
export type OverlayResizeMisfit = "contain" | "cover" | "fill";

export async function fetchImageBufferFromUrl(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Không tải được ảnh khung (${res.status})`);
  }
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Đưa PNG khung về đúng kích thước canvas layout (targetW × targetH).
 * Cùng tỉ lệ: scale đều, khít pixel (fit fill, không méo).
 * Khác tỉ lệ: theo misfit (mặc định contain + nền trong suốt).
 */
export async function resizeFrameOverlayToLayout(
  input: Buffer | string,
  targetW: number,
  targetH: number,
  options?: { misfit?: OverlayResizeMisfit }
): Promise<Buffer> {
  if (targetW < 1 || targetH < 1) {
    throw new Error("Kích thước layout không hợp lệ.");
  }
  const meta = await sharp(input).metadata();
  const ow = meta.width ?? 0;
  const oh = meta.height ?? 0;
  if (!ow || !oh) {
    throw new Error("Không đọc được kích thước ảnh khung.");
  }

  if (ow === targetW && oh === targetH) {
    return sharp(input).ensureAlpha().png().toBuffer();
  }

  const sameAspect = sameAspectRatio(ow, oh, targetW, targetH);
  const misfit: OverlayResizeMisfit = options?.misfit ?? "contain";

  if (sameAspect) {
    return sharp(input)
      .resize(targetW, targetH, {
        fit: "fill",
        position: "centre",
      })
      .ensureAlpha()
      .png()
      .toBuffer();
  }

  if (misfit === "fill") {
    return sharp(input)
      .resize(targetW, targetH, { fit: "fill" })
      .ensureAlpha()
      .png()
      .toBuffer();
  }

  if (misfit === "cover") {
    return sharp(input)
      .resize(targetW, targetH, {
        fit: "cover",
        position: "centre",
      })
      .ensureAlpha()
      .png()
      .toBuffer();
  }

  return sharp(input)
    .resize(targetW, targetH, {
      fit: "contain",
      position: "centre",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .png()
    .toBuffer();
}
