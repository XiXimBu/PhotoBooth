"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFrameOverlayPng = exports.getFramesForLayout = exports.getFramesByPhotoCount = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const layoutCatalog_1 = require("../../config/layoutCatalog");
const frame_model_1 = __importDefault(require("../../models/frame.model"));
const layout_model_1 = __importDefault(require("../../models/layout.model"));
const frames_service_1 = require("../../services/client/frames.service");
const LAYOUT_NAME_VERTICAL_STRIP_4 = /^4\s*Ảnh\s*Dọc/i;
const getFramesByPhotoCount = async (req, res) => {
    const raw = req.query.photoCount;
    const photoCount = typeof raw === "string"
        ? parseInt(raw, 10)
        : Array.isArray(raw)
            ? parseInt(String(raw[0]), 10)
            : NaN;
    if (!Number.isFinite(photoCount) || photoCount < 1) {
        res.status(400).json({
            success: false,
            message: "Tham số photoCount không hợp lệ (ví dụ ?photoCount=4).",
        });
        return;
    }
    const layoutMatch = { photoCount };
    if (photoCount === 4) {
        layoutMatch.name = LAYOUT_NAME_VERTICAL_STRIP_4;
    }
    try {
        const docs = await frame_model_1.default.find({ isActive: true })
            .populate({
            path: "layoutId",
            match: layoutMatch,
        })
            .lean()
            .exec();
        const data = docs
            .filter((f) => f.layoutId != null)
            .map((f) => ({
            ...f,
            layoutId: (0, layoutCatalog_1.applyCatalogToLayoutDoc)(f.layoutId),
        }));
        res.json({ success: true, data });
    }
    catch (error) {
        console.error("[getFramesByPhotoCount]", error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Không thể tải danh sách khung.",
        });
    }
};
exports.getFramesByPhotoCount = getFramesByPhotoCount;
const getFramesForLayout = async (req, res) => {
    const raw = req.query.layoutId;
    const layoutId = typeof raw === "string"
        ? raw
        : Array.isArray(raw)
            ? String(raw[0] ?? "")
            : "";
    if (!layoutId || !mongoose_1.default.Types.ObjectId.isValid(layoutId)) {
        res.status(400).json({
            success: false,
            message: "Tham số layoutId không hợp lệ (ObjectId).",
        });
        return;
    }
    try {
        const exists = await layout_model_1.default.exists({ _id: layoutId });
        if (!exists) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy layout.",
            });
            return;
        }
        const raw = await frame_model_1.default.find({ isActive: true })
            .where("layoutId")
            .equals(layoutId)
            .populate("layoutId")
            .lean()
            .exec();
        const data = raw.map((f) => ({
            ...f,
            layoutId: (0, layoutCatalog_1.applyCatalogToLayoutDoc)(f.layoutId),
        }));
        res.json({ success: true, data });
    }
    catch (error) {
        console.error("[getFramesForLayout]", error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Không thể tải danh sách khung.",
        });
    }
};
exports.getFramesForLayout = getFramesForLayout;
function parseMisfit(q) {
    const s = typeof q === "string" ? q : Array.isArray(q) ? String(q[0]) : "";
    if (s === "fill" || s === "cover") {
        return s;
    }
    return "contain";
}
const getFrameOverlayPng = async (req, res) => {
    const rawFrameId = req.params.frameId;
    const frameId = typeof rawFrameId === "string"
        ? rawFrameId
        : Array.isArray(rawFrameId)
            ? String(rawFrameId[0] ?? "")
            : "";
    const layoutIdQuery = req.query.layoutId;
    const layoutIdStr = typeof layoutIdQuery === "string"
        ? layoutIdQuery
        : Array.isArray(layoutIdQuery)
            ? String(layoutIdQuery[0] ?? "")
            : "";
    if (!frameId || !mongoose_1.default.Types.ObjectId.isValid(frameId)) {
        res.status(400).json({
            success: false,
            message: "frameId không hợp lệ.",
        });
        return;
    }
    if (!layoutIdStr || !mongoose_1.default.Types.ObjectId.isValid(layoutIdStr)) {
        res.status(400).json({
            success: false,
            message: "Query layoutId (ObjectId) là bắt buộc.",
        });
        return;
    }
    const misfit = parseMisfit(req.query.misfit);
    try {
        const frame = await frame_model_1.default.findOne({
            _id: frameId,
            isActive: true,
        }).lean();
        if (!frame) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy khung.",
            });
            return;
        }
        if (String(frame.layoutId) !== layoutIdStr) {
            res.status(400).json({
                success: false,
                message: "Khung không thuộc layout đã chọn.",
            });
            return;
        }
        const layout = await layout_model_1.default.findById(layoutIdStr).lean();
        if (!layout) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy layout.",
            });
            return;
        }
        const merged = (0, layoutCatalog_1.applyCatalogToLayoutDoc)(layout);
        const targetW = Number(merged?.canvasW) || 1;
        const targetH = Number(merged?.canvasH) || 1;
        const input = await (0, frames_service_1.fetchImageBufferFromUrl)(frame.overlayUrl);
        const png = await (0, frames_service_1.resizeFrameOverlayToLayout)(input, targetW, targetH, {
            misfit,
        });
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=300");
        res.send(png);
    }
    catch (error) {
        console.error("[getFrameOverlayPng]", error);
        const message = error instanceof Error ? error.message : "Không xử lý được ảnh khung.";
        if (!res.headersSent) {
            res.status(500).json({ success: false, message });
        }
    }
};
exports.getFrameOverlayPng = getFrameOverlayPng;
