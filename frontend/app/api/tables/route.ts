import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@/auth';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  const searchParams = request.nextUrl.searchParams;
  const restaurantId = searchParams.get('restaurantId');
  
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const restaurantIdToUse = restaurantId || session.user.restaurant_id;

  if (!restaurantIdToUse) {
    return NextResponse.json({ error: 'No restaurant associated with user' }, { status: 403 });
  }

  try {
    // Get today's date for reservation lookup
    const today = new Date().toISOString().split('T')[0];

    // Get tables with their reservations for today
    const { data: tables, error: tablesError } = await supabase
      .from('tables')
      .select('*')
      .eq('restaurant_id', restaurantIdToUse)
      .order('name');

    if (tablesError) throw tablesError;

    // Get today's reservations for this restaurant
    const { data: reservations, error: reservationsError } = await supabase
      .from('reservations')
      .select(`
        *,
        tables!inner (
          id,
          restaurant_id
        )
      `)
      .eq('tables.restaurant_id', restaurantIdToUse)
      .eq('reservation_date', today);

    if (reservationsError) throw reservationsError;

    // Combine tables with their current reservation status
    const tablesWithStatus = tables.map(table => {
      const reservation = reservations?.find(r => r.table_id === table.id);
      
      // Determine actual status based on reservations
      let actualStatus = 'available';
      if (reservation) {
        if (reservation.status === 'pending') {
          actualStatus = 'pending';
        } else if (reservation.status === 'confirmed') {
          actualStatus = 'confirmed';
        }
      }
      
      return {
        ...table,
        status: actualStatus, // Override the table status with reservation status
        reservation: reservation || null
      };
    });

    return NextResponse.json(tablesWithStatus);
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
