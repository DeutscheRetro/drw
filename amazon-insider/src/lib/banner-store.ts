interface BannerData {
  id: string;
  filename: string;
  url: string;
  uploadedAt: string;
  isActive: boolean;
}

// Banner storage (in production, use proper file storage)
class BannerStore {
  private banners: BannerData[] = [];
  private activeBannerId: string | null = null;

  // Get active banner
  getActiveBanner(): BannerData | null {
    if (!this.activeBannerId) return null;
    return this.banners.find(b => b.id === this.activeBannerId) || null;
  }

  // Get all banners
  getAllBanners(): BannerData[] {
    return this.banners;
  }

  // Add new banner
  addBanner(banner: BannerData): BannerData {
    this.banners.push(banner);
    return banner;
  }

  // Set active banner
  setActiveBanner(id: string): boolean {
    const banner = this.banners.find(b => b.id === id);
    if (!banner) return false;

    // Deactivate all banners
    this.banners.forEach(b => b.isActive = false);

    // Activate selected banner
    banner.isActive = true;
    this.activeBannerId = id;
    return true;
  }

  // Delete banner
  deleteBanner(id: string): boolean {
    const index = this.banners.findIndex(b => b.id === id);
    if (index === -1) return false;

    this.banners.splice(index, 1);

    // If deleted banner was active, clear active banner
    if (this.activeBannerId === id) {
      this.activeBannerId = null;
    }

    return true;
  }

  // Reset to default (no custom banner)
  resetToDefault(): void {
    this.banners.forEach(b => b.isActive = false);
    this.activeBannerId = null;
  }
}

// Create singleton instance
const bannerStore = new BannerStore();

export { bannerStore, type BannerData };
