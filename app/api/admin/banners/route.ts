import { NextResponse } from 'next/server';
import { bannerStore } from '@/lib/banner-store';

// GET /api/admin/banners - Get all banners for admin
export async function GET() {
  try {
    const allBanners = bannerStore.getAllBanners();
    return NextResponse.json(allBanners);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}
