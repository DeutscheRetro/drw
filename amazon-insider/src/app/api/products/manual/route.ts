import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { addReferralCode } from '@/lib/utils';

// POST /api/products/manual - Add product manually
export async function POST(request: NextRequest) {
  try {
    const { amazonId, title, image, link, price, category, description } = await request.json();

    // Validation
    if (!amazonId || !title || !image) {
      return NextResponse.json(
        { message: 'Amazon ID, title, and image are required' },
        { status: 400 }
      );
    }

    // Check if product already exists
    const { data: existingProduct } = await supabase
      .from('products')
      .select('amazon_id')
      .eq('amazon_id', amazonId)
      .single();

    if (existingProduct) {
      return NextResponse.json(
        { message: 'Product with this Amazon ID already exists' },
        { status: 409 }
      );
    }

    // Ensure the link has the referral code
    const finalLink = link ? addReferralCode(link) : addReferralCode(`https://amazon.de/dp/${amazonId}`);

    const productData = {
      amazon_id: amazonId,
      title: title,
      description: description || '',
      price: price || '',
      image: image,
      category: category || 'Allgemein',
      rating: 0,
      review_count: 0,
      tags: [],
      link: finalLink,
      status: 'active',
    };

    const { data: newProduct, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { message: 'Failed to save product to database' },
        { status: 500 }
      );
    }

    // Transform response to match frontend interface
    const transformedProduct = {
      id: newProduct.id,
      amazonId: newProduct.amazon_id,
      title: newProduct.title,
      description: newProduct.description,
      price: newProduct.price,
      originalPrice: newProduct.original_price,
      image: newProduct.image,
      category: newProduct.category,
      rating: newProduct.rating,
      reviewCount: newProduct.review_count,
      discount: newProduct.discount,
      tags: newProduct.tags,
      link: newProduct.link,
      createdAt: newProduct.created_at,
      updatedAt: newProduct.updated_at,
      status: newProduct.status,
    };

    return NextResponse.json(transformedProduct, { status: 201 });
  } catch (error) {
    console.error('Manual product creation error:', error);
    return NextResponse.json(
      { message: 'Failed to create product manually' },
      { status: 500 }
    );
  }
}
