import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@/auth';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!session.user.restaurant_id) {
    return NextResponse.json({ error: 'No restaurant associated with user' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, capacity, location, status } = body;

    // First, verify the table belongs to the user's restaurant
    const { data: existingTable, error: fetchError } = await supabase
      .from('tables')
      .select('restaurant_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingTable || existingTable.restaurant_id !== session.user.restaurant_id) {
      return NextResponse.json({ error: 'Table not found or access denied' }, { status: 404 });
    }

    const { data: table, error } = await supabase
      .from('tables')
      .update({ name, capacity, location, status })
      .eq('id', id)
      .eq('restaurant_id', session.user.restaurant_id) // Double check
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(table);
  } catch (error) {
    console.error('Error updating table:', error);
    return NextResponse.json({ error: 'Failed to update table' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!session.user.restaurant_id) {
    return NextResponse.json({ error: 'No restaurant associated with user' }, { status: 403 });
  }

  try {
    const { id } = await params;

    // First, verify the table belongs to the user's restaurant
    const { data: existingTable, error: fetchError } = await supabase
      .from('tables')
      .select('restaurant_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingTable || existingTable.restaurant_id !== session.user.restaurant_id) {
      return NextResponse.json({ error: 'Table not found or access denied' }, { status: 404 });
    }

    const { error } = await supabase
      .from('tables')
      .delete()
      .eq('id', id)
      .eq('restaurant_id', session.user.restaurant_id); // Double check

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting table:', error);
    return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 });
  }
}
