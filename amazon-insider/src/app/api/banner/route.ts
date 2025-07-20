import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/banner - Get active banner
export async function GET() {
  try {
    const { data: activeBanner, error } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Supabase error fetching banner:', error);
      return NextResponse.json(
        { message: 'Failed to fetch banner from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      banner: activeBanner ? {
        id: activeBanner.id,
        imageUrl: activeBanner.image_url,
        altText: activeBanner.alt_text,
        isActive: activeBanner.is_active,
        createdAt: activeBanner.created_at,
        updatedAt: activeBanner.updated_at,
      } : null
    });
  } catch (error) {
    console.error('Banner fetch error:', error);
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

    // Convert file to base64 (in production, use Supabase Storage or similar)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    console.log('Base64 conversion complete, length:', base64.length);

    // First deactivate all existing banners
    const { error: deactivateError } = await supabase
      .from('banners')
      .update({ is_active: false })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

    if (deactivateError) {
      console.error('Error deactivating existing banners:', deactivateError);
    }

    // Insert new banner
    const { data: savedBanner, error: insertError } = await supabase
      .from('banners')
      .insert([{
        image_url: dataUrl,
        alt_text: file.name,
        is_active: true
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json(
        { message: 'Failed to save banner to database' },
        { status: 500 }
      );
    }

    console.log('Banner saved successfully:', savedBanner.id);

    return NextResponse.json({
      message: 'Banner erfolgreich hochgeladen',
      banner: {
        id: savedBanner.id,
        filename: file.name,
        uploadedAt: savedBanner.created_at,
        isActive: savedBanner.is_active
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

      // Deactivate all banners first
      const { error: deactivateError } = await supabase
        .from('banners')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

      if (deactivateError) {
        console.error('Error deactivating banners:', deactivateError);
        return NextResponse.json(
          { message: 'Failed to deactivate existing banners' },
          { status: 500 }
        );
      }

      // Activate the selected banner
      const { data: activatedBanner, error: activateError } = await supabase
        .from('banners')
        .update({ is_active: true })
        .eq('id', bannerId)
        .select()
        .single();

      if (activateError || !activatedBanner) {
        console.error('Error activating banner:', activateError);
        return NextResponse.json(
          { message: 'Banner nicht gefunden' },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: 'Banner aktiviert' });
    }

    if (action === 'reset') {
      // Deactivate all banners (reset to default/no banner)
      const { error } = await supabase
        .from('banners')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

      if (error) {
        console.error('Error resetting banners:', error);
        return NextResponse.json(
          { message: 'Failed to reset banners' },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: 'Standard-Banner wiederhergestellt' });
    }

    return NextResponse.json(
      { message: 'Ungültige Aktion' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Banner update error:', error);
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

    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', bannerId);

    if (error) {
      console.error('Error deleting banner:', error);
      return NextResponse.json(
        { message: 'Failed to delete banner from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Banner gelöscht' });
  } catch (error) {
    console.error('Banner delete error:', error);
    return NextResponse.json(
      { message: 'Fehler beim Löschen des Banners' },
      { status: 500 }
    );
  }
}
