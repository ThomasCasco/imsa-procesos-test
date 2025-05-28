import { NextResponse } from "next/server";
import axios from "axios";
import { processContent } from "../../../lib/htmlProcessor.js";

export async function POST(request) {
  const { documento, aprobaciones } = await request.json();

  // Log para depurar los datos recibidos
  console.log("Datos recibidos - documento:", documento);
  console.log("Datos recibidos - aprobaciones:", aprobaciones);

  // Verificar si el token de Browserless está configurado
  const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN;
  if (!BROWSERLESS_TOKEN || BROWSERLESS_TOKEN === 'your_browserless_token_here') {
    console.error("Token de Browserless no configurado");
    return new NextResponse(
      JSON.stringify({ 
        error: "Token de Browserless no configurado", 
        details: "Configure BROWSERLESS_TOKEN en .env.local para generar PDFs. Obtenga su token en https://browserless.io" 
      }),
      { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  const today = new Date();
  const fecha = `${today.getDate().toString().padStart(2, "0")}/${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${today.getFullYear()}`;

  // Procesar todo el contenido del documento usando el nuevo procesador
  const objetoHTML = processContent(documento.objeto);
  const alcanceHTML = processContent(documento.alcance);
  const abreviaturasHTML = processContent(documento.abreviaturas);
  const responsabilidadesHTML = processContent(documento.responsabilidades);
  const descripcionHTML = processContent(documento.descripcion);

  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://tu-proyecto.vercel.app"
      : "http://localhost:4000";

  const htmlContent = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 40px 40px 60px 40px;
            font-size: 12pt;
            line-height: 1.4;
            color: #333;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid black;
            padding-bottom: 5px;
            margin-bottom: 20px;
          }
          
          .header-left {
            font-weight: bold;
          }
          
          .header-left img {
            height: 30px;
            vertical-align: middle;
          }
          
          .header-center {
            font-weight: bold;
            text-align: center;
            flex: 1;
          }
          
          .header-right {
            text-align: right;
            font-size: 10pt;
          }
          
          .title {
            text-align: center;
            font-size: 14pt;
            font-weight: bold;
            margin: 20px 0;
            line-height: 1.2;
          }
          
          .section {
            margin-bottom: 20px;
            page-break-inside: auto;
          }
          
          .section-title {
            font-weight: bold;
            margin-bottom: 8px;
            font-size: 12pt;
          }
          
          /* Estilos para párrafos */
          .pdf-paragraph, p {
            margin: 8px 0;
            line-height: 1.5;
            text-align: justify;
          }
          
          /* Estilos para listas ordenadas */
          .pdf-ordered-list, ol {
            margin: 10px 0;
            padding-left: 25px;
            page-break-inside: auto;
          }
          
          .pdf-ordered-list li, ol li {
            margin-bottom: 6px;
            line-height: 1.4;
            page-break-inside: avoid;
            list-style-type: decimal;
          }
          
          /* Estilos para listas no ordenadas */
          .pdf-unordered-list, ul {
            margin: 10px 0;
            padding-left: 25px;
            page-break-inside: auto;
          }
          
          .pdf-unordered-list li, ul li {
            margin-bottom: 6px;
            line-height: 1.4;
            page-break-inside: avoid;
            list-style-type: disc;
          }
          
          /* Estilos para sublistas */
          .pdf-sublist {
            margin: 5px 0;
            padding-left: 20px;
          }
          
          .pdf-sublist li {
            list-style-type: lower-alpha;
            margin-bottom: 4px;
          }
          
          /* Listas anidadas */
          ol ol, ul ul, ol ul, ul ol {
            margin: 5px 0;
            padding-left: 20px;
          }
          
          ol ol li, ul ol li {
            list-style-type: lower-alpha;
          }
          
          ul ul li, ol ul li {
            list-style-type: circle;
          }
          
          ol ol ol li, ul ul ul li {
            list-style-type: lower-roman;
          }
          
          /* Estilos para encabezados */
          .pdf-heading-1, h1 {
            font-size: 16pt;
            font-weight: bold;
            margin: 15px 0 10px 0;
            color: #000;
          }
          
          .pdf-heading-2, h2 {
            font-size: 14pt;
            font-weight: bold;
            margin: 12px 0 8px 0;
            color: #000;
          }
          
          .pdf-heading-3, h3 {
            font-size: 13pt;
            font-weight: bold;
            margin: 10px 0 6px 0;
            color: #000;
          }
          
          .pdf-heading-4, h4 {
            font-size: 12pt;
            font-weight: bold;
            margin: 8px 0 4px 0;
            color: #000;
          }
          
          .pdf-heading-5, h5 {
            font-size: 11pt;
            font-weight: bold;
            margin: 6px 0 3px 0;
            color: #000;
          }
          
          .pdf-heading-6, h6 {
            font-size: 10pt;
            font-weight: bold;
            margin: 4px 0 2px 0;
            color: #000;
          }
          
          /* Estilos para texto con formato */
          strong, b {
            font-weight: bold;
          }
          
          em, i {
            font-style: italic;
          }
          
          u {
            text-decoration: underline;
          }
          
          s, strike {
            text-decoration: line-through;
          }
          
          /* Estilos para citas */
          .pdf-blockquote, blockquote {
            border-left: 4px solid #ddd;
            margin: 15px 0;
            padding: 10px 15px;
            background-color: #f9f9f9;
            font-style: italic;
            page-break-inside: avoid;
          }
          
          /* Estilos para código */
          .pdf-inline-code, code {
            background-color: #f4f4f4;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: "Courier New", monospace;
            font-size: 11pt;
          }
          
          .pdf-code-block, pre {
            background-color: #f4f4f4;
            padding: 12px;
            border-radius: 4px;
            overflow-x: auto;
            font-family: "Courier New", monospace;
            font-size: 10pt;
            line-height: 1.3;
            margin: 10px 0;
            page-break-inside: avoid;
          }
          
          /* Saltos de línea */
          br {
            margin: 2px 0;
          }
          
          /* Texto adicional */
          .additional-text {
            margin: 15px 0;
            font-style: italic;
            font-size: 10pt;
            color: #666;
          }
          
          /* Evitar saltos de página problemáticos */
          .section-title {
            page-break-after: avoid;
          }
          
          li {
            page-break-inside: avoid;
          }
          
          h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid;
          }
          
          /* Espaciado mejorado para elementos consecutivos */
          p + ul, p + ol {
            margin-top: 5px;
          }
          
          ul + p, ol + p {
            margin-top: 10px;
          }
          
          /* Estilos para divs genéricos */
          div {
            margin: 0;
            padding: 0;
          }
          
          /* Asegurar que el contenido se mantenga dentro de los márgenes */
          * {
            box-sizing: border-box;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            <img src="https://imsa.com.ar/wp-content/uploads/2020/06/IMSA_Logo_rojo_02.png" alt="I.M.S.A." />
          </div>
          <div class="header-center">
            PROCEDIMIENTO
          </div>
          <div class="header-right">
            PA 009<br />
            Página <span class="pageNumber"></span> de <span class="totalPages"></span>
          </div>
        </div>
        <div class="title">
          IMSA PROCESOS - CAMBIAR TITULO<br />
        </div>
        <div class="section">
          <div class="section-title">1. OBJETO</div>
          ${objetoHTML}
        </div>
        <div class="section">
          <div class="section-title">2. ALCANCE</div>
          ${alcanceHTML}
        </div>
        <div class="section">
          <div class="section-title">3. ABREVIATURAS Y DEFINICIONES</div>
          ${abreviaturasHTML}
        </div>
        <div class="section">
          <div class="section-title">4. RESPONSABILIDADES</div>
          ${responsabilidadesHTML}
        </div>
        <div class="section">
          <div class="section-title">5. DESCRIPCIÓN</div>
          ${descripcionHTML}
        </div>
        <div class="additional-text">
          Solicitar esta documentación con anticipación para evitar demoras en Portería.
        </div>
      </body>
    </html>
  `;

  const footerTemplate = `
    <div style="font-size: 10pt; width: 100%; margin: 0 40px; padding-top: 5px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <th style="border: 1px solid black; padding: 5px; text-align: center;">Preparado por:</th>
          <th style="border: 1px solid black; padding: 5px; text-align: center;">Revisado por:</th>
          <th style="border: 1px solid black; padding: 5px; text-align: center;">Aprobado por:</th>
          <th style="border: 1px solid black; padding: 5px; text-align: center;">Revisión N°:</th>
        </tr>
        <tr>
          <td style="border: 1px solid black; padding: 5px; text-align: center;">${
            aprobaciones.preparadoPor
          }<br />Fecha: ${fecha}</td>
          <td style="border: 1px solid black; padding: 5px; text-align: center;">${
            aprobaciones.revisadoPor
          }<br />Fecha: ${fecha}</td>
          <td style="border: 1px solid black; padding: 5px; text-align: center;">${
            aprobaciones.aprobadoPor
          }<br />Fecha: ${fecha}</td>
          <td style="border: 1px solid black; padding: 5px; text-align: center;">${
            aprobaciones.revision
          }</td>
        </tr>
      </table>
    </div>
  `;

  // Llamada a Browserless
  try {
    const pdfResponse = await axios.post(
      `https://chrome.browserless.io/pdf?token=${BROWSERLESS_TOKEN}`,
      {
        html: htmlContent,
        options: {
          format: "A4",
          printBackground: true,
          margin: {
            top: "20mm",
            right: "15mm",
            bottom: "40mm",
            left: "15mm",
          },
          displayHeaderFooter: true,
          headerTemplate: "<span></span>",
          footerTemplate: footerTemplate,
        },
      },
      { responseType: "arraybuffer" }
    );

    return new NextResponse(pdfResponse.data, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=procedimiento.pdf",
      },
    });
  } catch (error) {
    console.error("Error al generar PDF:", error);
    let errorMessage = "Failed to generate PDF";
    let details = error.message;
    
    if (error.response?.status === 401) {
      errorMessage = "Token de Browserless inválido o expirado";
      details = "Verifique su token de Browserless en .env.local. Obtenga uno nuevo en https://browserless.io";
    } else if (error.response?.status === 429) {
      errorMessage = "Límite de uso de Browserless excedido";
      details = "Ha excedido el límite de su plan de Browserless. Verifique su cuenta o actualice su plan.";
    }
    
    return new NextResponse(
      JSON.stringify({ error: errorMessage, details: details }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}