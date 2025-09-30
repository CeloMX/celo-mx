import { NextRequest, NextResponse } from 'next/server';
import { COURSE_TOKEN_IDS, getCourseTokenId } from '@/lib/hooks/useSimpleBadge';

// Course metadata for each token ID
const COURSE_METADATA: Record<string, {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}> = {
  '1': {
    name: 'Desarrollo de DApps - Badge de Inscripción',
    description: 'Badge otorgado por inscribirse al curso de Desarrollo de Aplicaciones Descentralizadas (DApps) en el ecosistema Celo.',
    image: 'https://academy.celo.org/images/badges/desarrollo-dapps.png',
    external_url: 'https://academy.celo.org/academy/desarrollo-dapps',
    attributes: [
      {
        trait_type: 'Course',
        value: 'Desarrollo de DApps'
      },
      {
        trait_type: 'Level',
        value: 'Principiante'
      },
      {
        trait_type: 'Blockchain',
        value: 'Celo'
      },
      {
        trait_type: 'Category',
        value: 'Desarrollo'
      },
      {
        trait_type: 'Badge Type',
        value: 'Enrollment'
      }
    ]
  },
  '2': {
    name: 'DeFi Fundamentals - Badge de Inscripción',
    description: 'Badge otorgado por inscribirse al curso de Fundamentos de Finanzas Descentralizadas (DeFi).',
    image: 'https://academy.celo.org/images/badges/defi-fundamentals.png',
    external_url: 'https://academy.celo.org/academy/defi-fundamentals',
    attributes: [
      {
        trait_type: 'Course',
        value: 'DeFi Fundamentals'
      },
      {
        trait_type: 'Level',
        value: 'Intermedio'
      },
      {
        trait_type: 'Blockchain',
        value: 'Celo'
      },
      {
        trait_type: 'Category',
        value: 'DeFi'
      },
      {
        trait_type: 'Badge Type',
        value: 'Enrollment'
      }
    ]
  },
  '3': {
    name: 'NFT Development - Badge de Inscripción', 
    description: 'Badge otorgado por inscribirse al curso de Desarrollo de NFTs (Tokens No Fungibles).',
    image: 'https://academy.celo.org/images/badges/nft-development.png',
    external_url: 'https://academy.celo.org/academy/nft-development',
    attributes: [
      {
        trait_type: 'Course',
        value: 'NFT Development'
      },
      {
        trait_type: 'Level',
        value: 'Avanzado'
      },
      {
        trait_type: 'Blockchain',
        value: 'Celo'
      },
      {
        trait_type: 'Category',
        value: 'NFTs'
      },
      {
        trait_type: 'Badge Type',
        value: 'Enrollment'
      }
    ]
  },
  '4': {
    name: 'Web3 Security - Badge de Inscripción',
    description: 'Badge otorgado por inscribirse al curso de Seguridad en Web3 y Blockchain.',
    image: 'https://academy.celo.org/images/badges/web3-security.png',
    external_url: 'https://academy.celo.org/academy/web3-security',
    attributes: [
      {
        trait_type: 'Course',
        value: 'Web3 Security'
      },
      {
        trait_type: 'Level',
        value: 'Avanzado'
      },
      {
        trait_type: 'Blockchain',
        value: 'Celo'
      },
      {
        trait_type: 'Category',
        value: 'Seguridad'
      },
      {
        trait_type: 'Badge Type',
        value: 'Enrollment'
      }
    ]
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  try {
    const tokenId = params.tokenId;

    // Validate token ID
    if (!tokenId || !/^\d+$/.test(tokenId)) {
      return NextResponse.json(
        { error: 'Invalid token ID' },
        { status: 400 }
      );
    }

    // Get metadata for this token ID
    const metadata = COURSE_METADATA[tokenId];
    
    if (!metadata) {
      return NextResponse.json(
        { error: 'Token ID not found' },
        { status: 404 }
      );
    }

    // Return ERC1155 compliant metadata
    return NextResponse.json(metadata, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });

  } catch (error) {
    console.error('Error serving metadata:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also handle POST requests for dynamic metadata updates (optional)
export async function POST(
  request: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  // This could be used for updating metadata dynamically
  // For now, return method not allowed
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}