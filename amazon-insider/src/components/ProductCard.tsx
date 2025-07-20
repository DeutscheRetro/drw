'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface ProductCardProps {
  id: string;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  discount?: number;
  tags?: string[];
  link?: string;
  timeAgo: string;
}

export default function ProductCard({
  id,
  title,
  description,
  price,
  originalPrice,
  image,
  link,
  timeAgo
}: ProductCardProps) {
  return (
    <Card className="article-card hover-lift overflow-hidden group">
      <div className="relative">
        <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg bg-white h-40 flex items-center justify-center">
          <Image
            src={image}
            alt={title}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm line-clamp-3">
            {description}
          </p>

          {/* Price section - only show if price exists */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {price && price.trim() && (
                <>
                  <span className="text-2xl font-bold primary-green">{price}</span>
                  {originalPrice && (
                    <span className="text-sm text-gray-400 line-through">{originalPrice}</span>
                  )}
                </>
              )}
            </div>
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <Button
              size="sm"
              className="w-full bg-primary-green hover:bg-green-600 text-white"
              onClick={() => link && window.open(link, '_blank')}
            >
              Angebot ansehen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
