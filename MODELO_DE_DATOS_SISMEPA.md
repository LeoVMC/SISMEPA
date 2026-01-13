# 🗄️ Modelo de Datos de SISMEPA

Piensa en el sistema como una universidad digital. Cada modelo representa una "tabla" en la base de datos.

---

## 📊 Diagrama Visual Simplificado

### USUARIOS

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIOS                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐               │
│  │Estudiante│    │ Docente  │    │Administrador │               │
│  │  cedula  │    │  cedula  │    │    cedula    │               │
│  │ telefono │    │ telefono │    │   telefono   │               │
│  │ programa │    │tipo_contr│    └──────────────┘               │
│  └────┬─────┘    └────┬─────┘                                    │
│       │               │         Todos conectan a Django User     │
│       ▼               ▼                                          │
│  ┌────────────────────────────────────────────┐                 │
│  │              User (Django)                  │                 │
│  │  username, email, first_name, last_name    │                 │
│  └────────────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

### ESTRUCTURA ACADÉMICA

```
┌─────────────────────────────────────────────────────────────────┐
│                     ESTRUCTURA ACADÉMICA                         │
│                                                                  │
│  ┌──────────────┐                                               │
│  │   Programa   │◄─────── Ej: "Ingeniería en Sistemas"          │
│  │ (Carrera)    │                                               │
│  └──────┬───────┘                                               │
│         │ tiene muchas                                          │
│         ▼                                                        │
│  ┌──────────────┐                                               │
│  │  Asignatura  │◄─────── Ej: "Matemáticas I" (MAT-101)         │
│  │  (Materia)   │                                               │
│  │   código     │──────────┐                                    │
│  │   créditos   │          │ tiene muchas                       │
│  │   semestre   │          ▼                                    │
│  │  prelaciones │◄───┐  ┌──────────┐                            │
│  └──────────────┘    │  │ Sección  │◄── Ej: "D1", "D2", "N1"    │
│         │            │  │ docente  │                            │
│         │            │  └────┬─────┘                            │
│    (se referencia    │       │ tiene                            │
│     a sí misma)      │       ▼                                  │
│         └────────────┘  ┌──────────┐                            │
│                         │ Horario  │◄── Lunes 7:00-8:30, Aula A1│
│                         │ dia      │                            │
│                         │hora_ini  │                            │
│                         │hora_fin  │                            │
│                         │ aula     │                            │
│                         └──────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

### PROCESO DE INSCRIPCIÓN

```
┌─────────────────────────────────────────────────────────────────┐
│                     PROCESO DE INSCRIPCIÓN                       │
│                                                                  │
│  ┌─────────────────────┐                                        │
│  │  PeriodoAcademico   │◄─────── Ej: "2025-1" (Ene-May 2025)    │
│  │   nombre_periodo    │                                        │
│  │   fecha_inicio/fin  │                                        │
│  │   activo (bool)     │                                        │
│  │   inscripciones_act │                                        │
│  └──────────┬──────────┘                                        │
│             │                                                    │
│             │ un estudiante se inscribe en un período           │
│             ▼                                                    │
│  ┌─────────────────────┐                                        │
│  │    Inscripcion      │◄─────── "Juan se inscribió en 2025-1"  │
│  │   estudiante        │                                        │
│  │   periodo           │                                        │
│  │   fecha_inscripcion │                                        │
│  └──────────┬──────────┘                                        │
│             │                                                    │
│             │ cada inscripción tiene varias materias            │
│             ▼                                                    │
│  ┌─────────────────────┐                                        │
│  │ DetalleInscripcion  │                                        │
│  │   asignatura        │                                        │
│  │   seccion           │                                        │
│  │   nota1, nota2...   │◄─────── Las 4 notas parciales          │
│  │   nota_final        │◄─────── Promedio calculado             │
│  │   estatus           │◄─────── CURSANDO/APROBADO/REPROBADO    │
│  └─────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔑 Relaciones Clave Explicadas

### 1. Usuario → Perfiles (OneToOne)

```
User (Django nativo)
  │
  ├── Estudiante (si es estudiante)
  ├── Docente (si es profesor)
  └── Administrador (si es admin)
```

**¿Por qué?** Django tiene su propio modelo `User`. SISMEPA extiende ese usuario con información adicional según el rol (cédula, teléfono, programa, etc.).

---

### 2. Programa → Asignaturas (OneToMany)

```
Ingeniería en Sistemas
  ├── Matemáticas I
  ├── Física I
  ├── Programación I
  └── ... (todas las materias de la carrera)
```

**¿Por qué?** Cada carrera tiene su pensum diferente.

---

### 3. Asignatura → Secciones (OneToMany)

```
Matemáticas I (MAT-101)
  ├── Sección D1 (Prof. García, Lun-Mie 7:00)
  ├── Sección D2 (Prof. López, Mar-Jue 9:00)
  └── Sección N1 (Prof. Pérez, Lun-Mie 18:00)
```

**¿Por qué?** Una misma materia puede tener múltiples secciones con diferentes profesores y horarios.

---

### 4. Asignatura ↔ Asignatura (ManyToMany - Prelaciones)

```
Matemáticas II
  └── prelaciones: [Matemáticas I]  ← Debes aprobar esto primero

Física II  
  └── prelaciones: [Física I, Matemáticas I]  ← Debes aprobar ambas
```

**¿Por qué?** Las materias tienen requisitos previos. Es una auto-referencia (una asignatura apunta a otras asignaturas).

---

### 5. El Flujo de Inscripción

| Paso | Acción |
|------|--------|
| PASO 1 | Existe un PeriodoAcademico activo |
| PASO 2 | Estudiante crea/tiene una Inscripcion (vincula: estudiante + período) |
| PASO 3 | Por cada materia que inscribe, se crea un DetalleInscripcion (vincula: inscripción + asignatura + sección, contiene: notas + estatus) |
| PASO 4 | El docente carga nota1, nota2, nota3, nota4 |
| PASO 5 | El sistema calcula nota_final y actualiza estatus (APROBADO si >= 10, REPROBADO si < 10) |

---

## 📋 Ejemplo Concreto

Imagina a **Juan Pérez** (Estudiante de Sistemas):

### Estructura del Usuario
```
User
├── username: "12345678"
├── first_name: "Juan"
└── last_name: "Pérez"
```

### Perfil de Estudiante
```
Estudiante
├── cedula: "12345678"
├── telefono: "0412-1234567"
└── programa: Ingeniería en Sistemas
```

### Inscripción en Período 2025-1

**DetalleInscripcion #1 - Matemáticas I**

| Campo | Valor |
|-------|-------|
| asignatura | Matemáticas I |
| seccion | D1 (Prof. García) |
| nota1 | 15 |
| nota2 | 12 |
| nota3 | 18 |
| nota4 | 14 |
| nota_final | 14.75 |
| estatus | APROBADO ✅ |

**DetalleInscripcion #2 - Física I**

| Campo | Valor |
|-------|-------|
| asignatura | Física I |
| seccion | D2 (Prof. López) |
| nota1 | 8 |
| nota2 | 6 |
| nota3 | 9 |
| nota4 | 7 |
| nota_final | 7.50 |
| estatus | REPROBADO ❌ |

---

## 🎯 ¿Por qué este diseño?

| Decisión de Diseño | Razón |
|--------------------|-------|
| Separar User y Perfiles | Reutiliza el sistema de autenticación de Django |
| Secciones separadas de Asignaturas | Una materia puede tener varios profesores/horarios |
| DetalleInscripcion con 4 notas | Sistema de 4 cortes parciales común en universidades |
| Prelaciones como ManyToMany | Flexibilidad para materias con múltiples prerrequisitos |
| PeriodoAcademico como modelo separado | Permite gestionar inscripciones por semestre |

---

## Resumen de Modelos

| Modelo | Descripción | Campos Principales |
|--------|-------------|-------------------|
| **User** | Usuario de Django (autenticación) | username, email, password |
| **Estudiante** | Perfil de estudiante |
| `usuario` | OneToOne(User) | Usuario del sistema |
| `programa` | FK(Programa) | Carrera inscrita |
| `cedula` | CharField(20) | Documento de identidad (único) |
| `telefono` | CharField(20) | Teléfono de contacto |
| `fecha_ingreso` | DateField | Fecha automática |
| `(Normalizado)` | - | Nombre/Apellido/Email se consultan desde `usuario` |
| **Docente** | Perfil de profesor | tipo_contratacion |
| **Administrador** | Perfil de admin | cedula, telefono |
| **Programa** | Carrera universitaria | nombre, titulo_otorgado, duracion |
| **Asignatura** | Materia del pensum | codigo, nombre, creditos, semestre, prelaciones |
| **Seccion** | División de una materia | codigo_seccion, docente |
| **Horario** | Bloque de clase | dia, hora_inicio, hora_fin, aula |
| **PeriodoAcademico** | Semestre académico | nombre, fecha_inicio, fecha_fin, activo |
| **Inscripcion** | Registro de inscripción | estudiante, periodo |
| **DetalleInscripcion** | Materia inscrita con notas | asignatura, seccion, nota1-4, nota_final, estatus |
```
