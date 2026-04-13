"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const theme_model_1 = __importDefault(require("../../models/theme.model"));
const getActiveThemes = async () => {
    try {
        const docs = await theme_model_1.default.find({ isActive: true })
            .sort({ priority: 1, name: 1 })
            .select("name description thumbnailUrl priority")
            .lean()
            .exec();
        const themes = docs.map((d) => ({
            _id: String(d._id),
            name: d.name,
            description: d.description,
            thumbnailUrl: d.thumbnailUrl,
            priority: d.priority,
        }));
        return { success: true, themes };
    }
    catch (error) {
        console.error("[ThemeService.getActiveThemes]", error);
        const message = error instanceof Error
            ? error.message
            : "Không thể tải danh sách chủ đề.";
        return { success: false, themes: [], message };
    }
};
exports.default = { getActiveThemes };
