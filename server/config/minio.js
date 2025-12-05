const Minio = require('minio');
require('dotenv').config();

// MinIO client configuration
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
  secretKey: process.env.MINIO_SECRET_KEY || 'admin123',
});

// Ensure bucket exists
const ensureBucketExists = async () => {
  try {
    const bucketName = process.env.MINIO_BUCKET || 'resolve360';
    const exists = await minioClient.bucketExists(bucketName);
    
    if (!exists) {
      console.log(`Creating bucket: ${bucketName}`);
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`✅ Bucket '${bucketName}' created successfully`);
    } else {
      console.log(`✅ Bucket '${bucketName}' already exists`);
    }
  } catch (err) {
    console.error('Error ensuring bucket exists:', err);
  }
};

// Initialize MinIO connection
const initMinio = async () => {
  try {
    await ensureBucketExists();
    console.log('✅ MinIO client initialized successfully');
  } catch (err) {
    console.error('❌ Error initializing MinIO:', err);
  }
};

module.exports = {
  minioClient,
  initMinio,
  ensureBucketExists
};
