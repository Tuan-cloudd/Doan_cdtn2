import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['document_approved', 'document_rejected', 'comment', 'rating', 'report', 'system'], default: 'system' },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  message: { type: String, required: true, trim: true, maxlength: 1000 },
  link: { type: String, trim: true, default: '' },
  isRead: { type: Boolean, default: false, index: true }
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
