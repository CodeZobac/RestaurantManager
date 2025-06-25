import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@/auth';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET() {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!session.user.restaurant_id) {
    return NextResponse.json({ error: 'No restaurant associated with user' }, { status: 403 });
  }

  try {
    const { data: tables, error } = await supabase
      .from('tables')
      .select('*')
      .eq('restaurant_id', session.user.restaurant_id)
      .order('name');

    if (error) throw error;

    return NextResponse.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!session.user.restaurant_id) {
    return NextResponse.json({ error: 'No restaurant associated with user' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, capacity, location, status = 'available' } = body;

    const { data: table, error } = await supabase
      .from('tables')
      .insert({
        name,
        capacity,
        location,
        status,
        restaurant_id: session.user.restaurant_id
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(table);
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 });
  }
}
