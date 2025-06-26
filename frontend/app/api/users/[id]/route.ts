import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

interface UpdateData {
  name: string;
  email: string;
  role: string;
  phone: string;
  restaurant_id: string;
  password_hash?: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.restaurant_id) {
      return NextResponse.json({ error: 'No restaurant associated with user' }, { status: 403 });
    }

    const { id } = await params;
    const { name, email, password, role, phone } = await request.json();

    // Check if the user being updated belongs to the same restaurant
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('admins')
      .select('restaurant_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (existingUser.restaurant_id !== session.user.restaurant_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const updateData: Partial<UpdateData> = { 
      name, 
      email, 
      role, 
      phone, 
      restaurant_id: session.user.restaurant_id // Ensure restaurant_id doesn't change
    };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password_hash = await bcrypt.hash(password, salt);
    }

    const { data, error } = await supabaseAdmin
      .from('admins')
      .update(updateData)
      .eq('id', id)
      .select('id, name, email, role, phone')
      .single();

    if (error) {
      console.error('Database error updating user:', error);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.restaurant_id) {
      return NextResponse.json({ error: 'No restaurant associated with user' }, { status: 403 });
    }

    const { id } = await params;

    // Check if the user being deleted belongs to the same restaurant
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('admins')
      .select('restaurant_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (existingUser.restaurant_id !== session.user.restaurant_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Prevent users from deleting themselves
    if (id === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('admins').delete().eq('id', id);

    if (error) {
      console.error('Database error deleting user:', error);
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
