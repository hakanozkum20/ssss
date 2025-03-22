import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Session cookie'sini sil
    const response = NextResponse.json({ success: true });
    response.cookies.delete('session');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 