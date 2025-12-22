from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import HttpResponse
import openpyxl

from gestion.models import (
    Estudiante, Asignatura, DetalleInscripcion, Pensum, Planificacion, DocumentoCalificaciones, Seccion, PeriodoAcademico
)
from gestion.api.serializers import (
    EstudianteSerializer, AsignaturaSerializer, PensumSerializer,
    PlanificacionSerializer, DocumentoCalificacionesSerializer, CreateUserSerializer, UserSerializer,
    ProgramaSerializer, SeccionSerializer, DocenteSerializer, AdministradorSerializer, PeriodoAcademicoSerializer
)
from gestion.permissions import IsAdmin, IsDocente, IsEstudiante, IsDocenteOrAdminOrOwner, IsDocenteOrAdmin
from django.contrib.auth.models import User



class EstudianteViewSet(viewsets.ModelViewSet):
    queryset = Estudiante.objects.all()
    serializer_class = EstudianteSerializer
    filterset_fields = ['programa', 'cedula']
    search_fields = ['usuario__first_name', 'usuario__last_name', 'usuario__username', 'cedula']

    def get_permissions(self):
        # admin: acceso total; listado permitido a admin y docentes
        if self.action in ['list']:
            return [IsDocenteOrAdmin()]
        if self.action in ['create', 'destroy']:
            return [IsAdmin()]
        if self.action in ['retrieve', 'progreso']:
            return [IsDocenteOrAdminOrOwner()]
        if self.action in ['mis_inscripciones', 'mi_info']:
            return [IsEstudiante()]
        return []

    @action(detail=True, methods=['get'])
    def progreso(self, request, pk=None):
        estudiante = self.get_object()
        avance = estudiante.calcular_avance()

        # Datos adicionales: total/aprobadas para mostrar en dashboard
        total_asignaturas = Estudiante.objects.filter(pk=estudiante.pk).exists() and estudiante.programa and estudiante.programa and estudiante.programa.asignatura_set.count() or 0
        aprobadas = DetalleInscripcion.objects.filter(
            inscripcion__estudiante=estudiante,
            nota_final__gte=10
        ).count()

        nombre = ''
        try:
            nombre = estudiante.usuario.get_full_name()
        except Exception:
            nombre = str(estudiante.usuario)

        datos = {
            'id': estudiante.id,
            'cedula': estudiante.cedula,
            'nombre': nombre,
            'programa': estudiante.programa.nombre_programa if estudiante.programa else '',
            'porcentaje_avance': avance,
            'total_asignaturas': total_asignaturas,
            'aprobadas': aprobadas,
        }
        return Response(datos)

    @action(detail=False, methods=['get'], url_path='mis-inscripciones')
    def mis_inscripciones(self, request):
        """Devuelve el estado de inscripción de cada asignatura para el estudiante autenticado."""
        user = request.user
        
        try:
            estudiante = Estudiante.objects.get(usuario=user)
        except Estudiante.DoesNotExist:
            return Response({'error': 'No tienes perfil de estudiante.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Obtener todos los detalles de inscripción del estudiante
        detalles = DetalleInscripcion.objects.filter(
            inscripcion__estudiante=estudiante
        ).select_related('asignatura', 'seccion')
        
        # Mapear por código de asignatura
        inscripciones_map = {}
        for detalle in detalles:
            codigo = detalle.asignatura.codigo
            # Si hay múltiples inscripciones (por ejemplo, repitió), tomar la más reciente/relevante
            if codigo not in inscripciones_map or detalle.id > inscripciones_map[codigo]['id']:
                inscripciones_map[codigo] = {
                    'id': detalle.id,
                    'asignatura_id': detalle.asignatura.id,
                    'codigo': codigo,
                    'estatus': detalle.estatus,
                    'nota_final': float(detalle.nota_final) if detalle.nota_final else None,
                    'seccion_id': detalle.seccion_id,
                    'seccion_codigo': detalle.seccion.codigo_seccion if detalle.seccion else None,
                }
        
        return Response({
            'estudiante_id': estudiante.id,
            'programa': estudiante.programa.nombre_programa if estudiante.programa else '',
            'inscripciones': inscripciones_map
        })

    @action(detail=False, methods=['get'], url_path='mi-info')
    def mi_info(self, request):
        """Devuelve información de progreso del estudiante autenticado."""
        user = request.user
        
        try:
            estudiante = Estudiante.objects.get(usuario=user)
        except Estudiante.DoesNotExist:
            return Response({'error': 'No tienes perfil de estudiante.'}, status=status.HTTP_400_BAD_REQUEST)
        
        avance = estudiante.calcular_avance()
        
        total_asignaturas = estudiante.programa.asignatura_set.count() if estudiante.programa else 0
        aprobadas = DetalleInscripcion.objects.filter(
            inscripcion__estudiante=estudiante,
            nota_final__gte=10
        ).count()

        nombre = ''
        try:
            nombre = estudiante.usuario.get_full_name()
        except Exception:
            nombre = str(estudiante.usuario)

        return Response({
            'id': estudiante.id,
            'cedula': estudiante.cedula,
            'nombre': nombre,
            'nombre_completo': nombre,
            'programa': estudiante.programa.nombre_programa if estudiante.programa else '',
            'porcentaje_avance': avance,
            'total_asignaturas': total_asignaturas,
            'aprobadas': aprobadas,
        })


    @action(detail=False, methods=['get'])
    def reporte_excel(self, request):
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Listado Estudiantes"
        ws.append(['Nombres', 'Apellidos', 'Cédula', 'Teléfono', 'Correo', 'Carrera', 'Avance (%)'])

        for est in Estudiante.objects.select_related('usuario', 'programa').all():
            ws.append([
                est.usuario.first_name,
                est.usuario.last_name,
                est.cedula,
                est.telefono,
                est.usuario.email,
                est.programa.nombre_programa if est.programa else '',
                f"{est.calcular_avance()}"
            ])

        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename=reporte_academico.xlsx'
        wb.save(response)
        return response


class AsignaturaViewSet(viewsets.ModelViewSet):
    queryset = Asignatura.objects.all()
    serializer_class = AsignaturaSerializer
    filterset_fields = ['programa', 'semestre']
    search_fields = ['nombre_asignatura', 'codigo']

    @action(detail=True, methods=['post'], url_path='assign-docente')
    def assign_docente(self, request, pk=None):
        asignatura = self.get_object()
        codigo_seccion = request.data.get('codigo_seccion')
        docente_id = request.data.get('docente') # User ID

        if not codigo_seccion:
            return Response({'error': 'Código de sección requerido'}, status=400)
        
        # Validate docente exists if provided
        docente_user = None
        if docente_id:
            from gestion.models import Docente
            try:
                # docente_id viene del frontend seleccionando un objeto Docente
                # así que debemos buscar el modelo Docente, y luego obtener su usuario
                docente_obj = Docente.objects.get(pk=docente_id)
                docente_user = docente_obj.usuario
            except Docente.DoesNotExist:
                return Response({'error': 'Docente no encontrado'}, status=404)

        if not docente_user:
            # Si se está eliminando el docente (docente_id vacío), eliminar la sección para que desaparezca de la lista
            Seccion.objects.filter(asignatura=asignatura, codigo_seccion=codigo_seccion).delete()
            return Response({'status': 'deleted'})

        seccion, created = Seccion.objects.update_or_create(
            asignatura=asignatura,
            codigo_seccion=codigo_seccion,
            defaults={'docente': docente_user}
        )

        return Response(SeccionSerializer(seccion).data)

    @action(detail=True, methods=['post'], url_path='assign-tutor')
    def assign_tutor(self, request, pk=None):
        asignatura = self.get_object()
        docente_id = request.data.get('docente')
        tutor_type = request.data.get('type', 'generic') # generic, academic, community

        if not docente_id:
            return Response({'error': 'Docente ID requerido'}, status=400)
        
        # docente_id viene del frontend seleccionando un objeto Docente
        # así que debemos buscar el modelo Docente, y luego obtener su usuario
        from gestion.models import Docente
        try:
            docente_obj = Docente.objects.get(pk=docente_id)
            docente_user = docente_obj.usuario
        except Docente.DoesNotExist:
            return Response({'error': 'Docente no encontrado'}, status=404)

        if asignatura.tutores.count() >= 10:
             return Response({'error': "Límite de tutores alcanzado (10)"}, status=400)

        asignatura.tutores.add(docente_user)
        return Response({'status': 'Tutor assigned'})



    @action(detail=True, methods=['post'], url_path='remove-tutor')
    def remove_tutor(self, request, pk=None):
        asignatura = self.get_object()
        docente_id = request.data.get('docente')
        tutor_type = request.data.get('type', 'generic')

        if not docente_id:
            return Response({'error': 'Docente ID requerido'}, status=400)
        
        try:
            docente = User.objects.get(pk=docente_id)
        except User.DoesNotExist:
            return Response({'error': 'Docente no encontrado'}, status=404)

        asignatura.tutores.remove(docente)
        return Response({'status': 'Tutor removed'})


class ProgramaViewSet(viewsets.ModelViewSet):
    from gestion.models import Programa
    queryset = Programa.objects.all()
    serializer_class = ProgramaSerializer
    permission_classes = []
    
    def get_permissions(self):
        from rest_framework.permissions import IsAuthenticated
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdmin()]

class UserManagementViewSet(viewsets.ViewSet):
    """Endpoints para que el administrador cree usuarios (docente/estudiante)."""
    permission_classes = [IsAdmin]

    def create(self, request):
        serializer = CreateUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


from rest_framework.views import APIView
from gestion.models import UserActivity
from django.utils import timezone
from datetime import timedelta

class OnlineUsersView(APIView):
    """Devuelve usuarios activos en los últimos 5 minutos."""
    # permission_classes = [IsAuthenticated] # Opcional: IsAdmin si es restringido

    def get(self, request):
        time_threshold = timezone.now() - timedelta(minutes=5)
        # Filtrar actividades recientes y unirse con User
        active_users = UserActivity.objects.filter(last_activity__gte=time_threshold).select_related('user')
        
        data = []
        for activity in active_users:
            user = activity.user
            
            # Determinar rol
            role = 'Desconocido'
            if user.is_superuser or user.is_staff or user.groups.filter(name='Administrador').exists():
                role = 'Administrador'
            elif hasattr(user, 'docente'):
                role = 'Docente'
            elif hasattr(user, 'estudiante'):
                role = 'Estudiante'

            # Nombre completo
            name = user.get_full_name() or user.username
            
            # ID específico para mapeo (Estudiante ID vs User ID)
            # Para facilitar el mapeo en el frontend, enviamos ambos
            student_id = user.estudiante.id if hasattr(user, 'estudiante') else None
            
            data.append({
                'id': user.id, # User ID
                'student_id': student_id,
                'username': user.username,
                'name': name,
                'email': user.email,
                'role': role,
                'status': 'online',
                'last_activity': activity.last_activity,
                'device': activity.device_type
            })
            
        return Response(data)


class DocenteViewSet(viewsets.ModelViewSet):
    from gestion.models import Docente
    queryset = Docente.objects.all()
    serializer_class = DocenteSerializer
    permission_classes = [IsAdmin]
    search_fields = ['usuario__first_name', 'usuario__last_name', 'usuario__username', 'cedula']

    @action(detail=False, methods=['get'])
    def reporte_excel(self, request):
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Listado Docentes"
        ws.append(['Nombres', 'Apellidos', 'Cédula', 'Teléfono', 'Correo', 'Contratación'])

        for docente in self.filter_queryset(self.get_queryset()):
            ws.append([
                docente.usuario.first_name,
                docente.usuario.last_name,
                docente.cedula,
                docente.telefono,
                docente.usuario.email,
                docente.tipo_contratacion
            ])

        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename=reporte_docentes.xlsx'
        wb.save(response)
        return response


class AdminViewSet(viewsets.ModelViewSet):
    from gestion.models import Administrador
    queryset = Administrador.objects.all()
    serializer_class = AdministradorSerializer
    permission_classes = [IsAdmin]
    search_fields = ['usuario__first_name', 'usuario__last_name', 'usuario__username', 'cedula']

    @action(detail=False, methods=['get'])
    def reporte_excel(self, request):
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Listado Administradores"
        ws.append(['Nombres', 'Apellidos', 'Cédula', 'Teléfono', 'Correo'])

        for admin in self.filter_queryset(self.get_queryset()):
            ws.append([
                admin.usuario.first_name,
                admin.usuario.last_name,
                admin.cedula,
                admin.telefono,
                admin.usuario.email
            ])

        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename=reporte_administradores.xlsx'
        wb.save(response)
        return response


class PensumViewSet(viewsets.ModelViewSet):
    queryset = Pensum.objects.all()
    serializer_class = PensumSerializer
    parser_classes = [MultiPartParser, FormParser]
    filterset_fields = ['programa']
    search_fields = ['programa__nombre_programa']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return []


class PlanificacionViewSet(viewsets.ModelViewSet):
    queryset = Planificacion.objects.all()
    serializer_class = PlanificacionSerializer
    parser_classes = [MultiPartParser, FormParser]
    filterset_fields = ['asignatura', 'asignatura__codigo', 'codigo_especifico']
    search_fields = ['asignatura__nombre_asignatura', 'asignatura__codigo']

    def perform_create(self, serializer):
        asignatura = serializer.validated_data.get('asignatura')
        user = self.request.user
        
        # Si el usuario es Docente (y no admin/superuser), asegurar que esté asignado a esta asignatura
        if not user.is_superuser and not user.groups.filter(name='Administrador').exists():
            if not Seccion.objects.filter(asignatura=asignatura, docente=user).exists():
                 from rest_framework.exceptions import PermissionDenied
                 raise PermissionDenied("No estás asignado a esta asignatura.")

        serializer.save(uploaded_by=self.request.user)

    def perform_destroy(self, instance):
        user = self.request.user
        # Si el usuario es Docente (y no admin/superuser), asegurar que esté asignado a esta asignatura
        if not user.is_superuser and not user.groups.filter(name='Administrador').exists():
            if not Seccion.objects.filter(asignatura=instance.asignatura, docente=user).exists():
                 from rest_framework.exceptions import PermissionDenied
                 raise PermissionDenied("No estás asignado a esta asignatura.")
        instance.delete()

    def get_permissions(self):
        from rest_framework.permissions import IsAuthenticated
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsDocenteOrAdmin()]
        return []


class DocumentoCalificacionesViewSet(viewsets.ModelViewSet):
    queryset = DocumentoCalificaciones.objects.all()
    serializer_class = DocumentoCalificacionesSerializer
    parser_classes = [MultiPartParser, FormParser]
    filterset_fields = ['estudiante']
    search_fields = ['estudiante__cedula', 'estudiante__usuario__first_name', 'estudiante__usuario__last_name']

    def get_permissions(self):
        if self.action in ['create']:
            return [IsEstudiante()]
        # allow students to list their own docs and admin/docente to view
        return []

    def perform_create(self, serializer):
        # ensure estudiante belongs to requesting user
        estudiante = serializer.validated_data.get('estudiante')
        if estudiante.usuario != self.request.user and not self.request.user.is_superuser and not self.request.user.groups.filter(name='Docente').exists():
            raise PermissionError('No autorizado')
        doc = serializer.save()
        # trigger recalculation (and potential alerts)
        try:
            doc.estudiante.calcular_avance()
        except Exception:
            pass


class SeccionViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar secciones e inscripción de estudiantes."""
    queryset = Seccion.objects.all()
    serializer_class = SeccionSerializer
    filterset_fields = ['asignatura', 'asignatura__programa', 'docente']

    def get_permissions(self):
        from rest_framework.permissions import IsAuthenticated
        if self.action in ['list', 'retrieve', 'estudiantes']:
            return [IsAuthenticated()]
        if self.action in ['inscribir_estudiante', 'desinscribir_estudiante']:
            return [IsDocenteOrAdmin()]
        if self.action in ['inscribirme', 'desinscribirme']:
            return [IsEstudiante()]
        if self.action in ['mis_secciones', 'calificar']:
            return [IsDocente()]
        return [IsAdmin()]

    @action(detail=True, methods=['get'], url_path='estudiantes')
    def estudiantes(self, request, pk=None):
        """Lista los estudiantes inscritos en esta sección."""
        seccion = self.get_object()
        from gestion.api.serializers import DetalleInscripcionListSerializer
        detalles = seccion.estudiantes_inscritos.filter(estatus='CURSANDO')
        serializer = DetalleInscripcionListSerializer(detalles, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='descargar-listado')
    def descargar_listado(self, request, pk=None):
        """Descarga el listado de estudiantes inscritos en la sección como Excel."""
        seccion = self.get_object()
        user = request.user
        
        # Verificar permisos
        if not user.is_superuser and not user.groups.filter(name='Administrador').exists():
            if not user.groups.filter(name='Docente').exists():
                return Response({'error': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)
            if seccion.docente != user:
                return Response({'error': 'No estás asignado a esta sección.'}, status=status.HTTP_403_FORBIDDEN)
        
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = f"Listado {seccion.codigo_seccion}"
        
        # Encabezados
        ws.append(['Cédula', 'Nombre', 'Apellido', 'Correo', 'Nota 1', 'Nota 2', 'Nota 3', 'Nota 4', 'Nota Final', 'Estado'])
        
        # Datos de estudiantes
        detalles = seccion.estudiantes_inscritos.select_related('inscripcion__estudiante__usuario')
        for detalle in detalles:
            est = detalle.inscripcion.estudiante
            ws.append([
                est.cedula,
                est.usuario.first_name,
                est.usuario.last_name,
                est.usuario.email,
                float(detalle.nota1) if detalle.nota1 else '',
                float(detalle.nota2) if detalle.nota2 else '',
                float(detalle.nota3) if detalle.nota3 else '',
                float(detalle.nota4) if detalle.nota4 else '',
                float(detalle.nota_final) if detalle.nota_final else '',
                detalle.estatus
            ])
        
        filename = f"listado_{seccion.asignatura.codigo}_{seccion.codigo_seccion}.xlsx"
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename={filename}'
        wb.save(response)
        return response

    @action(detail=True, methods=['post'], url_path='inscribir-estudiante')
    def inscribir_estudiante(self, request, pk=None):
        """Permite a un docente inscribir un estudiante en su sección asignada."""
        seccion = self.get_object()
        user = request.user
        
        # Verificar que el docente esté asignado a esta sección (o sea admin)
        if not user.is_superuser and not user.groups.filter(name='Administrador').exists():
            if seccion.docente != user:
                return Response(
                    {'error': 'No estás asignado a esta sección.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        estudiante_id = request.data.get('estudiante_id')
        if not estudiante_id:
            return Response({'error': 'Se requiere estudiante_id.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            estudiante = Estudiante.objects.get(pk=estudiante_id)
        except Estudiante.DoesNotExist:
            return Response({'error': 'Estudiante no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        # Validar que el estudiante pertenece al mismo programa de la asignatura
        if estudiante.programa_id != seccion.asignatura.programa_id:
            return Response(
                {'error': 'El estudiante no pertenece al programa de esta asignatura.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Realizar inscripción
        result = self._inscribir_estudiante_en_seccion(estudiante, seccion)
        if result.get('error'):
            return Response({'error': result['error']}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'status': 'Estudiante inscrito exitosamente.', 'detalle_id': result.get('detalle_id')})

    @action(detail=True, methods=['post'], url_path='inscribirme')
    def inscribirme(self, request, pk=None):
        """Permite a un estudiante auto-inscribirse en una sección de su programa."""
        seccion = self.get_object()
        user = request.user

        # Obtener el estudiante asociado al usuario
        try:
            estudiante = Estudiante.objects.get(usuario=user)
        except Estudiante.DoesNotExist:
            return Response({'error': 'No tienes perfil de estudiante.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validar que la asignatura es del programa del estudiante
        if estudiante.programa_id != seccion.asignatura.programa_id:
            return Response(
                {'error': 'Esta asignatura no pertenece a tu programa.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Realizar inscripción
        result = self._inscribir_estudiante_en_seccion(estudiante, seccion)
        if result.get('error'):
            return Response({'error': result['error']}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'status': 'Te has inscrito exitosamente.', 'detalle_id': result.get('detalle_id')})

    @action(detail=True, methods=['post'], url_path='desinscribirme')
    def desinscribirme(self, request, pk=None):
        """Permite a un estudiante desinscribirse de una sección."""
        seccion = self.get_object()
        user = request.user

        try:
            estudiante = Estudiante.objects.get(usuario=user)
        except Estudiante.DoesNotExist:
            return Response({'error': 'No tienes perfil de estudiante.'}, status=status.HTTP_400_BAD_REQUEST)

        # Buscar el detalle de inscripción
        from gestion.models import Inscripcion, DetalleInscripcion, PeriodoAcademico
        
        detalle = DetalleInscripcion.objects.filter(
            inscripcion__estudiante=estudiante,
            seccion=seccion,
            estatus='CURSANDO'
        ).first()

        if not detalle:
            return Response({'error': 'No estás inscrito en esta sección.'}, status=status.HTTP_400_BAD_REQUEST)

        detalle.delete()
        return Response({'status': 'Te has desinscrito exitosamente.'})

    @action(detail=True, methods=['post'], url_path='desinscribir-estudiante')
    def desinscribir_estudiante(self, request, pk=None):
        """Permite a un docente/admin desinscribir un estudiante de su sección."""
        seccion = self.get_object()
        user = request.user

        # Verificar permisos
        if not user.is_superuser and not user.groups.filter(name='Administrador').exists():
            if seccion.docente != user:
                return Response(
                    {'error': 'No estás asignado a esta sección.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        estudiante_id = request.data.get('estudiante_id')
        if not estudiante_id:
            return Response({'error': 'Se requiere estudiante_id.'}, status=status.HTTP_400_BAD_REQUEST)

        from gestion.models import DetalleInscripcion
        detalle = DetalleInscripcion.objects.filter(
            inscripcion__estudiante_id=estudiante_id,
            seccion=seccion,
            estatus='CURSANDO'
        ).first()

        if not detalle:
            return Response({'error': 'Estudiante no encontrado en esta sección.'}, status=status.HTTP_404_NOT_FOUND)

        detalle.delete()
        return Response({'status': 'Estudiante desinscrito exitosamente.'})

    @action(detail=False, methods=['get'], url_path='mis-secciones')
    def mis_secciones(self, request):
        """Devuelve las secciones asignadas al docente autenticado con sus estudiantes."""
        user = request.user
        
        # Verificar que sea docente
        if not user.groups.filter(name='Docente').exists() and not user.is_superuser and not user.groups.filter(name='Administrador').exists():
            return Response({'error': 'Solo los docentes y administradores pueden acceder a este recurso.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Códigos especiales que solo gestiona el ADMINISTRADOR
        SPECIAL_CODES = ['TAI-01', 'PRO-01', 'PSI-30010']

        if user.is_superuser or user.groups.filter(name='Administrador').exists():
            # Para administrador: Asegurar que existan secciones para las materias especiales
            from gestion.models import Asignatura
            for code in SPECIAL_CODES:
                asig = Asignatura.objects.filter(codigo=code).first()
                if asig:
                    # Crear sección por defecto '01' si no existe ninguna
                    if not Seccion.objects.filter(asignatura=asig).exists():
                         Seccion.objects.create(asignatura=asig, codigo_seccion='01', docente=None)

            secciones = Seccion.objects.all().select_related('asignatura', 'asignatura__programa', 'docente')
        else:
            # Para docentes: Mostrar sus secciones pero EXCLUIR explícitamente las especiales
            secciones = Seccion.objects.filter(docente=user).exclude(asignatura__codigo__in=SPECIAL_CODES).select_related('asignatura', 'asignatura__programa', 'docente')
        
        result = []
        for seccion in secciones:
            estudiantes_data = []
            detalles = DetalleInscripcion.objects.filter(seccion=seccion).select_related(
                'inscripcion__estudiante', 'inscripcion__estudiante__usuario'
            )
            for detalle in detalles:
                est = detalle.inscripcion.estudiante
                estudiantes_data.append({
                    'detalle_id': detalle.id,
                    'estudiante_id': est.id,
                    'cedula': est.cedula,
                    'nombre': est.usuario.get_full_name(),
                    'nota1': float(detalle.nota1) if detalle.nota1 else None,
                    'nota2': float(detalle.nota2) if detalle.nota2 else None,
                    'nota3': float(detalle.nota3) if detalle.nota3 else None,
                    'nota4': float(detalle.nota4) if detalle.nota4 else None,
                    'nota_final': float(detalle.nota_final) if detalle.nota_final else None,
                    'estatus': detalle.estatus
                })
            
            result.append({
                'id': seccion.id,
                'codigo_seccion': seccion.codigo_seccion,
                'asignatura_id': seccion.asignatura.id,
                'asignatura_codigo': seccion.asignatura.codigo,
                'asignatura_nombre': seccion.asignatura.nombre_asignatura,
                'programa': seccion.asignatura.programa.nombre_programa,
                'semestre': seccion.asignatura.semestre,
                'docente_nombre': seccion.docente.get_full_name() if seccion.docente else 'Sin Docente',
                'estudiantes': estudiantes_data,
                'total_estudiantes': len(estudiantes_data)
            })
        
        return Response(result)

    @action(detail=True, methods=['post'], url_path='calificar')
    def calificar(self, request, pk=None):
        """Permite a un docente asignar calificaciones a un estudiante."""
        seccion = self.get_object()
        user = request.user
        
        # Verificar que sea el docente asignado o admin
        if not user.is_superuser and not user.groups.filter(name='Administrador').exists():
            if seccion.docente != user:
                return Response({'error': 'No estás asignado a esta sección.'}, status=status.HTTP_403_FORBIDDEN)
        
        detalle_id = request.data.get('detalle_id')
        nota1 = request.data.get('nota1')
        nota2 = request.data.get('nota2')
        nota3 = request.data.get('nota3')
        nota4 = request.data.get('nota4')
        
        if not detalle_id:
            return Response({'error': 'Se requiere detalle_id.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            detalle = DetalleInscripcion.objects.get(pk=detalle_id, seccion=seccion)
        except DetalleInscripcion.DoesNotExist:
            return Response({'error': 'Detalle de inscripción no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        
        # Validar notas (1-20)
        from decimal import Decimal, InvalidOperation
        def parse_nota(val):
            if val is None or val == '':
                return None
            try:
                nota = Decimal(str(val))
                if nota < 1 or nota > 20:
                    raise ValueError('Nota fuera de rango')
                return nota
            except (InvalidOperation, ValueError):
                return None
        
        # Actualizar notas
        if nota1 is not None:
            detalle.nota1 = parse_nota(nota1)
        if nota2 is not None:
            detalle.nota2 = parse_nota(nota2)
        if nota3 is not None:
            detalle.nota3 = parse_nota(nota3)
        if nota4 is not None:
            detalle.nota4 = parse_nota(nota4)
        
        detalle.save()  # El método save() calcula nota_final automáticamente
        
        return Response({
            'status': 'Calificaciones guardadas.',
            'nota_final': float(detalle.nota_final) if detalle.nota_final else None,
            'estatus': detalle.estatus
        })

    def _inscribir_estudiante_en_seccion(self, estudiante, seccion):
        """Método interno para realizar la inscripción con validaciones."""
        from gestion.models import Inscripcion, DetalleInscripcion, PeriodoAcademico
        from django.core.exceptions import ValidationError

        asignatura = seccion.asignatura

        # 1. Obtener período activo con inscripciones abiertas
        periodo = PeriodoAcademico.objects.filter(activo=True, inscripciones_activas=True).first()
        if not periodo:
            # Verificar si hay período activo pero inscripciones cerradas
            periodo_cerrado = PeriodoAcademico.objects.filter(activo=True).first()
            if periodo_cerrado:
                return {'error': f'Las inscripciones están cerradas para el período {periodo_cerrado.nombre_periodo}.'}
            return {'error': 'No hay período académico activo.'}

        # 2. Verificar si ya está inscrito en esta asignatura EN ESTE PERIODO
        ya_inscrito_periodo = DetalleInscripcion.objects.filter(
            inscripcion__estudiante=estudiante,
            inscripcion__periodo=periodo,
            asignatura=asignatura
        ).exists()

        if ya_inscrito_periodo:
            return {'error': 'El estudiante ya está inscrito en esta asignatura en el período actual.'}

        # 3. Verificar si ya aprobó esta asignatura (histórico)
        ya_aprobo = DetalleInscripcion.objects.filter(
            inscripcion__estudiante=estudiante,
            asignatura=asignatura,
            estatus='APROBADO'
        ).exists()

        if ya_aprobo:
            return {'error': 'El estudiante ya aprobó esta asignatura anteriormente.'}

        # 4. Verificar prelaciones
        prelaciones = asignatura.prelaciones.all()
        for prereq in prelaciones:
            # Buscar si aprobó la prelación
            aprobada = DetalleInscripcion.objects.filter(
                inscripcion__estudiante=estudiante,
                asignatura=prereq,
                nota_final__gte=10
            ).exists()
            
            # Caso especial: PSI-30010 requiere todo el pensum (excluyendo la misma materia y electivas si aplica)
            # Simplificación: PSI-30010 suele ser Tesis/Pasantía, requiere checkeo manual o lógica compleja.
            # Por ahora validamos prelaciones directas.
            
            if not aprobada:
                return {'error': f'Prelación no cumplida: {prereq.codigo} - {prereq.nombre_asignatura}'}

        # 5. Obtener o crear inscripción del estudiante en el período
        inscripcion, _ = Inscripcion.objects.get_or_create(
            estudiante=estudiante,
            periodo=periodo
        )

        # 6. Crear detalle de inscripción con estatus inicial 'CURSANDO'
        detalle = DetalleInscripcion.objects.create(
            inscripcion=inscripcion,
            asignatura=asignatura,
            seccion=seccion,
            estatus='CURSANDO'
        )

        return {'detalle_id': detalle.id}


class PeriodoAcademicoViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar períodos académicos."""
    queryset = PeriodoAcademico.objects.all().order_by('-anio', '-nombre_periodo')
    serializer_class = PeriodoAcademicoSerializer

    def get_permissions(self):
        from rest_framework.permissions import IsAuthenticated
        if self.action in ['list', 'retrieve', 'activo']:
            return [IsAuthenticated()]
        return [IsAdmin()]

    @action(detail=False, methods=['get'], url_path='activo')
    def activo(self, request):
        """Retorna el período académico activo actual."""
        periodo = PeriodoAcademico.objects.filter(activo=True).first()
        if periodo:
            return Response(PeriodoAcademicoSerializer(periodo).data)
        return Response({'error': 'No hay período activo.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], url_path='toggle-inscripciones')
    def toggle_inscripciones(self, request, pk=None):
        """Activa o desactiva las inscripciones para un período."""
        from datetime import date
        periodo = self.get_object()
        hoy = date.today()
        
        # No permitir modificar inscripciones de períodos pasados
        if periodo.fecha_fin < hoy:
            return Response({
                'error': 'No se pueden modificar inscripciones de un período que ya finalizó.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Toggle del estado
        periodo.inscripciones_activas = not periodo.inscripciones_activas
        periodo.save()
        return Response({
            'status': 'success',
            'inscripciones_activas': periodo.inscripciones_activas,
            'mensaje': f'Inscripciones {"activadas" if periodo.inscripciones_activas else "desactivadas"} para {periodo.nombre_periodo}'
        })

    @action(detail=True, methods=['post'], url_path='activar')
    def activar_periodo(self, request, pk=None):
        """Establece este período como el activo (desactiva los demás)."""
        from datetime import date
        periodo = self.get_object()
        hoy = date.today()
        
        # No permitir activar períodos pasados
        if periodo.fecha_fin < hoy:
            return Response({
                'error': 'No se puede activar un período que ya finalizó.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # No permitir activar períodos futuros antes de su fecha de inicio
        if periodo.fecha_inicio > hoy:
            return Response({
                'error': f'Este período no puede activarse hasta {periodo.fecha_inicio}.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Desactivar todos los períodos
        PeriodoAcademico.objects.update(activo=False)
        # Activar este período
        periodo.activo = True
        periodo.save()
        return Response({
            'status': 'success',
            'mensaje': f'Período {periodo.nombre_periodo} activado correctamente.'
        })


class EstadisticasViewSet(viewsets.ViewSet):
    """ViewSet para estadísticas académicas."""
    permission_classes = [IsDocenteOrAdmin]
    
    def get_permissions(self):
        if self.action == 'mi_progreso':
            return [IsEstudiante()]
        return [IsDocenteOrAdmin()]

    @action(detail=False, methods=['get'], url_path='desglose')
    def desglose(self, request):
        """Devuelve el desglose académico real por semestre/asignatura/sección."""
        from django.db.models import Avg, Max, Min, Count
        
        programa_id = request.query_params.get('programa')
        user = request.user
        
        # Determinar si es admin o docente
        is_admin = user.is_superuser or user.groups.filter(name='Administrador').exists()
        is_docente = user.groups.filter(name='Docente').exists()
        
        # Obtener asignaturas agrupadas por semestre
        asignaturas = Asignatura.objects.all().order_by('semestre', 'orden')
        if programa_id:
            asignaturas = asignaturas.filter(programa_id=programa_id)
        
        semestres = {}
        for asig in asignaturas:
            sem_key = asig.semestre
            if sem_key not in semestres:
                semestres[sem_key] = {
                    'id': sem_key,
                    'name': f'Semestre {sem_key}',
                    'subjects': []
                }
            
            # Obtener secciones con docente asignado
            secciones_data = []
            secciones = asig.secciones.filter(docente__isnull=False).select_related('docente')
            
            # Si es docente (no admin), filtrar solo sus secciones
            if is_docente and not is_admin:
                secciones = secciones.filter(docente=user)
            
            for seccion in secciones:
                # Obtener estadísticas de notas
                stats = DetalleInscripcion.objects.filter(
                    seccion=seccion
                ).aggregate(
                    count=Count('id'),
                    avg=Avg('nota_final'),
                    max=Max('nota_final'),
                    min=Min('nota_final')
                )
                
                secciones_data.append({
                    'id': seccion.id,
                    'code': seccion.codigo_seccion,
                    'docente': seccion.docente.get_full_name() if seccion.docente else 'Sin asignar',
                    'count': stats['count'] or 0,
                    'avg': round(float(stats['avg']), 2) if stats['avg'] else 0,
                    'max': round(float(stats['max']), 2) if stats['max'] else 0,
                    'min': round(float(stats['min']), 2) if stats['min'] else 0
                })
            
            if secciones_data:  # Solo agregar asignaturas con secciones activas
                semestres[sem_key]['subjects'].append({
                    'id': asig.id,
                    'code': asig.codigo,
                    'name': asig.nombre_asignatura,
                    'sections': secciones_data
                })
        
        # Filtrar semestres vacíos (sin asignaturas con secciones)
        result = [sem for sem in sorted(semestres.values(), key=lambda x: x['id']) if sem['subjects']]
        return Response(result)

    @action(detail=False, methods=['get'], url_path='chart-data')
    def chart_data(self, request):
        """Devuelve datos para el gráfico radar según el rol del usuario."""
        from django.db.models import Avg
        
        user = request.user
        is_admin = user.is_superuser or user.groups.filter(name='Administrador').exists()
        is_docente = user.groups.filter(name='Docente').exists()
        programa_id = request.query_params.get('programa')
        
        labels = []
        data = []
        
        # Siempre mostrar 8 semestres
        for sem_num in range(1, 9):
            labels.append(f'Sem {sem_num}')
            
            if is_admin:
                # Admin: promedio por semestre de todo el programa
                detalles = DetalleInscripcion.objects.filter(
                    asignatura__semestre=sem_num,
                    nota_final__isnull=False
                )
                if programa_id:
                    detalles = detalles.filter(asignatura__programa_id=programa_id)
                
                avg = detalles.aggregate(avg=Avg('nota_final'))['avg']
                data.append(round(float(avg), 2) if avg else 0)
            
            elif is_docente:
                # Docente: promedios solo de sus secciones para ese semestre
                secciones_docente = Seccion.objects.filter(docente=user, asignatura__semestre=sem_num)
                avg = DetalleInscripcion.objects.filter(
                    seccion__in=secciones_docente,
                    nota_final__isnull=False
                ).aggregate(avg=Avg('nota_final'))['avg']
                
                data.append(round(float(avg), 2) if avg else 0)
            else:
                data.append(0)
        
        return Response({
            'labels': labels,
            'data': data
        })

    @action(detail=False, methods=['get'], url_path='mi-progreso')
    def mi_progreso(self, request):
        """Devuelve el progreso académico del estudiante autenticado."""
        from django.db.models import Avg
        
        user = request.user
        
        # Verificar que sea estudiante
        try:
            estudiante = Estudiante.objects.get(usuario=user)
        except Estudiante.DoesNotExist:
            return Response({'error': 'Usuario no es estudiante.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Calcular avance
        avance = estudiante.calcular_avance()
        total_asignaturas = estudiante.programa.asignatura_set.count() if estudiante.programa else 0
        aprobadas = DetalleInscripcion.objects.filter(
            inscripcion__estudiante=estudiante,
            nota_final__gte=10
        ).count()
        
        nombre = ''
        try:
            nombre = estudiante.usuario.get_full_name()
        except Exception:
            nombre = str(estudiante.usuario)
        
        # Datos para el gráfico radar (promedios por semestre)
        labels = []
        chart_data = []
        
        # Desglose académico (formato compatible con admin)
        desglose = {}
        
        detalles = DetalleInscripcion.objects.filter(
            inscripcion__estudiante=estudiante
        ).select_related('asignatura', 'seccion')
        
        for detalle in detalles:
            sem_key = detalle.asignatura.semestre
            if sem_key not in desglose:
                desglose[sem_key] = {
                    'id': sem_key,
                    'name': f'Semestre {sem_key}',
                    'subjects': []
                }
            
            # Buscar si ya existe la asignatura (para agrupar por sección)
            existing_subject = None
            for subj in desglose[sem_key]['subjects']:
                if subj['id'] == detalle.asignatura.id:
                    existing_subject = subj
                    break
            
            section_data = {
                'id': detalle.seccion.id if detalle.seccion else detalle.id,
                'code': detalle.seccion.codigo_seccion if detalle.seccion else 'N/A',
                'nota1': float(detalle.nota1) if detalle.nota1 else None,
                'nota2': float(detalle.nota2) if detalle.nota2 else None,
                'nota3': float(detalle.nota3) if detalle.nota3 else None,
                'nota4': float(detalle.nota4) if detalle.nota4 else None,
                'nota_final': float(detalle.nota_final) if detalle.nota_final else None,
                'estatus': detalle.estatus
            }
            
            if existing_subject:
                existing_subject['sections'].append(section_data)
            else:
                desglose[sem_key]['subjects'].append({
                    'id': detalle.asignatura.id,
                    'code': detalle.asignatura.codigo,
                    'name': detalle.asignatura.nombre_asignatura,
                    'sections': [section_data]
                })
        
        # Calcular promedios por semestre para el gráfico (siempre 8 semestres)
        for sem_num in range(1, 9):
            labels.append(f'Sem {sem_num}')
            if sem_num in desglose:
                notas_sem = []
                for subj in desglose[sem_num]['subjects']:
                    for sec in subj['sections']:
                        if sec['nota_final']:
                            notas_sem.append(sec['nota_final'])
                promedio = sum(notas_sem) / len(notas_sem) if notas_sem else 0
                chart_data.append(round(promedio, 2))
            else:
                chart_data.append(0)
        
        return Response({
            'labels': labels,
            'data': chart_data,
            'desglose': sorted(desglose.values(), key=lambda x: x['id']),
            'estudiante': {
                'id': estudiante.id,
                'nombre': nombre,
                'programa': estudiante.programa.nombre_programa if estudiante.programa else '',
                'porcentaje_avance': avance,
                'total_asignaturas': total_asignaturas,
                'aprobadas': aprobadas
            }
        })

