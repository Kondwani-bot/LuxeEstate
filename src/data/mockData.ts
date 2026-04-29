import { Property } from '@/types';

export const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Modern Minimalist Villa',
    description: 'A stunning modern villa with floor-to-ceiling windows, private infinity pool, and panoramic ocean views. Designed by award-winning architects, this home offers the pinnacle of luxury living.',
    price: 4500000,
    location: 'Malibu, California',
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1613977257582-7776100868f7?auto=format&fit=crop&q=80&w=1200'
    ],
    type: 'Villa',
    status: 'Approved',
    submittedBy: 'John Member',
    submittedAt: '2024-03-15',
    features: ['Infinity Pool', 'Home Theater', 'Smart Home System', 'Wine Cellar']
  },
  {
    id: '2',
    title: 'Historic European Estate',
    description: 'This meticulously restored 18th-century estate combines classic elegance with modern amenities. Features include a private vineyard, formal gardens, and a grand ballroom.',
    price: 12000000,
    location: 'Tuscany, Italy',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200'
    ],
    type: 'Villa',
    status: 'Approved',
    submittedBy: 'Jane Member',
    submittedAt: '2024-03-10',
    features: ['Private Vineyard', 'Guest House', 'Historic Architecture', 'Formal Gardens']
  },
  {
    id: '3',
    title: 'Urban Penthouse Sanctuary',
    description: 'Experience the ultimate city lifestyle in this triplex penthouse. Boasting a private rooftop terrace, outdoor kitchen, and 360-degree skyline views.',
    price: 8750000,
    location: 'Manhattan, New York',
    imageUrl: 'https://images.unsplash.com/photo-1600607687940-4e524cb35a3a?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1600607687940-4e524cb35a3a?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'
    ],
    type: 'Penthouse',
    status: 'Approved',
    submittedBy: 'Alex Member',
    submittedAt: '2024-03-12',
    features: ['Rooftop Terrace', 'Private Elevator', '24/7 Concierge', 'Chef\'s Kitchen']
  },
  {
    id: '4',
    title: 'Alpine Luxury Chalet',
    description: 'A cozy yet grand chalet nestled in the heart of the Alps. Ski-in/ski-out access, sauna, and a massive stone fireplace make this the perfect winter retreat.',
    price: 3200000,
    location: 'Zermatt, Switzerland',
    imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1482859454392-1b5326395032?auto=format&fit=crop&q=80&w=1200'
    ],
    type: 'House',
    status: 'Pending',
    submittedBy: 'John Member',
    submittedAt: '2024-03-20',
    features: ['Ski-in/Ski-out', 'Sauna', 'Stone Fireplace', 'Heated Floors']
  },
  {
    id: '5',
    title: 'Tropical Island Retreat',
    description: 'Escape to paradise in this beachfront estate. Features include private beach access, lush tropical gardens, and open-air living spaces.',
    price: 6800000,
    location: 'Bora Bora, French Polynesia',
    imageUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=1200'
    ],
    type: 'Villa',
    status: 'Pending',
    submittedBy: 'Jane Member',
    submittedAt: '2024-03-21',
    features: ['Private Beach', 'Open-air Living', 'Tropical Gardens', 'Boat Dock']
  },
  {
    id: '6',
    title: 'Glass House in the Woods',
    description: 'A masterpiece of contemporary architecture, this glass-walled home blurs the line between indoors and outdoors.',
    price: 2100000,
    location: 'Portland, Oregon',
    imageUrl: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1542314831-c6a4d14cdac8?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=1200'
    ],
    type: 'House',
    status: 'Approved',
    submittedBy: 'Alex Member',
    submittedAt: '2024-03-25',
    features: ['Floor-to-ceiling Glass', 'Sustainable Design', 'Smart Lighting', 'Forest Views']
  },
  {
    id: '7',
    title: 'Skyline View Apartment',
    description: 'Modern apartment in the heart of the business district with high-end finishes and incredible city views.',
    price: 1250000,
    location: 'Manhattan, New York',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1502672260266-1c1c28b1e15e?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=1200'
    ],
    type: 'Apartment',
    status: 'Approved',
    submittedBy: 'John Member',
    submittedAt: '2024-03-28',
    features: ['Gym Access', 'Underground Parking', 'Balcony', 'Modern Appliances']
  },
  {
    id: '8',
    title: 'Desert Oasis Compound',
    description: 'Luxurious compound in the middle of a private desert reserve. Comes with an artificial oasis pool, tennis courts, and custom sunset viewing decks.',
    price: 5400000,
    location: 'Palm Springs, California',
    imageUrl: 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1481026469463-66327c86e544?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200'
    ],
    type: 'Villa',
    status: 'Approved',
    submittedBy: 'Jane Member',
    submittedAt: '2024-04-02',
    features: ['Tennis Courts', 'Oasis Pool', 'Viewing Deck', 'Helipad']
  }
];
