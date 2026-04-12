import { Request, Response } from "express";
import HomeService from "../../services/client/home.service";

export const getDashboard = async (req: Request, res: Response): Promise<void> => {
	try {
			res.render("admin/pages/dashboard/index", {
				pageTitle: "Trang chủ",
				
			});
	} catch (error) {
		console.error("getDashboard error:", error);
		res.status(500).render("admin/pages/dashboard/index", {
			pageTitle: "Trang chủ",
			error: "Có lỗi xảy ra",
		});
	}
};

