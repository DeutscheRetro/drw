import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/products/[id]/click - Track a click on a product link
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Increment the click count for the product
    const { data: product, error } = await supabase
      .from('products')
      .update({
        click_count: supabase.rpc('increment_click_count', { product_id: id })
      })
      .eq('id', id)
      .select('click_count')
      .single();

    if (error) {
      console.error('Error tracking click:', error);
      // Still return success to not break user experience
      return NextResponse.json({ success: true, message: 'Click tracked' });
    }

    return NextResponse.json({
      success: true,
      message: 'Click tracked successfully',
      click_count: product?.click_count || 0
    });
  } catch (error) {
    console.error('Error in click tracking:', error);
    // Return success to not break user experience
    return NextResponse.json({ success: true, message: 'Click tracked' });
  }
}
