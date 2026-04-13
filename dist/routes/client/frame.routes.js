"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const frames_controller_1 = require("../../controllers/client/frames.controller");
const router = (0, express_1.Router)();
router.get("/frames-by-count", frames_controller_1.getFramesByPhotoCount);
router.get("/frames/:frameId/overlay.png", frames_controller_1.getFrameOverlayPng);
exports.default = router;
