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
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select(`
        *,
        tables!inner (
          id,
          name,
          restaurant_id
        ),
        customers (
          id,
          name,
          email,
          phone
        )
      `)
      .eq('tables.restaurant_id', session.user.restaurant_id)
      .order('reservation_date', { ascending: true })
      .order('reservation_time', { ascending: true });

    if (error) throw error;

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_name, customer_email, customer_phone, restaurant_id, reservation_date, reservation_time, party_size, special_requests, table_id } = body;

    // If table_id is provided (from dashboard popover), use it directly
    // Otherwise, find available table that can accommodate the party size
    let selectedTableId = table_id;
    
    if (!selectedTableId) {
      const { data: availableTables, error: tablesError } = await supabase
        .from('tables')
        .select('id, name, capacity')
        .eq('restaurant_id', restaurant_id)
        .eq('status', 'available')
        .gte('capacity', party_size)
        .order('capacity', { ascending: true })
        .limit(1);

      if (tablesError) throw tablesError;

      if (!availableTables || availableTables.length === 0) {
        return NextResponse.json({ 
          success: false,
          error: 'No available tables found for the requested party size at this restaurant' 
        }, { status: 409 });
      }

      selectedTableId = availableTables[0].id;
    }

    // Create or get customer
    let customer_id;
    if (customer_email) {
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', customer_email)
        .single();

      if (existingCustomer) {
        customer_id = existingCustomer.id;
      } else {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            name: customer_name,
            email: customer_email,
            phone: customer_phone
          })
          .select('id')
          .single();

        if (customerError) throw customerError;
        customer_id = newCustomer.id;
      }
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          name: customer_name,
          phone: customer_phone
        })
        .select('id')
        .single();

      if (customerError) throw customerError;
      customer_id = newCustomer.id;
    }

    // Create reservation
    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert({
        customer_id,
        table_id: selectedTableId,
        restaurant_id,
        reservation_date,
        reservation_time,
        party_size,
        special_requests,
        client_name: customer_name,
        client_contact: customer_phone,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      reservation_id: reservation.id,
      message: 'Reservation created successfully'
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, ...updates } = body;

    // First, update the reservation
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .update({ status, ...updates })
      .eq('id', id)
      .select()
      .single();

    if (reservationError) throw reservationError;

    // If the reservation was updated successfully, update the corresponding table
    if (reservation) {
      let tableStatus;
      if (status === 'confirmed') {
        tableStatus = 'occupied';
      } else if (status === 'declined') {
        tableStatus = 'available';
      }

      if (tableStatus) {
        const { error: tableError } = await supabase
          .from('tables')
          .update({ status: tableStatus })
          .eq('id', reservation.table_id);

        if (tableError) {
          // Log the error, but don't block the response to the client
          console.error('Error updating table status:', tableError);
        }
      }
    }

    return NextResponse.json({ success: true, data: reservation });
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json({ error: 'Failed to delete reservation' }, { status: 500 });
  }
}
