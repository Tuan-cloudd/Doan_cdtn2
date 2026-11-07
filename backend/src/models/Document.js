import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, trim: true, maxlength: 3000, default: '' },
  originalName: { type: String, required: true },
  storedName: { type: String, required: true, unique: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  faculty: { type: String, trim: true, default: '' },
  major: { type: String, trim: true, default: '' },
  subject: { type: String, trim: true, default: '', index: true },
  documentType: { type: String, trim: true, default: '', index: true },
  keywords: [{ type: String, trim: true, lowercase: true }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  rejectionReason: { type: String, trim: true, default: '' },
  downloads: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 }
}, { timestamps: true });

documentSchema.index({ title: 'text', description: 'text', keywords: 'text', subject: 'text' });
documentSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Document', documentSchema);
