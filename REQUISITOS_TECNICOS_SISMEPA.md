# 📋 Documentación Técnica SISMEPA - Requisitos del Sistema

Este documento describe las 11 funcionalidades técnicas implementadas en el proyecto SISMEPA.

---

## 1. 📊 Generación de Documentos (Excel)

### Descripción
El sistema genera múltiples reportes Excel profesionales usando la librería **openpyxl**.

### Ubicación en el código
- **Backend**: `gestion/api/views.py` y `gestion/utils.py`
- **Función de estilizado**: `apply_excel_styling()` en `utils.py`

### Reportes disponibles

| Reporte | Endpoint | Archivo |
|---------|----------|---------|
| Horario Estudiante | `/estudiantes/descargar-horario/` | views.py L185-583 |
| Progreso Académico | `/estudiantes/descargar-progreso-academico/` | views.py L40-101 |
| Horario Maestro | `/secciones/descargar-master-horario/` | views.py L1208-1735 |
| Listado de Sección | `/secciones/{id}/descargar-listado/` | views.py L1758-1840 |
| Desglose Estadístico | `/estadisticas/descargar-desglose-excel/` | views.py L2312-2418 |
| Listado Estudiantes | `/estudiantes/reporte-excel/` | views.py L688-728 |
| Listado Docentes | `/docentes/reporte-excel/` | views.py L973-1012 |

### Algoritmo de generación (ejemplo horario)
```python
import openpyxl
from openpyxl.styles import Font, Alignment, Border, PatternFill

def descargar_horario(self, request):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Horario"
    
    # 1. Escribir encabezados (días de la semana)
    dias = ['Hora', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
    for col, dia in enumerate(dias, 1):
        ws.cell(row=1, column=col, value=dia)
    
    # 2. Llenar matriz de bloques horarios
    for bloque_idx, bloque in enumerate(BLOQUES):
        ws.cell(row=bloque_idx+2, column=1, value=bloque['hora'])
        for dia_idx, dia in enumerate(dias[1:], 2):
            # Buscar si hay clase en este bloque/día
            clase = buscar_clase(horarios, dia_idx, bloque)
            if clase:
                ws.cell(row=bloque_idx+2, column=dia_idx, value=clase.nombre)
    
    # 3. Aplicar estilos profesionales
    apply_excel_styling(ws, header_row_num=1)
    
    # 4. Devolver respuesta HTTP
    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename="horario.xlsx"'
    wb.save(response)
    return response
```

### Estilizado profesional (`utils.py`)
```python
def apply_excel_styling(ws, header_row_num, custom_widths=None):
    # Bordes
    thin_border = Border(left=Side(style='thin'), right=Side(style='thin'), ...)
    
    # Relleno gris para encabezados
    header_fill = PatternFill(start_color="D9D9D9", fill_type="solid")
    
    # Aplicar a encabezados
    for cell in ws[header_row_num]:
        cell.fill = header_fill
        cell.font = Font(bold=True)
        cell.alignment = Alignment(horizontal='center')
    
    # Auto-calcular anchos de columna
    for col in range(1, ws.max_column + 1):
        max_length = max(len(str(cell.value)) for cell in ws[get_column_letter(col)])
        ws.column_dimensions[get_column_letter(col)].width = max_length + 2
```

---

## 2. 📁 Manejo de Archivos

### Descripción
El sistema permite subir, descargar y validar archivos (PDFs, Word, Excel).

### Ubicación en el código
- **Modelos**: `gestion/models.py` (Pensum, Planificacion, DocumentoCalificaciones)
- **Serializers**: `gestion/api/serializers.py` (validaciones)
- **Views**: `gestion/api/views.py` (upload/download)
- **Almacenamiento**: carpeta `media/`

### Tipos de archivos manejados

| Modelo | Tipo | Extensiones | Carpeta |
|--------|------|-------------|---------|
| Pensum | Documento pensum | .pdf, .docx | media/pensums/ |
| Planificacion | Plan docente | .pdf, .docx, .xlsx | media/planificaciones/ |
| DocumentoCalificaciones | Notas estudiante | .pdf | media/calificaciones/ |

### Validación de archivos (serializers.py)
```python
def validate_archivo(self, value):
    # 1. Validar tamaño máximo (10MB)
    max_size = 10 * 1024 * 1024
    if value.size > max_size:
        raise serializers.ValidationError("Archivo demasiado grande (máx 10MB)")

    # 2. Validar tipo MIME con python-magic
    allowed_mimes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    try:
        import magic
        buf = value.read(2048)
        value.seek(0)
        mime = magic.from_buffer(buf, mime=True)
        if mime not in allowed_mimes:
            raise serializers.ValidationError("Tipo de archivo no permitido")
    except:
        # Fallback: verificar extensión
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in ['.pdf', '.docx']:
            raise serializers.ValidationError("Extensión no permitida")
    
    return value
```

### Subida de archivos (views.py)
```python
class PlanificacionViewSet(viewsets.ModelViewSet):
    parser_classes = [MultiPartParser, FormParser]  # Habilita multipart
    
    def perform_create(self, serializer):
        # Guardar archivo con usuario que lo subió
        serializer.save(uploaded_by=self.request.user)
```

### Frontend: Subida de planificación (PensumPage.jsx)
```javascript
const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('asignatura', selectedSubject.id);
    
    const response = await fetch(`${API_URL}/planificaciones/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` },
        body: formData  // No Content-Type para FormData
    });
};
```

---

## 3. 🔄 CRUD (Create, Read, Update, Delete)

### Descripción
Operaciones completas de gestión de datos para todas las entidades.

### Ubicación en el código
- **Backend**: `gestion/api/views.py` (ViewSets)
- **Frontend**: Páginas `ListadoPage.jsx`, `RegisterUserPage.jsx`, `PensumPage.jsx`

### Entidades con CRUD completo

| Entidad | Create | Read | Update | Delete |
|---------|--------|------|--------|--------|
| Estudiantes | RegisterUserPage | ListadoPage | ProfilePage, ListadoPage | ListadoPage |
| Docentes | RegisterUserPage | ListadoPage | ListadoPage | ListadoPage |
| Administradores | RegisterUserPage | ListadoPage | ListadoPage | ListadoPage |
| Períodos | Dashboard | Dashboard | Dashboard | Dashboard (Admin) |
| Secciones | Admin Django | PensumPage | PensumPage | Admin Django |
| Inscripciones | PensumPage | PensumPage | CalificacionesPage | PensumPage |

### Backend: ViewSet con CRUD (views.py)
```python
class EstudianteViewSet(viewsets.ModelViewSet):
    queryset = Estudiante.objects.all()
    serializer_class = EstudianteSerializer
    filterset_fields = ['programa', 'cedula']
    search_fields = ['usuario__first_name', 'usuario__last_name', 'cedula']
    
    # CREATE: Heredado de ModelViewSet
    # READ: list() y retrieve() heredados
    # UPDATE: update() y partial_update() heredados
    # DELETE: destroy() heredado
```

### Frontend: CRUD en ListadoPage.jsx
```javascript
// CREATE - Redirige a RegisterUserPage
// READ - Fetch inicial
const fetchData = async () => {
    const response = await fetch(`${API_URL}/${endpoint}/`);
    setData(await response.json());
};

// UPDATE
const handleSaveEdit = async () => {
    await fetch(`${API_URL}/${endpoint}/${editingItem.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(editForm)
    });
};

// DELETE
const handleDelete = async (id) => {
    if (confirm('¿Eliminar?')) {
        await fetch(`${API_URL}/${endpoint}/${id}/`, { method: 'DELETE' });
        fetchData();  // Refrescar lista
    }
};
```

---

## 4. 📱 Responsive (Diseño Adaptativo)

### Descripción
La interfaz se adapta a diferentes tamaños de pantalla usando TailwindCSS.

### Ubicación en el código
- **Estilos**: `frontend/src/index.css`
- **Configuración**: `frontend/tailwind.config.cjs`
- **Componentes**: Todos los archivos `.jsx`

### Breakpoints de TailwindCSS

| Prefijo | Ancho mínimo | Dispositivo |
|---------|--------------|-------------|
| (base) | 0px | Móvil |
| `sm:` | 640px | Tablet pequeña |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Laptop |
| `xl:` | 1280px | Desktop |

### Ejemplos de código responsive

**Sidebar.jsx - Menú colapsable en móvil:**
```jsx
<div className={`
    fixed inset-y-0 left-0 z-50 w-64 bg-gray-900
    transition-transform duration-300 ease-in-out
    lg:relative lg:translate-x-0
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
`}>
```

**Dashboard.jsx - Grid adaptativo:**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {cards.map(card => <Card key={card.id} {...card} />)}
</div>
```

**Tablas con scroll horizontal en móvil:**
```jsx
<div className="overflow-x-auto">
    <table className="min-w-full">...</table>
</div>
```

**Botón menú móvil (AdminLayout.jsx):**
```jsx
<button 
    onClick={() => setIsSidebarOpen(true)}
    className="lg:hidden p-2"  // Solo visible en móvil
>
    <Menu size={24} />
</button>
```

---

## 5. 🔍 Filtros / Búsqueda

### Descripción
Sistema de filtrado y búsqueda en listas usando django-filter y búsqueda frontend.

### Ubicación en el código
- **Backend**: `gestion/api/views.py` (filterset_fields, search_fields)
- **Frontend**: Componentes de búsqueda en páginas

### Backend: Django Filter
```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
    ),
}

# views.py
class EstudianteViewSet(viewsets.ModelViewSet):
    filterset_fields = ['programa', 'cedula']  # ?programa=1&cedula=12345
    search_fields = ['usuario__first_name', 'usuario__last_name', 'cedula']  # ?search=juan
```

### Endpoints con filtros

| Endpoint | Filtros | Búsqueda |
|----------|---------|----------|
| /estudiantes/ | programa, cedula | nombre, apellido, cedula |
| /asignaturas/ | programa, semestre | nombre, código |
| /secciones/ | asignatura, programa, docente | - |
| /planificaciones/ | asignatura, codigo_especifico | nombre asignatura |
| /secciones/master-horario/ | programa, semestre, seccion | - |

### Frontend: Búsqueda local (ListadoPage.jsx)
```jsx
const [searchTerm, setSearchTerm] = useState('');

const filteredData = data.filter(item => 
    item.cedula.includes(searchTerm) ||
    item.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase())
);

// Renderizado
<input 
    type="text"
    placeholder="Buscar por cédula o nombre..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
/>
{filteredData.map(item => <Row key={item.id} {...item} />)}
```

### Frontend: Filtros de Horario Maestro (HorarioPage.jsx)
```jsx
const [filters, setFilters] = useState({ programa: '', semestre: '', seccion: '' });

const fetchMasterHorario = async () => {
    const params = new URLSearchParams();
    if (filters.programa) params.append('programa', filters.programa);
    if (filters.semestre) params.append('semestre', filters.semestre);
    
    const response = await fetch(`${API_URL}/secciones/master-horario/?${params}`);
};
```

---

## 6. ✅ Validaciones

### Descripción
Validaciones en frontend (formularios) y backend (serializers, modelos).

### Ubicación en el código
- **Backend**: `gestion/api/serializers.py`, `gestion/api/views.py`
- **Frontend**: Funciones de validación en páginas

### Validaciones del Backend

| Validación | Ubicación | Tipo |
|------------|-----------|------|
| Tamaño máximo archivo (10MB) | serializers.py | Serializer |
| Tipo MIME de archivo | serializers.py | Serializer |
| Prelaciones requeridas | views.py | Vista |
| Límite 35 UC por período | views.py | Vista |
| Conflictos de horario | views.py | Vista |
| Cédula única | models.py | Modelo (unique=True) |
| Notas 1-20 | views.py | Vista |
| Nota R solo para reprobados | views.py | Vista |

### Validación de inscripción (views.py)
```python
def _inscribir_estudiante_en_seccion(self, estudiante, seccion, allow_conflicts=False):
    # Validación 1: Inscripciones activas
    if not PeriodoAcademico.objects.filter(activo=True, inscripciones_activas=True).exists():
        raise ValidationError("Las inscripciones no están activas")
    
    # Validación 2: Prelaciones
    for prereq in seccion.asignatura.prelaciones.all():
        if not DetalleInscripcion.objects.filter(
            inscripcion__estudiante=estudiante, asignatura=prereq, estatus='APROBADO'
        ).exists():
            raise ValidationError(f"Falta aprobar: {prereq.codigo}")
    
    # Validación 3: Límite UC
    uc_actuales = estudiante.get_uc_periodo_actual()
    if uc_actuales + seccion.asignatura.creditos > 35:
        raise ValidationError(f"Excede límite de 35 UC")
    
    # Validación 4: Conflictos de horario
    if not allow_conflicts:
        for horario_nuevo in seccion.horarios.all():
            for inscrit in estudiante.inscripciones.filter(periodo__activo=True):
                for det in inscrit.detalles.all():
                    for h in det.seccion.horarios.all():
                        if hay_conflicto(horario_nuevo, h):
                            raise ValidationError("Conflicto de horario")
```

### Validación Frontend (LoginPage.jsx)
```jsx
const handleNumericInput = (e) => {
    // Solo permitir números en cédula
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
};

const doLogin = async (e) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!username || !password) {
        setError('Todos los campos son requeridos');
        return;
    }
    
    // Validar longitud cédula
    if (username.length < 6) {
        setError('La cédula debe tener al menos 6 dígitos');
        return;
    }
    
    // Intentar login...
};
```

---

## 7. 🔐 Login (con Niveles de Usuario)

### Descripción
Autenticación basada en Token con 3 roles: Administrador, Docente, Estudiante.

### Ubicación en el código
- **Backend**: `dj-rest-auth` (configurado en settings.py y urls.py)
- **Frontend**: `LoginPage.jsx`, `Sidebar.jsx`, `App.jsx`

### Configuración Backend (settings.py)
```python
INSTALLED_APPS = [
    'rest_framework.authtoken',  # Tokens
    'allauth',                    # Autenticación
    'dj_rest_auth',               # Endpoints REST
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.TokenAuthentication',
    ),
}
```

### Endpoint de Login
```
POST /api/auth/login/
Body: { "username": "12345678", "password": "contraseña" }
Response: { "key": "token123...", "user": { ... } }
```

### Roles y Permisos (permissions.py)
```python
class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_superuser or \
               request.user.groups.filter(name='Administrador').exists()

class IsDocente(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name='Docente').exists() or \
               request.user.is_superuser

class IsEstudiante(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name='Estudiante').exists()
```

### Frontend: Login (LoginPage.jsx)
```jsx
const doLogin = async (e) => {
    e.preventDefault();
    
    const response = await api.post('/auth/login/', { username, password });
    const data = await response.json();
    
    if (response.ok) {
        // Guardar token y datos de usuario
        localStorage.setItem('apiToken', data.key);
        localStorage.setItem('userData', JSON.stringify(data.user));
        navigate('/dashboard');
    } else {
        setError('Credenciales inválidas');
    }
};
```

### Frontend: Verificación de rol (Sidebar.jsx)
```jsx
const userData = JSON.parse(localStorage.getItem('userData') || '{}');

const isAdmin = userData.is_staff || 
                userData.groups?.some(g => g.name === 'Administrador');
const isTeacher = userData.groups?.some(g => g.name === 'Docente');
const isStudent = !isAdmin && !isTeacher;

// Menú condicional
{isAdmin && <Link to="/admin/register">Registrar Usuario</Link>}
{(isAdmin || isTeacher) && <Link to="/calificaciones">Calificaciones</Link>}
```

### Rutas protegidas (App.jsx)
```jsx
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('apiToken');
    return token ? children : <Navigate to="/login" />;
};

<Route path="/dashboard" element={
    <PrivateRoute>
        <AdminLayout><Dashboard /></AdminLayout>
    </PrivateRoute>
} />
```

---

## 8. 📈 Gráficos / Estadísticas

### Descripción
Dashboard con gráfico radar usando Chart.js para visualizar progreso académico.

### Ubicación en el código
- **Backend**: `EstadisticasViewSet` en views.py
- **Frontend**: `Dashboard.jsx` usando react-chartjs-2

### Backend: Datos para gráfico (views.py)
```python
class EstadisticasViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['get'])
    def chart_data(self, request):
        # Para estudiantes: progreso por semestre
        if hasattr(request.user, 'estudiante'):
            estudiante = request.user.estudiante
            data = []
            for sem in range(1, 11):
                total = Asignatura.objects.filter(programa=estudiante.programa, semestre=sem).count()
                aprobadas = DetalleInscripcion.objects.filter(
                    inscripcion__estudiante=estudiante,
                    asignatura__semestre=sem,
                    estatus='APROBADO'
                ).count()
                porcentaje = (aprobadas / total * 100) if total > 0 else 0
                data.append({'semestre': f'Sem {sem}', 'porcentaje': porcentaje})
            return Response(data)
        
        # Para admin/docente: estadísticas globales
        return Response({
            'total_estudiantes': Estudiante.objects.count(),
            'total_docentes': Docente.objects.count(),
            ...
        })
```

### Frontend: Gráfico Radar (Dashboard.jsx)
```jsx
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler);

const Dashboard = () => {
    const [chartData, setChartData] = useState(null);
    
    useEffect(() => {
        const fetchChartData = async () => {
            const response = await fetch(`${API_URL}/estadisticas/chart-data/`);
            const data = await response.json();
            
            setChartData({
                labels: data.map(d => d.semestre),
                datasets: [{
                    label: 'Progreso %',
                    data: data.map(d => d.porcentaje),
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgb(54, 162, 235)',
                }]
            });
        };
        fetchChartData();
    }, []);
    
    return (
        <div>
            {chartData && <Radar data={chartData} options={{
                scales: { r: { min: 0, max: 100 } }
            }} />}
        </div>
    );
};
```

---

## 9. 🌐 Uso de API Externa y FakerAPI

### Descripción
El sistema consume su propia API REST. No utiliza FakerAPI pero tiene scripts de poblado de datos.

### API REST propia
- **Base URL**: `http://localhost:8000/api/`
- **Documentación**: Automática via DRF Browsable API

### Scripts de poblado de datos (equivalente a Faker)
**Archivo**: `scripts/populate_telecom.py`
```python
# Crea datos de prueba para el programa de Telecomunicaciones
MATERIAS_TELECOM = [
    {'codigo': 'MAT-101', 'nombre': 'Matemáticas I', 'semestre': 1, 'creditos': 4},
    {'codigo': 'FIS-101', 'nombre': 'Física I', 'semestre': 1, 'creditos': 4},
    ...
]

for materia in MATERIAS_TELECOM:
    Asignatura.objects.create(
        programa=programa_telecom,
        **materia
    )
```

### Consumo de API desde Frontend (api.js)
```javascript
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('apiToken');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': token ? `Token ${token}` : '',
    };
    
    return await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
}

export default {
    get: (endpoint) => apiCall(endpoint, { method: 'GET' }),
    post: (endpoint, body) => apiCall(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    patch: (endpoint, body) => apiCall(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (endpoint) => apiCall(endpoint, { method: 'DELETE' }),
};
```

---

## 10. 📧 Servicio de Correo

### Descripción
Sistema de notificaciones por email usando Django SMTP (Gmail/SendGrid).

### Ubicación en el código
- **Configuración**: `sismepa/settings.py`
- **Funciones**: `gestion/notifications.py`
- **Triggers**: `gestion/signals.py`

### Configuración (settings.py)
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'no-reply@sismepa.com')
```

### Funciones de notificación (notifications.py)
```python
from django.core.mail import send_mail

def send_notification_email(subject, message, recipient_list):
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=recipient_list,
        fail_silently=False,
    )

def notify_student_risk(estudiante, asignatura, nota_actual, nota_necesaria):
    """Alerta al estudiante de riesgo de reprobación"""
    subject = f"Alerta de Rendimiento: {asignatura.nombre_asignatura}"
    
    extra_msg = ""
    if nota_necesaria > 20:
        extra_msg = "Lamentablemente, el cálculo indica que es improbable aprobar."
    else:
        extra_msg = f"Necesitas obtener: {nota_necesaria:.2f} pts para aprobar."

    message = f"""Hola {estudiante.usuario.get_full_name()},

Tu rendimiento en {asignatura.nombre_asignatura} presenta riesgo.
Nota actual: {nota_actual:.2f}
{extra_msg}

Atentamente,
Sistema de Alerta Temprana - SISMEPA"""
    
    if estudiante.usuario.email:
        send_notification_email(subject, message, [estudiante.usuario.email])

def notify_docente_assignment(docente, seccion):
    """Notifica al docente de nueva asignación"""
    ...

def notify_student_failure(estudiante, asignatura, nota_final):
    """Notifica reprobación"""
    ...
```

### Triggers automáticos (signals.py)
```python
@receiver(post_save, sender=DetalleInscripcion)
def risk_notification(sender, instance, **kwargs):
    notas = [n for n in [instance.nota1, instance.nota2, instance.nota3] if n]
    
    if len(notas) == 3:
        necesario = 40 - sum(notas)
        if necesario >= 15:  # Necesita 15+ en 4ta nota (muy difícil)
            notify_student_risk(instance.inscripcion.estudiante, 
                               instance.asignatura, 
                               sum(notas)/3, necesario)
```

---

## 11. ⚡ Uso de AJAX

### Descripción
Todas las comunicaciones frontend-backend usan Fetch API (AJAX moderno).

### Ubicación en el código
- **Servicio centralizado**: `frontend/src/services/api.js`
- **Páginas**: Todas las páginas `.jsx`

### Servicio API centralizado (api.js)
```javascript
export async function apiCall(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Token ${localStorage.getItem('apiToken')}`,
    };
    
    try {
        const response = await fetch(url, { ...options, headers });
        return response;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}
```

### Ejemplos de llamadas AJAX

**GET - Listar datos (Dashboard.jsx):**
```javascript
useEffect(() => {
    const fetchData = async () => {
        const response = await api.get('/estadisticas/chart-data/');
        const data = await response.json();
        setChartData(data);
    };
    fetchData();
}, []);
```

**POST - Login (LoginPage.jsx):**
```javascript
const response = await api.post('/auth/login/', { username, password });
if (response.ok) {
    const data = await response.json();
    localStorage.setItem('apiToken', data.key);
}
```

**POST - Inscripción (PensumPage.jsx):**
```javascript
const handleInscribirme = async (seccionId) => {
    const response = await fetch(`${API_URL}/secciones/${seccionId}/inscribirme/`, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        }
    });
    
    if (response.ok) {
        alert('¡Inscripción exitosa!');
        fetchMisInscripciones();  // Refrescar datos
    } else {
        const error = await response.json();
        alert(error.detail || 'Error en inscripción');
    }
};
```

**PATCH - Actualizar notas (CalificacionesPage.jsx):**
```javascript
const handleGuardarNotas = async (seccion) => {
    for (const est of seccion.estudiantes) {
        if (notasEditadas[est.id]) {
            await fetch(`${API_URL}/secciones/${seccion.id}/calificar/`, {
                method: 'POST',
                headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    detalle_id: est.id,
                    ...notasEditadas[est.id]
                })
            });
        }
    }
};
```

**DELETE - Eliminar usuario (ListadoPage.jsx):**
```javascript
const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    
    const response = await fetch(`${API_URL}/${currentEndpoint}/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
    });
    
    if (response.ok) {
        fetchData();  // Refrescar lista
    }
};
```

---

## Resumen de Cumplimiento

| # | Requisito | ¿Implementado? | Ubicación Principal |
|---|-----------|----------------|---------------------|
| 1 | Generación Excel | ✅ | views.py, utils.py |
| 2 | Manejo Archivos | ✅ | serializers.py, models.py |
| 3 | CRUD | ✅ | ViewSets, ListadoPage |
| 4 | Responsive | ✅ | TailwindCSS, todos los .jsx |
| 5 | Filtros/Búsqueda | ✅ | django-filter, páginas |
| 6 | Validaciones | ✅ | serializers, views, forms |
| 7 | Login + Roles | ✅ | dj-rest-auth, permissions.py |
| 8 | Gráficos | ✅ | Chart.js, Dashboard |
| 9 | API Externa | ✅ | API REST propia |
| 10 | Servicio Correo | ✅ | notifications.py, signals.py |
| 11 | AJAX | ✅ | Fetch API en todos los .jsx |
