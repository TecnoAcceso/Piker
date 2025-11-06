# Piker - Sistema de Mensajería Certificada

Aplicación premium de distribución y logística para envío masivo de mensajes certificados vía WhatsApp Business API.

## 🚀 Características

- ✅ **Autenticación Multi-Rol**: Usuario, Admin y System Admin
- ✅ **Multi-Tenencia**: Cada usuario gestiona sus propios datos de forma segura
- ✅ **Gestión de Plantillas**: 3 tipos de mensajes (Recibidos, Recordatorios, Devoluciones)
- ✅ **Envío Masivo**: Procesamiento por lotes con validación
- ✅ **Escaneo QR**: Captura de números mediante cámara móvil
- ✅ **Validación Diaria**: Prevención de duplicados por día
- ✅ **Historial Completo**: Registro detallado de todos los envíos
- ✅ **Sistema de Licencias**: Gestión centralizada para System Admin
- ✅ **Diseño Premium**: Interfaz lujosa con animaciones suaves

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Cuenta de Supabase
- Cuenta de WhatsApp Business API (Meta)
- Cuenta de Vercel (para deployment)
- Git

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + Vite
- **Estilo**: Tailwind CSS + Framer Motion
- **Backend/DB**: Supabase (PostgreSQL + Auth + RLS)
- **Routing**: React Router v6
- **QR Scanner**: html5-qrcode
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📦 Instalación

### 1. Clonar el Repositorio

```bash
git clone <your-repo-url>
cd adlmc-app
npm install
```

### 2. Configurar Supabase

#### 2.1 Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Espera a que se inicialice (2-3 minutos)

#### 2.2 Ejecutar el Schema SQL

1. En el dashboard de Supabase, ve a **SQL Editor**
2. Abre el archivo `supabase-schema.sql` de este proyecto
3. Copia todo el contenido y pégalo en el editor
4. Ejecuta el script (botón "Run")

Esto creará:
- Tablas: `profiles`, `message_templates`, `sent_log`, `phone_numbers`, `licenses`
- Políticas RLS para multi-tenencia
- Funciones helper para validación y estadísticas
- Triggers automáticos

#### 2.3 Crear tu Primer Usuario Admin

1. Regístrate en la aplicación (después de configurar las variables de entorno)
2. En Supabase, ve a **SQL Editor**
3. Ejecuta este query para convertirte en System Admin:

```sql
UPDATE public.profiles
SET role = 'system_admin'
WHERE email = 'tu-email@ejemplo.com';
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# Supabase (obtén estos valores del dashboard de Supabase)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui

# WhatsApp Business API (Meta)
VITE_META_API_TOKEN=tu_token_de_meta
VITE_META_PHONE_NUMBER_ID=tu_phone_number_id
```

### 4. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🌐 Deployment en Vercel

### Opción 1: Deployment Automático (Recomendado)

1. **Push a GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <tu-repo-url>
   git push -u origin main
   ```

2. **Conectar con Vercel**:
   - Ve a [https://vercel.com](https://vercel.com)
   - Click en "New Project"
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto Vite

3. **Configurar Variables de Entorno**:
   - En el dashboard de Vercel, ve a tu proyecto
   - Settings → Environment Variables
   - Agrega todas las variables del archivo `.env`:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_META_API_TOKEN`
     - `VITE_META_PHONE_NUMBER_ID`

4. **Deploy**:
   - Click en "Deploy"
   - Vercel construirá y publicará tu aplicación
   - Cada push a `main` desplegará automáticamente

### Opción 2: Deployment Manual

```bash
# Instalar Vercel CLI
npm install -g vercel

# Iniciar sesión
vercel login

# Deploy
vercel
```

## 👥 Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **User** | - Enviar mensajes<br>- Gestionar plantillas propias<br>- Ver historial propio |
| **Admin** | - Todo lo de User<br>- Gestionar usuarios<br>- Ver reportes consolidados |
| **System Admin** | - Todo lo de Admin<br>- Gestionar licencias<br>- Configurar API tokens |

## 📱 Funcionalidades Principales

### Envío de Mensajes

1. **Seleccionar Tipo**: Recibidos / Recordatorios / Devoluciones
2. **Agregar Números**:
   - Manualmente: Ingresa y valida formato
   - QR Scanner: Escanea códigos QR con números
3. **Validación**: Sistema verifica duplicados del día
4. **Envío Masivo**: Un click para enviar todo el lote
5. **Registro**: Cada envío se guarda en el historial

### Gestión de Plantillas

- Crea plantillas personalizadas para cada tipo de mensaje
- Usa variables: `{nombre}`, `{numero_seguimiento}`, etc.
- Edita y elimina plantillas existentes

### Historial y Reportes

- Busca por número o contenido
- Filtra por tipo de mensaje y fecha
- Exporta a CSV para análisis

### Panel de Licencias (System Admin)

- Genera claves de licencia
- Asigna límites de mensajes
- Configura tokens de WhatsApp API
- Monitorea uso por licencia

## 🔒 Seguridad

- **Row-Level Security (RLS)**: Cada usuario solo accede a sus datos
- **Autenticación JWT**: Tokens seguros de Supabase
- **HTTPS**: Encriptación en tránsito (Vercel)
- **Validación de entrada**: Sanitización de números de teléfono
- **Roles granulares**: Permisos específicos por nivel

## 🎨 Personalización

### Colores del Tema

Edita `tailwind.config.js`:

```js
luxury: {
  gold: '#D4AF37',        // Dorado principal
  darkGold: '#B8942C',    // Dorado oscuro
  black: '#0A0A0A',       // Fondo principal
  darkGray: '#1A1A1A',    // Fondo cards
  // ...
}
```

### Logo y Branding

- Reemplaza el ícono en `Layout.jsx` y páginas de auth
- Actualiza el título en `index.html`
- Modifica el favicon en `public/`

## 📚 Estructura del Proyecto

```
adlmc-app/
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # Layout principal con sidebar
│   │   └── ProtectedRoute.jsx  # Rutas protegidas
│   ├── contexts/
│   │   └── AuthContext.jsx     # Contexto de autenticación
│   ├── lib/
│   │   └── supabase.js         # Cliente de Supabase
│   ├── pages/
│   │   ├── Login.jsx           # Página de login
│   │   ├── Register.jsx        # Página de registro
│   │   ├── Dashboard.jsx       # Dashboard principal
│   │   ├── Templates.jsx       # Gestión de plantillas
│   │   ├── SendMessage.jsx     # Envío de mensajes
│   │   ├── History.jsx         # Historial
│   │   ├── Users.jsx           # Gestión de usuarios (Admin)
│   │   └── Licenses.jsx        # Gestión de licencias (System Admin)
│   ├── App.jsx                 # Configuración de rutas
│   ├── main.jsx                # Punto de entrada
│   └── index.css               # Estilos globales
├── supabase-schema.sql         # Schema de base de datos
├── vercel.json                 # Configuración de Vercel
└── README.md                   # Este archivo
```

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"

**Solución**: Verifica que tu archivo `.env` tenga las variables correctas y estén prefijadas con `VITE_`.

### Error al escanear QR: "No se pudo acceder a la cámara"

**Solución**:
- Verifica permisos de cámara en el navegador
- Usa HTTPS (requerido para acceso a cámara)
- En desarrollo local, usa `localhost` (permitido sin HTTPS)

### Error: "Row-Level Security policy violation"

**Solución**:
- Verifica que ejecutaste el schema SQL completo
- Confirma que las políticas RLS están habilitadas
- Revisa que el usuario esté autenticado

### Duplicados no se están validando correctamente

**Solución**:
- Verifica que la función `check_daily_duplicate` existe en Supabase
- Confirma que el índice `idx_sent_log_user_phone_type_date` está creado
- Revisa la fecha del sistema

## 📞 Integración con WhatsApp Business API

### Configuración de Meta (Facebook)

1. **Crear App en Meta for Developers**:
   - Ve a [https://developers.facebook.com](https://developers.facebook.com)
   - Crea una nueva app tipo "Business"

2. **Configurar WhatsApp Business**:
   - Agrega el producto "WhatsApp"
   - Obtén tu Phone Number ID
   - Genera un token permanente

3. **Actualizar el código de envío**:
   En `SendMessage.jsx`, descomenta y configura la llamada a la API:

```javascript
const response = await fetch(
  `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phone.number,
      type: 'text',
      text: { body: customMessage }
    })
  }
)
```

## 🤝 Contribución

Para trabajar en equipo:

1. **Clonar el repositorio**
2. **Crear una rama para tu feature**:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. **Hacer commits descriptivos**
4. **Push y crear Pull Request**

## 📄 Licencia

Este proyecto es privado. Todos los derechos reservados.

## 🆘 Soporte

Para reportar bugs o solicitar features:
- Abre un issue en GitHub
- Contacta al equipo de desarrollo

---

**Desarrollado con ❤️ usando React + Supabase + Vercel**
