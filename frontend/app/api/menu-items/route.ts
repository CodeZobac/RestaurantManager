import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const { data, error } = await supabaseAdmin.from('menu_items').select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { name, description, price, category, image_url, restaurant_id } = await request.json();

  const { data, error } = await supabaseAdmin
    .from('menu_items')
    .insert([{ name, description, price, category, image_url, restaurant_id }])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
