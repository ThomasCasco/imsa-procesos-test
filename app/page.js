"use client"

import { useState, useEffect } from "react"
import dynamic from 'next/dynamic'
import Image from 'next/image'
// If you have Lucide icons installed, uncomment this line:
// import { Mic, FileText, Save, ArrowLeft, ArrowRight, Sparkles, Download } from 'lucide-react';

// Importar el editor de texto enriquecido dinámicamente
const RichTextEditor = dynamic(() => import('../components/RichTextEditor'), {
  ssr: false,
  loading: () => <p>Cargando editor...</p>
})

export default function Transcribir() {
  const [showIntro, setShowIntro] = useState(true)
  const [seccionActual, setSeccionActual] = useState(0)
  const [documento, setDocumento] = useState({
    objeto: "",
    alcance: "",
    abreviaturas: "",
    responsabilidades: "",
    descripcion: "",
  })
  const [grabando, setGrabando] = useState(false)
  const [textoTemporal, setTextoTemporal] = useState("")
  const [aprobaciones, setAprobaciones] = useState({
    preparadoPor: "Roberto Francucci",
    revisadoPor: "Pablo Ottaviano",
    aprobadoPor: "Pablo Ottaviano",
    revision: "000",
  })
  const [processingAI, setProcessingAI] = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [activeTab, setActiveTab] = useState("resumen")
  const [useRichText, setUseRichText] = useState(true) // Nuevo estado para el modo de editor

  // Animation timing effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false)
    }, 3000) // 3 seconds for the intro animation

    return () => clearTimeout(timer)
  }, [])

  const secciones = [
    { nombre: "Objeto", clave: "objeto" },
    { nombre: "Alcance", clave: "alcance" },
    { nombre: "Abreviaturas y Definiciones", clave: "abreviaturas" },
    { nombre: "Responsabilidades", clave: "responsabilidades" },
    { nombre: "Descripción", clave: "descripcion" },
  ]

  const empezarGrabacion = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
    recognition.lang = "es-ES"
    recognition.onresult = (event) => {
      const transcripcion = event.results[0][0].transcript
      setTextoTemporal(transcripcion)
    }
    recognition.onend = () => setGrabando(false)
    recognition.start()
    setGrabando(true)
  }

  const mejorarConIA = async () => {
    if (!textoTemporal) return

    setProcessingAI(true)
    try {
      const response = await fetch("/api/mejorar-texto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto: textoTemporal,
          seccion: secciones[seccionActual].clave,
        }),
      })
      const data = await response.json()
      setTextoTemporal(data.resultado)
    } catch (error) {
      console.error("Error al mejorar el texto:", error)
    } finally {
      setProcessingAI(false)
    }
  }

  const guardarTexto = () => {
    if (!textoTemporal) return
    setDocumento((prev) => ({
      ...prev,
      [secciones[seccionActual].clave]: textoTemporal,
    }))
    setTextoTemporal("")
  }

  const generarPDF = async () => {
    setGeneratingPDF(true)
    try {
      const response = await fetch("/api/generar-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documento, aprobaciones }),
      })

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "procedimiento.pdf"
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error al generar el PDF:", error)
    } finally {
      setGeneratingPDF(false)
    }
  }

  const siguienteSeccion = () => {
    if (seccionActual < secciones.length - 1) {
      setSeccionActual(seccionActual + 1)
      setTextoTemporal("")
    }
  }

  const seccionAnterior = () => {
    if (seccionActual > 0) {
      setSeccionActual(seccionActual - 1)
      setTextoTemporal("")
    }
  }

  const calcularProgreso = () => {
    const seccionesCompletadas = Object.values(documento).filter(Boolean).length
    return (seccionesCompletadas / secciones.length) * 100
  }

  const irASeccion = (index) => {
    setSeccionActual(index)
    setTextoTemporal("")
  }

  // Función para alternar entre modo texto plano y enriquecido
  const toggleEditorMode = () => {
    setUseRichText(!useRichText)
    // Si el texto actual es HTML y cambiamos a texto plano, convertir
    if (useRichText && textoTemporal.includes('<')) {
      // Convertir HTML básico a texto plano
      const plainText = textoTemporal
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<p>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
      setTextoTemporal(plainText)
    }
  }

  // Función para manejar cambios en el editor de texto enriquecido
  const handleRichTextChange = (content) => {
    setTextoTemporal(content)
  }

  // Icons as SVG if Lucide is not installed
  const IconMic = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" x2="12" y1="19" y2="22"></line>
    </svg>
  )

  const IconSparkles = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
    </svg>
  )

  const IconSave = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <polyline points="17 21 17 13 7 13 7 21"></polyline>
      <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
  )

  const IconArrowLeft = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 19-7-7 7-7"></path>
      <path d="M19 12H5"></path>
    </svg>
  )

  const IconArrowRight = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14"></path>
      <path d="m12 5 7 7-7 7"></path>
    </svg>
  )

  const IconDownload = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" x2="12" y1="15" y2="3"></line>
    </svg>
  )

  const IconEdit = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
      <path d="m15 5 4 4"></path>
    </svg>
  )

  // Intro animation styles
  const introContainerStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#F1291C",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    transition: "opacity 0.5s ease-in-out",
    opacity: showIntro ? 1 : 0,
    pointerEvents: showIntro ? "all" : "none",
  }

  const introTitleStyle = {
    fontSize: "3rem",
    fontWeight: "bold",
    color: "white",
    marginBottom: "1rem",
    textAlign: "center",
    animation: "fadeInUp 0.8s ease-out",
  }

  const introSubtitleStyle = {
    fontSize: "1.5rem",
    color: "white",
    opacity: 0.9,
    textAlign: "center",
    animation: "fadeInUp 0.8s ease-out 0.3s forwards",
    opacity: 0,
  }

  const containerStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
  }

  const headerStyle = {
    textAlign: "center",
    marginBottom: "2rem",
  }

  const titleStyle = {
    fontSize: "1.875rem",
    fontWeight: "bold",
    color: "#F1291C",
    marginBottom: "0.5rem",
  }

  const subtitleStyle = {
    color: "#666",
    marginBottom: "1rem",
  }

  const progressContainerStyle = {
    width: "100%",
    maxWidth: "500px",
    height: "8px",
    backgroundColor: "#e5e7eb",
    borderRadius: "4px",
    margin: "0 auto",
  }

  const progressBarStyle = {
    width: `${calcularProgreso()}%`,
    height: "100%",
    backgroundColor: "#F1291C",
    borderRadius: "4px",
    transition: "width 0.3s ease",
  }

  const progressTextStyle = {
    fontSize: "0.875rem",
    color: "#666",
    marginTop: "0.5rem",
  }

  const cardStyle = {
    border: "1px solid #e5e7eb",
    borderRadius: "0.5rem",
    overflow: "hidden",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    marginBottom: "1.5rem",
  }

  const cardHeaderStyle = {
    background: "linear-gradient(to right, #F1291C, #B91207)",
    padding: "1rem",
    color: "white",
  }

  const cardHeaderFlexStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }

  const cardTitleStyle = {
    fontSize: "1.25rem",
    fontWeight: "bold",
  }

  const cardSubtitleStyle = {
    fontSize: "0.875rem",
    color: "#FFF7F6",
  }

  const badgeStyle = {
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    border: "1px solid white",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  }

  const cardContentStyle = {
    padding: "1.5rem",
  }

  const buttonPrimaryStyle = {
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "#F1291C",
    color: "white",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    marginBottom: "1rem",
  }

  const buttonRecordingStyle = {
    ...buttonPrimaryStyle,
    backgroundColor: "#93c5fd",
    cursor: "default",
  }

  const textareaStyle = {
    width: "100%",
    minHeight: "200px",
    padding: "0.75rem",
    borderRadius: "0.375rem",
    border: "1px solid #d1d5db",
    resize: "vertical",
    marginBottom: "1rem",
  }

  const buttonGroupStyle = {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1rem",
  }

  const buttonOutlineStyle = {
    flex: "1",
    padding: "0.75rem",
    backgroundColor: "white",
    color: "#F1291C",
    border: "1px solid #F1291C",
    borderRadius: "0.375rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
  }

  const buttonSuccessStyle = {
    flex: "1",
    padding: "0.75rem",
    backgroundColor: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
  }

  // Nuevos estilos para el toggle del editor
  const editorToggleStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1rem",
    padding: "0.5rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "0.375rem",
    border: "1px solid #e5e7eb",
  }

  const toggleButtonStyle = {
    padding: "0.25rem 0.75rem",
    backgroundColor: useRichText ? "#F1291C" : "#6b7280",
    color: "white",
    border: "none",
    borderRadius: "0.25rem",
    cursor: "pointer",
    fontSize: "0.875rem",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  }

  const cardFooterStyle = {
    display: "flex",
    justifyContent: "space-between",
    padding: "1rem",
    borderTop: "1px solid #e5e7eb",
  }

  const navButtonStyle = {
    padding: "0.5rem 1rem",
    backgroundColor: "white",
    color: "#F1291C",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  }

  const navButtonDisabledStyle = {
    ...navButtonStyle,
    color: "#9ca3af",
    cursor: "default",
    opacity: 0.5,
  }

  const navButtonPrimaryStyle = {
    ...navButtonStyle,
    backgroundColor: "#F1291C",
    color: "white",
    border: "none",
  }

  const navButtonPrimaryDisabledStyle = {
    ...navButtonPrimaryStyle,
    opacity: 0.5,
    cursor: "default",
  }

  const grayCardHeaderStyle = {
    background: "linear-gradient(to right, #4b5563, #1f2937)",
    padding: "1rem",
    color: "white",
  }

  const navButtonsContainerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  }

  const sectionNavButtonStyle = {
    padding: "0.75rem",
    backgroundColor: "white",
    color: "#0f172a",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    cursor: "pointer",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
  }

  const sectionNavButtonActiveStyle = {
    ...sectionNavButtonStyle,
    backgroundColor: "#F1291C",
    color: "white",
  }

  const sectionNumberStyle = {
    width: "1.5rem",
    height: "1.5rem",
    borderRadius: "9999px",
    backgroundColor: "#e0f2fe",
    color: "#F1291C",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    marginRight: "0.5rem",
  }

  const sectionCompleteBadgeStyle = {
    marginLeft: "auto",
    padding: "0.125rem 0.5rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    border: "1px solid #d1d5db",
  }

  const formGroupStyle = {
    marginBottom: "1rem",
  }

  const labelStyle = {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: "500",
    marginBottom: "0.5rem",
  }

  const inputStyle = {
    width: "100%",
    padding: "0.5rem",
    borderRadius: "0.375rem",
    border: "1px solid #d1d5db",
  }

  const tabsContainerStyle = {
    marginTop: "2rem",
  }

  const tabsHeaderStyle = {
    display: "flex",
    borderBottom: "1px solid #e5e7eb",
  }

  const tabStyle = {
    padding: "0.75rem 1.5rem",
    backgroundColor: "white",
    color: "#0f172a",
    border: "none",
    cursor: "pointer",
    flex: 1,
    textAlign: "center",
  }

  const tabActiveStyle = {
    ...tabStyle,
    backgroundColor: "#F1291C",
    color: "white",
  }

  const tabContentStyle = {
    padding: "1.5rem",
    border: "1px solid #e5e7eb",
    borderTop: "none",
    borderBottomLeftRadius: "0.375rem",
    borderBottomRightRadius: "0.375rem",
  }

  const sectionTitleStyle = {
    fontSize: "1.25rem",
    fontWeight: "600",
    marginBottom: "1rem",
    color: "#F1291C",
  }

  const sectionContainerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  }

  const sectionItemStyle = {
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "0.75rem",
  }

  const sectionItemTitleStyle = {
    fontSize: "1.125rem",
    fontWeight: "500",
    color: "#F1291C",
  }

  const sectionItemContentStyle = {
    marginTop: "0.5rem",
    color: "#374151",
    whiteSpace: "pre-line",
  }

  const sectionItemEmptyStyle = {
    marginTop: "0.5rem",
    color: "#9ca3af",
    fontStyle: "italic",
  }

  const actionCenterStyle = {
    textAlign: "center",
  }

  const actionDescriptionStyle = {
    marginBottom: "1.5rem",
    color: "#4b5563",
  }

  const generateButtonStyle = {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#F1291C",
    color: "white",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "1rem",
  }

  const generateButtonDisabledStyle = {
    ...generateButtonStyle,
    opacity: 0.7,
    cursor: "default",
  }

  return (
    <>
      {/* Intro Animation */}
      <div style={introContainerStyle}>
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
            100% {
              transform: scale(1);
            }
          }
        `}</style>
        <div style={{ animation: "pulse 2s infinite ease-in-out" }}>
          <h1 style={introTitleStyle}>IMSA + Procesos</h1>
        </div>
        <p style={introSubtitleStyle}>Impulsado por IA</p>
      </div>

      {/* Main Application */}
      <div style={containerStyle}>
        <div style={headerStyle}>
          <Image
            src="/logo_rojo.png"
            alt="Banner descriptivo"
            width={400}
            height={200}
            style={{ display: "block", margin: "0 auto 1rem", maxWidth: "50%", height: "auto" }}
          />
          <h1 style={titleStyle}>IMSA + Procesos</h1>
          <p style={subtitleStyle}>Cree y mejore documentos de procedimientos con asistencia de IA</p>
          <div style={progressContainerStyle}>
            <div style={progressBarStyle}></div>
          </div>
          <p style={progressTextStyle}>Progreso: {Math.round(calcularProgreso())}% completado</p>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div style={cardHeaderFlexStyle}>
                <div>
                  <h2 style={cardTitleStyle}>Sección: {secciones[seccionActual].nombre}</h2>
                  <p style={cardSubtitleStyle}>
                    Paso {seccionActual + 1} de {secciones.length}
                  </p>
                </div>
                <span style={badgeStyle}>{documento[secciones[seccionActual].clave] ? "Completado" : "Pendiente"}</span>
              </div>
            </div>
            <div style={cardContentStyle}>
              <div>
                <button
                  onClick={empezarGrabacion}
                  disabled={grabando}
                  style={grabando ? buttonRecordingStyle : buttonPrimaryStyle}
                >
                  <IconMic />
                  {grabando ? "Grabando..." : "Iniciar Grabación de Voz"}
                </button>
              </div>
              
              {/* Toggle para cambiar modo de editor */}
              <div style={editorToggleStyle}>
                <span style={{ fontSize: "0.875rem", color: "#374151" }}>
                  {useRichText ? "Editor de texto enriquecido activo" : "Editor de texto plano activo"}
                </span>
                <button onClick={toggleEditorMode} style={toggleButtonStyle}>
                  <IconEdit />
                  {useRichText ? "Cambiar a texto plano" : "Cambiar a texto enriquecido"}
                </button>
              </div>

              {/* Editor condicional */}
              <div style={{ marginBottom: "1rem" }}>
                {useRichText ? (
                  <RichTextEditor
                    value={textoTemporal}
                    onChange={handleRichTextChange}
                    placeholder={`Escribe aquí el contenido de la sección ${secciones[seccionActual].nombre}...`}
                    height="250px"
                  />
                ) : (
                  <textarea
                    value={textoTemporal}
                    onChange={(e) => setTextoTemporal(e.target.value)}
                    placeholder={`Habla o escribe aquí el contenido de la sección ${secciones[seccionActual].nombre}...`}
                    style={textareaStyle}
                  />
                )}
              </div>

              <div style={buttonGroupStyle}>
                <button
                  onClick={mejorarConIA}
                  disabled={!textoTemporal || processingAI}
                  style={{
                    ...buttonOutlineStyle,
                    opacity: !textoTemporal || processingAI ? 0.5 : 1,
                    cursor: !textoTemporal || processingAI ? "default" : "pointer",
                  }}
                >
                  <IconSparkles />
                  {processingAI ? "Procesando..." : "Mejorar con IA"}
                </button>
                <button
                  onClick={guardarTexto}
                  disabled={!textoTemporal}
                  style={{
                    ...buttonSuccessStyle,
                    opacity: !textoTemporal ? 0.5 : 1,
                    cursor: !textoTemporal ? "default" : "pointer",
                  }}
                >
                  <IconSave />
                  Guardar
                </button>
              </div>
            </div>
            <div style={cardFooterStyle}>
              <button
                onClick={seccionAnterior}
                disabled={seccionActual === 0}
                style={seccionActual === 0 ? navButtonDisabledStyle : navButtonStyle}
              >
                <IconArrowLeft />
                Anterior
              </button>
              <button
                onClick={siguienteSeccion}
                disabled={seccionActual === secciones.length - 1}
                style={seccionActual === secciones.length - 1 ? navButtonPrimaryDisabledStyle : navButtonPrimaryStyle}
              >
                Siguiente
                <IconArrowRight />
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
          <div style={cardStyle}>
            <div style={grayCardHeaderStyle}>
              <h2 style={cardTitleStyle}>Navegación Rápida</h2>
              <p style={cardSubtitleStyle}>Seleccione una sección para editar</p>
            </div>
            <div style={{ ...cardContentStyle, padding: "1rem" }}>
              <div style={navButtonsContainerStyle}>
                {secciones.map((seccion, index) => (
                  <button
                    key={index}
                    onClick={() => irASeccion(index)}
                    style={seccionActual === index ? sectionNavButtonActiveStyle : sectionNavButtonStyle}
                  >
                    <span style={sectionNumberStyle}>{index + 1}</span>
                    <span>{seccion.nombre}</span>
                    {documento[seccion.clave] && <span style={sectionCompleteBadgeStyle}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <h2 style={cardTitleStyle}>Datos de Aprobación</h2>
              <p style={cardSubtitleStyle}>Información para el documento final</p>
            </div>
            <div style={cardContentStyle}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Preparado por:</label>
                <input
                  type="text"
                  value={aprobaciones.preparadoPor}
                  onChange={(e) => setAprobaciones((prev) => ({ ...prev, preparadoPor: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Revisado por:</label>
                <input
                  type="text"
                  value={aprobaciones.revisadoPor}
                  onChange={(e) => setAprobaciones((prev) => ({ ...prev, revisadoPor: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Aprobado por:</label>
                <input
                  type="text"
                  value={aprobaciones.aprobadoPor}
                  onChange={(e) => setAprobaciones((prev) => ({ ...prev, aprobadoPor: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Revisión N°:</label>
                <input
                  type="text"
                  value={aprobaciones.revision}
                  onChange={(e) => setAprobaciones((prev) => ({ ...prev, revision: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={tabsContainerStyle}>
          <div style={tabsHeaderStyle}>
            <button onClick={() => setActiveTab("resumen")} style={activeTab === "resumen" ? tabActiveStyle : tabStyle}>
              Resumen del Documento
            </button>
            <button
              onClick={() => setActiveTab("acciones")}
              style={activeTab === "acciones" ? tabActiveStyle : tabStyle}
            >
              Acciones Finales
            </button>
          </div>
          <div style={tabContentStyle}>
            {activeTab === "resumen" ? (
              <div>
                <h3 style={sectionTitleStyle}>Vista Previa del Documento</h3>
                <div style={sectionContainerStyle}>
                  {secciones.map((seccion, index) => (
                    <div key={index} style={sectionItemStyle}>
                      <h4 style={sectionItemTitleStyle}>{seccion.nombre}</h4>
                      {documento[seccion.clave] ? (
                        <div 
                          style={sectionItemContentStyle}
                          dangerouslySetInnerHTML={{ __html: documento[seccion.clave] }}
                        />
                      ) : (
                        <p style={sectionItemEmptyStyle}>No completado</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={actionCenterStyle}>
                <h3 style={sectionTitleStyle}>Finalizar Documento</h3>
                <p style={actionDescriptionStyle}>
                  Una vez que haya completado todas las secciones, puede generar el documento PDF final.
                </p>
                <button
                  onClick={generarPDF}
                  disabled={generatingPDF}
                  style={generatingPDF ? generateButtonDisabledStyle : generateButtonStyle}
                >
                  <IconDownload />
                  {generatingPDF ? "Generando PDF..." : "Generar PDF"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

