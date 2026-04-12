import { Router } from "express";
import {
  getFrameOverlayPng,
  getFramesByPhotoCount,
} from "../../controllers/client/frames.controller";

const router = Router();

router.get("/frames-by-count", getFramesByPhotoCount);
/** frames-by-layout / frames/for-layout được đăng ký trong index.ts (app.get) */
router.get("/frames/:frameId/overlay.png", getFrameOverlayPng);

export default router;
