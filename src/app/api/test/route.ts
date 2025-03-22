import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';

// Database bağlantısını global olarak tutuyoruz
let db: Database.Database | null = null;

function openDB() {
  if (db) return db;
  
  try {
    const dbPath = process.env.DATABASE_PATH;
    if (!dbPath) {
      throw new Error('DATABASE_PATH environment variable is not set');
    }
    
    db = new Database(dbPath);
    return db;
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Failed to connect to database');
  }
}

export async function GET() {
  try {
    const database = openDB();
    
    // Veritabanı bağlantısını test ediyoruz
    database.prepare('SELECT 1').get();
    
    const tokens = database.prepare("SELECT * FROM tokens").all();
    
    return NextResponse.json({ 
      success: true,
      data: tokens 
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Database error'
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST(request: Request) {
  try {
    const database = openDB();
    const body = await request.json();
    
    // Gerekli alanları kontrol et
    if (!body.token_key || !body.token_id1) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: token_key, token_id1'
      }, { status: 400 });
    }

    // Yeni token ekle
    const insertStmt = database.prepare(`
      INSERT INTO tokens (
        server_id,
        token_key,
        token_type,
        token_id1,
        token_id2,
        token_created,
        token_description,
        token_customset,
        token_from_client_id
      ) VALUES (
        1,
        @token_key,
        0,
        @token_id1,
        0,
        @token_created,
        NULL,
        NULL,
        NULL
      )
    `);

    const now = new Date().toISOString();
    const result = insertStmt.run({
      token_key: body.token_key,
      token_id1: body.token_id1,
      token_created: now
    });

    return NextResponse.json({
      success: true,
      message: 'Token added successfully',
      data: {
        id: result.lastInsertRowid,
        server_id: 1,
        token_key: body.token_key,
        token_type: 0,
        token_id1: body.token_id1,
        token_id2: 0,
        token_created: now,
        token_description: null,
        token_customset: null,
        token_from_client_id: null
      }
    }, {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Database error'
    }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}