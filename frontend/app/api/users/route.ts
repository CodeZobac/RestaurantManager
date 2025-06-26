import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function GET() {
  const { data, error } = await supabaseAdmin.from('admins').select('id, name, email, role, phone');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const { name, email, password, role, phone, restaurant_id } = await request.json();

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  const { data, error } = await supabaseAdmin
    .from('admins')
    .insert([{ name, email, password_hash, role, phone, restaurant_id }])
    .select('id, name, email, role, phone');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
