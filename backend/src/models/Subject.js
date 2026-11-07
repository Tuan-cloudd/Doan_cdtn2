import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  faculty: { type: String, trim: true, default: '' },
  major: { type: String, trim: true, default: '' },
  description: { type: String, trim: true, default: '' }
}, { timestamps: true });

export default mongoose.model('Subject', subjectSchema);
