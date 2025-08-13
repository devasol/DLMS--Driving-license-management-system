import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ensureUploadsDirectories = () => {
  console.log('🗂️  Ensuring upload directories exist...');

  const uploadsDir = path.join(__dirname, 'uploads');
  const profilePicturesDir = path.join(uploadsDir, 'profile-pictures');
  const documentsDir = path.join(uploadsDir, 'documents');

  // Create main uploads directory
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory:', uploadsDir);
  } else {
    console.log('✅ Uploads directory exists:', uploadsDir);
  }

  // Create profile pictures directory
  if (!fs.existsSync(profilePicturesDir)) {
    fs.mkdirSync(profilePicturesDir, { recursive: true });
    console.log('✅ Created profile-pictures directory:', profilePicturesDir);
  } else {
    console.log('✅ Profile-pictures directory exists:', profilePicturesDir);
  }

  // Create documents directory
  if (!fs.existsSync(documentsDir)) {
    fs.mkdirSync(documentsDir, { recursive: true });
    console.log('✅ Created documents directory:', documentsDir);
  } else {
    console.log('✅ Documents directory exists:', documentsDir);
  }

  console.log('🎉 All upload directories are ready!\n');
};

export default ensureUploadsDirectories;
