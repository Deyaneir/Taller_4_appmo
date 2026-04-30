/**
 * Script de prueba para validar la subida de documentos a Supabase Storage
 * Ejecutar en la consola para debuggear
 */

import { supabase } from '@shared/api/supabase';

export async function testStorageConnection() {
  console.log('=== TEST: Verificando conexión a Supabase Storage ===');
  
  try {
    // Listar buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error al listar buckets:', bucketsError.message);
      return;
    }
    
    console.log('✓ Buckets disponibles:', buckets?.map(b => b.name));
    
    // Verificar si existe el bucket proyectos-documentos
    const bucketExists = buckets?.some(b => b.name === 'proyectos-documentos');
    console.log(`✓ Bucket 'proyectos-documentos' existe: ${bucketExists ? 'SÍ' : 'NO'}`);
    
    if (!bucketExists) {
      console.warn('⚠️ El bucket no existe. Necesita ser creado en el dashboard de Supabase');
    }
    
  } catch (err) {
    console.error('❌ Error en testStorageConnection:', err);
  }
}

export async function testCreateMinimalPDF() {
  console.log('=== TEST: Crear y subir un PDF minimal ===');
  
  try {
    // Crear un PDF minimal en base64
    const pdfBase64 = 'JVBERi0xLjQKCjEgMCBvYmo+CjwvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFI+CmVuZG9iCgoyIDAgb2JqCjwvVHlwZSAvUGFnZXMgL0tpZHMgWzMgMCBSXSAvQ291bnQgMT4KZW5kb2JqCgozIDAgb2JqCjwvVHlwZSAvUGFnZSAvUGFyZW50IDIgMCBSIC9NZWRpYUJveCBbMCAwIDYxMiA3OTJdIC9SZXNvdXJjZXMgNCAwIFI+CmVuZG9iCgo0IDAgb2JqCjwvRm9udCA8PC9GMSA1IDAgUj4+Pgo+CmVuZG9iCgo1IDAgb2JqCjwvVHlwZSAvRm9udCAvU3VidHlwZSAvVHlwZTEgL0Jhc2VGb250IC9IZWxtdGljYT4KZW5kb2IKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDA0NiAwMDAwMCBuIAowMDAwMDAwMTExIDAwMDAwIG4gCjAwMDAwMDAyMzAgMDAwMDAgbiAKMDAwMDAwMDI4MCAwMDAwMCBuIAp0cmFpbGVyCjwvU2l6ZSA2IC9Sb290IDEgMCBSOiAvSW5mbyAxIDAgUj4Kc3RhcnR4cmVmCjM4OAolJUVPRgo=';
    
    const binaryString = atob(pdfBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });
    
    // Intentar subir
    const fileName = `test-${Date.now()}.pdf`;
    console.log(`Subiendo: ${fileName}`);
    
    const { data, error } = await supabase.storage
      .from('proyectos-documentos')
      .upload(`documentos/${fileName}`, blob, {
        contentType: 'application/pdf',
        upsert: false,
      });
    
    if (error) {
      console.error('❌ Error al subir:', error.message, error);
      return;
    }
    
    console.log('✓ Archivo subido:', data);
    
    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from('proyectos-documentos')
      .getPublicUrl(`documentos/${fileName}`);
    
    console.log('✓ URL pública:', publicUrlData.publicUrl);
    
  } catch (err) {
    console.error('❌ Error en testCreateMinimalPDF:', err);
  }
}
