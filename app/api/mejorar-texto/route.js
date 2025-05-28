import { NextResponse } from "next/server";
import axios from "axios";
  
export async function POST(request) {
  const { texto, seccion } = await request.json();

  const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
  
  // Verificar si el token está configurado
  if (!MISTRAL_API_KEY || MISTRAL_API_KEY === 'your_mistral_api_key_here') {
    console.log("Token de Mistral no configurado, usando fallback");
    let textoFallback = texto.trim();
    if (seccion === "objeto") textoFallback = `Objeto: ${textoFallback.replace(/^objeto:?/i, "").trim()}.`;
    else if (seccion === "alcance") textoFallback = `Alcance: ${textoFallback.replace(/^alcance:?/i, "").trim()}.`;
    else if (seccion === "abreviaturas") textoFallback = `Abreviaturas y Definiciones: ${textoFallback.replace(/^abreviaturas.*?:?/i, "").trim()}.`;
    else if (seccion === "responsabilidades") textoFallback = `Responsabilidades: ${textoFallback.replace(/^responsabilidades:?/i, "").trim()}.`;
    else if (seccion === "descripcion") textoFallback = `Descripción: ${textoFallback.replace(/^descripción:?/i, "").trim()}.`;
    
    return NextResponse.json({ 
      resultado: textoFallback,
      mensaje: "Función de IA no disponible. Configure MISTRAL_API_KEY en .env.local para usar esta función."
    });
  }

  let prompt = "";
  if (seccion === "objeto") {
    prompt = `Corrige y formatea este texto como la sección 'Objeto' de un procedimiento ISO, siendo claro y formal: "${texto}"`;
  } else if (seccion === "alcance") {
    prompt = `Corrige y formatea este texto como la sección 'Alcance' de un procedimiento ISO, siendo conciso: "${texto}"`;
  } else if (seccion === "abreviaturas") {
    prompt = `Corrige y formatea este texto como la sección 'Abreviaturas y Definiciones' de un procedimiento ISO: "${texto}"`;
  } else if (seccion === "responsabilidades") {
    prompt = `Corrige y formatea este texto como la sección 'Responsabilidades' de un procedimiento ISO, siendo claro: "${texto}"`;
  } else if (seccion === "descripcion") {
    prompt = `Corrige y formatea este texto como la sección 'Descripción' de un procedimiento ISO, siendo detallado: "${texto}"`;
  }

  try {
    const response = await axios.post(
      "https://api.mistral.ai/v1/chat/completions",
      {
        model: "mistral-small-latest",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 32000,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const textoMejorado = response.data.choices[0]?.message.content || texto;
    return NextResponse.json({ resultado: textoMejorado });
  } catch (error) {
    console.error("Error con Mistral API:", error.message);
    let textoFallback = texto.trim();
    if (seccion === "objeto") textoFallback = `Objeto: ${textoFallback.replace(/^objeto:?/i, "").trim()}.`;
    else if (seccion === "alcance") textoFallback = `Alcance: ${textoFallback.replace(/^alcance:?/i, "").trim()}.`;
    else if (seccion === "abreviaturas") textoFallback = `Abreviaturas y Definiciones: ${textoFallback.replace(/^abreviaturas.*?:?/i, "").trim()}.`;
    else if (seccion === "responsabilidades") textoFallback = `Responsabilidades: ${textoFallback.replace(/^responsabilidades:?/i, "").trim()}.`;
    else if (seccion === "descripcion") textoFallback = `Descripción: ${textoFallback.replace(/^descripción:?/i, "").trim()}.`;
    
    return NextResponse.json({ 
      resultado: textoFallback,
      mensaje: "Error conectando con IA. Se aplicó formato básico al texto."
    });
  }
}