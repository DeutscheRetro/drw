'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface TopOffer {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link: string;
  category: string;
  is_active: boolean;
  sort_order: number;
}

interface FeaturedSectionProps {
  // Kept for backward compatibility, but now we fetch from API
  articles?: never;
}

export default function FeaturedSection({ }: FeaturedSectionProps) {
  const [topOffers, setTopOffers] = useState<TopOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopOffers = async () => {
      try {
        const response = await fetch('/api/top-offers');
        if (response.ok) {
          const data = await response.json();
          setTopOffers(data);
        } else {
          console.error('Failed to fetch top offers');
        }
      } catch (error) {
        console.error('Error fetching top offers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopOffers();
  }, []);

  // Don't render section if no active offers
  if (!loading && topOffers.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-dark-green mb-2">AKTUELLE TOP-ANGEBOTE</h2>
        <div className="w-24 h-1 bg-primary-green mx-auto"></div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((index) => (
            <div key={index} className="animate-pulse">
              <Card className="overflow-hidden">
                <div className="aspect-video bg-gray-200"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topOffers.map((offer, index) => (
          <Card
            key={offer.id}
            className="overflow-hidden hover-lift group cursor-pointer"
            onClick={() => window.open(offer.link, '_blank')}
          >
            <div className="relative">
              <div className="aspect-video relative overflow-hidden">
                <Image
                  src={offer.image_url}
                  alt={offer.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Category badge */}
                <Badge
                  className="absolute top-4 left-4 bg-primary-green text-white"
                  variant="default"
                >
                  {offer.category}
                </Badge>

                {/* Featured badge */}
                {index === 0 && (
                  <Badge
                    className="absolute top-4 right-4 bg-yellow-500 text-black font-bold"
                    variant="secondary"
                  >
                    🔥 FEATURED
                  </Badge>
                )}

                {/* Title overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white text-xl font-bold line-clamp-2 mb-2">
                    {offer.title}
                  </h3>
                  <div className="flex items-center justify-between text-white/80 text-sm">
                    <span>Top-Angebot</span>
                    <span className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      <span>Angebot ansehen</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <p className="text-gray-600 line-clamp-3">
                {offer.description}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>💰</span>
                  <span>Tolles Angebot</span>
                </div>
                <span className="text-xs text-gray-400">ID: {offer.id.slice(0, 8)}</span>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}
    </section>
  );
}
