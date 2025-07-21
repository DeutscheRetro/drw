import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      .update({
        title,
        description,
        image_url,
        link,
        category: category || 'Top-Angebot',
        is_active: is_active !== undefined ? is_active : true,
        sort_order: sort_order || 0
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating top offer:', error);
      return NextResponse.json(
        { error: 'Failed to update top offer' },
        { status: 500 }
      );
    }

    if (!offer) {
      return NextResponse.json(
        { error: 'Top offer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(offer);
  } catch (error) {
    console.error('Error in top offer PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('top_offers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting top offer:', error);
      return NextResponse.json(
        { error: 'Failed to delete top offer' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Top offer deleted successfully' });
  } catch (error) {
    console.error('Error in top offer DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
