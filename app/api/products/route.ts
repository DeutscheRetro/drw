import { NextRequest, NextResponse } from 'next/server';
import { productStore, type Product } from '@/lib/data-store';
import { addReferralCode } from '@/lib/utils';

// Mock function to simulate Amazon product data fetching
// In a real application, you'd integrate with Amazon's Product Advertising API
function fetchAmazonProductData(amazonId: string): Promise<Partial<Product>> {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      // Mock data based on common Amazon products
      const mockProducts: Record<string, Partial<Product>> = {
        'B08N5WRWNW': {
          title: 'Echo Dot (5th Gen, 2022 release) | Smart speaker with Alexa',
          description: 'Our most popular smart speaker with a fabric design. Ready to help with weather, jokes, skills, and more.',
          price: '$29.99',
          originalPrice: '$49.99',
          image: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=400',
          category: 'Smart Home',
          rating: 4.7,
          reviewCount: 245673,
          discount: 40,
          tags: ['smart speaker', 'alexa', 'echo', 'amazon', 'voice assistant'],
          link: addReferralCode(`https://amazon.de/dp/${amazonId}`),
        },
        'B0B7BP6CJN': {
          title: 'Apple AirPods Pro (2nd Generation) Wireless Earbuds',
          description: 'Up to 2x more Active Noise Cancellation. Transparency mode. Adaptive Audio. Personalized Spatial Audio.',
          price: '$199.99',
          originalPrice: '$249.00',
          image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400',
          category: 'Electronics',
          rating: 4.8,
          reviewCount: 89234,
          discount: 20,
          tags: ['airpods', 'apple', 'wireless', 'earbuds', 'noise cancelling'],
          link: addReferralCode(`https://amazon.de/dp/${amazonId}`),
        },
        'B09JQSZ5QR': {
          title: 'Ninja Foodi Personal Blender for Shakes, Smoothies',
          description: 'Powerful nutrient & vitamin extraction. 18 oz. to-go cup with spout lid. Easy-to-clean base and dishwasher-safe cups.',
          price: '$39.95',
          originalPrice: '$79.99',
          image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
          category: 'Kitchen',
          rating: 4.5,
          reviewCount: 12456,
          discount: 50,
          tags: ['blender', 'ninja', 'smoothies', 'kitchen', 'personal'],
          link: addReferralCode(`https://amazon.de/dp/${amazonId}`),
        },
      };

      // Return mock data if available, otherwise generate generic data
      const mockData = mockProducts[amazonId] || {
        title: `Amazon Product ${amazonId}`,
        description: `Description for Amazon product with ID ${amazonId}. This product offers great value and customer satisfaction.`,
        price: `$${(Math.random() * 200 + 10).toFixed(2)}`,
        originalPrice: `$${(Math.random() * 300 + 50).toFixed(2)}`,
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
        category: ['Electronics', 'Kitchen', 'Home & Garden', 'Books & Media'][Math.floor(Math.random() * 4)],
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        reviewCount: Math.floor(Math.random() * 100000 + 1000),
        discount: Math.floor(Math.random() * 50 + 10),
        tags: ['amazon', 'deal', 'product'],
        link: addReferralCode(`https://amazon.de/dp/${amazonId}`),
      };

      resolve(mockData);
    }, 1000); // Simulate 1 second API call
  });
}

// GET /api/products - Get all active products
export async function GET() {
  try {
    const activeProducts = productStore.getActive();
    return NextResponse.json(activeProducts);
  } catch (error) {
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
    const existingProduct = productStore.getByAmazonId(amazonId);
    if (existingProduct) {
      return NextResponse.json(
        { message: 'Product with this Amazon ID already exists' },
        { status: 409 }
      );
    }

    try {
      // Fetch product data from Amazon (mock implementation)
      const amazonData = await fetchAmazonProductData(amazonId);

      const newProduct: Product = {
        id: Date.now().toString(), // Simple ID generation
        amazonId,
        title: amazonData.title || 'Unknown Product',
        description: amazonData.description || 'No description available',
        price: amazonData.price || '$0.00',
        originalPrice: amazonData.originalPrice,
        image: amazonData.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
        category: amazonData.category || 'General',
        rating: amazonData.rating || 0,
        reviewCount: amazonData.reviewCount || 0,
        discount: amazonData.discount,
        tags: amazonData.tags || [],
        link: amazonData.link || addReferralCode(`https://amazon.de/dp/${amazonId}`),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
      };

      const addedProduct = productStore.add(newProduct);

      return NextResponse.json(addedProduct, { status: 201 });
    } catch (fetchError) {
      return NextResponse.json(
        { message: 'Failed to fetch product data from Amazon. Please check the product ID.' },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to add product' },
      { status: 500 }
    );
  }
}
