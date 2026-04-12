/** Ước lượng GCD để rút gọn tỉ lệ W:H (vd. 736×2208 → "1:3") */
export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

/** Chuỗi tỉ lệ từ kích thước canvas (dùng lọc khung / hiển thị) */
export function aspectRatioLabel(canvasW: number, canvasH: number): string {
  if (!canvasW || !canvasH) {
    return "";
  }
  const g = gcd(canvasW, canvasH);
  return `${Math.round(canvasW / g)}:${Math.round(canvasH / g)}`;
}

/** Hai canvas cùng tỉ lệ (sai số float nhỏ) */
export function sameAspectRatio(
  w1: number,
  h1: number,
  w2: number,
  h2: number,
  epsilon = 1e-5
): boolean {
  if (!w1 || !h1 || !w2 || !h2) {
    return false;
  }
  return Math.abs(w1 / h1 - w2 / h2) < epsilon;
}

/**
 * Slot lưu trong DB: tọa độ chuẩn hóa 0→1.
 * - x, w: tỉ lệ theo chiều rộng canvas (frame)
 * - y, h: tỉ lệ theo chiều cao canvas (frame)
 *
 * Khi render với kích thước thực W×H (ví dụ PNG khung 736×2208):
 *   left = x * W, top = y * H, width = w * W, height = h * H
 */

export interface NormalizedSlot {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Có phải slot cũ đang lưu pixel (số lớn) không */
export function isLegacyPixelSlot(slot: NormalizedSlot): boolean {
  return slot.x > 1 || slot.y > 1 || slot.w > 1 || slot.h > 1;
}

export function normalizeLayoutSlot(
  slot: NormalizedSlot,
  canvasW: number,
  canvasH: number
): NormalizedSlot {
  if (!canvasW || !canvasH) {
    return { ...slot };
  }
  if (isLegacyPixelSlot(slot)) {
    return {
      x: slot.x / canvasW,
      y: slot.y / canvasH,
      w: slot.w / canvasW,
      h: slot.h / canvasH,
    };
  }
  return { ...slot };
}

export function normalizeLayoutSlots(
  slots: NormalizedSlot[] | undefined,
  canvasW: number,
  canvasH: number
): NormalizedSlot[] {
  if (!Array.isArray(slots)) {
    return [];
  }
  return slots.map((s) => normalizeLayoutSlot(s, canvasW, canvasH));
}

export interface PixelRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Đổi slot chuẩn hóa → pixel theo kích thước output (frame / canvas) */
export function slotToPixelRect(
  slot: NormalizedSlot,
  outW: number,
  outH: number
): PixelRect {
  const left = slot.x * outW;
  const top = slot.y * outH;
  const width = slot.w * outW;
  const height = slot.h * outH;
  return {
    left: Math.round(left),
    top: Math.round(top),
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height)),
  };
}
