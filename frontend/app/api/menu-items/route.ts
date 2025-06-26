import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!session.user.restaurant_id) {
    return NextResponse.json({ error: 'No restaurant associated with user' }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', session.user.restaurant_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!session.user.restaurant_id) {
    return NextResponse.json({ error: 'No restaurant associated with user' }, { status: 403 });
  }

  const { name, description, price, category, image_url } = await request.json();

  const { data, error } = await supabaseAdmin
    .from('menu_items')
    .insert([{ 
      name, 
      description, 
      price, 
      category, 
      image_url, 
      restaurant_id: session.user.restaurant_id 
    }])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
