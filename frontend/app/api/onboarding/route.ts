import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@/auth';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: Request) {
  const session = await auth();
  
  console.log('Session data:', JSON.stringify(session, null, 2));

  if (!session || !session.user || !session.user.id) {
    console.log('No valid session found:', { session });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  console.log('User ID from session:', userId);

  try {
    const { restaurantName, phoneNumber, tableRegions } = await request.json();

    // 1. Create the restaurant
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .insert({ 
        id: crypto.randomUUID(),
        name: restaurantName 
      })
      .select()
      .single();

    if (restaurantError) throw restaurantError;

    // 2. Update the admin with the restaurant_id and phone number
    const { error: adminError } = await supabase
      .from('admins')
      .update({ restaurant_id: restaurant.id, phone_number: phoneNumber })
      .eq('id', userId);

    if (adminError) throw adminError;

    // 3. Create the table regions
    const regionsToInsert = tableRegions.map((region: { name: string }) => ({
      restaurant_id: restaurant.id,
      name: region.name,
    }));

    const { data: insertedRegions, error: regionsError } = await supabase
      .from('table_regions')
      .insert(regionsToInsert)
      .select();

    if (regionsError) throw regionsError;

    // 4. Create the tables
    const tablesToInsert = [];
    for (const region of tableRegions) {
        const correspondingRegion = insertedRegions.find((r: { name: string; }) => r.name === region.name);
        if (correspondingRegion) {
            for (let i = parseInt(region.startNumber); i <= parseInt(region.endNumber); i++) {
                tablesToInsert.push({
                    restaurant_id: restaurant.id,
                    table_region_id: correspondingRegion.id,
                    name: `Table ${i}`,
                    location: region.name, // Add the location field
                    capacity: 4, // Default capacity, can be changed later
                    status: 'available',
                });
            }
        }
    }

    const { error: tablesError } = await supabase
        .from('tables')
        .insert(tablesToInsert);

    if (tablesError) throw tablesError;


    return NextResponse.json({ message: 'Onboarding successful', restaurantId: restaurant.id });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'An error occurred during onboarding.' }, { status: 500 });
  }
}
