"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gcd = gcd;
exports.aspectRatioLabel = aspectRatioLabel;
exports.sameAspectRatio = sameAspectRatio;
exports.isLegacyPixelSlot = isLegacyPixelSlot;
exports.normalizeLayoutSlot = normalizeLayoutSlot;
exports.normalizeLayoutSlots = normalizeLayoutSlots;
exports.slotToPixelRect = slotToPixelRect;
function gcd(a, b) {
    let x = Math.abs(Math.round(a));
    let y = Math.abs(Math.round(b));
    while (y) {
        const t = y;
        y = x % y;
        x = t;
    }
    return x || 1;
}
function aspectRatioLabel(canvasW, canvasH) {
    if (!canvasW || !canvasH) {
        return "";
    }
    const g = gcd(canvasW, canvasH);
    return `${Math.round(canvasW / g)}:${Math.round(canvasH / g)}`;
}
function sameAspectRatio(w1, h1, w2, h2, epsilon = 1e-5) {
    if (!w1 || !h1 || !w2 || !h2) {
        return false;
    }
    return Math.abs(w1 / h1 - w2 / h2) < epsilon;
}
function isLegacyPixelSlot(slot) {
    return slot.x > 1 || slot.y > 1 || slot.w > 1 || slot.h > 1;
}
function normalizeLayoutSlot(slot, canvasW, canvasH) {
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
function normalizeLayoutSlots(slots, canvasW, canvasH) {
    if (!Array.isArray(slots)) {
        return [];
    }
    return slots.map((s) => normalizeLayoutSlot(s, canvasW, canvasH));
}
function slotToPixelRect(slot, outW, outH) {
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
