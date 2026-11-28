import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';

const bucketName = 'documentFiles';
const gridFsPrefix = 'gridfs:';
const uploadDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', process.env.UPLOAD_DIR || 'uploads');

function getBucket() {
  if (!mongoose.connection.db) throw new Error('MongoDB is not connected');
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName });
}

function getGridFsId(storedName) {
  const id = storedName.slice(gridFsPrefix.length);
  if (!/^[\da-f]{24}$/i.test(id)) throw new Error('Invalid GridFS document file ID');
  return new mongoose.mongo.ObjectId(id);
}

function uploadStream(source, originalName, mimeType) {
  const stream = getBucket().openUploadStream(originalName, { metadata: { contentType: mimeType } });
  return new Promise((resolve, reject) => {
    let settled = false;
    const fail = (error) => {
      if (settled) return;
      settled = true;
      source.destroy();
      stream.destroy();
      reject(error);
    };

    source.once('error', fail);
    stream.once('error', fail);
    stream.once('finish', () => {
      if (settled) return;
      settled = true;
      resolve(`${gridFsPrefix}${stream.id.toString()}`);
    });
    source.pipe(stream);
  });
}

export function isGridFsStoredName(storedName) {
  return storedName.startsWith(gridFsPrefix);
}

export function storeDocumentFile(buffer, originalName, mimeType) {
  return uploadStream(Readable.from([buffer]), originalName, mimeType);
}

export async function storeLocalDocumentFile(storedName, originalName, mimeType) {
  const filePath = path.join(uploadDir, path.basename(storedName));
  let stats;
  try {
    stats = await fs.promises.stat(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
  if (!stats.isFile()) return null;
  return uploadStream(fs.createReadStream(filePath), originalName, mimeType);
}

export async function getDocumentFile(storedName) {
  if (isGridFsStoredName(storedName)) {
    const id = getGridFsId(storedName);
    const bucket = getBucket();
    const file = await bucket.find({ _id: id }).next();
    if (!file) return null;
    return { stream: bucket.openDownloadStream(id), length: file.length };
  }

  const filePath = path.join(uploadDir, path.basename(storedName));
  let stats;
  try {
    stats = await fs.promises.stat(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
  if (!stats.isFile()) return null;
  return { stream: fs.createReadStream(filePath), length: stats.size };
}

export async function deleteGridFsDocumentFile(storedName) {
  await getBucket().delete(getGridFsId(storedName));
}

export async function deleteDocumentFile(storedName) {
  if (isGridFsStoredName(storedName)) {
    const id = getGridFsId(storedName);
    const bucket = getBucket();
    if (await bucket.find({ _id: id }).hasNext()) await bucket.delete(id);
    return;
  }

  const filePath = path.join(uploadDir, path.basename(storedName));
  await fs.promises.unlink(filePath).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
  });
}
