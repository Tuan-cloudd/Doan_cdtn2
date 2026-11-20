import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  reason: { type: String, enum: ['copyright', 'spam', 'wrong_subject', 'inappropriate', 'other'], required: true },
  details: { type: String, trim: true, maxlength: 1000, default: '' },
  status: { type: String, enum: ['pending', 'reviewed', 'dismissed'], default: 'pending', index: true },
  adminNote: { type: String, trim: true, maxlength: 1000, default: '' }
}, { timestamps: true });

reportSchema.index({ document: 1, reporter: 1 }, { unique: true });

export default mongoose.model('Report', reportSchema);
