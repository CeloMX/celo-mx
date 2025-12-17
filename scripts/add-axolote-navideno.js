/**
 * Script para agregar el producto "Canva edición especial Axolote Navideño"
 * 
 * Uso:
 * 1. Asegúrate de tener la URL de la imagen del producto
 * 2. Ejecuta este script con: node scripts/add-axolote-navideno.js
 * 
 * O usa el panel de admin en /admin/merch para agregarlo manualmente con estos datos:
 */

const productData = {
  id: 'axolote-navideno',
  name: 'Canva edición especial Axolote Navideño',
  description: 'Colaboración especial. Canva edición especial Axolote Navideño.',
  price: 6000, // en CMT
  image: 'TU_URL_DE_IMAGEN_AQUI', // Reemplaza con la URL real de la imagen
  category: 'accessories',
  sizes: [],
  stock: 100, // Ajusta según disponibilidad
  tag: 'navidad', // Esto lo agrupará en la activación de Navidad
};

console.log('📦 Datos del producto Axolote Navideño:');
console.log(JSON.stringify(productData, null, 2));
console.log('\n💡 Para agregar este producto:');
console.log('1. Ve a /admin/merch');
console.log('2. Completa el formulario con los datos de arriba');
console.log('3. Asegúrate de usar tag: "navidad" para que aparezca en la activación de Navidad');
console.log('4. O ejecuta una petición POST a /api/admin/merch/items con estos datos');
console.log('\n📌 Nota: Los productos se organizan por activaciones:');
console.log('   - tag: "navidad" o "axolote-navideno" = Activación de Navidad');
console.log('   - tag: "argentina" o sin tag = Activación de Argentina');

// Si quieres ejecutar esto directamente, descomenta y ajusta:
/*
const fetch = require('node-fetch');

async function addProduct() {
  try {
    const response = await fetch('http://localhost:3000/api/admin/merch/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Necesitarás autenticación de admin aquí
      },
      body: JSON.stringify(productData),
    });
    const result = await response.json();
    console.log('✅ Producto agregado:', result);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// addProduct();
*/

