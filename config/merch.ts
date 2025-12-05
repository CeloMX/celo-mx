export interface MerchItem {
  id: string;
  name: string;
  description: string;
  price: number; // in CMT
  image: string;
  category: 'clothing' | 'accessories';
  sizes?: string[];
}

export const MERCHANT_ADDRESS = '0x65E8F19f1e8a5907F388E416876B7e1250a9863C';

export const merchItems: MerchItem[] = [
  {
    id: 'celo-shirt',
    name: 'Celo MX Shirt',
    description: 'Official Celo Mexico community shirt. High quality cotton with Celo logo.',
    price: 3, // 3 CMT
    image: 'https://tgjqcddmqtaceidmafyn.supabase.co/storage/v1/object/public/merch/celo_shirt.jpg',
    category: 'clothing',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'celo-beanie',
    name: 'Celo MX Beanie',
    description: 'Cozy Celo Mexico beanie. Keep warm while showing your Celo pride.',
    price: 2, // 2 CMT
    image: 'https://tgjqcddmqtaceidmafyn.supabase.co/storage/v1/object/public/merch/celo_beanie.jpg',
    category: 'accessories',
  },
  {
    id: 'celo-sticker',
    name: 'Celo MX Sticker',
    description: 'Premium Celo Mexico sticker. Perfect for laptops, water bottles, and more.',
    price: 1, // 1 CMT
    image: 'https://tgjqcddmqtaceidmafyn.supabase.co/storage/v1/object/public/merch/celo_sticker.jpg',
    category: 'accessories',
  },
];

export default { merchItems, MERCHANT_ADDRESS };
