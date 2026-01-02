from rest_framework import serializers
from django.contrib.auth.models import User
from gestion.models import Estudiante, Asignatura, Pensum, Planificacion, DocumentoCalificaciones, Programa, Seccion


class UserSerializer(serializers.ModelSerializer):
    telefono = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'groups', 'is_staff', 'is_superuser', 'telefono']
        depth = 1

    def get_telefono(self, obj):
        # Intentar obtener teléfono de perfiles relacionados
        if hasattr(obj, 'estudiante'):
            return obj.estudiante.telefono
        if hasattr(obj, 'docente'):
            return obj.docente.telefono
        if hasattr(obj, 'administrador'):
            return obj.administrador.telefono
        return None


class CreateUserSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=['Estudiante', 'Docente', 'Administrador'], default='Estudiante')

    # Campos específicos para Estudiante
    cedula = serializers.CharField(required=False, allow_blank=True)
    telefono = serializers.CharField(required=False, allow_blank=True)
    programa = serializers.PrimaryKeyRelatedField(queryset=Programa.objects.all(), required=False, allow_null=True)
    tipo_contratacion = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def create(self, validated_data):
        role = validated_data.pop('role', 'Estudiante')
        password = validated_data.pop('password')
        cedula = validated_data.pop('cedula', None)
        telefono = validated_data.pop('telefono', '')
        programa = validated_data.pop('programa', None)
        tipo_contratacion = validated_data.pop('tipo_contratacion', 'Tiempo Completo')

        user = User.objects.create(
            username=cedula,
            email=validated_data.get('email',''),
            first_name=validated_data.get('first_name',''),
            last_name=validated_data.get('last_name',''),
        )
        user.set_password(password)
        user.save()

        # asignar grupo
        from django.contrib.auth.models import Group
        group, _ = Group.objects.get_or_create(name=role)
        user.groups.add(group)

        if role == 'Estudiante':
            # crear registro de Estudiante
            Estudiante.objects.create(usuario=user, programa=programa, cedula=cedula, telefono=telefono)
        elif role == 'Docente':
            from gestion.models import Docente
            Docente.objects.create(usuario=user, cedula=cedula, telefono=telefono, tipo_contratacion=tipo_contratacion)
        elif role == 'Administrador':
            user.is_staff = True
            user.is_superuser = True
            user.save()
            from gestion.models import Administrador
            Administrador.objects.create(usuario=user, cedula=cedula, telefono=telefono)

        return user

        return user


class ProgramaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Programa
        fields = ['id', 'nombre_programa', 'titulo_otorgado', 'duracion_anios']


class PeriodoAcademicoSerializer(serializers.ModelSerializer):
    """Serializer para gestión de períodos académicos."""
    es_pasado = serializers.SerializerMethodField()
    es_futuro = serializers.SerializerMethodField()
    es_activable = serializers.SerializerMethodField()
    estado = serializers.SerializerMethodField()
    
    class Meta:
        from gestion.models import PeriodoAcademico
        model = PeriodoAcademico
        fields = ['id', 'nombre_periodo', 'fecha_inicio', 'fecha_fin', 'activo', 'inscripciones_activas', 'anio', 'es_pasado', 'es_futuro', 'es_activable', 'estado']

    def get_es_pasado(self, obj):
        from datetime import date
        return obj.fecha_fin < date.today()

    def get_es_futuro(self, obj):
        from datetime import date
        return obj.fecha_inicio > date.today()

    def get_es_activable(self, obj):
        from datetime import date
        hoy = date.today()
        # No se puede activar si ya está activo, ya pasó, o aún no ha comenzado
        if obj.activo:
            return False
        if obj.fecha_fin < hoy:
            return False
        if obj.fecha_inicio > hoy:
            return False
        return True

    def get_estado(self, obj):
        from datetime import date
        hoy = date.today()
        if obj.fecha_fin < hoy:
            return 'finalizado'
        if obj.fecha_inicio > hoy:
            return 'futuro'
        return 'en_curso'



class HorarioSerializer(serializers.ModelSerializer):
    dia_nombre = serializers.CharField(source='get_dia_display', read_only=True)
    
    class Meta:
        from gestion.models import Horario
        model = Horario
        fields = ['id', 'dia', 'dia_nombre', 'hora_inicio', 'hora_fin', 'aula']


class SeccionSerializer(serializers.ModelSerializer):
    docente_nombre = serializers.SerializerMethodField()
    estudiantes_count = serializers.SerializerMethodField()
    horarios = HorarioSerializer(many=True, read_only=True)
    nombre_asignatura = serializers.CharField(source='asignatura.nombre_asignatura', read_only=True)
    codigo_asignatura = serializers.CharField(source='asignatura.codigo', read_only=True)
    
    class Meta:
        model = Seccion
        fields = ['id', 'asignatura', 'nombre_asignatura', 'codigo_asignatura', 'codigo_seccion', 'docente', 'docente_nombre', 'estudiantes_count', 'horarios']

    def get_docente_nombre(self, obj):
        if obj.docente:
            # obj.docente es una instancia de User
            name = obj.docente.get_full_name()
            return name if name else obj.docente.username
        return None

    def get_estudiantes_count(self, obj):
        # Contar inscritos en periodos activos (independiente del estatus CURSANDO/INSCRITO)
        return obj.estudiantes_inscritos.filter(inscripcion__periodo__activo=True).count()


class InscripcionSeccionSerializer(serializers.Serializer):
    """Serializer para inscribir estudiante a una sección."""
    estudiante_id = serializers.IntegerField(required=True)


class DetalleInscripcionListSerializer(serializers.ModelSerializer):
    """Serializer para listar estudiantes inscritos en una sección."""
    from gestion.models import DetalleInscripcion
    estudiante_nombre = serializers.SerializerMethodField()
    estudiante_cedula = serializers.SerializerMethodField()
    estudiante_id = serializers.SerializerMethodField()

    class Meta:
        from gestion.models import DetalleInscripcion
        model = DetalleInscripcion
        fields = ['id', 'estudiante_id', 'estudiante_nombre', 'estudiante_cedula', 'estatus', 'nota_final']

    def get_estudiante_nombre(self, obj):
        est = obj.inscripcion.estudiante
        return est.usuario.get_full_name() or est.usuario.username

    def get_estudiante_cedula(self, obj):
        return obj.inscripcion.estudiante.cedula

    def get_estudiante_id(self, obj):
        return obj.inscripcion.estudiante.id

class AsignaturaSerializer(serializers.ModelSerializer):
    secciones = SeccionSerializer(many=True, read_only=True)
    is_assigned_to_current_user = serializers.SerializerMethodField()
    has_assignments = serializers.SerializerMethodField()
    has_plan = serializers.SerializerMethodField()
    prelaciones = serializers.SlugRelatedField(slug_field='codigo', many=True, read_only=True)
    tutores = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Asignatura
        fields = ['id', 'codigo', 'nombre_asignatura', 'creditos', 'semestre', 'programa', 'docente', 'secciones', 'has_assignments', 'has_plan', 'prelaciones', 'orden', 'tutores', 'is_assigned_to_current_user']

    def get_is_assigned_to_current_user(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        # El docente está asignado si su ID de Usuario coincide con el campo docente de cualquier sección
        return obj.secciones.filter(docente=request.user).exists()

    def get_has_assignments(self, obj):
        # Retornar verdadero si alguna sección tiene un docente asignado
        return obj.secciones.filter(docente__isnull=False).exists()

    def get_has_plan(self, obj):
        return obj.planificaciones.exists()




class EstudianteSerializer(serializers.ModelSerializer):
    usuario = UserSerializer(read_only=True)
    nombre_completo = serializers.SerializerMethodField()

    # Campos de escritura para actualizar información del usuario
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False)

    class Meta:
        model = Estudiante
        fields = ['id', 'usuario', 'nombre_completo', 'cedula', 'telefono', 'programa', 'fecha_ingreso', 'first_name', 'last_name', 'email']
        read_only_fields = ['fecha_ingreso', 'nombre_completo']

    def get_nombre_completo(self, obj):
        try:
            return obj.usuario.get_full_name()
        except Exception:
            return str(obj.usuario)

    def update(self, instance, validated_data):
        # Actualizar campos del Usuario si se proporcionan
        user = instance.usuario
        user_changed = False
        if 'first_name' in validated_data:
            user.first_name = validated_data.pop('first_name')
            user_changed = True
        if 'last_name' in validated_data:
            user.last_name = validated_data.pop('last_name')
            user_changed = True
        if 'email' in validated_data:
            user.email = validated_data.pop('email')
            user_changed = True
        
        if user_changed:
            user.save()

        # Actualizar campos de Estudiante
        return super().update(instance, validated_data)


class DocenteSerializer(serializers.ModelSerializer):
    usuario = UserSerializer(read_only=True)
    nombre_completo = serializers.SerializerMethodField()
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False)

    class Meta:
        from gestion.models import Docente
        model = Docente
        fields = ['id', 'usuario', 'nombre_completo', 'cedula', 'telefono', 'tipo_contratacion', 'first_name', 'last_name', 'email']
        read_only_fields = ['nombre_completo']

    def get_nombre_completo(self, obj):
        return obj.usuario.get_full_name()

    def update(self, instance, validated_data):
        user = instance.usuario
        user_changed = False
        if 'first_name' in validated_data:
            user.first_name = validated_data.pop('first_name')
            user_changed = True
        if 'last_name' in validated_data:
            user.last_name = validated_data.pop('last_name')
            user_changed = True
        if 'email' in validated_data:
            user.email = validated_data.pop('email')
            user_changed = True
        if user_changed: user.save()
        
        # tipo_contratacion es manejado automáticamente por super().update si está en validated_data
        return super().update(instance, validated_data)


class AdministradorSerializer(serializers.ModelSerializer):
    usuario = UserSerializer(read_only=True)
    nombre_completo = serializers.SerializerMethodField()
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False)

    class Meta:
        from gestion.models import Administrador
        model = Administrador
        fields = ['id', 'usuario', 'nombre_completo', 'cedula', 'telefono', 'first_name', 'last_name', 'email']
        read_only_fields = ['nombre_completo']

    def get_nombre_completo(self, obj):
        return obj.usuario.get_full_name()

    def update(self, instance, validated_data):
        user = instance.usuario
        user_changed = False
        if 'first_name' in validated_data:
            user.first_name = validated_data.pop('first_name')
            user_changed = True
        if 'last_name' in validated_data:
            user.last_name = validated_data.pop('last_name')
            user_changed = True
        if 'email' in validated_data:
            user.email = validated_data.pop('email')
            user_changed = True
        if user_changed: user.save()
        return super().update(instance, validated_data)


class PensumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pensum
        fields = ['id', 'programa', 'archivo', 'uploaded_at']

    def validate_archivo(self, value):
        # Validar tamaño
        from django.conf import settings
        max_size = getattr(settings, 'MAX_UPLOAD_SIZE', 10 * 1024 * 1024)
        if value.size > max_size:
            raise serializers.ValidationError(f"Archivo demasiado grande (máx {max_size} bytes)")

        # preferir detección MIME vía python-magic cuando esté disponible
        allowed_ext = ['.pdf', '.docx', '.doc']
        allowed_mimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        try:
            import magic
            buf = value.read(2048)
            value.seek(0)
            mime = magic.from_buffer(buf, mime=True)
            if mime not in allowed_mimes:
                raise serializers.ValidationError("Tipo de archivo no permitido (mime)")
        except Exception:
            # alternativa: verificar extensión
            import os
            ext = os.path.splitext(value.name)[1].lower()
            if ext not in allowed_ext:
                raise serializers.ValidationError("Tipo de archivo no permitido (ext)")

        return value


class PlanificacionSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)

    class Meta:
        model = Planificacion
        fields = ['id', 'asignatura', 'archivo', 'uploaded_by', 'uploaded_at', 'codigo_especifico']

    def validate_archivo(self, value):
        from django.conf import settings
        max_size = getattr(settings, 'MAX_UPLOAD_SIZE', 10 * 1024 * 1024)
        if value.size > max_size:
            raise serializers.ValidationError(f"Archivo demasiado grande (máx {max_size} bytes)")

        allowed_ext = ['.pdf', '.docx', '.doc', '.xls', '.xlsx']
        allowed_mimes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ]
        try:
            import magic
            buf = value.read(2048)
            value.seek(0)
            mime = magic.from_buffer(buf, mime=True)
            if mime not in allowed_mimes:
                raise serializers.ValidationError(f"Tipo de archivo no permitido (mime: {mime})")
        except Exception:
            import os
            ext = os.path.splitext(value.name)[1].lower()
            if ext not in allowed_ext:
                raise serializers.ValidationError(f"Tipo de archivo no permitido (ext: {ext})")

        return value


class DocumentoCalificacionesSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentoCalificaciones
        fields = ['id', 'estudiante', 'archivo', 'uploaded_at']

    def validate_archivo(self, value):
        from django.conf import settings
        max_size = getattr(settings, 'MAX_UPLOAD_SIZE', 10 * 1024 * 1024)
        if value.size > max_size:
            raise serializers.ValidationError(f"Archivo demasiado grande (máx {max_size} bytes)")

        allowed_ext = ['.pdf']
        allowed_mimes = ['application/pdf']
        try:
            import magic
            buf = value.read(2048)
            value.seek(0)
            mime = magic.from_buffer(buf, mime=True)
            if mime not in allowed_mimes:
                raise serializers.ValidationError("Tipo de archivo no permitido (mime)")
        except Exception:
            import os
            ext = os.path.splitext(value.name)[1].lower()
            if ext not in allowed_ext:
                raise serializers.ValidationError("Tipo de archivo no permitido (ext)")

        return value
