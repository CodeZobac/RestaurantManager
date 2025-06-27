import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chat_id } = await request.json();

    if (!chat_id) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    // Validate chat_id is numeric (Telegram chat IDs are numbers)
    const numericChatId = parseInt(chat_id);
    if (isNaN(numericChatId)) {
      return NextResponse.json({ error: 'Chat ID must be a valid number' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('admins')
      .update({ telegram_chat_id: numericChatId })
      .eq('id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json({ 
      message: 'Telegram connection successful', 
      data: {
        chat_id: numericChatId,
        admin_id: session.user.id
      }
    });
  } catch (error) {
    console.error('Error connecting Telegram manually:', error);
    return NextResponse.json({ 
      error: 'Failed to connect to Telegram. Please check your Chat ID and try again.' 
    }, { status: 500 });
  }
}
