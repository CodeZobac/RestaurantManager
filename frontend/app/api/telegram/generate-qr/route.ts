import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST() {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has completed onboarding
    if (!session.user.onboarding_completed) {
      return NextResponse.json(
        { error: 'User must complete onboarding first' },
        { status: 400 }
      );
    }

    // Check if user has restaurant_id
    if (!session.user.restaurant_id) {
      return NextResponse.json(
        { error: 'User must be associated with a restaurant' },
        { status: 400 }
      );
    }
    
    const cleanedBackendUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
    const response = await fetch(`${cleanedBackendUrl}/api/v1/auth/telegram/generate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ admin_id: session.user.id }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      
      // Handle specific error cases
      if (response.status === 400) {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(
          { error: errorData.detail },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to generate Telegram token' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to backend:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
