export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  currency: string;
  dateFormat: string;
}