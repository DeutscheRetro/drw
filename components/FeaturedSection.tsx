'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface FeaturedArticle {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  readTime: string;
}

interface FeaturedSectionProps {
  articles: FeaturedArticle[];
}

export default function FeaturedSection({ articles }: FeaturedSectionProps) {
  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-dark-green mb-2">AKTUELLE TOP-ANGEBOTE</h2>
        <div className="w-24 h-1 bg-primary-green mx-auto"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((article, index) => (
          <Card key={article.id} className="overflow-hidden hover-lift group cursor-pointer">
            <div className="relative">
              <div className="aspect-video relative overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
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
                  {article.category}
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
                    {article.title}
                  </h3>
                  <div className="flex items-center justify-between text-white/80 text-sm">
                    <span>{article.readTime}</span>
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
                {article.description}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>💰</span>
                  <span>Tolles Angebot</span>
                </div>
                <span className="text-xs text-gray-400">ID: {article.id}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
