'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface ComparisonProduct {
  id: string;
  title: string;
  price: string;
  image: string;
  rating: number;
  votes: number;
}

interface ProductComparisonProps {
  product1: ComparisonProduct;
  product2: ComparisonProduct;
  category: string;
}

export default function ProductComparison({ product1, product2, category }: ProductComparisonProps) {
  const [userVote, setUserVote] = useState<string | null>(null);

  const totalVotes = product1.votes + product2.votes;
  const product1Percentage = totalVotes > 0 ? (product1.votes / totalVotes) * 100 : 50;
  const product2Percentage = totalVotes > 0 ? (product2.votes / totalVotes) * 100 : 50;

  const handleVote = (productId: string) => {
    if (!userVote) {
      setUserVote(productId);
      // Here you would typically send the vote to your backend
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="bg-dark-green text-white p-4">
        <h3 className="text-xl font-bold text-center">WELCHES ANGEBOT IST BESSER?</h3>
        <p className="text-center text-sm opacity-90 mt-1">{category} Kategorie</p>
      </div>

      <CardContent className="p-0">
        <div className="grid grid-cols-2 gap-0">
          {/* Product 1 */}
          <div className="p-6 border-r">
            <div className="text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-gray-200">
                <Image
                  src={product1.image}
                  alt={product1.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <h4 className="font-semibold text-lg line-clamp-2">{product1.title}</h4>
                <p className="text-2xl font-bold primary-green mt-2">{product1.price}</p>
                <div className="flex justify-center items-center space-x-1 mt-1">
                  <span>⭐</span>
                  <span className="text-sm">{product1.rating}</span>
                </div>
              </div>

              <Button
                onClick={() => handleVote(product1.id)}
                disabled={!!userVote}
                className="w-full bg-primary-green hover:bg-green-600 text-white font-bold py-3"
              >
                BESSERES ANGEBOT!
              </Button>

              {/* Vote percentage */}
              <div className="text-center">
                <div className="text-2xl font-bold primary-green">{product1Percentage.toFixed(0)}%</div>
                <div className="text-sm text-gray-500">{product1.votes} Stimmen</div>
              </div>
            </div>
          </div>

          {/* VS Divider */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-12 h-12 bg-primary-green rounded-full flex items-center justify-center text-white font-bold text-lg border-4 border-white shadow-lg">
              VS
            </div>
          </div>

          {/* Product 2 */}
          <div className="p-6">
            <div className="text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-gray-200">
                <Image
                  src={product2.image}
                  alt={product2.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <h4 className="font-semibold text-lg line-clamp-2">{product2.title}</h4>
                <p className="text-2xl font-bold primary-green mt-2">{product2.price}</p>
                <div className="flex justify-center items-center space-x-1 mt-1">
                  <span>⭐</span>
                  <span className="text-sm">{product2.rating}</span>
                </div>
              </div>

              <Button
                onClick={() => handleVote(product2.id)}
                disabled={!!userVote}
                className="w-full bg-primary-green hover:bg-green-600 text-white font-bold py-3"
              >
                BESSERES ANGEBOT!
              </Button>

              {/* Vote percentage */}
              <div className="text-center">
                <div className="text-2xl font-bold primary-green">{product2Percentage.toFixed(0)}%</div>
                <div className="text-sm text-gray-500">{product2.votes} Stimmen</div>
              </div>
            </div>
          </div>
        </div>

        {/* Vote results bar */}
        <div className="h-2 bg-gray-200 relative overflow-hidden">
          <div
            className="h-full bg-primary-green transition-all duration-500"
            style={{ width: `${product1Percentage}%` }}
          />
        </div>

        {/* Additional info */}
        <div className="p-4 bg-gray-50 flex justify-between items-center text-sm text-gray-600">
          <span>🔥 {totalVotes} Personen haben abgestimmt</span>
          <Badge variant="secondary" className="text-xs">
            An der Diskussion teilnehmen
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
