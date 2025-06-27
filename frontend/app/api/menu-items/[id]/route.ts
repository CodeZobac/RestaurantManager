import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

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
    const { name, description, price, category, image_url } = await request.json();

    // Check if the menu item belongs to the same restaurant
    const { data: existingItem, error: fetchError } = await supabaseAdmin
      .from('menu_items')
      .select('restaurant_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    if (existingItem.restaurant_id !== session.user.restaurant_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .update({ 
        name, 
        description, 
        price, 
        category, 
        image_url, 
        restaurant_id: session.user.restaurant_id // Ensure restaurant_id doesn't change
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Database error updating menu item:', error);
      return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
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

    // Check if the menu item belongs to the same restaurant
    const { data: existingItem, error: fetchError } = await supabaseAdmin
      .from('menu_items')
      .select('restaurant_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    if (existingItem.restaurant_id !== session.user.restaurant_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { error } = await supabaseAdmin.from('menu_items').delete().eq('id', id);

    if (error) {
      console.error('Database error deleting menu item:', error);
      return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
