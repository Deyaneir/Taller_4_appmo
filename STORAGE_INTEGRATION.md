# Integración de Supabase Storage para Carga de Documentos

## Cambios Realizados

### 1. Actualización de Modelos (`src/entities/proyecto-tesis/model/types.tsx`)
- ✅ Agregado campo `documento_url?: string` en la interfaz `ProyectoTesis`
- Los DTOs se actualizan automáticamente vía `Omit<ProyectoTesis>`

### 2. Actualización del Schema de Validación (`src/shared/lib/validators/proyectoSchema.ts`)
- ✅ Agregado campo `documento_url` (string opcional)
- El campo es tratado como opcional en la validación

### 3. Nuevo Módulo de Upload (`src/features/registro-proyecto/api/uploadDocumento.ts`)
- ✅ Función `uploadDocumentoProyecto()`: Sube PDFs a Supabase Storage
  - Valida tipo MIME (application/pdf)
  - Limita tamaño máximo a 5 MB
  - Genera nombre único con timestamp para evitar conflictos
  - Retorna URL pública del archivo
- ✅ Función `isValidPdfFile()`: Valida propiedades del archivo
- ✅ Función `deleteDocumentoProyecto()`: Elimina archivos de Storage

### 4. Actualización de Lógica de Creación (`src/features/registro-proyecto/api/createProyecto.ts`)
- ✅ Ahora acepta parámetro `documentoFile` (opcional)
- ✅ Sube el documento ANTES de crear el proyecto
- ✅ Incluye `documento_url` en el payload si el upload fue exitoso
- ✅ Manejo de errores: si el upload falla, no se crea el proyecto

### 5. Actualización de API (`src/entities/proyecto-tesis/api/proyectoApi.tsx`)
- ✅ Método `create()` ahora filtra `documento_url` si está vacío
- ✅ Preserva la lógica existente para otros campos opcionales

### 6. Actualización del Formulario (`src/features/registro-proyecto/ui/RegistroProyectoForm.tsx`)
- ✅ Nuevo estado `documentoSeleccionado` para rastrear el archivo
- ✅ Botón "Seleccionar PDF" que usa `expo-document-picker`
- ✅ Muestra nombre y tamaño del archivo seleccionado
- ✅ Integración con `createProyecto()` para pasar el archivo
- ✅ Reset del estado cuando la creación es exitosa

### 7. Actualización de Dependencias (`package.json`)
- ✅ Agregada `expo-document-picker@~13.0.13`

## Configuración Necesaria de Supabase

Para que el upload de documentos funcione, debes:

### Paso 1: Crear el Bucket en Supabase
```sql
-- En SQL Editor de Supabase:
INSERT INTO storage.buckets (id, name, public)
VALUES ('proyectos-documentos', 'proyectos-documentos', true);
```

### Paso 2: Configurar Políticas de Acceso (RLS)
En la sección **Storage Policies** de Supabase, crea las siguientes políticas para el bucket `proyectos-documentos`:

**Política de Lectura (SELECT)**:
```sql
-- Permite que cualquiera lea archivos públicos
(bucket_id = 'proyectos-documentos'::text)
```
Aplica a: SELECT

**Política de Escritura (INSERT)**:
```sql
-- Permite que usuarios autenticados suban archivos
(bucket_id = 'proyectos-documentos'::text AND auth.role() = 'authenticated'::text)
```
Aplica a: INSERT

### Paso 3: Agregar Columna a la Tabla (si aún no existe)
```sql
-- Verificar si existe la columna
ALTER TABLE proyectos_tesis
ADD COLUMN documento_url TEXT;
```

## Flujo de Uso

### Creación de Proyecto con Documento:
1. Usuario completa el formulario de registro
2. (Opcional) Presiona "Seleccionar PDF" para elegir un archivo
3. Sistema valida:
   - El archivo es un PDF
   - El tamaño no excede 5 MB
4. Al presionar "Registrar Proyecto":
   - Si hay documento: se sube primero a Storage
   - Se obtiene la URL pública del archivo
   - Se crea el proyecto con `documento_url` incluido
5. Éxito: Proyecto registrado con documento enlazado
6. Error: Se muestra al usuario y el proyecto NO se crea

### Acceso al Documento:
- El `documento_url` almacenado en `proyectos_tesis` es una URL pública
- Ejemplo: `https://[tu-project].supabase.co/storage/v1/object/public/proyectos-documentos/1734567890-tesis.pdf`
- Los usuarios pueden descargar el PDF haciendo click en la URL

## Gestión del Ciclo de Vida

### Editar Proyecto:
El campo `documento_url` se preserva en ediciones. Para reemplazar el documento, se requeriría lógica adicional no implementada en esta versión.

### Eliminar Proyecto:
Actualmente el borrado NO elimina automáticamente el documento de Storage. Para implementar esto:
```typescript
// En proyectoApi.delete():
if (proyecto.documento_url) {
  const filePath = proyecto.documento_url.split('/').pop();
  await deleteDocumentoProyecto(`documentos/${filePath}`);
}
```

## Validación Frontend
- Tipo de archivo: Solo PDFs (extension `.pdf` o MIME type `application/pdf`)
- Tamaño máximo: 5 MB
- Mensajes de error específicos para cada validación

## Limitaciones Conocidas
1. No hay reemplazo de documentos (solo creación)
2. No hay limpieza automática al eliminar proyectos
3. El nombre del archivo se genera con timestamp (perder nombre original si es importante)

## Testing
Para probar la integración:
```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar Expo
npx expo start -c

# 3. En la app:
# - Navegar a "Registro"
# - Completar formulario
# - Seleccionar un PDF test
# - Registrar proyecto
# - Verificar que aparece en la lista con documento adjunto
```

## Endpoints Utilizados
- `supabase.storage.from('proyectos-documentos').upload()` - Upload
- `supabase.storage.from('proyectos-documentos').getPublicUrl()` - Obtener URL
- `supabase.storage.from('proyectos-documentos').remove()` - Eliminar
