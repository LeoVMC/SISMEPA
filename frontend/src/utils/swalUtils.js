import Swal from 'sweetalert2'

// Configuración base para tema oscuro/claro
const getThemeColors = () => {
    const isDark = document.documentElement.classList.contains('dark')
    return {
        background: isDark ? '#111827' : '#ffffff',
        text: isDark ? '#f3f4f6' : '#1f2937',
        confirmButton: '#3b82f6',
        cancelButton: isDark ? '#374151' : '#6b7280',
        iconColor: isDark ? '#60a5fa' : '#3b82f6',
    }
}

// SweetAlert mixin con estilos del proyecto
const createThemedSwal = () => {
    const colors = getThemeColors()
    return Swal.mixin({
        background: colors.background,
        color: colors.text,
        confirmButtonColor: colors.confirmButton,
        cancelButtonColor: colors.cancelButton,
        customClass: {
            popup: 'rounded-xl shadow-soft-lg border border-gray-200 dark:border-gray-700',
            title: 'text-lg font-bold',
            htmlContainer: 'text-sm',
            confirmButton: 'rounded-lg px-4 py-2 font-medium transition-all duration-200',
            cancelButton: 'rounded-lg px-4 py-2 font-medium transition-all duration-200',
        },
        buttonsStyling: true,
    })
}

// Alerta de éxito
export const showSuccess = (title, text = '') => {
    return createThemedSwal().fire({
        icon: 'success',
        title,
        text,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
    })
}

// Alerta de error
export const showError = (title, text = '') => {
    return createThemedSwal().fire({
        icon: 'error',
        title,
        text,
        confirmButtonText: 'Entendido',
    })
}

// Alerta de información
export const showInfo = (title, text = '') => {
    return createThemedSwal().fire({
        icon: 'info',
        title,
        text,
        confirmButtonText: 'Aceptar',
    })
}

// Alerta de advertencia
export const showWarning = (title, text = '') => {
    return createThemedSwal().fire({
        icon: 'warning',
        title,
        text,
        confirmButtonText: 'Aceptar',
    })
}

// Diálogo de confirmación
export const showConfirm = async (title, text = '', confirmText = 'Sí, confirmar', cancelText = 'Cancelar') => {
    const result = await createThemedSwal().fire({
        icon: 'question',
        title,
        text,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        reverseButtons: true,
    })
    return result.isConfirmed
}

// Diálogo de confirmación para eliminación (estilo peligroso)
export const showDeleteConfirm = async (title, text = '') => {
    const colors = getThemeColors()
    const result = await Swal.fire({
        icon: 'warning',
        title,
        text,
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: colors.cancelButton,
        background: colors.background,
        color: colors.text,
        reverseButtons: true,
        customClass: {
            popup: 'rounded-xl shadow-soft-lg border border-gray-200 dark:border-gray-700',
            confirmButton: 'rounded-lg px-4 py-2 font-medium',
            cancelButton: 'rounded-lg px-4 py-2 font-medium',
        },
    })
    return result.isConfirmed
}

// Toast notification
export const showToast = (icon, title) => {
    const colors = getThemeColors()
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: colors.background,
        color: colors.text,
        customClass: {
            popup: 'rounded-lg shadow-soft border border-gray-200 dark:border-gray-700',
        },
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer
            toast.onmouseleave = Swal.resumeTimer
        }
    })
    return Toast.fire({ icon, title })
}

export default {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showConfirm,
    showDeleteConfirm,
    showToast,
}
