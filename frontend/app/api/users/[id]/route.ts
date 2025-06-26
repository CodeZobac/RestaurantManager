import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

interface UpdateData {
  name: string;
  email: string;
  role: string;
  phone: string;
  restaurant_id: string;
  password_hash?: string;
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { name, email, password, role, phone, restaurant_id } = await request.json();

  const updateData: Partial<UpdateData> = { name, email, role, phone, restaurant_id };

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  const { error } = await supabaseAdmin.from('admins').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'User deleted successfully' });
}
