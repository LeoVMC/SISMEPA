/**
 * Datos simulados locales para cuando la API real no está disponible.
 * Evita depender de APIs externas como FakerAPI.
 */

const NOMBRES = [
    'Carlos', 'María', 'Juan', 'Ana', 'Pedro', 'Laura', 'Luis', 'Carmen',
    'José', 'Sofía', 'Miguel', 'Elena', 'Antonio', 'Patricia', 'Francisco',
    'Marta', 'David', 'Lucía', 'Javier', 'Isabella', 'Daniel', 'Valentina'
];

const APELLIDOS = [
    'García', 'Rodríguez', 'Martínez', 'López', 'González', 'Hernández',
    'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez',
    'Díaz', 'Reyes', 'Morales', 'Jiménez', 'Ruiz', 'Álvarez', 'Romero'
];

const DOMINIOS = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com'];

/**
 * Genera un usuario simulado basado en un índice (determinístico)
 */
export function generateMockUser(index, role = 'Estudiante') {
    const nombre = NOMBRES[index % NOMBRES.length];
    const apellido = APELLIDOS[(index * 3) % APELLIDOS.length];
    const dominio = DOMINIOS[index % DOMINIOS.length];
    const cedula = 10000000 + (index * 1234567) % 20000000;
    const telefono = `0414${(1000000 + index * 12345) % 9000000}`;

    return {
        id: `mock-${role.toLowerCase()}-${index}`,
        isMock: true,
        usuario: {
            first_name: nombre,
            last_name: apellido,
            email: `${nombre.toLowerCase()}.${apellido.toLowerCase()}@${dominio}`,
        },
        first_name: nombre,
        last_name: apellido,
        email: `${nombre.toLowerCase()}.${apellido.toLowerCase()}@${dominio}`,
        cedula: `V-${cedula}`,
        telefono: telefono,
        programa: null, // Se asigna dinámicamente
        tipo_contratacion: index % 2 === 0 ? 'Tiempo Completo' : 'Tiempo Parcial',
    };
}

/**
 * Genera una lista de usuarios simulados
 */
export function generateMockUsers(count, role = 'Estudiante', programas = []) {
    return Array.from({ length: count }, (_, i) => {
        const user = generateMockUser(i, role);
        if (programas.length > 0 && role === 'Estudiante') {
            user.programa = programas[i % programas.length];
        }
        return user;
    });
}

/**
 * Usuarios mock para la página de usuarios en línea
 */
export function generateOnlineUsers(count = 10) {
    const roles = ['Estudiante', 'Estudiante', 'Estudiante', 'Docente', 'Administrador'];
    const devices = ['Desktop', 'Mobile'];
    const activities = ['Ahora mismo', 'Hace 1 min', 'Hace 2 min', 'Hace 5 min'];

    return Array.from({ length: count }, (_, i) => {
        const nombre = NOMBRES[i % NOMBRES.length];
        const apellido = APELLIDOS[(i * 2) % APELLIDOS.length];
        const dominio = DOMINIOS[i % DOMINIOS.length];

        return {
            id: `mock-online-${i}`,
            name: `${nombre} ${apellido}`,
            email: `${nombre.toLowerCase()}.${apellido.toLowerCase()}@${dominio}`,
            role: roles[i % roles.length],
            status: i < count - 2 ? 'online' : 'idle',
            lastActivity: activities[i % activities.length],
            device: devices[i % devices.length],
        };
    });
}

export default {
    generateMockUser,
    generateMockUsers,
    generateOnlineUsers,
};
