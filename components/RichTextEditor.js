'use client'

import React, { useRef, useState, useEffect } from 'react'

const RichTextEditor = ({ value, onChange, placeholder, height = '200px' }) => {
  const editorRef = useRef(null)
  const [content, setContent] = useState(value || '')

  useEffect(() => {
    setContent(value || '')
  }, [value])

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content
    }
  }, [content])

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      setContent(newContent)
      onChange(newContent)
    }
  }

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value)
    editorRef.current.focus()
    handleInput()
  }

  const insertList = (ordered = false) => {
    const command = ordered ? 'insertOrderedList' : 'insertUnorderedList'
    document.execCommand(command, false, null)
    editorRef.current.focus()
    handleInput()
  }

  const formatBlock = (tag) => {
    document.execCommand('formatBlock', false, tag)
    editorRef.current.focus()
    handleInput()
  }

  const isActive = (command) => {
    return document.queryCommandState(command)
  }

  return (
    <div className="rich-text-editor">
      <style jsx>{`
        .rich-text-editor {
          font-family: Arial, sans-serif;
          border: 1px solid #ccc;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
          padding: 8px;
          background: #f8f9fa;
          border-bottom: 1px solid #ccc;
        }
        
        .toolbar button {
          padding: 6px 8px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
          min-width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .toolbar button:hover {
          background: #e9ecef;
        }
        
        .toolbar button.active {
          background: #007bff;
          color: white;
        }
        
        .toolbar select {
          padding: 4px;
          border: 1px solid #ddd;
          border-radius: 3px;
          background: white;
          cursor: pointer;
        }
        
        .editor-content {
          min-height: ${height};
          padding: 12px;
          outline: none;
          overflow-y: auto;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .editor-content:empty:before {
          content: attr(data-placeholder);
          color: #999;
          font-style: italic;
        }
        
        .editor-content h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }
        
        .editor-content h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.83em 0;
        }
        
        .editor-content h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 1em 0;
        }
        
        .editor-content ol {
          padding-left: 1.5em;
          margin: 1em 0;
        }
        
        .editor-content ul {
          padding-left: 1.5em;
          margin: 1em 0;
        }
        
        .editor-content ol li {
          list-style-type: decimal;
          margin-bottom: 5px;
        }
        
        .editor-content ul li {
          list-style-type: disc;
          margin-bottom: 5px;
        }
        
        .editor-content ol ol li {
          list-style-type: lower-alpha;
        }
        
        .editor-content ul ul li {
          list-style-type: circle;
        }
        
        .editor-content blockquote {
          border-left: 4px solid #ccc;
          margin: 1em 0;
          padding: 0.5em 10px;
          background-color: #f9f9f9;
        }
        
        .editor-content p {
          margin: 0.5em 0;
        }
      `}</style>
      
      <div className="toolbar">
        <select onChange={(e) => formatBlock(e.target.value)} defaultValue="">
          <option value="">Normal</option>
          <option value="h1">Encabezado 1</option>
          <option value="h2">Encabezado 2</option>
          <option value="h3">Encabezado 3</option>
        </select>
        
        <button 
          type="button"
          onClick={() => formatText('bold')}
          className={isActive('bold') ? 'active' : ''}
          title="Negrita"
        >
          <strong>B</strong>
        </button>
        
        <button 
          type="button"
          onClick={() => formatText('italic')}
          className={isActive('italic') ? 'active' : ''}
          title="Cursiva"
        >
          <em>I</em>
        </button>
        
        <button 
          type="button"
          onClick={() => formatText('underline')}
          className={isActive('underline') ? 'active' : ''}
          title="Subrayado"
        >
          <u>U</u>
        </button>
        
        <button 
          type="button"
          onClick={() => insertList(true)}
          title="Lista numerada"
        >
          1.
        </button>
        
        <button 
          type="button"
          onClick={() => insertList(false)}
          title="Lista con viñetas"
        >
          •
        </button>
        
        <button 
          type="button"
          onClick={() => formatText('indent')}
          title="Aumentar indentación"
        >
          →
        </button>
        
        <button 
          type="button"
          onClick={() => formatText('outdent')}
          title="Disminuir indentación"
        >
          ←
        </button>
        
        <button 
          type="button"
          onClick={() => formatBlock('blockquote')}
          title="Cita"
        >
          &ldquo;&rdquo;
        </button>
        
        <button 
          type="button"
          onClick={() => formatText('removeFormat')}
          title="Limpiar formato"
        >
          ×
        </button>
      </div>
      
      <div 
        ref={editorRef}
        className="editor-content"
        contentEditable={true}
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder || "Escribe aquí..."}
        suppressContentEditableWarning={true}
        style={{ minHeight: height }}
      />
    </div>
  )
}

export default RichTextEditor 