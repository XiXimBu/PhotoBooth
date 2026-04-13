"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const layoutCatalog_1 = require("../../config/layoutCatalog");
const layout_model_1 = __importDefault(require("../../models/layout.model"));
const layoutSlots_helper_1 = require("../../helpers/layoutSlots.helper");
const getCameraPage = async () => {
    try {
        const docs = await layout_model_1.default.find({})
            .select("name photoCount canvasW canvasH aspectRatio previewSlotYShift slots")
            .lean()
            .exec();
        const docByName = new Map(docs.map((d) => [String(d.name).trim(), d]));
        const layouts = [];
        for (const catalog of layoutCatalog_1.LAYOUT_CATALOG) {
            const layout = docByName.get(catalog.name.trim());
            if (!layout) {
                continue;
            }
            const previewSlotYShift = typeof layout.previewSlotYShift === "number"
                ? layout.previewSlotYShift
                : undefined;
            layouts.push({
                id: String(layout._id),
                name: layout.name,
                photoCount: catalog.photoCount,
                canvasW: catalog.canvasW,
                canvasH: catalog.canvasH,
                aspectRatio: (0, layoutSlots_helper_1.aspectRatioLabel)(catalog.canvasW, catalog.canvasH),
                previewSlotYShift,
                slots: (0, layoutSlots_helper_1.normalizeLayoutSlots)(catalog.slots, catalog.canvasW, catalog.canvasH),
            });
        }
        return {
            success: true,
            data: {
                pageTitle: "Camera — Photo Booth",
                layouts,
            },
        };
    }
    catch (error) {
        console.error("[HomeService.getCameraPage]", error);
        const message = error instanceof Error ? error.message : "Không thể chuẩn bị trang camera.";
        return { success: false, message };
    }
};
exports.default = { getCameraPage };
