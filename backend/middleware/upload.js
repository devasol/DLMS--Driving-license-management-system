import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directories exist
const uploadsDir = path.join(__dirname, "../uploads/documents");
const profilePicturesDir = path.join(__dirname, "../uploads/profile-pictures");
const newsImagesDir = path.join(__dirname, "../uploads/news");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(profilePicturesDir)) {
  fs.mkdirSync(profilePicturesDir, { recursive: true });
}

if (!fs.existsSync(newsImagesDir)) {
  fs.mkdirSync(newsImagesDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    const fileName =
      file.fieldname.replace(/[[\]]/g, "_") +
      "-" +
      uniqueSuffix +
      fileExtension;
    cb(null, fileName);
  },
});

// Profile picture storage configuration
const profilePictureStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profilePicturesDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename for profile pictures
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    const fileName = "profile-" + uniqueSuffix + fileExtension;
    cb(null, fileName);
  },
});

// News images storage configuration
const newsImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, newsImagesDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename for news images
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    const fileName = "news-" + uniqueSuffix + fileExtension;
    cb(null, fileName);
  },
});

// File filter for documents
const fileFilter = (req, file, cb) => {
  console.log("🔍 File filter check:", {
    originalname: file.originalname,
    mimetype: file.mimetype,
    fieldname: file.fieldname,
  });

  // Check file extension
  const allowedExtensions = /\.(jpeg|jpg|png|gif|pdf)$/i;
  const extname = allowedExtensions.test(file.originalname.toLowerCase());

  // Check mimetype - be more flexible with mimetypes
  const allowedMimetypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/x-pdf",
    "text/plain", // Allow text files for testing
  ];
  const mimetype = allowedMimetypes.includes(file.mimetype.toLowerCase());

  console.log("📋 File validation:", {
    extname: extname,
    mimetype: mimetype,
    extension: path.extname(file.originalname).toLowerCase(),
    mimeType: file.mimetype,
  });

  if (mimetype || extname) {
    // Accept if either mimetype OR extension is valid
    console.log("✅ File accepted");
    return cb(null, true);
  } else {
    console.log("❌ File rejected");
    cb(new Error("Only PDF, JPG, JPEG, PNG, and GIF files are allowed!"));
  }
};

// File filter for profile pictures (images only)
const profilePictureFilter = (req, file, cb) => {
  // Check file type - only images allowed for profile pictures
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, and PNG files are allowed for profile pictures!"
      )
    );
  }
};

// Configure multer for documents
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Configure multer for profile pictures
const profilePictureUpload = multer({
  storage: profilePictureStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for profile pictures
  },
  fileFilter: profilePictureFilter,
});

// File filter for news images (images only)
const newsImageFilter = (req, file, cb) => {
  console.log("🔍 News image filter check:", {
    originalname: file.originalname,
    mimetype: file.mimetype,
    fieldname: file.fieldname,
  });

  // Check file type - only images allowed for news images
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  console.log("📋 News image validation:", {
    extname: extname,
    mimetype: mimetype,
    extension: path.extname(file.originalname).toLowerCase(),
    mimeType: file.mimetype,
  });

  if (mimetype && extname) {
    console.log("✅ News image accepted");
    return cb(null, true);
  } else {
    console.log("❌ News image rejected");
    cb(
      new Error(
        "Only JPG, JPEG, PNG, GIF, and WEBP files are allowed for news images!"
      )
    );
  }
};

// Configure multer for news images
const newsImageUpload = multer({
  storage: newsImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for news images
  },
  fileFilter: newsImageFilter, // Use dedicated filter for news images
});

// Export different upload configurations
export const uploadDocuments = upload.fields([
  { name: "documents[drivingSchoolCertificate]", maxCount: 1 },
  { name: "documents[nationalId]", maxCount: 1 },
  { name: "documents[personalId]", maxCount: 1 },
  { name: "documents[medicalCertificate]", maxCount: 1 },
]);

// Alternative: use upload.any() to handle any files
export const uploadAny = upload.any();

// Profile picture upload (single file)
export const uploadProfilePicture =
  profilePictureUpload.single("profilePicture");

// News image upload (single file)
export const uploadNewsImage = newsImageUpload.single("featuredImage");

// News upload with any files (for backward compatibility)
export const uploadNewsAny = newsImageUpload.any();

export default upload;
