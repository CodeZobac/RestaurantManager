import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.restaurant_id) {
      return NextResponse.json({ error: 'No restaurant associated with user' }, { status: 403 });
    }

    // Only return users from the same restaurant
    const { data, error } = await supabaseAdmin
      .from('admins')
      .select('id, name, email, role, phone, restaurant_id')
      .eq('restaurant_id', session.user.restaurant_id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.restaurant_id) {
      return NextResponse.json({ error: 'No restaurant associated with user' }, { status: 403 });
    }

    const { name, email, password, role, phone } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const { data, error } = await supabaseAdmin
      .from('admins')
      .insert([{ 
        name, 
        email, 
        password_hash, 
        role: role || 'user', 
        phone, 
        restaurant_id: session.user.restaurant_id,
        onboarding_completed: true // New users added to existing restaurant are considered onboarded
      }])
      .select('id, name, email, role, phone');

    if (error) {
      console.error('Database error creating user:', error);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
