"""
Configuración de Django para el proyecto SISMEPA.

Generado por 'django-admin startproject' usando Django 5.2.8.

Para más información sobre este archivo, ver:
https://docs.djangoproject.com/en/5.2/topics/settings/

Para la lista completa de configuraciones y sus valores, ver:
https://docs.djangoproject.com/en/5.2/ref/settings/
"""

from pathlib import Path
import os
from dotenv import load_dotenv

# Construir rutas dentro del proyecto así: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Cargar variables de entorno desde un archivo .env en desarrollo (opcional)
load_dotenv()


# Configuración rápida de desarrollo - no apta para producción
# Ver https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SEGURIDAD: leer `SECRET_KEY` desde la variable de entorno en vez de dejarlo hardcodeado
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-mck48xvyndhn*x-#4ygsos_kyra@!mam1ibh$lyt@28c+7wkhu')

# DEBUG configurable vía variable de entorno; por defecto True en desarrollo
DEBUG = os.environ.get('DJANGO_DEBUG', 'True') == 'True'

ALLOWED_HOSTS = ['*']


# Definición de aplicaciones

INSTALLED_APPS = [
    'corsheaders',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'rest_framework',
    'rest_framework.authtoken',
    'allauth',
    'allauth.account',
    'dj_rest_auth',
    'dj_rest_auth.registration',
    'django_filters',
    'gestion',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

# CORS: permitir el frontend de desarrollo
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
]

# Sitios (requerido por django-allauth)
SITE_ID = 1

# Backends de autenticación (permite autenticación con allauth)
AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
)

# Configuración mínima de REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
    ),
}

# Email / SendGrid
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'no-reply@example.com')
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY', '')

# Umbral para alertas tempranas de bajo rendimiento (porcentaje)
LOW_PERFORMANCE_THRESHOLD = int(os.environ.get('LOW_PERFORMANCE_THRESHOLD', '50'))

# Configuración mínima de django-allauth para desarrollo
ACCOUNT_AUTHENTICATION_METHOD = 'username'
ACCOUNT_EMAIL_VERIFICATION = 'none'
ACCOUNT_EMAIL_REQUIRED = False
ACCOUNT_USERNAME_REQUIRED = True

# Configuración heredada
REST_AUTH_SERIALIZERS = {
    'USER_DETAILS_SERIALIZER': 'gestion.api.serializers.UserSerializer',
}

# Configuración moderna (dj-rest-auth >= 2.1.0)
REST_AUTH = {
    'USER_DETAILS_SERIALIZER': 'gestion.api.serializers.UserSerializer',
    'USE_JWT': False,
}

# En desarrollo, si prefieres permitir todos los orígenes usa:
# CORS_ALLOW_ALL_ORIGINS = True

ROOT_URLCONF = 'sismepa.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'sismepa.wsgi.application'


# Base de datos
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', 'unefa_monitoring_db'),
        'USER': os.environ.get('POSTGRES_USER', 'unefa_user'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', '123456'),
        'HOST': os.environ.get('POSTGRES_HOST', 'db'),
        'PORT': os.environ.get('POSTGRES_PORT', '5432'),
    }
}


# Validación de contraseñas
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internacionalización
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'es-ve'

TIME_ZONE = 'America/Caracas'

USE_I18N = True

USE_TZ = True


# Archivos estáticos (CSS, JavaScript, Imágenes)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'

# Archivos de medios (subidas de usuarios)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Tamaño máximo de subida (bytes) - opcional
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB

# Tipo de campo de clave primaria por defecto
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Registro de logs: consola + archivo para desarrollo
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': '[%(asctime)s] %(levelname)s %(name)s: %(message)s'
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'standard',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'sismepa.log',
            'formatter': 'standard',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
}
