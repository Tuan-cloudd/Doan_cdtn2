import Category from '../models/Category.js';
import Subject from '../models/Subject.js';

export async function listCategories(_req, res) {
  const [categories, subjects] = await Promise.all([
    Category.find({ type: { $ne: 'subject' } }).sort({ type: 1, name: 1 }),
    Subject.find().sort({ name: 1 })
  ]);
  categories.push(...subjects.map((subject) => ({
    _id: subject._id,
    name: subject.name,
    type: 'subject',
    description: subject.description
  })));
  res.json({ categories });
}

export async function createCategory(req, res) {
  const { name, type, description } = req.body;
  if (typeof name !== 'string' || !name.trim() || !['faculty', 'major', 'subject', 'documentType'].includes(type)) {
    return res.status(400).json({ message: 'Tên và loại danh mục không hợp lệ' });
  }
  const category = type === 'subject'
    ? await Subject.create({ name: name.trim(), description })
    : await Category.create({ name: name.trim(), type, description });
  res.status(201).json({ category: { ...category.toObject(), type } });
}

export async function deleteCategory(req, res) {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
  }
  res.json({ message: 'Đã xóa danh mục' });
}
