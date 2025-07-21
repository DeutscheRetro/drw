'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import FeaturedSection from '@/components/FeaturedSection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  amazonId: string;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  discount?: number;
  tags: string[];
  link: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive';
}


const featuredArticles = [
  {
    id: 'feat1',
    title: 'Amazons beste Elektronik-Angebote diese Woche - Bis zu 60% sparen',
    description: 'Entdecke unglaubliche Ersparnisse bei top-bewerteter Elektronik wie Echo-Geräten, Fire TVs, Kindle-Readern und mehr. Begrenzte Angebote, die du nicht verpassen willst.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600',
    category: 'Angebots-Alarm',
    readTime: '5 Min. Lesezeit'
  },
  {
    id: 'feat2',
    title: 'Küchen-Essentials unter 50€ - Verwandele dein Kochen',
    description: 'Von Heißluftfritteusen bis Kaffeemaschinen, entdecke die besten Küchengeräte, die professionelle Ergebnisse liefern, ohne das Budget zu sprengen.',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',
    category: 'Küchen-Guide',
    readTime: '7 Min. Lesezeit'
  }
];



// Fisher-Yates Shuffle Algorithm für zufällige Reihenfolge
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Shuffle auch die Vergleichsdaten für mehr Dynamik
  const shuffledFeatures = featuredArticles;

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data: Product[] = await response.json();

      // Shuffle die Angebote für zufällige Reihenfolge bei jedem Refresh
      const shuffledProducts = shuffleArray(data);
      setProducts(shuffledProducts);

      console.log(`🔀 ${shuffledProducts.length} Angebote wurden gemischt`);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Latest Deals Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-dark-green">Aktuelle Amazon-Angebote</h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-64"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.amazonId}
                  title={product.title}
                  description={product.description}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  image={product.image}
                  category={product.category}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  discount={product.discount}
                  tags={product.tags}
                  link={product.link}
                  timeAgo=""
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">📦</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Noch keine Produkte</h3>
              <p className="text-gray-500 mb-4">Schauen Sie bald wieder vorbei für neue Amazon-Angebote.</p>
            </div>
          )}
        </section>



        {/* Featured Articles */}
        <FeaturedSection />




      </main>

      {/* Footer */}
      <footer className="bg-dark-green text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm opacity-80">
            Version 1.0.0 © DeutscheRetroWerbung.de, 2024-2025 |
            <span className="mx-2">|</span>
            <a href="#" className="hover:text-primary">Datenschutz</a>
            <span className="mx-2">|</span>
            <a href="#" className="hover:text-primary">Impressum</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
