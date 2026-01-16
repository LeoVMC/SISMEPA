/**
 * Servicio centralizado para peticiones API.
 * Maneja automáticamente:
 * - URL base desde variables de entorno
 * - Headers de autenticación (Token)
 * - Errores de red comunes
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Realiza una petición fetch con los headers configurados.
 * @param {string} endpoint - El endpoint relativo (ej: '/auth/login/')
 * @param {object} options - Opciones estándar de fetch (method, body, headers, etc)
 */
export async function apiCall(endpoint, options = {}) {
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${BASE_URL}${path}`;

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('apiToken');
    if (token) {
        defaultHeaders['Authorization'] = `Token ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        if (response.status === 401) {
        }

        return response;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}

export default {
    get: (endpoint) => apiCall(endpoint, { method: 'GET' }),
    post: (endpoint, body) => apiCall(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => apiCall(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    patch: (endpoint, body) => apiCall(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (endpoint) => apiCall(endpoint, { method: 'DELETE' }),
};
