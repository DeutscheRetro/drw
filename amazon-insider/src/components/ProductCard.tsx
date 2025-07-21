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
  timeAgo?: string;
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
    <Card className="article-card hover-lift overflow-hidden group flex flex-col h-full">
      <div className="relative">
        <div className="relative overflow-hidden rounded-t-lg bg-white h-64 flex items-center justify-center p-4">
          <Image
            src={image}
            alt={title}
            width={390}
            height={260}
            className="object-contain max-w-full max-h-full group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="flex flex-col flex-grow">
          {/* Title */}
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors mb-3">
            {title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
            {description}
          </p>

          {/* Spacer to push price and button to bottom */}
          <div className="flex-grow"></div>

          {/* Price section - only show if price exists */}
          {price && price.trim() && (
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl font-bold primary-green">{price}</span>
              {originalPrice && (
                <span className="text-sm text-gray-400 line-through">{originalPrice}</span>
              )}
            </div>
          )}

          {/* Action button - always at bottom */}
          <Button
            size="sm"
            className="w-full bg-primary-green hover:bg-green-600 text-white"
            onClick={() => link && window.open(link, '_blank')}
          >
            Angebot ansehen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
