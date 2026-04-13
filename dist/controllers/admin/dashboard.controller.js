"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = void 0;
const getDashboard = async (req, res) => {
    try {
        res.render("admin/pages/dashboard/index", {
            pageTitle: "Trang chủ",
        });
    }
    catch (error) {
        console.error("getDashboard error:", error);
        res.status(500).render("admin/pages/dashboard/index", {
            pageTitle: "Trang chủ",
            error: "Có lỗi xảy ra",
        });
    }
};
exports.getDashboard = getDashboard;
