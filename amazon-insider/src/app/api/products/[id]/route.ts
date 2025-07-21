import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { addReferralCode } from '@/lib/utils';

// Helper function to transform database product to frontend format
function transformProduct(product: {
  id: string;
  amazon_id: string;
  title: string;
  description: string;
  price: string;
  original_price?: string;
  image: string;
  category: string;
  rating: number;
  review_count: number;
  discount?: number;
  tags: string[];
  link: string;
  created_at: string;
  updated_at: string;
  status: string;
}) {
  return {
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
  };
}

// PATCH /api/products/[id] - Update product
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();

    // Transform frontend keys to database keys
    const dbUpdates: {
      title?: string;
      description?: string;
      price?: string;
      original_price?: string;
      image?: string;
      category?: string;
      rating?: number;
      review_count?: number;
      discount?: number;
      tags?: string[];
      status?: string;
      link?: string;
    } = {};

    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.originalPrice !== undefined) dbUpdates.original_price = updates.originalPrice;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
    if (updates.reviewCount !== undefined) dbUpdates.review_count = updates.reviewCount;
    if (updates.discount !== undefined) dbUpdates.discount = updates.discount;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    // Wenn ein Link aktualisiert wird, automatisch Referral-Code hinzufügen
    if (updates.link && typeof updates.link === 'string') {
      dbUpdates.link = addReferralCode(updates.link);
    }

    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json(
        { message: 'Failed to update product in database' },
        { status: 500 }
      );
    }

    if (!updatedProduct) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(transformProduct(updatedProduct));
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { message: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json(
        { message: 'Failed to delete product from database' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Product delete error:', error);
    return NextResponse.json(
      { message: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

// GET /api/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase select error:', error);
      return NextResponse.json(
        { message: 'Failed to fetch product from database' },
        { status: 500 }
      );
    }

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(transformProduct(product));
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
