import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!session.user.restaurant_id) {
    return NextResponse.json({ error: 'No restaurant associated with user' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Get all tables for the restaurant
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('tables')
      .select('*')
      .eq('restaurant_id', session.user.restaurant_id)
      .order('name');

    if (tablesError) throw tablesError;

    // Get reservations for the specified date
    const { data: reservations, error: reservationsError } = await supabaseAdmin
      .from('reservations')
      .select(`
        *,
        tables!inner (
          id,
          restaurant_id
        ),
        customers (
          name
        )
      `)
      .eq('tables.restaurant_id', session.user.restaurant_id)
      .eq('reservation_date', date);

    if (reservationsError) throw reservationsError;

    // Combine tables with their reservations
    const tablesWithReservations = tables.map(table => {
      const reservation = reservations.find(r => r.table_id === table.id);
      
      // Determine table status based on reservation status
      let tableStatus = 'available';
      if (reservation) {
        if (reservation.status === 'pending') {
          tableStatus = 'pending';
        } else if (reservation.status === 'confirmed') {
          tableStatus = 'confirmed';
        }
      }
      
      return {
        id: table.id,
        name: table.name,
        capacity: table.capacity,
        location: table.location,
        status: tableStatus,
        reservation: reservation ? {
          id: reservation.id,
          customer_name: reservation.client_name || reservation.customers?.name || '',
          reservation_time: reservation.reservation_time,
          party_size: reservation.party_size,
          customer_email: reservation.customer_email,
          customer_phone: reservation.client_contact,
        } : undefined
      };
    });

    return NextResponse.json({
      date,
      tables: tablesWithReservations
    });
  } catch (error) {
    console.error('Error fetching dashboard status:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard status' }, { status: 500 });
  }
}
