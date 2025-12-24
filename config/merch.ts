export interface MerchItem {
  id: string;
  name: string;
  description: string;
  price: number; // in CMT
  image: string;
  category: 'clothing' | 'accessories';
  sizes?: string[];
}

// Merchant address (receives direct payments for items without fee splitting)
// Defaults to treasury address if not specified
// IMPORTANT: This should be a proper wallet or contract address, NOT a Privy embedded wallet
export const MERCHANT_ADDRESS = 
  process.env.NEXT_PUBLIC_MERCHANT_ADDRESS || 
  process.env.NEXT_PUBLIC_TREASURY_ADDRESS || 
  '0x795df83a989c74832b2D108FF8200989B59FbaCf';

// Payment Splitter Configuration
// For items that use fee splitting (e.g., axolote navideño)
// $10 goes to treasury, $35 goes to artist (from $45 total)

// Treasury address (receives $10 from $45 = 22.22% of split payments)
export const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '0x795df83a989c74832b2D108FF8200989B59FbaCf';

// Artist address (receives $35 from $45 = 77.78% of split payments)
export const ARTIST_ADDRESS = process.env.NEXT_PUBLIC_ARTIST_ADDRESS || '0x2A0029E7b5E74898e794b32722fBcb5276d38f18';

// Payment Splitter contract address
// Mainnet: 0x8fbfb62ABf46Ba81eEe5a41f0dF72d35cC75C18a
// Set via environment variables, or uses mainnet default if not specified
export const PAYMENT_SPLITTER_ADDRESS = 
  process.env.NEXT_PUBLIC_PAYMENT_SPLITTER_ADDRESS_MAINNET || 
  process.env.NEXT_PUBLIC_PAYMENT_SPLITTER_ADDRESS || 
  '0x8fbfb62ABf46Ba81eEe5a41f0dF72d35cC75C18a'; // Mainnet Payment Splitter contract

// Test mode: reduces prices for testing (set NEXT_PUBLIC_TEST_MODE=true)
export const IS_TEST_MODE = process.env.NEXT_PUBLIC_TEST_MODE === 'true';

// Items that should use payment splitting (by ID or tag)
// For these items, payments go to the splitter contract instead of directly to merchant
export const ITEMS_WITH_FEE_SPLIT: string[] = [
  // Add item IDs or tags that should use fee splitting
  // Example: 'axolote-navideno', or match by tag: 'navidad'
];

/**
 * Check if an item should use fee splitting
 */
export function shouldUseFeeSplit(itemId: string, itemTag?: string | null): boolean {
  // Check by ID
  if (ITEMS_WITH_FEE_SPLIT.includes(itemId)) {
    return true;
  }
  
  // Check by tag (e.g., items tagged with 'navidad' or containing 'axolote')
  if (itemTag) {
    const tagLower = itemTag.toLowerCase();
    if (tagLower.includes('navidad') || tagLower.includes('axolote')) {
      return true;
    }
  }
  
  // Check by item ID containing keywords
  const idLower = itemId.toLowerCase();
  if (idLower.includes('axolote') || idLower.includes('navideno') || idLower.includes('navidad')) {
    return true;
  }
  
  return false;
}

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
