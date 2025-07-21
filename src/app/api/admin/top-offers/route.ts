import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: offers, error } = await supabase
      .from('top_offers')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching top offers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch top offers' },
        { status: 500 }
      );
    }

    return NextResponse.json(offers);
  } catch (error) {
    console.error('Error in top offers GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, image_url, link, category, is_active, sort_order } = body;

    if (!title || !image_url || !link) {
      return NextResponse.json(
        { error: 'Title, image_url, and link are required' },
        { status: 400 }
      );
    }

    const { data: offer, error } = await supabase
      .from('top_offers')
      .insert([{
        title,
        description,
        image_url,
        link,
        category: category || 'Top-Angebot',
        is_active: is_active !== undefined ? is_active : true,
        sort_order: sort_order || 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating top offer:', error);
      return NextResponse.json(
        { error: 'Failed to create top offer' },
        { status: 500 }
      );
    }

    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    console.error('Error in top offers POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
