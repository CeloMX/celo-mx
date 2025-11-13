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
    price: 2, // 2 CMT
    image: 'https://via.placeholder.com/400x400/FCFF52/000000?text=Celo+Shirt',
    category: 'clothing',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'celo-hat',
    name: 'Celo MX Hat',
    description: 'Stylish Celo Mexico cap. Adjustable strap, one size fits all.',
    price: 2, // 2 CMT
    image: 'https://via.placeholder.com/400x400/FCFF52/000000?text=Celo+Hat',
    category: 'accessories',
  },
];

export default { merchItems, MERCHANT_ADDRESS };
