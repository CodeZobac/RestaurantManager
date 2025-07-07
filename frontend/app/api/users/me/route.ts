import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the current user's full details from the database
    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .select('id, name, email, role, phone_number, restaurant_id, telegram_chat_id, onboarding_completed')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Database error fetching admin:', error);
      return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 });
    }

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Also fetch restaurant name if restaurant_id exists
    let restaurant_name = null;
    if (admin.restaurant_id) {
      const { data: restaurant } = await supabaseAdmin
        .from('restaurants')
        .select('name')
        .eq('id', admin.restaurant_id)
        .single();
      
      if (restaurant) {
        restaurant_name = restaurant.name;
      }
    }

    return NextResponse.json({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      phone: admin.phone_number,
      restaurant_id: admin.restaurant_id,
      restaurant_name,
      telegram_chat_id: admin.telegram_chat_id,
      onboarding_completed: admin.onboarding_completed,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
