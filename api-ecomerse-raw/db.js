import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // 👈 đọc biến từ file .env

const PORT = process.env.PORT || 3000;

const connectDb = (app) => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecom';
  console.log('🔗 Mongo URI:', mongoUri);

  mongoose
    .connect(mongoUri)
    .then(() => {
      console.log('✅ Connected to MongoDB');
      app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`📡 API available at http://localhost:${PORT}/api/v1`);
        console.log(`📚 Swagger docs at http://localhost:${PORT}/api-docs`);
      });
    })
    .catch((err) => {
      console.error('❌ Failed to connect to MongoDB:', err);
      console.error('💡 Make sure MongoDB is running on your system');
      console.error('💡 You can start MongoDB with: mongod (or use MongoDB service)');
      // Still start server even if DB fails (for development)
      app.listen(PORT, () => {
        console.log(`⚠️  Server is running on port ${PORT} but MongoDB is not connected`);
        console.log(`📡 API available at http://localhost:${PORT}/api/v1`);
      });
    });
};

export { connectDb };
