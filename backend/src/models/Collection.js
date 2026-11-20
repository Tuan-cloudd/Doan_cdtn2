import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }]
}, { timestamps: true });

collectionSchema.index({ owner: 1, name: 1 }, { unique: true });

export default mongoose.model('Collection', collectionSchema);
