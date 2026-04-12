import mongoose, { Document, Schema } from "mongoose";

interface ITheme extends Document {
  name: string;        // VD: "Retro", "K-Style", "Giáng Sinh"
  description?: string;
  thumbnailUrl?: string; // Ảnh đại diện để hiển thị ở danh mục ngoài UI
  priority: number;     // Thứ tự hiển thị (1, 2, 3...)
  isActive: boolean;
}

const themeSchema = new Schema<ITheme>({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  thumbnailUrl: { type: String },
  priority: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});


const Theme = mongoose.model<ITheme>("Theme", themeSchema, "themes");

export default Theme;