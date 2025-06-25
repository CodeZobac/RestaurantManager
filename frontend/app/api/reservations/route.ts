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
    const { customer_name, customer_email, customer_phone, table_id, reservation_date, reservation_time, party_size, special_requests } = body;

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
        table_id,
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
