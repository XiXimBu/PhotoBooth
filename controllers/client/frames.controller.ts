import { Request, Response } from "express";
import mongoose from "mongoose";
import { applyCatalogToLayoutDoc } from "../../config/layoutCatalog";
import Frame from "../../models/frame.model";
import Layout from "../../models/layout.model";
import {
  fetchImageBufferFromUrl,
  resizeFrameOverlayToLayout,
  type OverlayResizeMisfit,
} from "../../services/client/frames.service";

/** Chỉ layout kiểu 4 ô dọc xếp chồng (vd. "4 Ảnh Dọc (Classic)"), không gồm 4 ô lưới 2×2. */
const LAYOUT_NAME_VERTICAL_STRIP_4 = /^4\s*Ảnh\s*Dọc/i;

/**
 * GET /api/frames-by-count?photoCount=4
 * Trả frame active có layout đúng photoCount; với photoCount=4 chỉ nhận layout tên "4 Ảnh Dọc…".
 */
export const getFramesByPhotoCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  const raw = req.query.photoCount;
  const photoCount =
    typeof raw === "string"
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

  const layoutMatch: Record<string, unknown> = { photoCount };
  if (photoCount === 4) {
    layoutMatch.name = LAYOUT_NAME_VERTICAL_STRIP_4;
  }

  try {
    const docs = await Frame.find({ isActive: true })
      .populate({
        path: "layoutId",
        match: layoutMatch,
      })
      .lean()
      .exec();

    const data = docs
      .filter(
        (f): f is typeof f & { layoutId: NonNullable<(typeof f)["layoutId"]> } =>
          f.layoutId != null
      )
      .map((f) => ({
        ...f,
        layoutId: applyCatalogToLayoutDoc(f.layoutId),
      }));

    res.json({ success: true, data });
  } catch (error) {
    console.error("[getFramesByPhotoCount]", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Không thể tải danh sách khung.",
    });
  }
};

/**
 * GET /api/frames-by-layout?layoutId=...
 * GET /api/frames/for-layout?layoutId=...  (alias)
 * Chỉ khung gắn đúng layout (user đã chọn lưới trước).
 */
export const getFramesForLayout = async (
  req: Request,
  res: Response
): Promise<void> => {
  const raw = req.query.layoutId;
  const layoutId =
    typeof raw === "string"
      ? raw
      : Array.isArray(raw)
        ? String(raw[0] ?? "")
        : "";

  if (!layoutId || !mongoose.Types.ObjectId.isValid(layoutId)) {
    res.status(400).json({
      success: false,
      message: "Tham số layoutId không hợp lệ (ObjectId).",
    });
    return;
  }

  try {
    const exists = await Layout.exists({ _id: layoutId });
    if (!exists) {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy layout.",
      });
      return;
    }

    const raw = await Frame.find({ isActive: true })
      .where("layoutId")
      .equals(layoutId)
      .populate("layoutId")
      .lean()
      .exec();

    const data = raw.map((f) => ({
      ...f,
      layoutId: applyCatalogToLayoutDoc(f.layoutId),
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error("[getFramesForLayout]", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Không thể tải danh sách khung.",
    });
  }
};

function parseMisfit(q: unknown): OverlayResizeMisfit {
  const s = typeof q === "string" ? q : Array.isArray(q) ? String(q[0]) : "";
  if (s === "fill" || s === "cover") {
    return s;
  }
  return "contain";
}

/**
 * GET /api/frames/:frameId/overlay.png?layoutId=...&misfit=contain|cover|fill
 * PNG khung đã resize đúng canvasW×canvasH của layout (Sharp).
 */
export const getFrameOverlayPng = async (
  req: Request,
  res: Response
): Promise<void> => {
  const rawFrameId = req.params.frameId;
  const frameId =
    typeof rawFrameId === "string"
      ? rawFrameId
      : Array.isArray(rawFrameId)
        ? String(rawFrameId[0] ?? "")
        : "";
  const layoutIdQuery = req.query.layoutId;
  const layoutIdStr =
    typeof layoutIdQuery === "string"
      ? layoutIdQuery
      : Array.isArray(layoutIdQuery)
        ? String(layoutIdQuery[0] ?? "")
        : "";

  if (!frameId || !mongoose.Types.ObjectId.isValid(frameId)) {
    res.status(400).json({
      success: false,
      message: "frameId không hợp lệ.",
    });
    return;
  }

  if (!layoutIdStr || !mongoose.Types.ObjectId.isValid(layoutIdStr)) {
    res.status(400).json({
      success: false,
      message: "Query layoutId (ObjectId) là bắt buộc.",
    });
    return;
  }

  const misfit = parseMisfit(req.query.misfit);

  try {
    const frame = await Frame.findOne({
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

    const layout = await Layout.findById(layoutIdStr).lean();
    if (!layout) {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy layout.",
      });
      return;
    }

    const merged = applyCatalogToLayoutDoc(layout) as Record<
      string,
      unknown
    > | null;
    const targetW = Number(merged?.canvasW) || 1;
    const targetH = Number(merged?.canvasH) || 1;

    const input = await fetchImageBufferFromUrl(frame.overlayUrl);
    const png = await resizeFrameOverlayToLayout(input, targetW, targetH, {
      misfit,
    });

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=300");
    res.send(png);
  } catch (error) {
    console.error("[getFrameOverlayPng]", error);
    const message =
      error instanceof Error ? error.message : "Không xử lý được ảnh khung.";
    if (!res.headersSent) {
      res.status(500).json({ success: false, message });
    }
  }
};
