// Shared authentication store - v0.1.1
// In production, this would be replaced with a proper database

interface AdminCredentials {
  username: string;
  password: string;
}

class AuthStore {
  private adminCredentials: AdminCredentials = {
    username: 'lenski@gmail.com',
    password: 'Wnfe1ftT'
  };

  // Get current admin credentials
  getAdminCredentials(): AdminCredentials {
    return { ...this.adminCredentials };
  }

  // Check if email exists in the system
  emailExists(email: string): boolean {
    return email === this.adminCredentials.username;
  }

  // Update admin password - for deployment compatibility
  updateAdminPassword(newPassword: string): boolean {
    if (!newPassword || newPassword.length < 6) {
      return false;
    }
    this.adminCredentials.password = newPassword;
    return true;
  }

  // Generate reset token - for deployment compatibility
  generateResetToken(email: string): string {
    // Simple implementation for deployment compatibility
    // In production, this would generate a secure token and store it in database
    if (!this.emailExists(email)) {
      throw new Error('Email not found');
    }
    return `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Verify reset token - for deployment compatibility
  verifyResetToken(email: string, token: string): boolean {
    // Simple implementation for deployment compatibility
    // In production, this would verify against a database with proper tokens
    return this.emailExists(email) && !!token && token.length > 0;
  }
}

// Create singleton instance
const authStore = new AuthStore();

export { authStore, type AdminCredentials };
