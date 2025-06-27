import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

const onboardingSchema = z.object({
  restaurantName: z.string().min(1, 'Restaurant name is required'),
  restaurantId: z.string().optional(),
  tables: z.array(z.object({
    name: z.string().min(1, 'Table name is required'),
    capacity: z.number().min(1, 'Capacity must be at least 1'),
  })).min(1, 'At least one table is required'),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors }, { status: 400 });
    }

    const { restaurantName, tables } = parsed.data;

    // 1. Create the restaurant
    const { data: restaurant, error: restaurantError } = await supabaseAdmin
      .from('restaurants')
      .insert({ name: restaurantName })
      .select()
      .single();

    if (restaurantError) throw restaurantError;

    // 2. Update the user with the new restaurant ID
    const { error: userError } = await supabaseAdmin
      .from('admins')
      .update({
        restaurant_id: restaurant.id,
        onboarding_completed: true,
      })
      .eq('id', session.user.id)
      .select()
      .single();

    if (userError) throw userError;

    // 3. Create the tables for the restaurant
    const tableData = tables.map(table => ({
      ...table,
      restaurant_id: restaurant.id,
    }));

    const { error: tablesError } = await supabaseAdmin
      .from('tables')
      .insert(tableData);

    if (tablesError) throw tablesError;

    return NextResponse.json({
      message: 'Onboarding completed successfully',
      restaurant_id: restaurant.id,
      admin_id: session.user.id,
    });

  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 });
  }
}
