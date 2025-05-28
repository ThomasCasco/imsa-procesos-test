import DOMPurify from 'dompurify';

/**
 * Procesa el HTML del editor de texto enriquecido y lo convierte a HTML válido para PDF
 * @param {string} htmlContent - Contenido HTML del editor
 * @returns {string} - HTML procesado y limpio
 */
export function processRichTextForPDF(htmlContent) {
  if (!htmlContent || htmlContent.trim() === '' || htmlContent === '<p><br></p>') {
    return '<p>No completado</p>';
  }

  try {
    // En el lado del servidor, usamos una versión simplificada de limpieza
    if (typeof window === 'undefined') {
      return processHTMLServerSide(htmlContent);
    }

    // Limpiar el HTML con DOMPurify (solo en el cliente)
    const cleanHTML = DOMPurify.sanitize(htmlContent, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u',
        'ol', 'ul', 'li', 'h1', 'h2', 'h3',
        'blockquote', 'div', 'span'
      ],
      ALLOWED_ATTR: ['class', 'style'],
      KEEP_CONTENT: true
    });

    return enhanceHTMLForPDF(cleanHTML);
  } catch (error) {
    console.error('Error procesando HTML:', error);
    return `<p>${htmlContent.replace(/<[^>]*>/g, '')}</p>`;
  }
}

/**
 * Procesa HTML en el servidor sin DOMPurify
 * @param {string} htmlContent 
 * @returns {string}
 */
function processHTMLServerSide(htmlContent) {
  // Limpiar tags no permitidos de manera básica
  let cleaned = htmlContent
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');

  return enhanceHTMLForPDF(cleaned);
}

/**
 * Mejora el HTML para una mejor renderización en PDF
 * @param {string} htmlContent 
 * @returns {string}
 */
function enhanceHTMLForPDF(htmlContent) {
  let enhanced = htmlContent;

  // Convertir párrafos vacíos de Quill a saltos de línea
  enhanced = enhanced.replace(/<p><br><\/p>/g, '<br>');
  enhanced = enhanced.replace(/<p><br\/><\/p>/g, '<br>');
  
  // NUEVA FUNCIÓN: Convertir divs con patrones de lista a listas reales
  enhanced = convertDivsToLists(enhanced);
  
  // Mejorar las listas - asegurar espaciado correcto
  enhanced = enhanced.replace(/<ol>/g, '<ol class="pdf-ordered-list">');
  enhanced = enhanced.replace(/<ul>/g, '<ul class="pdf-unordered-list">');
  
  // Agregar clases para mejor estilizado
  enhanced = enhanced.replace(/<blockquote>/g, '<blockquote class="pdf-blockquote">');
  
  // Asegurar que los párrafos tengan la clase correcta
  enhanced = enhanced.replace(/<p>/g, '<p class="pdf-paragraph">');
  
  // Manejar encabezados (solo H1-H3 ahora)
  for (let i = 1; i <= 3; i++) {
    const regex = new RegExp(`<h${i}>`, 'g');
    enhanced = enhanced.replace(regex, `<h${i} class="pdf-heading-${i}">`);
  }

  return enhanced;
}

/**
 * Convierte divs que contienen patrones de lista en listas HTML estructuradas
 * @param {string} htmlContent 
 * @returns {string}
 */
function convertDivsToLists(htmlContent) {
  // Dividir el contenido en líneas para procesamiento
  const lines = htmlContent.split(/(<div[^>]*>.*?<\/div>|<br\s*\/?>)/i).filter(line => line.trim());
  let result = [];
  let currentList = null;
  let currentListType = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line || line === '<br>' || line === '<br/>') {
      // Finalizar lista actual si existe
      if (currentList) {
        if (currentListType === 'ol') {
          result.push('<ol class="pdf-ordered-list">');
        } else {
          result.push('<ul class="pdf-unordered-list">');
        }
        result.push(...currentList);
        result.push(currentListType === 'ol' ? '</ol>' : '</ul>');
        currentList = null;
        currentListType = null;
      }
      result.push('<br>');
      continue;
    }
    
    // Extraer contenido del div
    const divMatch = line.match(/<div[^>]*>(.*?)<\/div>/i);
    if (!divMatch) {
      // No es un div, mantener como está
      if (currentList) {
        // Finalizar lista actual
        if (currentListType === 'ol') {
          result.push('<ol class="pdf-ordered-list">');
        } else {
          result.push('<ul class="pdf-unordered-list">');
        }
        result.push(...currentList);
        result.push(currentListType === 'ol' ? '</ol>' : '</ul>');
        currentList = null;
        currentListType = null;
      }
      result.push(line);
      continue;
    }
    
    const content = divMatch[1].trim();
    
    // Detectar patrones de lista
    const numberedMatch = content.match(/^(\d+)\.\s*(.+)$/);
    const letterMatch = content.match(/^([a-z])\)\s*(.+)$/i);
    const bulletMatch = content.match(/^[-*•]\s*(.+)$/);
    
    if (numberedMatch) {
      // Lista numerada
      const number = parseInt(numberedMatch[1]);
      const text = numberedMatch[2];
      
      if (number === 1 || !currentList || currentListType !== 'ol') {
        // Iniciar nueva lista numerada
        if (currentList) {
          // Finalizar lista anterior
          if (currentListType === 'ol') {
            result.push('<ol class="pdf-ordered-list">');
          } else {
            result.push('<ul class="pdf-unordered-list">');
          }
          result.push(...currentList);
          result.push(currentListType === 'ol' ? '</ol>' : '</ul>');
        }
        currentList = [];
        currentListType = 'ol';
      }
      
      currentList.push(`<li>${text}</li>`);
      
    } else if (letterMatch) {
      // Sublista con letras
      const letter = letterMatch[1].toLowerCase();
      const text = letterMatch[2];
      
      if (letter === 'a' || !currentList || currentListType !== 'ol-sub') {
        // Iniciar nueva sublista
        if (currentList && currentListType !== 'ol-sub') {
          // Finalizar lista anterior
          if (currentListType === 'ol') {
            result.push('<ol class="pdf-ordered-list">');
          } else {
            result.push('<ul class="pdf-unordered-list">');
          }
          result.push(...currentList);
          result.push(currentListType === 'ol' ? '</ol>' : '</ul>');
        }
        currentList = [];
        currentListType = 'ol-sub';
      }
      
      currentList.push(`<li>${text}</li>`);
      
    } else if (bulletMatch) {
      // Lista con viñetas
      const text = bulletMatch[1];
      
      if (!currentList || currentListType !== 'ul') {
        // Iniciar nueva lista con viñetas
        if (currentList) {
          // Finalizar lista anterior
          if (currentListType === 'ol') {
            result.push('<ol class="pdf-ordered-list">');
          } else if (currentListType === 'ol-sub') {
            result.push('<ol class="pdf-sublist">');
          } else {
            result.push('<ul class="pdf-unordered-list">');
          }
          result.push(...currentList);
          if (currentListType === 'ol') {
            result.push('</ol>');
          } else if (currentListType === 'ol-sub') {
            result.push('</ol>');
          } else {
            result.push('</ul>');
          }
        }
        currentList = [];
        currentListType = 'ul';
      }
      
      currentList.push(`<li>${text}</li>`);
      
    } else {
      // No es un patrón de lista, finalizar lista actual si existe
      if (currentList) {
        if (currentListType === 'ol') {
          result.push('<ol class="pdf-ordered-list">');
        } else if (currentListType === 'ol-sub') {
          result.push('<ol class="pdf-sublist">');
        } else {
          result.push('<ul class="pdf-unordered-list">');
        }
        result.push(...currentList);
        if (currentListType === 'ol') {
          result.push('</ol>');
        } else if (currentListType === 'ol-sub') {
          result.push('</ol>');
        } else {
          result.push('</ul>');
        }
        currentList = null;
        currentListType = null;
      }
      
      // Agregar como párrafo
      result.push(`<p class="pdf-paragraph">${content}</p>`);
    }
  }
  
  // Finalizar lista pendiente al final
  if (currentList) {
    if (currentListType === 'ol') {
      result.push('<ol class="pdf-ordered-list">');
    } else if (currentListType === 'ol-sub') {
      result.push('<ol class="pdf-sublist">');
    } else {
      result.push('<ul class="pdf-unordered-list">');
    }
    result.push(...currentList);
    if (currentListType === 'ol') {
      result.push('</ol>');
    } else if (currentListType === 'ol-sub') {
      result.push('</ol>');
    } else {
      result.push('</ul>');
    }
  }
  
  return result.join('\n');
}

/**
 * Convierte texto plano con formato simple a HTML estructurado
 * @param {string} plainText - Texto plano con formato
 * @returns {string} - HTML estructurado
 */
export function convertPlainTextToHTML(plainText) {
  if (!plainText || plainText.trim() === '') {
    return '<p>No completado</p>';
  }

  let html = plainText;
  
  // Escapar HTML existente
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  // Convertir saltos de línea dobles a párrafos
  html = html.replace(/\n\s*\n/g, '</p><p>');
  
  // Convertir listas numeradas
  html = html.replace(/^\s*(\d+)\.\s+(.+)$/gm, '<li>$2</li>');
  
  // Convertir sublistas con letras
  html = html.replace(/^\s*([a-z])\)\s+(.+)$/gm, '<li class="sublist-item">$2</li>');
  
  // Convertir viñetas
  html = html.replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>');
  
  // Envolver listas
  html = html.replace(/(<li>.*<\/li>)/gs, (match) => {
    if (match.includes('class="sublist-item"')) {
      return `<ol class="pdf-sublist">${match}</ol>`;
    }
    return `<ol class="pdf-ordered-list">${match}</ol>`;
  });
  
  // Envolver en párrafos
  if (!html.includes('<p>')) {
    html = `<p>${html}</p>`;
  }
  
  // Limpiar párrafos vacíos
  html = html.replace(/<p>\s*<\/p>/g, '');
  
  return html;
}

/**
 * Procesa contenido mixto (puede ser HTML del editor o texto plano)
 * @param {string} content 
 * @returns {string}
 */
export function processContent(content) {
  if (!content || content.trim() === '') {
    return '<p>No completado</p>';
  }

  // Detectar si ya es HTML del editor de texto enriquecido
  if (content.includes('<div>') || content.includes('<p>') || content.includes('<ol>') || content.includes('<ul>') || content.includes('<h')) {
    return processRichTextForPDF(content);
  }

  // Si es texto plano, convertirlo a HTML estructurado
  return convertPlainTextToHTML(content);
} 