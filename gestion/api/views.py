from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import HttpResponse
import openpyxl

from gestion.models import (
    Estudiante, Asignatura, DetalleInscripcion, Pensum, Planificacion, DocumentoCalificaciones, Seccion
)
from gestion.api.serializers import (
    EstudianteSerializer, AsignaturaSerializer, PensumSerializer,
    PlanificacionSerializer, DocumentoCalificacionesSerializer, CreateUserSerializer, UserSerializer,
    ProgramaSerializer, SeccionSerializer, DocenteSerializer, AdministradorSerializer
)
from gestion.permissions import IsAdmin, IsDocente, IsEstudiante, IsDocenteOrAdminOrOwner
from django.contrib.auth.models import User


class EstudianteViewSet(viewsets.ModelViewSet):
    queryset = Estudiante.objects.all()
    serializer_class = EstudianteSerializer
    filterset_fields = ['programa', 'cedula']
    search_fields = ['usuario__first_name', 'usuario__last_name', 'usuario__username', 'cedula']

    def get_permissions(self):
        # admin: full; listing/creation restricted to admin
        if self.action in ['list', 'create', 'destroy']:
            return [IsAdmin()]
        if self.action in ['retrieve', 'progreso']:
            return [IsDocenteOrAdminOrOwner()]
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

    @action(detail=False, methods=['get'])
    def reporte_excel(self, request):
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Listado Estudiantes"
        ws.append(['Cédula', 'Nombre', 'Programa', 'Avance (%)'])

        for est in Estudiante.objects.select_related('usuario', 'programa').all():
            nombre = ''
            try:
                nombre = est.usuario.get_full_name()
            except Exception:
                nombre = str(est.usuario)

            ws.append([
                est.cedula,
                nombre,
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
        docente = None
        if docente_id:
            try:
                docente = User.objects.get(pk=docente_id)
            except User.DoesNotExist:
                return Response({'error': 'Docente no encontrado'}, status=404)

        seccion, created = Seccion.objects.update_or_create(
            asignatura=asignatura,
            codigo_seccion=codigo_seccion,
            defaults={'docente': docente}
        )

        return Response(SeccionSerializer(seccion).data)

    @action(detail=True, methods=['post'], url_path='assign-tutor')
    def assign_tutor(self, request, pk=None):
        asignatura = self.get_object()
        docente_id = request.data.get('docente')
        tutor_type = request.data.get('type', 'generic') # generic, academic, community

        if not docente_id:
            return Response({'error': 'Docente ID requerido'}, status=400)
        
        try:
            docente = User.objects.get(pk=docente_id)
        except User.DoesNotExist:
            return Response({'error': 'Docente no encontrado'}, status=404)

        if asignatura.tutores.count() >= 10:
             return Response({'error': "Límite de tutores alcanzado (10)"}, status=400)

        asignatura.tutores.add(docente)
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
    permission_classes = [IsAdmin]


class UserManagementViewSet(viewsets.ViewSet):
    """Endpoints for admin to create users (docente/estudiante)."""
    permission_classes = [IsAdmin]

    def create(self, request):
        serializer = CreateUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


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
        ws.append(['Cédula', 'Nombres', 'Apellidos', 'Teléfono', 'Email'])

        for docente in self.filter_queryset(self.get_queryset()):
            ws.append([
                docente.cedula,
                docente.usuario.first_name,
                docente.usuario.last_name,
                docente.telefono,
                docente.usuario.email
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
        ws.append(['Cédula', 'Nombres', 'Apellidos', 'Teléfono', 'Email'])

        for admin in self.filter_queryset(self.get_queryset()):
            ws.append([
                admin.cedula,
                admin.usuario.first_name,
                admin.usuario.last_name,
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
    filterset_fields = ['asignatura', 'asignatura__codigo']
    search_fields = ['asignatura__nombre_asignatura', 'asignatura__codigo']

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsDocenteOrAdminOrOwner()]
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
