import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/admin/products - Get all products (including inactive) for admin
export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { message: 'Failed to fetch products from database' },
        { status: 500 }
      );
    }

    // Transform Supabase data to match frontend interface
    const transformedProducts = products?.map(product => ({
      id: product.id,
      amazonId: product.amazon_id,
      title: product.title,
      description: product.description,
      price: product.price,
      originalPrice: product.original_price,
      image: product.image,
      category: product.category,
      rating: product.rating,
      reviewCount: product.review_count,
      discount: product.discount,
      tags: product.tags,
      link: product.link,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      status: product.status,
    })) || [];

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
