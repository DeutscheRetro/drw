'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

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

interface ProductEditModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
}

export default function ProductEditModal({ product, isOpen, onClose, onSave }: ProductEditModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (product) {
      setFormData(product);
      setTagInput(product.tags.join(', '));
    }
  }, [product]);

  const handleInputChange = (field: keyof Product, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagsChange = (value: string) => {
    setTagInput(value);
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    handleInputChange('tags', tags);
  };

  const handleSave = async () => {
    if (!product || !formData.title || !formData.description) {
      setMessage('Titel und Beschreibung sind erforderlich');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        onSave(updatedProduct);
        onClose();
        setMessage('Produkt erfolgreich aktualisiert!');
      } else {
        const error = await response.json();
        setMessage(error.message || 'Fehler beim Aktualisieren des Produkts');
      }
    } catch (error) {
      setMessage('Netzwerkfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = formData.tags?.filter(tag => tag !== tagToRemove) || [];
    handleInputChange('tags', updatedTags);
    setTagInput(updatedTags.join(', '));
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Produkt bearbeiten</span>
            <Badge variant="secondary" className="text-xs">
              ID: {product.amazonId}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Image Preview */}
          <div className="flex items-center space-x-4">
            <img
              src={formData.image}
              alt={formData.title}
              className="w-20 h-20 object-cover rounded border"
            />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bild-URL
              </label>
              <Input
                value={formData.image || ''}
                onChange={(e) => handleInputChange('image', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titel *
            </label>
            <Input
              value={formData.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Produkttitel"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Beschreibung *
            </label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Produktbeschreibung"
              rows={4}
            />
          </div>

          {/* Price and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preis
              </label>
              <Input
                value={formData.price || ''}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="99,99€"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Originalpreis
              </label>
              <Input
                value={formData.originalPrice || ''}
                onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                placeholder="149,99€"
              />
            </div>
          </div>

          {/* Category and Link */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategorie
              </label>
              <Input
                value={formData.category || ''}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="Elektronik"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bewertung
              </label>
              <Input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating || ''}
                onChange={(e) => handleInputChange('rating', parseFloat(e.target.value))}
                placeholder="4.5"
              />
            </div>
          </div>

          {/* Amazon Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Produkt-Link
            </label>
            <Input
              value={formData.link || ''}
              onChange={(e) => handleInputChange('link', e.target.value)}
              placeholder="https://amazon.de/dp/B08N5WRWNW"
            />
            <p className="text-xs text-gray-500 mt-1">
              Der Referral-Code (?tag=50674-21) wird automatisch hinzugefügt
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <Textarea
              value={tagInput}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="retro werbung, elektronik, vintage"
              rows={2}
            />
            <p className="text-xs text-gray-500 mt-1">Tags mit Kommas trennen</p>

            {/* Tag Preview */}
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {message && (
            <div className={`p-3 rounded ${
              message.includes('erfolgreich') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-primary-green hover:bg-green-600 text-white"
            >
              {isLoading ? 'Speichern...' : 'Änderungen speichern'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
