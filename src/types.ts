export type PropertyStatus = 'Pending' | 'Approved' | 'Rejected';

export type PropertyType = 'House' | 'Apartment' | 'Villa' | 'Penthouse';

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  imageUrl: string;
  images: string[];
  type: PropertyType;
  status: PropertyStatus;
  submittedBy: string;
  submittedAt: string;
  features: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'admin';
  avatar?: string;
}
