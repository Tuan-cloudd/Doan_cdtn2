import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Subject from '../models/Subject.js';

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
  await mongoose.connect(process.env.MONGODB_URI);
  const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  await User.updateOne(
    { email },
    { $setOnInsert: { name: 'Quản trị viên', email, passwordHash: await bcrypt.hash(password, 12), role: 'admin' } },
    { upsert: true }
  );
  const categories = [
    { name: 'Công nghệ thông tin', type: 'faculty' },
    { name: 'Kỹ thuật phần mềm', type: 'major' },
    { name: 'Giáo trình', type: 'documentType' },
    { name: 'Đề thi', type: 'documentType' },
    { name: 'Bài giảng', type: 'documentType' }
  ];
  await Promise.all(categories.map((category) => Category.updateOne(
    { name: category.name },
    { $setOnInsert: category },
    { upsert: true }
  )));
  await Promise.all(['Cơ sở dữ liệu', 'Lập trình Web'].map((name) => Subject.updateOne(
    { name },
    { $setOnInsert: { name } },
    { upsert: true }
  )));
  console.log(`Seed complete. Admin: ${email}`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
