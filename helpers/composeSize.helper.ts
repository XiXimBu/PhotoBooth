import sharp from "sharp";
import type { NormalizedSlot } from "./layoutSlots.helper";
import { slotToPixelRect } from "./layoutSlots.helper";
import {
  resizeFrameOverlayToLayout,
  type OverlayResizeMisfit,
} from "../services/client/frames.service";

export interface ComposePhotoboothOptions {
  /** PNG/JPEG khung (có thể trong suốt) */
  overlayInput: Buffer | string;
  /** Mỗi buffer là một ảnh chụp, cùng thứ tự với slots */
  photoInputs: Buffer[];
  slots: NormalizedSlot[];
  /** Màu nền các vùng không có ảnh (RGB 0-255), mặc định gần giống preview client */
  background?: { r: number; g: number; b: number };
  /**
   * Kích thước canvas theo Layout đã chọn (canvasW × canvasH).
   * Nếu có: ép file khung về đúng kích thước này rồi mới ghép ảnh (slot 0→1 vẫn đúng).
   * Nếu không: dùng kích thước pixel của file overlay (hành vi cũ).
   */
  targetCanvas?: { width: number; height: number };
  /**
   * Khi kích thước overlay khác tỉ lệ với targetCanvas (map sang frameOverlay.service).
   */
  overlayMismatchFit?: OverlayResizeMisfit;
}

/**
 * Ghép ảnh theo layout: resize từng ảnh (cover, giữa) vào từng ô, sau đó phủ khung PNG lên.
 * Slot 0→1 nhân với kích thước canvas thực (sau khi ép khung về targetCanvas nếu có).
 */
export async function composePhotoboothFrame(
  options: ComposePhotoboothOptions
): Promise<Buffer> {
  const bg = options.background ?? { r: 18, g: 18, b: 20 };
  const mismatchFit = options.overlayMismatchFit ?? "contain";

  const overlayMeta = await sharp(options.overlayInput).metadata();
  const fileW = overlayMeta.width ?? 0;
  const fileH = overlayMeta.height ?? 0;
  if (!fileW || !fileH) {
    throw new Error("Không đọc được kích thước ảnh khung (overlay).");
  }

  const target = options.targetCanvas;
  let outW = fileW;
  let outH = fileH;
  let overlayBuf: Buffer;

  if (
    target &&
    target.width > 0 &&
    target.height > 0 &&
    (target.width !== fileW || target.height !== fileH)
  ) {
    outW = target.width;
    outH = target.height;
    overlayBuf = await resizeFrameOverlayToLayout(
      options.overlayInput,
      outW,
      outH,
      { misfit: mismatchFit }
    );
  } else {
    overlayBuf = await sharp(options.overlayInput).ensureAlpha().toBuffer();
    outW = fileW;
    outH = fileH;
  }

  const composites: sharp.OverlayOptions[] = [];

  const n = Math.min(options.slots.length, options.photoInputs.length);
  for (let i = 0; i < n; i++) {
    const photo = options.photoInputs[i];
    if (!photo || !photo.length) {
      continue;
    }
    const rect = slotToPixelRect(options.slots[i], outW, outH);
    const resized = await sharp(photo)
      .resize(rect.width, rect.height, {
        fit: "cover",
        position: "centre",
      })
      .toBuffer();

    composites.push({
      input: resized,
      left: rect.left,
      top: rect.top,
    });
  }

  composites.push({
    input: overlayBuf,
    left: 0,
    top: 0,
  });

  return sharp({
    create: {
      width: outW,
      height: outH,
      channels: 4,
      background: { ...bg, alpha: 1 },
    },
  })
    .composite(composites)
    .png()
    .toBuffer();
}
