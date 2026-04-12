import mongoose from "mongoose";
import dotenv from "dotenv";
import { LAYOUT_CATALOG } from "../config/layoutCatalog";
import Theme from "../models/theme.model";
import Frame from "../models/frame.model";
import Layout from "../models/layout.model";
import { aspectRatioLabel } from "../helpers/layoutSlots.helper";

dotenv.config();

const themes = [
  {
    name: "Đơn Giản",
    description: "Những mẫu cực kì đơn giản với những người đơn giản",
    thumbnailUrl: "https://pub-your-id.r2.dev/thumbnails/retro-theme.jpg",
    priority: 1,
    isActive: true,
  },
  {
    name: "Lễ Tết",
    description: "Những mẫu ngày lễ cực kì đẹp với những ngày đẹp nhất năm",
    thumbnailUrl: "https://pub-your-id.r2.dev/thumbnails/k-style.jpg",
    priority: 2,
    isActive: true,
  },
  {
    name: "Sinh nhật của xinh nhất",
    description: "Sinh nhật của xinh nhất ",
    thumbnailUrl: "https://pub-your-id.r2.dev/thumbnails/xmas.jpg",
    priority: 3,
    isActive: true,
  },   
  {
    name: "Màu mè",
    description: "Không phải dơn giản thì là màu mè ",
    thumbnailUrl: "https://pub-your-id.r2.dev/thumbnails/xmas.jpg",
    priority: 4,
    isActive: true,
  }, 
];

/** Khớp với tên layout trong `LAYOUT_CATALOG` (sau khi insert để lấy layoutId) */
const LAYOUT_KEY_TO_NAME: Record<string, string> = {
  "4_strips": "4 Ảnh Dọc (Classic)",
  grid_2x2: "4 Ảnh Lưới 2x2 (Vuông)",
};

/** Chỉ cần URL + theme + layout — không cần đặt tên từng khung (schema Frame cũng không có `name`). */
const frameSeeds: Array<{
  themeName: string;
  overlayUrl: string;
  layoutKey: keyof typeof LAYOUT_KEY_TO_NAME;
  isActive: boolean;
}> = [
  {
    themeName: "Lễ Tết",
    overlayUrl: "https://res.cloudinary.com/dai4kn53o/image/upload/v1775985902/download_2_copy_bny6ju.png",
    layoutKey: "4_strips",
    isActive: true,
  },
  {
    themeName: "Màu mè",
    overlayUrl: "https://res.cloudinary.com/dai4kn53o/image/upload/v1775985900/Untitled-1_srb8pn.png",
    layoutKey: "4_strips",
    isActive: true,
  },
  {
    themeName: "Lễ Tết",
    overlayUrl: "https://res.cloudinary.com/dai4kn53o/image/upload/v1775985900/framevietnam_jitrdo.png",
    layoutKey: "4_strips",
    isActive: true,
  },
  {
    themeName: "Đơn Giản",
    overlayUrl: "https://res.cloudinary.com/dai4kn53o/image/upload/v1775985899/download_10_copy_wx9pfq.png",
    layoutKey: "4_strips",
    isActive: true,
  },
  {
    themeName: "Đơn Giản",
    overlayUrl: "https://res.cloudinary.com/dai4kn53o/image/upload/v1775985899/download_13_copy_usd7v2.png",
    layoutKey: "4_strips",
    isActive: true,
  },
  {
    themeName: "Màu mè",
    overlayUrl: "https://res.cloudinary.com/dai4kn53o/image/upload/v1775985899/download_11_copy_uctguu.png",
    layoutKey: "4_strips",
    isActive: true,
  },
  {
    themeName: "Đơn Giản",
    overlayUrl: "https://pub-your-id.r2.dev/frames/mint-minimal.png",
    layoutKey: "4_strips",
    isActive: true,
  },
  {
    themeName: "Lễ Tết",
    overlayUrl: "https://res.cloudinary.com/dai4kn53o/image/upload/v1775985899/thu_iz0xtp.png",
    layoutKey: "4_strips",
    isActive: true,
  },
  {
    themeName: "Lễ Tết",
    overlayUrl: "https://pub-your-id.r2.dev/frames/tet-loc-do.png",
    layoutKey: "4_strips",
    isActive: true,
  },
  {
    themeName: "Sinh nhật của xinh nhất",
    overlayUrl: "https://res.cloudinary.com/dai4kn53o/image/upload/v1775985899/download_12_copy_wvcynv.png",
    layoutKey: "4_strips",
    isActive: true,
  },
  {
    themeName: "Sinh nhật của xinh nhất",
    overlayUrl: "https://res.cloudinary.com/dai4kn53o/image/upload/v1775985899/download_7_copy_rt1jjm.png",
    layoutKey: "4_strips",
    isActive: true,
  },
  {
    themeName: "Đơn Giản",
    overlayUrl: "https://res.cloudinary.com/dai4kn53o/image/upload/v1775985898/download_5_copy_tjcov4.png",
    layoutKey: "4_strips",
    isActive: true,
  },
  {
    themeName: "Lễ Tết",
    overlayUrl: "https://res.cloudinary.com/dai4kn53o/image/upload/v1775985898/download_9_copy_hppq7z.png",
    layoutKey: "4_strips",
    isActive: true,
  },
  {
    themeName: "Lễ Tết",
    overlayUrl: "https://res.cloudinary.com/dai4kn53o/image/upload/v1775985898/download_6_copy_m3qi5p.png",
    layoutKey: "4_strips",
    isActive: true,
  },
  {
    themeName: "Màu mè",
    overlayUrl: "https://res.cloudinary.com/dai4kn53o/image/upload/v1775985898/download_4_copy_k6yjut.png",
    layoutKey: "4_strips",
    isActive: true,
  },
  {
    themeName: "Lễ Tết",
    overlayUrl: "https://res.cloudinary.com/dai4kn53o/image/upload/v1775985897/download_8_copy_shnsgr.png",
    layoutKey: "4_strips",
    isActive: true,
  },
  {
    themeName: "Màu mè",
    overlayUrl: "https://res.cloudinary.com/dai4kn53o/image/upload/v1775985897/download_1_copy_cthsil.png",
    layoutKey: "4_strips",
    isActive: true,
  },
  {
    themeName: "Màu mè",
    overlayUrl: "https://res.cloudinary.com/dai4kn53o/image/upload/v1775985897/download_3_copy_nljajw.png",
    layoutKey: "4_strips",
    isActive: true,
  },
];

const layoutSeedsForDb = LAYOUT_CATALOG.map((L) => ({
  ...L,
  aspectRatio: aspectRatioLabel(L.canvasW, L.canvasH),
}));

const seedThemesAndFrames = async () => {
  try {
    const mongoUri =
      process.env.MONGOOSE_URL ||
      process.env.MONGO_URI ||
      "mongodb://localhost:27017/photobooth";
    await mongoose.connect(mongoUri);
    const dbName = mongoose.connection.db?.databaseName ?? "(unknown)";
    console.log("🌱 Đang kết nối tới MongoDB để seed dữ liệu...");
    console.log(`📦 Database trong URI: "${dbName}"`);
    console.log(
      "   → Trong Compass/Atlas: mở đúng database này; collections: themes, frames, layouts (chữ thường)."
    );

    await Frame.deleteMany({});
    console.log("🗑️ Đã xóa sạch dữ liệu cũ trong collection Frames.");

    await Layout.deleteMany({});
    console.log("🗑️ Đã xóa sạch dữ liệu cũ trong collection Layouts.");

    await Theme.deleteMany({});
    console.log("🗑️ Đã xóa sạch dữ liệu cũ trong collection Themes.");

    const createdThemes = await Theme.insertMany(themes);
    console.log(`✅ Đã chèn thành công ${createdThemes.length} chủ đề mới!`);

    const createdLayouts = await Layout.insertMany(layoutSeedsForDb);
    console.log(`✅ Đã chèn thành công ${createdLayouts.length} layout lưới!`);

    const layoutIdByName = new Map<string, mongoose.Types.ObjectId>();
    createdLayouts.forEach((doc) => {
      layoutIdByName.set(doc.name, doc._id as mongoose.Types.ObjectId);
    });

    const themeMap = new Map<string, string>();
    createdThemes.forEach((theme) => {
      themeMap.set(theme.name, String(theme._id));
      console.log(`- ${theme.name}: ID [${theme._id}]`);
    });

    const framesToInsert = frameSeeds
      .map((frame) => {
        const themeId = themeMap.get(frame.themeName);
        const layoutName = LAYOUT_KEY_TO_NAME[frame.layoutKey];
        const layoutId = layoutIdByName.get(layoutName);
        const hint =
          frame.overlayUrl.length > 56
            ? `${frame.overlayUrl.slice(0, 52)}…`
            : frame.overlayUrl;

        if (!themeId) {
          console.warn(
            `⚠️ Bỏ qua khung (${hint}) — không có theme "${frame.themeName}".`
          );
          return null;
        }
        if (!layoutId) {
          console.warn(
            `⚠️ Bỏ qua khung (${hint}) — không có layout "${layoutName}" (key ${frame.layoutKey}).`
          );
          return null;
        }

        return {
          themeId,
          overlayUrl: frame.overlayUrl,
          layoutId,
          isActive: frame.isActive,
        };
      })
      .filter((frame): frame is NonNullable<typeof frame> => frame !== null);

    const createdFrames = await Frame.insertMany(framesToInsert);
    console.log(`✅ Đã chèn thành công ${createdFrames.length} khung mới!`);
  } catch (error) {
    console.error("❌ Lỗi khi seed dữ liệu:", error);
    if (error instanceof Error) {
      console.error("   Message:", error.message);
    }
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Đã ngắt kết nối database.");
    process.exit();
  }
};

seedThemesAndFrames();
