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

// In-memory storage for demo purposes
// In production, you'd use a proper database like PostgreSQL, MongoDB, etc.
class ProductStore {
  private products: Product[] = [];

  // Get all products
  getAll(): Product[] {
    return this.products;
  }

  // Get active products only
  getActive(): Product[] {
    return this.products.filter(p => p.status === 'active');
  }

  // Get product by ID
  getById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  // Get product by Amazon ID
  getByAmazonId(amazonId: string): Product | undefined {
    return this.products.find(p => p.amazonId === amazonId);
  }

  // Add new product
  add(product: Product): Product {
    this.products.push(product);
    return product;
  }

  // Update product
  update(id: string, updates: Partial<Product>): Product | null {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    this.products[index] = {
      ...this.products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return this.products[index];
  }

  // Delete product
  delete(id: string): boolean {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.products.splice(index, 1);
    return true;
  }

  // Get products count
  count(): number {
    return this.products.length;
  }

  // Get active products count
  activeCount(): number {
    return this.products.filter(p => p.status === 'active').length;
  }

  // Get categories
  getCategories(): string[] {
    const categories = new Set(this.products.map(p => p.category));
    return Array.from(categories);
  }

  // Get all tags
  getAllTags(): string[] {
    const tags = new Set(this.products.flatMap(p => p.tags));
    return Array.from(tags);
  }
}

// Create singleton instance
const productStore = new ProductStore();

export { productStore, type Product };
