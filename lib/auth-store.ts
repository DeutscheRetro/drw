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
}

// Create singleton instance
const authStore = new AuthStore();

export { authStore, type AdminCredentials };
