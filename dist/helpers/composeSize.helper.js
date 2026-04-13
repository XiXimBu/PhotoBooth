"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.composePhotoboothFrame = composePhotoboothFrame;
const sharp_1 = __importDefault(require("sharp"));
const layoutSlots_helper_1 = require("./layoutSlots.helper");
const frames_service_1 = require("../services/client/frames.service");
async function composePhotoboothFrame(options) {
    const bg = options.background ?? { r: 18, g: 18, b: 20 };
    const mismatchFit = options.overlayMismatchFit ?? "contain";
    const overlayMeta = await (0, sharp_1.default)(options.overlayInput).metadata();
    const fileW = overlayMeta.width ?? 0;
    const fileH = overlayMeta.height ?? 0;
    if (!fileW || !fileH) {
        throw new Error("Không đọc được kích thước ảnh khung (overlay).");
    }
    const target = options.targetCanvas;
    let outW = fileW;
    let outH = fileH;
    let overlayBuf;
    if (target &&
        target.width > 0 &&
        target.height > 0 &&
        (target.width !== fileW || target.height !== fileH)) {
        outW = target.width;
        outH = target.height;
        overlayBuf = await (0, frames_service_1.resizeFrameOverlayToLayout)(options.overlayInput, outW, outH, { misfit: mismatchFit });
    }
    else {
        overlayBuf = await (0, sharp_1.default)(options.overlayInput).ensureAlpha().toBuffer();
        outW = fileW;
        outH = fileH;
    }
    const composites = [];
    const n = Math.min(options.slots.length, options.photoInputs.length);
    for (let i = 0; i < n; i++) {
        const photo = options.photoInputs[i];
        if (!photo || !photo.length) {
            continue;
        }
        const rect = (0, layoutSlots_helper_1.slotToPixelRect)(options.slots[i], outW, outH);
        const resized = await (0, sharp_1.default)(photo)
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
    return (0, sharp_1.default)({
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
