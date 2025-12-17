import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación y permisos de admin
    const auth = await getAuthenticatedUser(request as unknown as Request);
    if (!auth.isAuthenticated || !auth.user) {
      console.error('[API] Unauthorized - not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar que el usuario sea admin
    if (!auth.isAdmin) {
      console.error('[API] Forbidden - not admin');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Obtener todos los envíos con información relacionada
    console.log('[API] Fetching shipping info from database...');
    console.log('[API] Prisma client available:', !!prisma);
    console.log('[API] ShippingInfo model available:', !!(prisma as any).shippingInfo);
    
    let shippings;
    try {
      // Verificar que el modelo existe
      if (!(prisma as any).shippingInfo) {
        throw new Error('ShippingInfo model not available in Prisma Client. Please restart the server after running "npx prisma generate"');
      }
      
      shippings = await prisma.shippingInfo.findMany({
        include: {
          Purchase: {
            include: {
              MerchItem: true,
              User: {
                select: {
                  walletAddress: true,
                  email: true,
                  displayName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      console.log(`[API] Found ${shippings.length} shipping records`);
    } catch (dbError: any) {
      // Si la tabla no existe, retornar array vacío con mensaje informativo
      if (dbError?.code === 'P2001' || dbError?.message?.includes('does not exist') || dbError?.message?.includes('relation') && dbError?.message?.includes('does not exist')) {
        console.warn('[API] ShippingInfo table does not exist yet. Returning empty array.');
        return NextResponse.json({ 
          shippings: [],
          message: 'La tabla de envíos aún no existe. Ejecuta las migraciones de Prisma para crearla.'
        });
      }
      throw dbError; // Re-throw otros errores
    }

    // Formatear los datos para la respuesta
    const formattedShippings = shippings.map((shipping) => ({
      id: shipping.id,
      purchaseId: shipping.purchaseId,
      firstName: shipping.firstName,
      lastName: shipping.lastName,
      email: shipping.email,
      address: shipping.address,
      addressLine2: shipping.addressLine2,
      postalCode: shipping.postalCode,
      city: shipping.city,
      phone: shipping.phone,
      createdAt: shipping.createdAt,
      purchase: {
        id: shipping.Purchase.id,
        txHash: shipping.Purchase.txhash,
        amount: shipping.Purchase.amount,
        selectedSize: shipping.Purchase.selectedsize,
        createdAt: shipping.Purchase.createdat,
        item: {
          id: shipping.Purchase.MerchItem.id,
          name: shipping.Purchase.MerchItem.name,
          description: shipping.Purchase.MerchItem.description,
        },
        user: {
          walletAddress: shipping.Purchase.User.walletAddress,
          email: shipping.Purchase.User.email,
          displayName: shipping.Purchase.User.displayName,
        },
      },
    }));

    return NextResponse.json({ shippings: formattedShippings });
  } catch (error: any) {
    console.error('[API] Error fetching shippings:', error);
    console.error('[API] Error stack:', error?.stack);
    console.error('[API] Error name:', error?.name);
    
    // Si es un error de Prisma, dar más detalles
    if (error?.code === 'P2001' || error?.message?.includes('does not exist')) {
      return NextResponse.json(
        { error: 'La tabla ShippingInfo no existe en la base de datos. Ejecuta las migraciones de Prisma.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error?.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación y permisos de admin
    const auth = await getAuthenticatedUser(request as unknown as Request);
    if (!auth.isAuthenticated || !auth.user) {
      console.error('[API] Unauthorized - not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar que el usuario sea admin
    if (!auth.isAdmin) {
      console.error('[API] Forbidden - not admin');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Obtener el ID del envío a eliminar (si se proporciona)
    const { searchParams } = new URL(request.url);
    const shippingId = searchParams.get('id');
    const deleteAll = searchParams.get('all') === 'true';

    console.log('[API] Delete request:', { shippingId, deleteAll });

    // Verificar que el modelo existe
    if (!(prisma as any).shippingInfo) {
      throw new Error('ShippingInfo model not available in Prisma Client');
    }

    let deletedCount = 0;

    if (deleteAll) {
      // Eliminar todos los envíos
      console.log('[API] Deleting all shipping records...');
      const result = await prisma.shippingInfo.deleteMany({});
      deletedCount = result.count;
      console.log(`[API] Deleted ${deletedCount} shipping records`);
    } else if (shippingId) {
      // Eliminar un envío específico
      console.log('[API] Deleting shipping record:', shippingId);
      await prisma.shippingInfo.delete({
        where: { id: shippingId },
      });
      deletedCount = 1;
      console.log('[API] Shipping record deleted successfully');
    } else {
      return NextResponse.json(
        { error: 'Se requiere el parámetro "id" o "all=true"' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true,
      deletedCount,
      message: deleteAll 
        ? `Se eliminaron ${deletedCount} envíos` 
        : 'Envío eliminado correctamente'
    });
  } catch (error: any) {
    console.error('[API] Error deleting shipping:', error);
    console.error('[API] Error stack:', error?.stack);
    
    // Si el registro no existe
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'El envío no existe' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error?.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

