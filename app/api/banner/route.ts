import { NextRequest, NextResponse } from 'next/server';
import { bannerStore, type BannerData } from '@/lib/banner-store';

// GET /api/banner - Get active banner
export async function GET() {
  try {
    const activeBanner = bannerStore.getActiveBanner();
    return NextResponse.json({ banner: activeBanner });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to get banner' },
      { status: 500 }
    );
  }
}

// POST /api/banner - Upload new banner
export async function POST(request: NextRequest) {
  try {
    console.log('Banner upload request received');

    const formData = await request.formData();
    const file = formData.get('banner') as File;

    console.log('File from formData:', file ? file.name : 'No file');

    if (!file || file.size === 0) {
      console.log('No file uploaded or file is empty');
      return NextResponse.json(
        { message: 'Keine Datei hochgeladen oder Datei ist leer' },
        { status: 400 }
      );
    }

    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('Invalid file type:', file.type);
      return NextResponse.json(
        { message: 'Nur Bilddateien sind erlaubt (JPG, PNG, GIF, WebP)' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.log('File too large:', file.size);
      return NextResponse.json(
        { message: 'Datei ist zu groß. Maximale Größe: 5MB' },
        { status: 400 }
      );
    }

    console.log('Converting file to base64...');

    // Convert file to base64 (in production, save to proper storage)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    console.log('Base64 conversion complete, length:', base64.length);

    // Create banner data
    const banner: BannerData = {
      id: Date.now().toString(),
      filename: file.name,
      url: dataUrl,
      uploadedAt: new Date().toISOString(),
      isActive: false
    };

    console.log('Adding banner to store...');

    // Add to store
    const savedBanner = bannerStore.addBanner(banner);

    console.log('Banner saved successfully:', savedBanner.id);

    return NextResponse.json({
      message: 'Banner erfolgreich hochgeladen',
      banner: {
        id: savedBanner.id,
        filename: savedBanner.filename,
        uploadedAt: savedBanner.uploadedAt,
        isActive: savedBanner.isActive
      }
    });
  } catch (error) {
    console.error('Banner upload error:', error);
    return NextResponse.json(
      { message: `Fehler beim Hochladen des Banners: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}` },
      { status: 500 }
    );
  }
}

// PUT /api/banner - Set active banner
export async function PUT(request: NextRequest) {
  try {
    const { bannerId, action } = await request.json();

    if (action === 'activate') {
      if (!bannerId) {
        return NextResponse.json(
          { message: 'Banner-ID ist erforderlich' },
          { status: 400 }
        );
      }

      const success = bannerStore.setActiveBanner(bannerId);
      if (!success) {
        return NextResponse.json(
          { message: 'Banner nicht gefunden' },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: 'Banner aktiviert' });
    }

    if (action === 'reset') {
      bannerStore.resetToDefault();
      return NextResponse.json({ message: 'Standard-Banner wiederhergestellt' });
    }

    return NextResponse.json(
      { message: 'Ungültige Aktion' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Fehler beim Aktualisieren des Banners' },
      { status: 500 }
    );
  }
}

// DELETE /api/banner - Delete banner
export async function DELETE(request: NextRequest) {
  try {
    const { bannerId } = await request.json();

    if (!bannerId) {
      return NextResponse.json(
        { message: 'Banner-ID ist erforderlich' },
        { status: 400 }
      );
    }

    const success = bannerStore.deleteBanner(bannerId);
    if (!success) {
      return NextResponse.json(
        { message: 'Banner nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Banner gelöscht' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Fehler beim Löschen des Banners' },
      { status: 500 }
    );
  }
}
