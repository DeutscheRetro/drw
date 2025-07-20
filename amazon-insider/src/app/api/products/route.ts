import { NextRequest, NextResponse } from 'next/server';
import { supabase, type Product } from '@/lib/supabase';
import { addReferralCode } from '@/lib/utils';

// Mock function to simulate Amazon product data fetching
function fetchAmazonProductData(amazonId: string): Promise<Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockProducts: Record<string, Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>> = {
        'B08N5WRWNW': {
          title: 'Echo Dot (5th Gen, 2022 release) | Smart speaker with Alexa',
          description: 'Our most popular smart speaker with a fabric design. Ready to help with weather, jokes, skills, and more.',
          price: '29,99€',
          original_price: '49,99€',
          image: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=400',
          category: 'Smart Home',
          rating: 4.7,
          review_count: 245673,
          discount: 40,
          tags: ['smart speaker', 'alexa', 'echo', 'amazon', 'voice assistant'],
          link: addReferralCode(`https://amazon.de/dp/${amazonId}`),
        },
        'B0B7BP6CJN': {
          title: 'Apple AirPods Pro (2nd Generation) Wireless Earbuds',
          description: 'Up to 2x more Active Noise Cancellation. Transparency mode. Adaptive Audio. Personalized Spatial Audio.',
          price: '199,99€',
          original_price: '249,00€',
          image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400',
          category: 'Electronics',
          rating: 4.8,
          review_count: 89234,
          discount: 20,
          tags: ['airpods', 'apple', 'wireless', 'earbuds', 'noise cancelling'],
          link: addReferralCode(`https://amazon.de/dp/${amazonId}`),
        },
        'B09JQSZ5QR': {
          title: 'Ninja Foodi Personal Blender for Shakes, Smoothies',
          description: 'Powerful nutrient & vitamin extraction. 18 oz. to-go cup with spout lid. Easy-to-clean base and dishwasher-safe cups.',
          price: '39,95€',
          original_price: '79,99€',
          image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
          category: 'Kitchen',
          rating: 4.5,
          review_count: 12456,
          discount: 50,
          tags: ['blender', 'ninja', 'smoothies', 'kitchen', 'personal'],
          link: addReferralCode(`https://amazon.de/dp/${amazonId}`),
        },
      };

      const mockData = mockProducts[amazonId] || {
        title: `Amazon Produkt ${amazonId}`,
        description: `Beschreibung für Amazon-Produkt mit ID ${amazonId}. Dieses Produkt bietet großartigen Wert und Kundenzufriedenheit.`,
        price: `${(Math.random() * 200 + 10).toFixed(2)}€`,
        original_price: `${(Math.random() * 300 + 50).toFixed(2)}€`,
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
        category: ['Electronics', 'Kitchen', 'Home & Garden', 'Books & Media'][Math.floor(Math.random() * 4)],
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        review_count: Math.floor(Math.random() * 100000 + 1000),
        discount: Math.floor(Math.random() * 50 + 10),
        tags: ['amazon', 'deal', 'product'],
        link: addReferralCode(`https://amazon.de/dp/${amazonId}`),
      };

      resolve(mockData);
    }, 1000);
  });
}

// GET /api/products - Get all active products
export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
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

// POST /api/products - Add new product
export async function POST(request: NextRequest) {
  try {
    const { amazonId } = await request.json();

    if (!amazonId || typeof amazonId !== 'string') {
      return NextResponse.json(
        { message: 'Amazon ID is required' },
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

    try {
      // Fetch product data from Amazon (mock implementation)
      const amazonData = await fetchAmazonProductData(amazonId);

      const productData = {
        amazon_id: amazonId,
        title: amazonData.title || 'Unknown Product',
        description: amazonData.description || 'No description available',
        price: amazonData.price || '0,00€',
        original_price: amazonData.original_price,
        image: amazonData.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
        category: amazonData.category || 'Allgemein',
        rating: amazonData.rating || 0,
        review_count: amazonData.review_count || 0,
        discount: amazonData.discount,
        tags: amazonData.tags || [],
        link: amazonData.link || addReferralCode(`https://amazon.de/dp/${amazonId}`),
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
    } catch (fetchError) {
      return NextResponse.json(
        { message: 'Failed to fetch product data from Amazon. Please check the product ID.' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { message: 'Failed to add product' },
      { status: 500 }
    );
  }
}
