import mongoose from 'mongoose';

const downloadSchema = new mongoose.Schema({
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  downloadedAt: { type: Date, default: Date.now }
}, { timestamps: false });

export default mongoose.model('Download', downloadSchema);
