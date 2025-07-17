'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  category,
  rating,
  reviewCount,
  discount,
  tags,
  link,
  timeAgo
}: ProductCardProps) {
  return (
    <Card className="article-card hover-lift overflow-hidden group">
      <div className="relative">
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Category badge */}
        <Badge
          className="absolute top-3 left-3 bg-primary-green text-white"
          variant="default"
        >
          {category}
        </Badge>

        {/* Discount badge */}
        {discount && (
          <Badge
            className="absolute top-3 right-3 bg-red-500 text-white"
            variant="destructive"
          >
            -{discount}%
          </Badge>
        )}

        {/* Rating overlay */}
        <div className="absolute bottom-3 left-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm flex items-center space-x-1">
          <span>⭐</span>
          <span>{rating}</span>
          <span className="text-xs">({reviewCount})</span>
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

          {/* Price section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold primary-green">{price}</span>
              {originalPrice && (
                <span className="text-sm text-gray-400 line-through">{originalPrice}</span>
              )}
            </div>
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-2 pt-2">
            <Button
              size="sm"
              className="flex-1 bg-primary-green hover:bg-green-600 text-white"
              onClick={() => link && window.open(link, '_blank')}
            >
              Deal ansehen
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="px-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Button>
          </div>

          {/* Hot indicator */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-green-600 font-medium">Heißes Angebot</span>
            </div>
            <span className="text-gray-500">ID: {id}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
