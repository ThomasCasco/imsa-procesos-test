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

- **Editor de texto enriquecido**: Formato completo con listas, negritas, cursivas, encabezados
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

### Dos barras de edición aparecen
- **Causa**: Problema de carga del editor
- **Solución**: Actualiza la página. El editor se carga dinámicamente para mejor compatibilidad

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
├── components/
│   └── RichTextEditor.js    # Editor de texto enriquecido
├── lib/
│   └── htmlProcessor.js     # Procesador de HTML para PDF
├── env.example              # Ejemplo de variables de entorno
└── cambios.md              # Documentación detallada
```

## 🔧 Desarrollo

- **Framework**: Next.js 15.2.3
- **Editor**: Quill.js (carga dinámica)
- **PDF**: Browserless/Chromium
- **IA**: Mistral AI
- **Estilos**: CSS-in-JS con styled-jsx

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
- ✅ Usar el editor de texto enriquecido
- ✅ Crear contenido estructurado
- ✅ Ver vista previa del documento
- ✅ Grabar y transcribir voz
- ❌ Generar PDFs (requiere Browserless token)
- ❌ Mejorar texto con IA (requiere Mistral token)
