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
    const { data: regions, error } = await supabase
      .from('table_regions')
      .select('*')
      .eq('restaurant_id', session.user.restaurant_id)
      .order('name');

    if (error) throw error;

    return NextResponse.json(regions);
  } catch (error) {
    console.error('Error fetching table regions:', error);
    return NextResponse.json({ error: 'Failed to fetch table regions' }, { status: 500 });
  }
}
