import Database from 'better-sqlite3';
import fs from 'fs';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const DB_PATH = process.env.DATABASE_URL;

// Veritabanı dosyasının varlığını kontrol et
if (!fs.existsSync(DB_PATH)) {
  throw new Error(`Database file not found at: ${DB_PATH}`);
}

// Dosya izinlerini kontrol et
try {
  fs.accessSync(DB_PATH, fs.constants.R_OK);
  console.log('Database file is readable');
} catch (error) {
  console.error('Database file is not readable:', error);
  throw new Error(`Database file is not readable: ${error instanceof Error ? error.message : 'Unknown error'}`);
}

let db: Database.Database;

try {
  // Veritabanı bağlantısını oluştur
  db = new Database(DB_PATH);
  console.log('Successfully connected to database');
} catch (error) {
  console.error('Error connecting to database:', error);
  throw new Error(`Failed to connect to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
}

export { db }; 