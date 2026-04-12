import { LAYOUT_CATALOG } from "../../config/layoutCatalog";
import Layout from "../../models/layout.model";
import {
  aspectRatioLabel,
  normalizeLayoutSlots,
} from "../../helpers/layoutSlots.helper";

export interface LayoutSlot {
  /** 0→1: x,w theo chiều rộng; y,h theo chiều cao (canvas mẫu / preview) */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CameraLayoutItem {
  id: string;
  name: string;
  photoCount: number;
  canvasW: number;
  canvasH: number;
  /** Tỉ lệ W:H rút gọn (vd. "1:3"); lọc khung theo cùng tỉ lệ với layout */
  aspectRatio: string;
  previewSlotYShift?: number;
  slots: LayoutSlot[];
}

export interface CameraPageData {
  pageTitle: string;
  layouts: CameraLayoutItem[];
}

const getCameraPage = async (): Promise<{
  success: boolean;
  data?: CameraPageData;
  message?: string;
}> => {
  try {
    const docs = await Layout.find({})
      .select("name photoCount canvasW canvasH aspectRatio previewSlotYShift slots")
      .lean()
      .exec();

    const docByName = new Map(
      docs.map((d) => [String(d.name).trim(), d])
    );

    /** Thứ tự = `LAYOUT_CATALOG`; geometry luôn từ catalog (khớp preview / chụp / overlay API). */
    const layouts: CameraLayoutItem[] = [];
    for (const catalog of LAYOUT_CATALOG) {
      const layout = docByName.get(catalog.name.trim());
      if (!layout) {
        continue;
      }
      const previewSlotYShift =
        typeof layout.previewSlotYShift === "number"
          ? layout.previewSlotYShift
          : undefined;
      layouts.push({
        id: String(layout._id),
        name: layout.name,
        photoCount: catalog.photoCount,
        canvasW: catalog.canvasW,
        canvasH: catalog.canvasH,
        aspectRatio: aspectRatioLabel(catalog.canvasW, catalog.canvasH),
        previewSlotYShift,
        slots: normalizeLayoutSlots(
          catalog.slots,
          catalog.canvasW,
          catalog.canvasH
        ),
      });
    }

    return {
      success: true,
      data: {
        pageTitle: "Camera — Photo Booth",
        layouts,
      },
    };
  } catch (error) {
    console.error("[HomeService.getCameraPage]", error);
    const message =
      error instanceof Error ? error.message : "Không thể chuẩn bị trang camera.";
    return { success: false, message };
  }
};

export default { getCameraPage };
