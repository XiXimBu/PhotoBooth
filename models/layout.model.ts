import mongoose, { Schema, Document } from 'mongoose';

interface ISlot {
  /** 0→1 theo chiều ngang (cạnh trái & chiều rộng ô) */
  x: number;
  /** 0→1 theo chiều dọc (cạnh trên & chiều cao ô) */
  y: number;
  w: number;
  h: number;
}

interface ILayout extends Document {
  name: string;        // VD: "4_O_DOC_TRUYEN_THONG"
  photoCount: number;  // So anh trong layout
  /** Cùng tỉ lệ với file PNG khung (W:H). Slot 0→1 là % trên ảnh đó — nếu tỉ lệ DB ≠ PNG thì lỗ sẽ lệch */
  canvasW: number;
  canvasH: number;
  /** Tỉ lệ chuẩn (vd. "1:3", "1:1"); nếu trống API suy ra từ canvasW/H */
  aspectRatio?: string;
  /** Cộng vào y (0→1) khi cần chỉnh nhẹ (mặc định 0) */
  previewSlotYShift?: number;
  /** Tọa độ chuẩn hóa 0→1; render nhân với kích thước canvas sau khi ép khung */
  slots: ISlot[];
}

const layoutSchema = new Schema<ILayout>({
  name: { type: String, required: true, unique: true },
  photoCount: { type: Number, required: true },
  canvasW: { type: Number, default: 1200 },
  canvasH: { type: Number, default: 1800 },
  aspectRatio: { type: String, required: false },
  previewSlotYShift: { type: Number, default: 0 },
  slots: [{
    x: Number, y: Number, w: Number, h: Number
  }]
});
const Layout = mongoose.model<ILayout>("Layout", layoutSchema, "layouts");

export default Layout;