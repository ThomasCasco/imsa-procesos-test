# IMSA Procesos

Sistema de generación de documentos de procedimientos con asistencia de IA.

## 🚀 Instalación

1. **Clonar el repositorio**:
```bash
git clone [url-del-repositorio]
cd imsa-procesos
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar variables de entorno**:
```bash
# Copiar el archivo de ejemplo
cp env.example .env.local
```

4. **Editar `.env.local` con tus tokens**:
```env
# Token para Browserless (obligatorio para generar PDFs)
BROWSERLESS_TOKEN=tu_token_de_browserless_aqui

# Token para Mistral AI (opcional, para mejorar texto con IA)
MISTRAL_API_KEY=tu_token_de_mistral_aqui
```

## 🔑 Obtener Tokens

### Browserless Token (Obligatorio)
1. Ve a [https://browserless.io](https://browserless.io)
2. Crea una cuenta gratuita
3. Obtén tu token del dashboard
4. Pégalo en `.env.local` como `BROWSERLESS_TOKEN`

### Mistral AI Token (Opcional)
1. Ve a [https://console.mistral.ai](https://console.mistral.ai)
2. Crea una cuenta
3. Genera una API key
4. Pégala en `.env.local` como `MISTRAL_API_KEY`

## 🏃‍♂️ Uso

1. **Iniciar el servidor de desarrollo**:
```bash
npm run dev
```

2. **Abrir en el navegador**:
```
http://localhost:3000
```

## ✨ Características

- **Editor de texto simple**: Textarea optimizado para contenido estructurado
- **Generación de PDF**: PDFs profesionales con formato preservado
- **Asistencia de IA**: Mejora automática de texto (requiere token de Mistral)
- **Grabación de voz**: Transcripción automática de audio
- **Navegación intuitiva**: Interfaz fácil de usar

## 🐛 Solución de Problemas

### Error: "Token de Browserless no configurado"
- **Causa**: No has configurado `BROWSERLESS_TOKEN` en `.env.local`
- **Solución**: Obtén un token gratuito en [browserless.io](https://browserless.io) y agrégalo a tu archivo `.env.local`

### Error: "Función de IA no disponible"
- **Causa**: No has configurado `MISTRAL_API_KEY` en `.env.local`
- **Solución**: La función de IA es opcional. El sistema funciona sin ella, pero puedes obtener un token en [console.mistral.ai](https://console.mistral.ai) para habilitar esta función

### Error de permisos en Windows
- **Causa**: Archivos de Next.js bloqueados
- **Solución**: Ejecuta como administrador o cambia permisos de la carpeta `.next`

## 📁 Estructura del Proyecto

```
imsa-procesos/
├── app/
│   ├── api/
│   │   ├── generar-pdf/     # API de generación de PDFs
│   │   └── mejorar-texto/   # API de mejora con IA
│   └── page.js              # Página principal
├── lib/
│   └── htmlProcessor.js     # Procesador de texto para PDF
├── env.example              # Ejemplo de variables de entorno
└── cambios.md              # Documentación detallada
```

## 🔧 Desarrollo

- **Framework**: Next.js 15.2.3
- **Editor**: Textarea simple con procesamiento inteligente de texto
- **PDF**: Browserless/Chromium
- **IA**: Mistral AI
- **Estilos**: CSS-in-JS con styled-jsx

## 📝 Formato de Texto Soportado

El sistema detecta y convierte automáticamente:
- **Listas numeradas**: `1. Elemento`, `2. Elemento`
- **Sublistas**: `a) Subelemento`, `b) Subelemento`
- **Viñetas**: `- Elemento` o `• Elemento`
- **Párrafos**: Texto separado por líneas en blanco
- **Saltos de línea**: Se preservan automáticamente

### Ejemplo de formato:
```
Tipos de servicios:
1. Trámites
2. Traslado de personal IMSA
   a) Por Agencia Viey
   b) Por Cabifi
3. Traslado de visitas

Consideraciones:
Los servicios deben ser contratados...
```

## 🚀 Deployment

### Preparación para Deploy

1. **Verificar build local**:
```bash
npm run build
```

2. **Configurar variables de entorno en producción**:
   - En Vercel: Project Settings → Environment Variables
   - Agregar `BROWSERLESS_TOKEN` y `MISTRAL_API_KEY`

### Deploy en Vercel

1. **Conectar repositorio**:
   - Conecta tu repositorio de GitHub/GitLab a Vercel
   - Vercel detectará automáticamente que es un proyecto Next.js

2. **Configurar variables de entorno**:
   ```env
   BROWSERLESS_TOKEN=tu_token_real
   MISTRAL_API_KEY=tu_token_real
   ```

3. **Deploy automático**:
   - Cada push a la rama principal desplegará automáticamente

### Solución de Errores de Build Comunes

#### Error de ESLint con comillas
- **Error**: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`
- **Solución**: ✅ Ya solucionado - Código optimizado

#### Warning de imagen no optimizada
- **Error**: Using `<img>` could result in slower LCP
- **Solución**: ✅ Ya solucionado - Usamos `<Image />` de Next.js

#### Error de variables de entorno
- **Error**: Variables no definidas en producción
- **Solución**: Configurar variables en el panel de Vercel

### URLs de Producción

Una vez desplegado, tu aplicación estará disponible en:
- **Vercel**: `https://tu-proyecto.vercel.app`
- **Dominio personalizado**: Configurable en Vercel

## 📚 Documentación Completa

Consulta `cambios.md` para documentación técnica detallada sobre:
- Arquitectura del sistema
- Decisiones técnicas
- Casos de uso
- Ejemplos de código

## 🆘 Soporte

Si tienes problemas:
1. Verifica que todos los tokens estén configurados correctamente
2. Revisa la consola del navegador para errores específicos
3. Consulta la sección de solución de problemas arriba
4. Revisa `cambios.md` para detalles técnicos

## 🚀 Funcionalidades Disponibles Sin Tokens

Incluso sin configurar tokens, puedes:
- ✅ Usar el editor de texto con formato automático
- ✅ Crear contenido estructurado
- ✅ Ver vista previa del documento
- ✅ Grabar y transcribir voz
- ❌ Generar PDFs (requiere Browserless token)
- ❌ Mejorar texto con IA (requiere Mistral token)

## 📈 Estado del Proyecto

- ✅ **Build exitoso**: Sin errores de linting o compilación
- ✅ **Editor optimizado**: Textarea simple con procesamiento inteligente
- ✅ **Deploy ready**: Optimizado para producción
- ✅ **Documentación completa**: README y documentación técnica
- ✅ **Variables de entorno**: Configuración clara y ejemplos
- ✅ **Formato automático**: Convierte texto plano a listas estructuradas en PDF
