# 🧠 Guía de AI Features en Viny - 100% GRATIS y LOCAL

## 🎯 Resumen

Viny ahora incluye un asistente de AI completamente **GRATIS** que funciona **localmente** en tu computadora, sin enviar datos a la nube. Usa tus notas como contexto para responder preguntas, generar resúmenes, y más.

## 🚀 Setup Rápido (5 minutos)

### 1. Instalar Ollama

```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows - Descargar desde
https://ollama.com/download/windows
```

### 2. Descargar un modelo

```bash
# Modelo pequeño y rápido (1.3GB)
ollama pull llama3.2

# Modelo más potente (4GB)
ollama pull mistral
```

### 3. Activar Dexie en Viny

1. Abrir **Settings** → **Storage**
2. En **Database Engine**, click **"Start Migration"**
3. Esperar ~30 segundos para migrar tus notas
4. ¡Listo! El AI ya puede usar tus notas

## 💬 Usando el AI Chat

### Abrir el Chat

- Click en el botón ✨ **AI** en la barra superior
- O presiona `Cmd/Ctrl + Shift + A`

### Ejemplos de Preguntas

**Búsqueda Inteligente:**

- "¿Qué notas tengo sobre React hooks?"
- "Muéstrame todas las ideas de proyectos que he escrito"
- "¿Cuándo fue la última vez que escribí sobre machine learning?"

**Análisis y Resúmenes:**

- "Resume mis notas de esta semana"
- "¿Cuáles son los temas principales en mis notas?"
- "Genera un resumen ejecutivo de mi proyecto X"

**Conexiones y Patrones:**

- "¿Qué conexiones hay entre mis notas de Python y JavaScript?"
- "Identifica patrones en mis daily notes"
- "¿Qué temas he estado explorando últimamente?"

**Asistencia de Escritura:**

- "Ayúdame a expandir esta idea: [pega tu texto]"
- "Sugiere mejoras para este párrafo"
- "Genera un outline para un artículo sobre [tema]"

## 🏷️ Auto-Tagging Inteligente

El AI puede sugerir tags automáticamente para tus notas:

1. Abre cualquier nota
2. Click en **"AI Suggest Tags"** (próximamente en UI)
3. El AI analizará el contenido y sugerirá tags relevantes

## 📝 Resúmenes Automáticos

Genera diferentes tipos de resúmenes:

- **Brief**: 1-2 oraciones concisas
- **Detailed**: Resumen comprehensivo
- **Bullet Points**: Lista de puntos clave
- **Academic**: Abstract estilo académico

## 🔍 Búsqueda Semántica

A diferencia de la búsqueda tradicional por palabras, la búsqueda semántica entiende el **significado**:

- Buscar "cómo hacer authentication" encontrará notas sobre login, JWT, OAuth, etc.
- Buscar "problemas de performance" encontrará notas sobre optimización, lentitud, etc.

## ⚙️ Configuración Avanzada

### Cambiar el Modelo

```bash
# Ver modelos disponibles
ollama list

# Descargar otros modelos
ollama pull codellama    # Para código
ollama pull phi3         # Muy rápido
ollama pull llama3:70b   # Más potente (requiere 40GB RAM)
```

### Optimización de Performance

**Para computadoras con poca RAM (8GB):**

- Usa `llama3.2:1b` o `phi3`
- Procesa menos notas a la vez

**Para computadoras potentes (16GB+):**

- Usa `mistral` o `llama3:7b`
- Aumenta el contexto a 5-10 notas

## 🔐 Privacidad y Seguridad

✅ **Tus datos NUNCA salen de tu computadora**
✅ **No se requiere conexión a internet** (después del setup)
✅ **No hay telemetría ni tracking**
✅ **Modelos de AI corren localmente**
✅ **Embeddings se almacenan localmente**

## 🚨 Troubleshooting

### "Ollama Not Available"

```bash
# Verificar que Ollama está corriendo
ollama list

# Si no funciona, iniciarlo manualmente
ollama serve
```

### "Dexie Not Enabled"

- Ve a Settings → Storage
- Activa Dexie siguiendo las instrucciones

### Respuestas lentas

- Cambia a un modelo más pequeño
- Cierra otras aplicaciones pesadas
- Considera usar GPU (si tienes NVIDIA)

### El AI no encuentra mis notas

1. Asegúrate de que Dexie está activo
2. Espera a que se generen los embeddings (primera vez)
3. Intenta preguntas más específicas

## 🎯 Tips y Mejores Prácticas

1. **Sé específico**: "Resume mis notas sobre React hooks" mejor que "resume mis notas"

2. **Usa contexto**: "Basándote en mis notas de proyecto X, ¿cómo debería estructurar Y?"

3. **Itera**: Si la respuesta no es ideal, reformula la pregunta

4. **Combina features**: Usa auto-tags + búsqueda semántica para mejor organización

5. **Daily reviews**: Pregunta "¿Qué logré hoy?" basado en tus daily notes

## 🚀 Próximas Features

- [ ] Voice input/output
- [ ] Generación automática de daily notes
- [ ] Knowledge graph visual
- [ ] Smart templates
- [ ] Scheduled summaries
- [ ] Multi-idioma

## 💡 Casos de Uso Avanzados

### 1. **Personal Knowledge Manager**

- "¿Qué sé sobre [tema]?"
- "¿Cuándo fue la última vez que estudié [tecnología]?"
- "Muéstrame gaps en mi conocimiento sobre [área]"

### 2. **Project Assistant**

- "Resume el estado actual del proyecto X"
- "¿Qué tareas pendientes tengo?"
- "Genera un reporte de progreso"

### 3. **Learning Companion**

- "Quiz me sobre mis notas de [tema]"
- "Genera flashcards de este contenido"
- "¿Qué debería repasar basado en mis notas?"

### 4. **Writing Helper**

- "Ayúdame a escribir un blog post sobre [tema] usando mis notas"
- "Encuentra contradicciones en mis ideas"
- "Sugiere conexiones entre estos conceptos"

---

**¿Preguntas?** El AI está aquí para ayudarte. ¡Simplemente pregúntale! 🚀
