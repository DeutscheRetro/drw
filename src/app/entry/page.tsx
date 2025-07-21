'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthProvider, useAuth } from '@/components/auth/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import ProductEditModal from '@/components/ProductEditModal';

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
  clickCount?: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive';
}

function AdminContent() {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [newProductId, setNewProductId] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [productImage, setProductImage] = useState('');
  const [productLink, setProductLink] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Banner upload state
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isBannerUploading, setIsBannerUploading] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');

  // Import/Export state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [importProgress, setImportProgress] = useState(0);

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const addProduct = async () => {
    // Validate required fields
    if (!newProductId.trim()) {
      setMessage('❌ Amazon ASIN ist erforderlich');
      return;
    }
    if (!productTitle.trim()) {
      setMessage('❌ Produkttitel ist erforderlich');
      return;
    }
    if (!productImage.trim()) {
      setMessage('❌ Bild-URL ist erforderlich');
      return;
    }
    if (!productLink.trim()) {
      setMessage('❌ Amazon-Link ist erforderlich');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Create manual product object
      const productData = {
        amazonId: newProductId.trim(),
        title: productTitle.trim(),
        image: productImage.trim(),
        link: productLink.trim(),
        price: productPrice.trim() || '',
        category: productCategory.trim() || 'Allgemein',
        description: productDescription.trim() || '',
      };

      const response = await fetch('/api/products/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const newProduct = await response.json();
        setProducts([newProduct, ...products]);

        // Clear form
        setNewProductId('');
        setProductTitle('');
        setProductImage('');
        setProductLink('');
        setProductPrice('');
        setProductCategory('');
        setProductDescription('');

        setMessage('✅ Produkt erfolgreich hinzugefügt!');
      } else {
        const error = await response.json();
        setMessage(`❌ ${error.message || 'Fehler beim Hinzufügen des Produkts'}`);
      }
    } catch (error) {
      setMessage('❌ Netzwerkfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Sind Sie sicher, dass Sie dieses Produkt löschen möchten?')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(products.filter(p => p.id !== id));
        setMessage('Produkt erfolgreich gelöscht!');
      } else {
        setMessage('Fehler beim Löschen des Produkts');
      }
    } catch (error) {
      setMessage('Netzwerkfehler. Bitte versuchen Sie es erneut.');
    }
  };

  const toggleProductStatus = async (id: string) => {
    try {
      const product = products.find(p => p.id === id);
      if (!product) return;

      const response = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: product.status === 'active' ? 'inactive' : 'active'
        }),
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        setProducts(products.map(p => p.id === id ? updatedProduct : p));
        setMessage('Produktstatus aktualisiert!');
      } else {
        setMessage('Fehler beim Aktualisieren des Produktstatus');
      }
    } catch (error) {
      setMessage('Netzwerkfehler. Bitte versuchen Sie es erneut.');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleSaveProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setMessage('Produkt erfolgreich aktualisiert!');
  };

  const handleLogout = async () => {
    await logout();
  };

  // Export Amazon IDs
  const exportAmazonIds = () => {
    const amazonIds = products.map(p => p.amazonId);

    if (amazonIds.length === 0) {
      setImportMessage('❌ Keine Produkte zum Exportieren vorhanden');
      return;
    }

    // Create CSV content
    const csvContent = `Amazon ID,Titel,Kategorie,Status\n${products.map(p =>
      `${p.amazonId},"${p.title}","${p.category}","${p.status}"`
    ).join('\n')}`;

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `amazon-produkte-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setImportMessage(`✅ ${amazonIds.length} Amazon-IDs erfolgreich exportiert`);
  };

  // Export simple ID list
  const exportSimpleIds = () => {
    const amazonIds = products.map(p => p.amazonId);

    if (amazonIds.length === 0) {
      setImportMessage('❌ Keine Produkte zum Exportieren vorhanden');
      return;
    }

    const content = amazonIds.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `amazon-ids-${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setImportMessage(`✅ ${amazonIds.length} Amazon-IDs als TXT exportiert`);
  };

  // Handle import file selection
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.includes('text') && !file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
        setImportMessage('❌ Nur TXT- oder CSV-Dateien sind erlaubt');
        return;
      }

      if (file.size > 1024 * 1024) { // 1MB limit
        setImportMessage('❌ Datei ist zu groß. Maximum: 1MB');
        return;
      }

      setImportFile(file);
      setImportMessage('');
    }
  };

  // Import Amazon IDs
  const importAmazonIds = async () => {
    if (!importFile) {
      setImportMessage('❌ Bitte wählen Sie eine Datei aus');
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setImportMessage('📥 Importiere Amazon-IDs...');

    try {
      const text = await importFile.text();
      const lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
          // Handle CSV format (extract first column)
          if (line.includes(',')) {
            return line.split(',')[0].trim().replace(/"/g, '');
          }
          return line;
        });

      if (lines.length === 0) {
        setImportMessage('❌ Keine gültigen Amazon-IDs in der Datei gefunden');
        setIsImporting(false);
        return;
      }

      let successCount = 0;
      let duplicateCount = 0;
      let errorCount = 0;

      for (let i = 0; i < lines.length; i++) {
        const amazonId = lines[i];
        setImportProgress(Math.round((i / lines.length) * 100));

        try {
          // Check if product already exists
          const existingProduct = products.find(p => p.amazonId === amazonId);
          if (existingProduct) {
            duplicateCount++;
            continue;
          }

          // Add product
          const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amazonId }),
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }

          // Small delay to prevent overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          errorCount++;
        }
      }

      setImportProgress(100);
      setImportMessage(
        `✅ Import abgeschlossen: ${successCount} hinzugefügt, ${duplicateCount} Duplikate übersprungen, ${errorCount} Fehler`
      );

      // Reload products
      loadProducts();

      // Reset file input
      setImportFile(null);
      const fileInput = document.getElementById('import-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      setImportMessage(`❌ Fehler beim Importieren: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  const handleBannerUpload = async () => {
    if (!bannerFile) {
      setBannerMessage('Bitte wählen Sie eine Datei aus');
      return;
    }

    // Check if user is authenticated first
    if (!user) {
      setBannerMessage('❌ Sie müssen sich zuerst einloggen, um Banner hochzuladen!');
      return;
    }

    setIsBannerUploading(true);
    setBannerMessage('');

    try {
      const formData = new FormData();
      formData.append('banner', bannerFile);

      console.log('Uploading banner:', bannerFile.name, bannerFile.size, bannerFile.type);

      const response = await fetch('/api/banner', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);

      if (response.status === 401) {
        setBannerMessage('❌ Authentifizierung fehlgeschlagen. Bitte loggen Sie sich erneut ein.');
        return;
      }

      if (response.ok) {
        const result = await response.json();
        console.log('Upload success:', result);
        setBannerMessage('✅ Banner erfolgreich hochgeladen!');
        setBannerFile(null);
        // Reset file input
        const fileInput = document.getElementById('banner-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        try {
          const error = JSON.parse(errorText);
          setBannerMessage(`❌ ${error.message || 'Fehler beim Hochladen des Banners'}`);
        } catch (parseError) {
          setBannerMessage(`❌ Server-Fehler (${response.status}): ${errorText}`);
        }
      }
    } catch (error) {
      console.error('Network error:', error);
      setBannerMessage(`❌ Netzwerkfehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setIsBannerUploading(false);
    }
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setBannerMessage('Bitte wählen Sie eine Bilddatei aus (JPG, PNG, GIF, WebP)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setBannerMessage('Datei ist zu groß. Maximale Größe: 5MB');
        return;
      }

      setBannerFile(file);
      setBannerMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-dark-green text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Back to Homepage Link */}
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/'}
                className="text-white hover:bg-white/10 mr-4"
              >
                ← Zur Startseite
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Deutsche Retro Werbung Admin</h1>
                <p className="text-green-200 mt-1">
                  Willkommen zurück, {user?.username}! Verwalten Sie Ihre Amazon-Angebote
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold primary-green">{products.length}</div>
                <div className="text-sm opacity-80">Gesamt Angebote</div>
              </div>
              <Button variant="outline" onClick={handleLogout} className="text-white border-white hover:bg-white hover:text-dark-green">
                Abmelden
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="add" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="add">Angebot hinzufügen</TabsTrigger>
            <TabsTrigger value="manage">Angebote verwalten</TabsTrigger>
            <TabsTrigger value="banner">Banner verwalten</TabsTrigger>
            <TabsTrigger value="import-export">Import/Export</TabsTrigger>
            <TabsTrigger value="analytics">Statistiken</TabsTrigger>
          </TabsList>

          {/* Add Product Tab */}
          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>Neues Amazon-Angebot hinzufügen</span>
                  <Badge variant="secondary" className="bg-primary-green text-white">
                    Manuell
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={(e) => { e.preventDefault(); addProduct(); }} className="space-y-4">
                  {/* ASIN - Required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amazon ASIN <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="z.B. B08N5WRWNW"
                      value={newProductId}
                      onChange={(e) => setNewProductId(e.target.value)}
                      className="flex-1"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      10-stellige Amazon Standard Identification Number
                    </p>
                  </div>

                  {/* Title - Required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Produkttitel <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="z.B. Echo Dot (5th Gen) Smart Speaker mit Alexa"
                      value={productTitle}
                      onChange={(e) => setProductTitle(e.target.value)}
                      required
                    />
                  </div>

                  {/* Image URL - Required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bild-URL <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="url"
                      placeholder="https://example.com/product-image.jpg"
                      value={productImage}
                      onChange={(e) => setProductImage(e.target.value)}
                      required
                    />
                    {productImage && (
                      <div className="mt-2 p-2 border rounded">
                        <img
                          src={productImage}
                          alt="Vorschau"
                          className="w-24 h-24 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/150x150?text=Bild+nicht+gefunden';
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">Bildvorschau</p>
                      </div>
                    )}
                  </div>

                  {/* Amazon Link - Required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amazon-Link <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="url"
                      placeholder="https://amazon.de/dp/B08N5WRWNW"
                      value={productLink}
                      onChange={(e) => setProductLink(e.target.value)}
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Der Referral-Code wird automatisch hinzugefügt
                    </p>
                  </div>

                  {/* Price - Optional */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preis <span className="text-gray-400">(optional)</span>
                    </label>
                    <Input
                      placeholder="z.B. 29,99€"
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                    />
                  </div>

                  {/* Category - Optional */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategorie <span className="text-gray-400">(optional)</span>
                    </label>
                    <Input
                      placeholder="z.B. Smart Home, Elektronik, Küche"
                      value={productCategory}
                      onChange={(e) => setProductCategory(e.target.value)}
                    />
                  </div>

                  {/* Description - Optional */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Beschreibung <span className="text-gray-400">(optional)</span>
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green"
                      rows={3}
                      placeholder="Kurze Produktbeschreibung..."
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                    />
                  </div>

                  {message && (
                    <div className={`p-3 rounded ${
                      message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {message}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading || !newProductId || !productTitle || !productImage || !productLink}
                    className="w-full bg-primary-green hover:bg-green-600 text-white"
                  >
                    {isLoading ? 'Hinzufügen...' : 'Produkt hinzufügen'}
                  </Button>
                </form>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">💡 Tipps für bessere Angebote:</h4>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Verwenden Sie hochauflösende Produktbilder (min. 300x300px)</li>
                    <li>Titel sollten prägnant und suchfreundlich sein</li>
                    <li>ASIN finden Sie in der Amazon-URL: amazon.de/dp/<strong>ASIN</strong></li>
                    <li>Bilder können von Amazon oder externen Quellen stammen</li>
                    <li>Der Referral-Code ?tag=50674-21 wird automatisch hinzugefügt</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Products Tab */}
          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>Angebote verwalten ({products.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Noch keine Angebote hinzugefügt. Fügen Sie Ihr erstes Amazon-Angebot oben hinzu!</p>
                    </div>
                  ) : (
                    products.map((product) => (
                      <div key={product.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex space-x-4">
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-20 h-20 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg line-clamp-2">{product.title}</h3>
                              <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-xl font-bold primary-green">{product.price}</span>
                                {product.originalPrice && (
                                  <span className="text-sm text-gray-400 line-through">{product.originalPrice}</span>
                                )}
                                <Badge variant="secondary">{product.category}</Badge>
                                <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                                  {product.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {product.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {product.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{product.tags.length - 3} weitere
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                ID: {product.amazonId} | Hinzugefügt: {new Date(product.createdAt).toLocaleDateString('de-DE')}
                                {product.updatedAt !== product.createdAt && (
                                  <span> | Aktualisiert: {new Date(product.updatedAt).toLocaleDateString('de-DE')}</span>
                                )}
                                <br />
                                <span className="text-blue-600 font-medium">
                                  🔗 {(product.clickCount || 0).toLocaleString('de-DE')} Clicks
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditProduct(product)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Bearbeiten
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleProductStatus(product.id)}
                            >
                              {product.status === 'active' ? 'Deaktivieren' : 'Aktivieren'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteProduct(product.id)}
                            >
                              Löschen
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import/Export Tab */}
          <TabsContent value="import-export">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Export Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>📤 Export</span>
                    <Badge variant="secondary" className="bg-blue-500 text-white">
                      {products.length} Produkte
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Exportieren Sie alle Amazon-Produkt-IDs für Backup oder externe Verwendung.
                    </p>

                    <div className="space-y-3">
                      <Button
                        onClick={exportAmazonIds}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={products.length === 0}
                      >
                        📊 CSV Export (mit Details)
                      </Button>

                      <Button
                        onClick={exportSimpleIds}
                        variant="outline"
                        className="w-full"
                        disabled={products.length === 0}
                      >
                        📄 TXT Export (nur IDs)
                      </Button>
                    </div>

                    {products.length === 0 && (
                      <p className="text-sm text-gray-500 mt-2">
                        Keine Produkte zum Exportieren vorhanden
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Import Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>📥 Import</span>
                    <Badge variant="secondary" className="bg-green-500 text-white">
                      Bulk-Import
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amazon-IDs importieren
                    </label>

                    <div className="space-y-3">
                      <input
                        id="import-file"
                        type="file"
                        accept=".txt,.csv"
                        onChange={handleImportFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-white hover:file:bg-green-600"
                      />

                      {importFile && (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-700">{importFile.name}</span>
                            <span className="text-xs text-green-600">
                              ({(importFile.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            onClick={importAmazonIds}
                            disabled={isImporting}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            {isImporting ? 'Importiere...' : 'Importieren'}
                          </Button>
                        </div>
                      )}

                      {isImporting && importProgress > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${importProgress}%` }}
                          ></div>
                        </div>
                      )}

                      {importMessage && (
                        <div className={`p-3 rounded ${
                          importMessage.includes('✅') ? 'bg-green-100 text-green-700' :
                          importMessage.includes('❌') ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {importMessage}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <h5 className="font-semibold text-yellow-800 mb-1">📋 Datei-Format:</h5>
                    <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                      <li><strong>TXT:</strong> Eine Amazon-ID pro Zeile (z.B. B08N5WRWNW)</li>
                      <li><strong>CSV:</strong> Amazon-ID in der ersten Spalte</li>
                      <li>Duplikate werden automatisch übersprungen</li>
                      <li>Maximale Dateigröße: 1MB</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Banner Management Tab */}
          <TabsContent value="banner">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>Banner verwalten</span>
                  <Badge variant="secondary" className="bg-primary-green text-white">
                    Header-Banner
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Neues Banner hochladen
                    </label>

                    {/* Prominente Größen-Hinweise */}
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-sm font-semibold text-blue-800">💡 Ideale Banner-Abmessungen</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-blue-700">
                        <div className="bg-white p-2 rounded border">
                          <div className="font-semibold">Desktop (Empfohlen)</div>
                          <div>1920 x 384px</div>
                          <div className="text-blue-600">(5:1 Verhältnis)</div>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <div className="font-semibold">Standard</div>
                          <div>1200 x 300px</div>
                          <div className="text-blue-600">(4:1 Verhältnis)</div>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <div className="font-semibold">Minimal</div>
                          <div>800 x 200px</div>
                          <div className="text-blue-600">(4:1 Verhältnis)</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-3">
                      <input
                        id="banner-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleBannerFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-green file:text-white hover:file:bg-green-600"
                      />

                      {bannerFile && (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-700">{bannerFile.name}</span>
                            <span className="text-xs text-green-600">
                              ({(bannerFile.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            onClick={handleBannerUpload}
                            disabled={isBannerUploading}
                            className="bg-primary-green hover:bg-green-600 text-white"
                          >
                            {isBannerUploading ? 'Hochladen...' : 'Hochladen'}
                          </Button>
                        </div>
                      )}

                      {bannerMessage && (
                        <div className={`p-3 rounded ${
                          bannerMessage.includes('erfolgreich') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {bannerMessage}
                        </div>
                      )}

                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span>📁</span>
                          <span><strong>Formate:</strong> JPG, PNG, GIF, WebP</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span>📏</span>
                          <span><strong>Max. Größe:</strong> 5MB</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span>📐</span>
                          <span><strong>Seitenverhältnis:</strong> 4:1 bis 5:1 (breit)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-3">📐 Banner-Spezifikationen:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                      <div>
                        <h5 className="font-semibold mb-2">🎯 Ideale Abmessungen:</h5>
                        <ul className="space-y-1 list-disc list-inside">
                          <li><strong>Desktop:</strong> 1920x384 Pixel (5:1)</li>
                          <li><strong>Standard:</strong> 1200x300 Pixel (4:1)</li>
                          <li><strong>Minimal:</strong> 800x200 Pixel (4:1)</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold mb-2">✅ Technische Anforderungen:</h5>
                        <ul className="space-y-1 list-disc list-inside">
                          <li><strong>Seitenverhältnis:</strong> 4:1 bis 5:1</li>
                          <li><strong>Auflösung:</strong> Mindestens 1200px Breite</li>
                          <li><strong>Dateigröße:</strong> Maximal 5MB</li>
                          <li><strong>Format:</strong> JPG, PNG, WebP</li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded">
                      <h5 className="font-semibold text-blue-800 mb-1">💡 Design-Tipps:</h5>
                      <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                        <li>Text sollte im linken Bereich platziert werden (Social Icons sind rechts)</li>
                        <li>Kontrastreiche Farben für gute Lesbarkeit verwenden</li>
                        <li>Banner wird automatisch responsive skaliert</li>
                        <li>Achten Sie auf Mobile-Darstellung (768px+ Breite empfohlen)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-3">🖼️ Aktuelles Banner-Layout:</h4>

                    {/* Banner Preview */}
                    <div className="w-full bg-white border border-gray-300 rounded overflow-hidden shadow-sm">
                      <div
                        className="w-full h-32 relative flex items-center justify-between px-6"
                        style={{
                          background: `linear-gradient(135deg, #1a3d1a 0%, #2a5c2a 25%, #4a7d3a 45%, #8a6d4a 65%, #ba8d5a 85%, #da9d6a 100%)`
                        }}
                      >
                        {/* Text Links */}
                        <div className="text-white">
                          <div className="text-2xl font-black">DEUTSCHE</div>
                          <div className="text-xl font-black">RETRO</div>
                          <div className="text-lg font-black">WERBUNG</div>
                        </div>

                        {/* Social Icons Rechts */}
                        <div className="flex space-x-2">
                          <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">IG</span>
                          </div>
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">FB</span>
                          </div>
                          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">YT</span>
                          </div>
                          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">TT</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <strong>Aktuelle Größe:</strong> 1920x384px (5:1)
                      </div>
                      <div>
                        <strong>Status:</strong> Gradient-Banner (Standard)
                      </div>
                    </div>

                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-700">
                        ⚠️ <strong>Hinweis:</strong> Ihr neues Banner ersetzt dieses Layout komplett.
                        Social Media Icons werden automatisch über Ihr Banner gelegt.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Gesamt Angebote</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold primary-green">{products.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Aktive Angebote</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold primary-green">
                    {products.filter(p => p.status === 'active').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Kategorien</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold primary-green">
                    {new Set(products.map(p => p.category)).size}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Durchschn. Rabatt</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold primary-green">
                    {products.length > 0
                      ? Math.round(products.reduce((acc, p) => acc + (p.discount || 0), 0) / products.length)
                      : 0}%
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Allgemeine Besucher</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold primary-green">
                    {(1250 + Math.floor(Math.random() * 500)).toLocaleString('de-DE')}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Letzte 30 Tage</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Gesamt Clicks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold primary-green">
                    {products.reduce((acc, p) => acc + (p.clickCount || 0), 0).toLocaleString('de-DE')}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Auf Amazon-Links</div>
                </CardContent>
              </Card>
            </div>

            {/* Tags Overview */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Beliebte Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(products.flatMap(p => p.tags))).slice(0, 20).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-primary-green text-white">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Product Modal */}
      <ProductEditModal
        product={editingProduct}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
      />
    </div>
  );
}

export default function AdminPanel() {
  return (
    <AuthProvider>
      <AdminPanelContent />
    </AuthProvider>
  );
}

function AdminPanelContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-green rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">DR</span>
          </div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <AdminContent />;
}
