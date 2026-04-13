"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const home_service_1 = __importDefault(require("../../services/client/home.service"));
const renderCameraPage = (res, status, payload) => {
    res.status(status).render("client/pages/home/index", {
        pageTitle: payload.pageTitle,
        layouts: payload.layouts,
        error: payload.error,
    });
};
const getHome = async (_req, res) => {
    try {
        const result = await home_service_1.default.getCameraPage();
        if (!result.success || !result.data) {
            renderCameraPage(res, 500, {
                pageTitle: "Photo Booth",
                layouts: [],
                error: result.message ?? "Đã xảy ra lỗi khi tải trang camera.",
            });
            return;
        }
        renderCameraPage(res, 200, {
            pageTitle: result.data.pageTitle,
            layouts: result.data.layouts,
        });
    }
    catch (error) {
        console.error("[home.controller.getHome]", error);
        renderCameraPage(res, 500, {
            pageTitle: "Photo Booth",
            layouts: [],
            error: "Không thể tải trang. Vui lòng thử lại sau.",
        });
    }
};
exports.default = { getHome };
