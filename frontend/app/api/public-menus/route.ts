import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch restaurants with their menu items
    const { data: restaurants, error: restaurantsError } = await supabase
      .from('restaurants')
      .select(
        `
        id,
        name,
        menu_items (
          id,
          name,
          description,
          price,
          category
        )
      `
      );

    if (restaurantsError) {
      console.error('Error fetching restaurants:', restaurantsError);
      return NextResponse.json(
        { error: 'Failed to fetch restaurants' },
        { status: 500 }
      );
    }

    // Transform the data to match our frontend interface
    const restaurantsWithMenus = restaurants?.map(restaurant => ({
      id: restaurant.id,
      name: restaurant.name,
      menuItems: restaurant.menu_items || []
    })) || [];

    // Sort restaurants by name
    restaurantsWithMenus.sort((a, b) => a.name.localeCompare(b.name));

    restaurantsWithMenus.sort((a, b) => a.name.localeCompare(b.name));

    console.log('Transformed restaurants:', JSON.stringify(restaurantsWithMenus, null, 2));

    // Filter out restaurants that don't have any menu items
    const restaurantsWithItems = restaurantsWithMenus.filter(
      restaurant => restaurant.menuItems.length > 0
    );

    console.log('Filtered restaurants with items:', JSON.stringify(restaurantsWithItems, null, 2));

    return NextResponse.json(restaurantsWithItems);

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
