import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    if (id) {
      // Fetch a single restaurant by ID
      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('id, name, created_at, updated_at')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching restaurant with id ${id}:`, error);
        return NextResponse.json(
          { error: `Failed to fetch restaurant with id ${id}` },
          { status: 500 }
        );
      }

      if (!restaurant) {
        return NextResponse.json(
          { error: `Restaurant with id ${id} not found` },
          { status: 404 }
        );
      }

      return NextResponse.json(restaurant);
    } else {
      // Fetch all restaurants
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select('id, name, created_at, updated_at')
        .order('name');

      if (error) {
        console.error('Error fetching restaurants:', error);
        return NextResponse.json(
          { error: 'Failed to fetch restaurants' },
          { status: 500 }
        );
      }

      return NextResponse.json(restaurants);
    }
  } catch (error) {
    console.error('Error in restaurants API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
