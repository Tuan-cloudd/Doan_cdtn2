import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
favoriteSchema.index({ document: 1, user: 1 }, { unique: true });

export default mongoose.model('Favorite', favoriteSchema);
