import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { table1_id, table2_id } = await req.json();

    if (!table1_id || !table2_id) {
      return NextResponse.json({ error: 'Missing table IDs' }, { status: 400 });
    }

    // Use a transaction to ensure both updates succeed or fail together
    const { error } = await supabaseAdmin.rpc('update_table_connections', {
      p_table1_id: table1_id,
      p_table2_id: table2_id,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Connection created successfully' });
  } catch (error) {
    console.error('Failed to create connection:', error);
    return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { table1_id, table2_id } = await req.json();

    if (!table1_id || !table2_id) {
      return NextResponse.json({ error: 'Missing table IDs' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.rpc('delete_table_connection', {
      p_table1_id: table1_id,
      p_table2_id: table2_id,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Connection deleted successfully' });
  } catch (error) {
    console.error('Failed to delete connection:', error);
    return NextResponse.json({ error: 'Failed to delete connection' }, { status: 500 });
  }
}
