import 'dotenv/config';
import mongoose from 'mongoose';
import Document from '../models/Document.js';
import { connectDatabase } from '../config/database.js';
import {
  deleteGridFsDocumentFile,
  isGridFsStoredName,
  storeLocalDocumentFile
} from '../services/document-file.service.js';

let migrated = 0;
let alreadyStored = 0;
let missing = 0;
let skipped = 0;

try {
  await connectDatabase();
  const cursor = Document.find({}).select('_id storedName originalName mimeType').lean().cursor();

  for await (const document of cursor) {
    if (isGridFsStoredName(document.storedName)) {
      alreadyStored += 1;
      continue;
    }

    const storedName = await storeLocalDocumentFile(document.storedName, document.originalName, document.mimeType);
    if (!storedName) {
      missing += 1;
      console.warn(`No local file found for document ${document._id}`);
      continue;
    }

    try {
      const result = await Document.updateOne(
        { _id: document._id, storedName: document.storedName },
        { $set: { storedName } }
      );
      if (result.modifiedCount !== 1) {
        await deleteGridFsDocumentFile(storedName);
        skipped += 1;
        console.warn(`Skipped document ${document._id} because its file record changed during migration`);
        continue;
      }
      migrated += 1;
    } catch (error) {
      try {
        await deleteGridFsDocumentFile(storedName);
      } catch (cleanupError) {
        console.error(`Unable to remove the temporary GridFS file for document ${document._id}:`, cleanupError);
      }
      throw error;
    }
  }

  console.log(`File migration complete: ${migrated} migrated, ${alreadyStored} already in GridFS, ${missing} local files missing, ${skipped} changed during migration.`);
  if (missing || skipped) process.exitCode = 1;
} catch (error) {
  console.error('Document file migration failed:', error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
