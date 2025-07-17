import { NextResponse } from 'next/server';
import { productStore } from '@/lib/data-store';

// GET /api/admin/products - Get all products (including inactive) for admin
export async function GET() {
  try {
    // Return all products for admin panel (both active and inactive)
    const allProducts = productStore.getAll();
    return NextResponse.json(allProducts);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
