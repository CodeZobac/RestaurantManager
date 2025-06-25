import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  const { email, password, name } = await request.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Missing email, password, or name' }, { status: 400 });
  }

  const password_hash = await bcrypt.hash(password, 10);

  try {
    const { data, error } = await supabaseAdmin
      .from('admins')
      .insert({
        email,
        password_hash,
        name,
        role: 'user'
      })
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      return NextResponse.json({ error: 'Could not create user' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Database insert error:', error);
    return NextResponse.json({ error: 'Could not create user' }, { status: 500 });
  }
}
