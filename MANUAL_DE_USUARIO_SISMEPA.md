# 📖 Manual de Usuario - SISMEPA

## Sistema de Monitoreo de Avance Educativo Universitario y Prelaciones Académicas

**Versión:** 1.0  
**Fecha:** Enero 2026  
**Universidad:** UNEFA

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Requisitos del Sistema](#2-requisitos-del-sistema)
3. [Acceso al Sistema](#3-acceso-al-sistema)
4. [Guía para Estudiantes](#4-guía-para-estudiantes)
5. [Guía para Docentes](#5-guía-para-docentes)
6. [Guía para Administradores](#6-guía-para-administradores)
7. [Preguntas Frecuentes](#7-preguntas-frecuentes)
8. [Solución de Problemas](#8-solución-de-problemas)

---

## 1. Introducción

### ¿Qué es SISMEPA?

SISMEPA es un sistema web diseñado para la gestión y monitoreo del avance académico de los estudiantes universitarios. Permite:

- 📊 Visualizar el progreso en la carrera
- 📅 Consultar y descargar horarios de clases
- 📝 Inscribir y desinscribir materias
- 📈 Ver estadísticas académicas
- 📧 Recibir alertas de rendimiento y resumen de notas

### Roles de Usuario

| Rol | Descripción |
|-----|-------------|
| **Estudiante** | Consulta su progreso, inscribe materias, ve horarios |
| **Docente** | Gestiona calificaciones, ve listados, sube planificaciones |
| **Administrador** | Control total: usuarios, períodos, asignaciones |

---

## 2. Requisitos del Sistema

### Navegadores Compatibles

| Navegador | Versión Mínima |
|-----------|----------------|
| Google Chrome | 90+ |
| Mozilla Firefox | 88+ |
| Microsoft Edge | 90+ |
| Safari | 14+ |

### Conexión a Internet
- Velocidad mínima recomendada: 1 Mbps

### Dispositivos
- ✅ Computadoras de escritorio
- ✅ Laptops
- ✅ Tablets
- ✅ Teléfonos móviles (diseño responsive)

---

## 3. Acceso al Sistema

### 3.1 Página de Inicio de Sesión

1. Abra su navegador web
2. Ingrese la dirección del sistema: `https://sismepa.unefa.edu.ve` (o la URL proporcionada)
3. Verá la pantalla de inicio de sesión

### 3.2 Iniciar Sesión

**Pasos:**

1. **Usuario**: Ingrese su número de cédula (solo números)
2. **Contraseña**: Ingrese su contraseña asignada
3. Haga clic en el botón **"Iniciar Sesión"**

```
┌─────────────────────────────────────┐
│           🎓 SISMEPA                │
│                                     │
│  Usuario (Cédula)                   │
│  ┌─────────────────────────────┐   │
│  │ 12345678                    │   │
│  └─────────────────────────────┘   │
│                                     │
│  Contraseña                         │
│  ┌─────────────────────────────┐   │
│  │ ••••••••               👁   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Iniciar Sesión         │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

> **💡 Consejo:** Puede hacer clic en el ícono del ojo 👁 para ver su contraseña mientras la escribe.

### 3.3 Cerrar Sesión

1. En cualquier momento, haga clic en **"Cerrar Sesión"** en la parte inferior del menú lateral
2. Confirme que desea salir
3. Será redirigido a la página de inicio de sesión

---

## 4. Guía para Estudiantes

### 4.1 Panel Principal (Dashboard)

Al iniciar sesión, verá su panel de progreso:

```
┌──────────────────────────────────────────────────────────────┐
│  SISMEPA              │  Progreso                            │
│  Panel Estudiante     │                                      │
│                       │  ┌────────────────────────────────┐  │
│  ▸ Progreso           │  │     GRÁFICO RADAR              │  │
│  ▸ Horario            │  │     (Progreso por semestre)    │  │
│  ▸ Pensums            │  │                                │  │
│                       │  └────────────────────────────────┘  │
│  ─────────────────    │                                      │
│  UC Usadas: 18/35     │  ┌────────────────────────────────┐  │
│  ████████░░░░░░       │  │  SEMESTRE I    ████████ 80%    │  │
│                       │  │  SEMESTRE II   ██████░░ 60%    │  │
│  ▸ Mi Perfil          │  │  SEMESTRE III  ████░░░░ 40%    │  │
│  ▸ Cerrar Sesión      │  └────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Elementos del Dashboard:**

| Elemento | Descripción |
|----------|-------------|
| Gráfico Radar | Visualiza tu avance por cada semestre |
| Barra UC | Muestra las Unidades de Crédito usadas (máximo 35) |
| Progreso por Semestre | Lista del % de materias aprobadas por semestre |

### 4.2 Consultar Pensum e Inscribir Materias

**Acceder al Pensum:**

1. Haga clic en **"Pensums"** en el menú lateral
2. Seleccione su programa (carrera)
3. Verá el mapa de materias organizado por semestre

**Leyenda de colores:**

| Color | Significado |
|-------|-------------|
| 🟢 Verde | Materia aprobada |
| 🔵 Azul | Materia cursando actualmente |
| 🟡 Amarillo | Materia disponible para inscribir |
| ⚪ Gris | Materia bloqueada (falta prelación) |
| 🔴 Rojo | Materia reprobada |

**Inscribir una materia:**

1. Haga clic en una materia disponible (amarilla)
2. Se abrirá un modal con las secciones disponibles
3. Revise el horario de cada sección
4. Haga clic en **"Inscribirme"** en la sección deseada
5. Confirme la inscripción

```
┌─────────────────────────────────────────────────┐
│  MATEMÁTICAS I (MAT-101)                    ✕   │
│  Créditos: 4 UC  │  Semestre: 1                 │
│                                                 │
│  Secciones Disponibles:                         │
│  ┌─────────────────────────────────────────┐   │
│  │ Sección D1 - Prof. García               │   │
│  │ Lun-Mie 7:00-8:30  Aula: A-101          │   │
│  │ [Inscribirme]                           │   │
│  └─────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────┐   │
│  │ Sección D2 - Prof. López                │   │
│  │ Mar-Jue 9:00-10:30  Aula: B-202         │   │
│  │ [Inscribirme]                           │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

> **⚠️ Importante:** 
> - No puede inscribir más de 35 UC por período
> - Debe haber aprobado las prelaciones de la materia
> - No puede tener conflictos de horario

**Desinscribir una materia:**

1. Haga clic en la materia que está cursando (azul)
2. Haga clic en **"Desinscribirme"**
3. Confirme la acción

### 4.3 Consultar Horario

**Ver horario:**

1. Haga clic en **"Horario"** en el menú lateral
2. Verá su horario semanal con todas las materias inscritas

```
┌──────────────────────────────────────────────────────────────────────┐
│                        MI HORARIO SEMANAL                            │
├─────────┬──────────┬──────────┬──────────┬──────────┬──────────────┤
│  Hora   │  Lunes   │  Martes  │Miércoles │  Jueves  │   Viernes    │
├─────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│ 7:00    │ MAT-101  │          │ MAT-101  │          │              │
│         │ Aula A1  │          │ Aula A1  │          │              │
├─────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│ 8:30    │          │ FIS-101  │          │ FIS-101  │              │
│         │          │ Lab 3    │          │ Lab 3    │              │
├─────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│ 10:00   │ PRG-101  │          │ PRG-101  │          │ PRG-101      │
│         │ Sala PC  │          │ Sala PC  │          │ Sala PC      │
└──────────────────────────────────────────────────────────────────────┘

                    [ 📥 Descargar Excel ]
```

**Descargar horario:**

1. Haga clic en el botón **"Descargar Excel"**
2. Se descargará un archivo `.xlsx` con su horario
3. Puede abrirlo con Excel, LibreOffice, o Google Sheets

### 4.4 Ver Perfil

1. Haga clic en **"Mi Perfil"** en el menú lateral
2. Verá su información personal:
   - Nombre completo
   - Cédula
   - Email
   - Teléfono
   - Programa (carrera)
   - Fecha de ingreso

**Editar información:**

1. Haga clic en **"Editar"**
2. Modifique los campos permitidos (email, teléfono)
3. Haga clic en **"Guardar"**

---

## 5. Guía para Docentes

### 5.1 Panel Principal

Al iniciar sesión, verá el panel de monitoreo con estadísticas de sus secciones.

**Menú del Docente:**

- 📊 Monitoreo - Dashboard general
- 👥 Usuarios en Línea - Ver usuarios conectados
- 📅 Horario - Ver horario maestro
- 📋 Pensums - Ver materias
- 📝 Calificaciones - Gestionar notas
- 👤 Mi Perfil

### 5.2 Gestión de Calificaciones

**Acceder a Calificaciones:**

1. Haga clic en **"Calificaciones"** en el menú
2. Verá la lista de sus secciones asignadas

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    MIS SECCIONES ASIGNADAS                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│  ▼ MATEMÁTICAS I - Sección D1                               [📥 Descargar]  │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Estudiante      │ Nota1 │ Nota2 │ Nota3 │ Nota4 │ Nota R │ Final │ Est  ││
│  ├─────────────────┼───────┼───────┼───────┼───────┼────────┼───────┼──────┤│
│  │ Juan Pérez      │  15   │  12   │  18   │  14   │  N/A   │ 14.75 │APROB.││
│  │ María García    │  10   │  14   │  16   │  12   │  N/A   │ 13.0  │APROB.││
│  │ Carlos López    │   8   │   6   │   9   │   5   │ [ 12 ] │ 12.0  │APROB.││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                       [💾 Guardar Notas]     │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Cargar notas parciales (Nota 1-4):**

1. Expanda la sección deseada haciendo clic en ella
2. Ingrese las notas en las celdas correspondientes (1-20)
3. Haga clic en **"Guardar Notas"**
4. Las notas se guardan automáticamente

**Cargar Nota de Reparación (Nota R):**

La Nota R es una quinta nota especial para estudiantes que reprobaron y desean salvar la asignatura.

1. Solo se habilita cuando el estudiante tiene las 4 notas cargadas y está **reprobado** (promedio < 10)
2. El campo aparece deshabilitado ("N/A") para estudiantes aprobados
3. Al cargar la Nota R, esta **sustituye completamente** la nota final
4. La Nota R no afecta las 4 notas parciales originales

> **💡 Notas importantes:** 
> - El promedio se calcula automáticamente cuando hay 4 notas
> - El sistema envía alertas a estudiantes en riesgo (cuando necesitan 15+ en la 4ta nota)
> - El estatus cambia a APROBADO (≥10) o REPROBADO (<10) al completar las 4 notas
> - Si hay Nota R, la nota final es igual a la Nota R (no el promedio de las 4 notas)
> - **Nuevo:** El estudiante recibirá un correo automático notificando la carga de la Nota R.

**Descargar listado:**

1. Haga clic en el botón **"Descargar"** de la sección
2. Se descargará un Excel con todos los estudiantes, notas y la columna Nota R

### 5.3 Agregar/Eliminar Estudiantes

**Agregar estudiante a una sección:**

1. En la sección, haga clic en **"+ Agregar Estudiante"**
2. Busque al estudiante por cédula o nombre
3. Selecciónelo y haga clic en **"Inscribir"**

> **⚠️ Nota:** Como docente, puede inscribir estudiantes aunque tengan conflictos de horario.

**Eliminar estudiante de una sección:**

1. Haga clic en el ícono 🗑️ junto al estudiante
2. Confirme la eliminación

### 5.4 Subir Planificación

1. Vaya a **"Pensums"**
2. Haga clic en la materia de su sección
3. Haga clic en **"Subir Planificación"**
4. Seleccione el archivo (PDF, Word, o Excel)
5. El archivo se guardará asociado a la materia

### 5.5 Ver Horario Maestro

1. Vaya a **"Horario"**
2. Seleccione filtros: Programa, Semestre, Sección
3. Verá el horario de todas las secciones filtradas
4. Puede descargar el Excel con **"Descargar Excel"**

---

## 6. Guía para Administradores

### 6.1 Panel Principal

Como administrador, tiene acceso completo al sistema.

**Menú del Administrador:**

- 📊 Monitoreo - Estadísticas generales
- 👥 Usuarios en Línea - Monitoreo en tiempo real
- 📅 Horario - Horario maestro completo
- 📋 Pensums - Gestión de materias y asignaciones
- 📝 Calificaciones - Ver/editar calificaciones
- ➕ Registrar Usuario - Crear nuevos usuarios
- 📋 Listado - Gestión completa de usuarios
- 👤 Mi Perfil

### 6.2 Registrar Nuevos Usuarios

**Acceso:**
1. Haga clic en **"Registrar Usuario"** en el menú

**Crear un Estudiante:**

1. Seleccione el rol **"Estudiante"**
2. Complete los campos:
   - Cédula (será el nombre de usuario)
   - Nombre y Apellido
   - Email
   - Teléfono
   - Programa (carrera)
   - Contraseña
3. Haga clic en **"Registrar"**

```
┌─────────────────────────────────────────────────┐
│         REGISTRAR NUEVO USUARIO                 │
├─────────────────────────────────────────────────┤
│  Rol: [Estudiante ▼]                            │
│                                                 │
│  Cédula: [_______________]                      │
│  Nombre: [_______________]                      │
│  Apellido: [_______________]                    │
│  Email: [_______________]                       │
│  Teléfono: [_______________]                    │
│  Programa: [Ing. Sistemas ▼]                    │
│  Contraseña: [_______________]                  │
│                                                 │
│  [        Registrar Usuario        ]            │
└─────────────────────────────────────────────────┘
```

**Crear un Docente:**

1. Seleccione el rol **"Docente"**
2. Complete los campos adicionales:
   - Tipo de Contratación (Tiempo Completo / Tiempo Parcial)
3. Haga clic en **"Registrar"**

**Crear un Administrador:**

1. Seleccione el rol **"Administrador"**
2. Complete los campos básicos
3. El usuario tendrá acceso completo al sistema

### 6.3 Gestión de Usuarios (Listado)

**Acceso:**
1. Haga clic en **"Listado"** en el menú

**Tabs disponibles:**
- 👨‍🎓 Estudiantes
- 👨‍🏫 Docentes  
- 🔐 Administradores

```
┌──────────────────────────────────────────────────────────────────────┐
│  LISTADO DE USUARIOS                                                 │
├──────────────────────────────────────────────────────────────────────┤
│  [Estudiantes] [Docentes] [Administradores]     [📥 Descargar Excel]│
│                                                                      │
│  🔍 Buscar: [_______________________________]                        │
│                                                                      │
│  ┌─────────┬────────────────┬─────────────┬─────────────┬──────────┐│
│  │ Cédula ↕│ Nombre         │ Email       │ Teléfono    │ Acciones ││
│  ├─────────┼────────────────┼─────────────┼─────────────┼──────────┤│
│  │12345678 │ Juan Pérez     │ juan@...    │ 0412-123... │ ✏️ 🗑️   ││
│  │23456789 │ María García   │ maria@...   │ 0414-456... │ ✏️ 🗑️   ││
│  └─────────┴────────────────┴─────────────┴─────────────┴──────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

**Buscar usuarios:**
- Escriba en el campo de búsqueda
- Puede buscar por cédula, nombre o apellido

**Ordenar:**
- Haga clic en el encabezado de columna para ordenar
- Clic nuevamente para invertir el orden

**Editar usuario:**

1. Haga clic en el ícono ✏️
2. Modifique los campos en el modal
3. Haga clic en **"Guardar"**

**Eliminar usuario:**

1. Haga clic en el ícono 🗑️
2. Confirme la eliminación
3. El usuario y todos sus datos serán eliminados

> **⚠️ Precaución:** La eliminación es permanente.

**Descargar listado:**
- Haga clic en **"Descargar Excel"**
- Se descargará un archivo con todos los usuarios del tab actual

### 6.4 Asignar Docentes a Secciones

1. Vaya a **"Pensums"**
2. Seleccione un programa
3. Haga clic en una materia
4. En la sección deseada, haga clic en **"Asignar Docente"**
5. Seleccione el docente de la lista
6. Haga clic en **"Asignar"**

```
┌─────────────────────────────────────────────────┐
│  MATEMÁTICAS I (MAT-101)                    ✕   │
├─────────────────────────────────────────────────┤
│  Sección D1                                     │
│  Docente: [Sin asignar]                         │
│                                                 │
│  Seleccionar Docente:                           │
│  ┌─────────────────────────────────────────┐   │
│  │ ○ Prof. García López                    │   │
│  │ ○ Prof. Martínez Rodríguez              │   │
│  │ ○ Prof. Fernández Pérez                 │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Horario: Lun-Mie 7:00-8:30  Aula: [A-101]     │
│                                                 │
│  [        Asignar Docente        ]              │
└─────────────────────────────────────────────────┘
```

### 6.5 Gestión de Períodos Académicos

Desde el **Panel de Control de Períodos** en el Dashboard, puede gestionar todo el ciclo de vida de los semestres.

**Crear un Nuevo Período:**

1. Haga clic en el botón azul **"+ Nuevo Período"**.
2. Complete el formulario emergente:
   - **Nombre:** Ej: "2-2026"
   - **Fecha Inicio/Fin:** Defina el rango temporal.
   - **Año:** Año calendario.
3. El período se creará como **Inactivo**.

**Activar un Período:**

1. Localice el período en la grilla (borde gris si es nuevo).
2. Haga clic en **"Activar Período"**.
3. Esto desactivará automáticamente el período activo anterior. El borde cambiará a **azul**.

**Abrir/Cerrar Inscripciones:**

1. Use el botón de interruptor en la tarjeta del período activo.
2. **Verde:** Inscripciones Abiertas.
3. **Gris:** Inscripciones Cerradas.

**Estados del Período:**
- 🔵 **Activo:** Período en curso.
- 🟡 **Próximo:** Fecha futura.
- ⚪ **Finalizado:** Fecha pasada.
- 🔘 **Inscripciones Abiertas/Cerradas:** Controla si los estudiantes pueden inscribir materias.

```
┌──────────────────────────────────────────────────────────────┐
│  CONTROL DE PERÍODOS ACADÉMICOS             [+ Nuevo Período]│
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐                  │
│  │ 2026-1           │  │ 2025-2           │                  │
│  │ Ene - May 2026   │  │ Sep - Dic 2025   │                  │
│  │ [🔵 Activo]      │  │ [⚪ Finalizado]  │                  │
│  │                  │  │                  │                  │
│  │ [🔘 Abiertas]    │  │ [Inscripciones]  │                  │
│  │                  │  │ [Cerradas    ]   │                  │
│  └──────────────────┘  └──────────────────┘                  │
└──────────────────────────────────────────────────────────────┘
```

### 6.6 Usuarios en Línea

1. Haga clic en **"Usuarios en Línea"** en el menú
2. Verá todos los usuarios activos en los últimos 5 minutos

```
┌──────────────────────────────────────────────────────────────┐
│  USUARIOS EN LÍNEA (5)                                       │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────┬──────────┬────────────┬──────────────────┐│
│  │ Usuario      │ Rol      │ Dispositivo│ Última Actividad ││
│  ├──────────────┼──────────┼────────────┼──────────────────┤│
│  │ 12345678     │ Estudiante│ Desktop   │ Hace 1 min       ││
│  │ 23456789     │ Docente  │ Mobile    │ Hace 3 min       ││
│  │ admin        │ Admin    │ Desktop   │ Ahora            ││
│  └──────────────┴──────────┴────────────┴──────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

---

## 7. Preguntas Frecuentes

### Estudiantes

**P: ¿Por qué no puedo inscribir una materia?**

R: Posibles razones:
- Las inscripciones están cerradas
- No ha aprobado las prelaciones
- Excedería el límite de 35 UC
- Hay conflicto de horario con otra materia inscrita

**P: ¿Cómo sé cuáles son las prelaciones de una materia?**

R: En el pensum, las materias grises son las que tienen prelaciones pendientes. Al hacer clic en una materia, verá la lista de prerrequisitos.

**P: ¿Hasta cuándo puedo inscribir materias?**

R: Hasta que el administrador cierre las inscripciones del período actual.

**P: ¿Cómo veo mi promedio actual?**

R: En el Dashboard puede ver el gráfico de progreso. Para ver notas específicas, consulte con Control de Estudios.
    
**P: ¿No recibí el correo de mis notas?**

R: Verifique su carpeta de SPAM. El correo se envía automáticamente solo cuando **todas** sus notas del periodo han sido cargadas.

### Docentes

**P: ¿Cómo cargo las notas de una evaluación?**

R: Vaya a Calificaciones, expanda su sección, ingrese las notas en las celdas y haga clic en "Guardar Notas".

**P: ¿Puedo modificar una nota ya guardada?**

R: Sí, simplemente edite el valor y vuelva a guardar.

**P: ¿Qué pasa cuando cargo la 4ta nota?**

R: El sistema calcula automáticamente la nota final y el estatus (Aprobado/Reprobado).

### Administradores

**P: ¿Cómo creo un nuevo período académico?**

R: Desde el Dashboard de Administrador, use el botón "+ Nuevo Período" en el panel de Control de Períodos.

**P: ¿Puedo restaurar un usuario eliminado?**

R: No, la eliminación es permanente. Se recomienda hacer respaldos de la base de datos regularmente.

---

## 8. Solución de Problemas

### "Credenciales inválidas"

- Verifique que está ingresando su cédula correctamente (solo números)
- Verifique que la contraseña es correcta (mayúsculas/minúsculas importan)
- Contacte al administrador si olvidó su contraseña

### "Sesión expirada"

- Su sesión expira después de un período de inactividad
- Inicie sesión nuevamente

### "Error de conexión"

- Verifique su conexión a internet
- Intente recargar la página (F5)
- Si persiste, el servidor puede estar en mantenimiento

### La página se ve mal en mi dispositivo

- Verifique que está usando un navegador compatible
- Actualice su navegador a la última versión
- Intente limpiar la caché (Ctrl+Shift+Delete)

### No puedo descargar archivos Excel

- Verifique que no tiene un bloqueador de descargas
- Permita descargas del sitio en la configuración del navegador

---

## Contacto y Soporte

Para soporte técnico:
- 📧 Email: soporte@sismepa.unefa.edu.ve
- 📞 Teléfono: (0XXX) XXX-XXXX
- 🏢 Oficina: Control de Estudios, Edificio Principal

**Horario de atención:**
Lunes a Viernes: 8:00 AM - 4:00 PM

---

*Manual de Usuario SISMEPA v1.0 - © 2026 UNEFA*
