from rest_framework import serializers
from django.contrib.auth.models import User
from gestion.models import Estudiante, Asignatura, Pensum, Planificacion, DocumentoCalificaciones, Programa


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'groups']
        depth = 1


class CreateUserSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=['Estudiante', 'Docente'], default='Estudiante')

    # Estudiante specific fields
    cedula = serializers.CharField(required=False, allow_blank=True)
    telefono = serializers.CharField(required=False, allow_blank=True)
    programa = serializers.PrimaryKeyRelatedField(queryset=Programa.objects.all(), required=False, allow_null=True)

    def create(self, validated_data):
        role = validated_data.pop('role', 'Estudiante')
        password = validated_data.pop('password')
        cedula = validated_data.pop('cedula', None)
        telefono = validated_data.pop('telefono', '')
        programa = validated_data.pop('programa', None)

        user = User.objects.create(
            username=validated_data.get('username'),
            email=validated_data.get('email',''),
            first_name=validated_data.get('first_name',''),
            last_name=validated_data.get('last_name',''),
        )
        user.set_password(password)
        user.save()

        # assign group
        from django.contrib.auth.models import Group
        group, _ = Group.objects.get_or_create(name=role)
        user.groups.add(group)

        if role == 'Estudiante':
            # create Estudiante record
            Estudiante.objects.create(usuario=user, programa=programa, cedula=cedula or f"V-{user.id}", telefono=telefono)

        return user


class ProgramaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Programa
        fields = ['id', 'nombre_programa', 'titulo_otorgado', 'duracion_anios']


class AsignaturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asignatura
        fields = ['id', 'codigo', 'nombre_asignatura', 'creditos', 'semestre', 'programa', 'docente']


class EstudianteSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.SerializerMethodField()

    class Meta:
        model = Estudiante
        fields = ['id', 'usuario', 'nombre_completo', 'cedula', 'telefono', 'programa', 'fecha_ingreso']
        read_only_fields = ['fecha_ingreso', 'nombre_completo']

    def get_nombre_completo(self, obj):
        try:
            return obj.usuario.get_full_name()
        except Exception:
            return str(obj.usuario)



class PensumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pensum
        fields = ['id', 'programa', 'archivo', 'uploaded_at']

    def validate_archivo(self, value):
        # Validate size
        from django.conf import settings
        max_size = getattr(settings, 'MAX_UPLOAD_SIZE', 10 * 1024 * 1024)
        if value.size > max_size:
            raise serializers.ValidationError(f"Archivo demasiado grande (máx {max_size} bytes)")

        # prefer MIME detection via python-magic when available
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
            # fallback to extension check
            import os
            ext = os.path.splitext(value.name)[1].lower()
            if ext not in allowed_ext:
                raise serializers.ValidationError("Tipo de archivo no permitido (ext)")

        return value


class PlanificacionSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)

    class Meta:
        model = Planificacion
        fields = ['id', 'asignatura', 'archivo', 'uploaded_by', 'uploaded_at']

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
