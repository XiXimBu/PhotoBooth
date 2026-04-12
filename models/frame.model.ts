import mongoose, { Document, model, Schema} from "mongoose";

interface IFrame extends Document {

  themeId: Schema.Types.ObjectId; // Trỏ về Theme
  overlayUrl: string; // Link file PNG trong suốt
  layoutId: Schema.Types.ObjectId;     // VD: "grid_2x2", "vertical_strip"
  isActive: boolean;
}

const frameSchema = new Schema<IFrame>({

  // REF ĐẾN THEME
  themeId: { type: Schema.Types.ObjectId, ref: 'Theme', required: true },
  overlayUrl: { type: String, required: true },
  layoutId: { type: Schema.Types.ObjectId, ref: 'Layout', required: true },
  isActive: { type: Boolean, default: true }
});

const Frame = mongoose.model<IFrame>("Frame", frameSchema, "frames");

export default Frame;
