import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: offers, error } = await supabase
      .from('top_offers')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching active top offers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch top offers' },
        { status: 500 }
      );
    }

    return NextResponse.json(offers || []);
  } catch (error) {
    console.error('Error in top offers GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
