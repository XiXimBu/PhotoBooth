"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchImageBufferFromUrl = fetchImageBufferFromUrl;
exports.resizeFrameOverlayToLayout = resizeFrameOverlayToLayout;
const sharp_1 = __importDefault(require("sharp"));
const layoutSlots_helper_1 = require("../../helpers/layoutSlots.helper");
async function fetchImageBufferFromUrl(url) {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Không tải được ảnh khung (${res.status})`);
    }
    return Buffer.from(await res.arrayBuffer());
}
async function resizeFrameOverlayToLayout(input, targetW, targetH, options) {
    if (targetW < 1 || targetH < 1) {
        throw new Error("Kích thước layout không hợp lệ.");
    }
    const meta = await (0, sharp_1.default)(input).metadata();
    const ow = meta.width ?? 0;
    const oh = meta.height ?? 0;
    if (!ow || !oh) {
        throw new Error("Không đọc được kích thước ảnh khung.");
    }
    if (ow === targetW && oh === targetH) {
        return (0, sharp_1.default)(input).ensureAlpha().png().toBuffer();
    }
    const sameAspect = (0, layoutSlots_helper_1.sameAspectRatio)(ow, oh, targetW, targetH);
    const misfit = options?.misfit ?? "contain";
    if (sameAspect) {
        return (0, sharp_1.default)(input)
            .resize(targetW, targetH, {
            fit: "fill",
            position: "centre",
        })
            .ensureAlpha()
            .png()
            .toBuffer();
    }
    if (misfit === "fill") {
        return (0, sharp_1.default)(input)
            .resize(targetW, targetH, { fit: "fill" })
            .ensureAlpha()
            .png()
            .toBuffer();
    }
    if (misfit === "cover") {
        return (0, sharp_1.default)(input)
            .resize(targetW, targetH, {
            fit: "cover",
            position: "centre",
        })
            .ensureAlpha()
            .png()
            .toBuffer();
    }
    return (0, sharp_1.default)(input)
        .resize(targetW, targetH, {
        fit: "contain",
        position: "centre",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
        .ensureAlpha()
        .png()
        .toBuffer();
}
