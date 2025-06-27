import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!restaurantId || !type) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    let query = supabase.from(getViewName(type)).select('*');
    
    // Filter by restaurant ID
    query = query.eq('restaurant_id', restaurantId);

    // Add date filtering if provided
    if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate);
    }

    // Add ordering based on type
    if (type === 'revenue' || type === 'daily_performance') {
      query = query.order('date', { ascending: false });
    } else if (type === 'peak_hours') {
      query = query.order('hour', { ascending: true });
    } else if (type === 'customers') {
      query = query.order('total_reservations', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getViewName(type: string): string {
  switch (type) {
    case 'revenue':
      return 'revenue_analytics';
    case 'customers':
      return 'customer_insights';
    case 'occupancy':
      return 'occupancy_analytics';
    case 'daily_performance':
      return 'daily_performance_summary';
    case 'peak_hours':
      return 'peak_hours_enhanced';
    case 'table_utilization':
      return 'table_utilization';
    default:
      throw new Error(`Invalid analytics type: ${type}`);
  }
}
