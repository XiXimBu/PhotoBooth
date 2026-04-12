import { Request, Response } from "express";
import HomeService from "../../services/client/home.service";

const renderCameraPage = (
  res: Response,
  status: number,
  payload: {
    pageTitle: string;
    layouts: unknown[];
    error?: string;
  }
): void => {
  res.status(status).render("client/pages/home/index", {
    pageTitle: payload.pageTitle,
    layouts: payload.layouts,
    error: payload.error,
  });
};

const getHome = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await HomeService.getCameraPage();

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
  } catch (error) {
    console.error("[home.controller.getHome]", error);
    renderCameraPage(res, 500, {
      pageTitle: "Photo Booth",
      layouts: [],
      error: "Không thể tải trang. Vui lòng thử lại sau.",
    });
  }
};

export default { getHome };
