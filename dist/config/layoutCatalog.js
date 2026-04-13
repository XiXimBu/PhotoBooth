"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LAYOUT_CATALOG = void 0;
exports.getCatalogLayoutByName = getCatalogLayoutByName;
exports.applyCatalogToLayoutDoc = applyCatalogToLayoutDoc;
const layoutSlots_helper_1 = require("../helpers/layoutSlots.helper");
function normSlot(canvasW, canvasH, x, y, w, h) {
    return {
        x: x / canvasW,
        y: y / canvasH,
        w: w / canvasW,
        h: h / canvasH,
    };
}
exports.LAYOUT_CATALOG = [
    {
        name: "2 Ảnh Ngang",
        photoCount: 2,
        canvasW: 1200,
        canvasH: 1200,
        slots: [
            normSlot(1200, 1200, 50, 50, 525, 1100),
            normSlot(1200, 1200, 625, 50, 525, 1100),
        ],
    },
    {
        name: "2 Ảnh Dọc",
        photoCount: 2,
        canvasW: 1200,
        canvasH: 1200,
        slots: [
            normSlot(1200, 1200, 50, 50, 1100, 525),
            normSlot(1200, 1200, 50, 625, 1100, 525),
        ],
    },
    {
        name: "3 Ảnh Dọc (Hẹp)",
        photoCount: 3,
        canvasW: 700,
        canvasH: 1400,
        slots: [
            normSlot(700, 1400, 100, 50, 500, 400),
            normSlot(700, 1400, 100, 500, 500, 400),
            normSlot(700, 1400, 100, 950, 500, 400),
        ],
    },
    {
        name: "3 Ảnh Dọc (Rộng)",
        photoCount: 3,
        canvasW: 900,
        canvasH: 1500,
        slots: [
            normSlot(900, 1500, 50, 50, 800, 433),
            normSlot(900, 1500, 50, 533, 800, 433),
            normSlot(900, 1500, 50, 1016, 800, 433),
        ],
    },
    {
        name: "4 Ảnh Dọc (Classic)",
        photoCount: 4,
        canvasW: 707,
        canvasH: 2000,
        slots: [
            normSlot(707, 2000, 38, 62, 631, 386),
            normSlot(707, 2000, 38, 464, 631, 386),
            normSlot(707, 2000, 38, 855, 631, 386),
            normSlot(707, 2000, 38, 1254, 631, 386),
        ],
    },
    {
        name: "4 Ảnh Lưới 2x2 (Vuông)",
        photoCount: 4,
        canvasW: 1200,
        canvasH: 1200,
        slots: [
            normSlot(1200, 1200, 50, 50, 525, 525),
            normSlot(1200, 1200, 625, 50, 525, 525),
            normSlot(1200, 1200, 50, 625, 525, 525),
            normSlot(1200, 1200, 625, 625, 525, 525),
        ],
    },
    {
        name: "4 Ảnh Lưới 2x2 (Dọc)",
        photoCount: 4,
        canvasW: 1000,
        canvasH: 1600,
        slots: [
            normSlot(1000, 1600, 60, 60, 420, 710),
            normSlot(1000, 1600, 520, 60, 420, 710),
            normSlot(1000, 1600, 60, 810, 420, 710),
            normSlot(1000, 1600, 520, 810, 420, 710),
        ],
    },
    {
        name: "4 Ảnh Lưới 2x2 (Viền Dày)",
        photoCount: 4,
        canvasW: 1200,
        canvasH: 1200,
        slots: [
            normSlot(1200, 1200, 120, 120, 440, 440),
            normSlot(1200, 1200, 640, 120, 440, 440),
            normSlot(1200, 1200, 120, 640, 440, 440),
            normSlot(1200, 1200, 640, 640, 440, 440),
        ],
    },
    {
        name: "Lưới 9 Ảnh (3x3)",
        photoCount: 9,
        canvasW: 1200,
        canvasH: 1200,
        slots: [
            normSlot(1200, 1200, 50, 50, 333, 333),
            normSlot(1200, 1200, 433, 50, 333, 333),
            normSlot(1200, 1200, 816, 50, 333, 333),
            normSlot(1200, 1200, 50, 433, 333, 333),
            normSlot(1200, 1200, 433, 433, 333, 333),
            normSlot(1200, 1200, 816, 433, 333, 333),
            normSlot(1200, 1200, 50, 816, 333, 333),
            normSlot(1200, 1200, 433, 816, 333, 333),
            normSlot(1200, 1200, 816, 816, 333, 333),
        ],
    },
];
const catalogByName = new Map();
for (const entry of exports.LAYOUT_CATALOG) {
    catalogByName.set(entry.name.trim(), entry);
}
function getCatalogLayoutByName(name) {
    return catalogByName.get(String(name).trim());
}
function applyCatalogToLayoutDoc(layout) {
    if (!layout || typeof layout !== "object") {
        return layout;
    }
    const rec = layout;
    const name = rec.name;
    if (typeof name !== "string") {
        return layout;
    }
    const cat = getCatalogLayoutByName(name);
    if (!cat) {
        return layout;
    }
    return {
        ...rec,
        canvasW: cat.canvasW,
        canvasH: cat.canvasH,
        photoCount: cat.photoCount,
        slots: cat.slots,
        aspectRatio: (0, layoutSlots_helper_1.aspectRatioLabel)(cat.canvasW, cat.canvasH),
    };
}
