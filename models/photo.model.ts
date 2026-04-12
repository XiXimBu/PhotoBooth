import mongoose, { Document, model, Schema} from "mongoose";

interface IPhoto extends Document {
  r2Url: string;
  frameId: Schema.Types.ObjectId; // Trỏ về Frame cụ thể đã dùng
  shareId: string;
  createdAt: Date;
}

const photoSchema = new Schema<IPhoto>({
  r2Url: { type: String, required: true },
  // REF ĐẾN FRAME
  frameId: { type: Schema.Types.ObjectId, ref: 'Frame', required: true },
  shareId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: '7d' }
});

const Photo = mongoose.model<IPhoto>("Photo", photoSchema, "photos");

export default Photo;