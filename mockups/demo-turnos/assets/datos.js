// Encastre Turnos · demo — todo es inventado (negocio, personas, teléfonos, precios y turnos).
// Para clonar la demo a otro rubro (consultorio, barbería, gimnasio…) alcanza con cambiar este archivo.
window.DEMO_DATA = {
  negocio: {
    nombre: 'Estudio de ejemplo',
    rubro: 'Peluquería y estética',
    abre: '09:00',
    cierra: '20:00',
    paso: 30, // minutos entre turnos posibles
    dias: [1, 2, 3, 4, 5, 6], // lunes a sábado
    direccion: 'Calle Falsa 123',
  },
  profesionales: [
    { id: 'carla', nombre: 'Carla', rol: 'Peluquería', iniciales: 'CA', color: 'a' },
    { id: 'nati', nombre: 'Nati', rol: 'Manos y pies', iniciales: 'NA', color: 'b' },
    { id: 'sofi', nombre: 'Sofi', rol: 'Estética', iniciales: 'SO', color: 'c' },
  ],
  servicios: [
    { id: 'corte', nombre: 'Corte', dur: 30, precio: 12000, prof: ['carla'] },
    { id: 'brushing', nombre: 'Brushing', dur: 30, precio: 9000, prof: ['carla'] },
    { id: 'color', nombre: 'Color', dur: 90, precio: 38000, prof: ['carla'] },
    { id: 'semi', nombre: 'Esmaltado semipermanente', dur: 60, precio: 15000, prof: ['nati'] },
    { id: 'pedi', nombre: 'Pedicuría', dur: 60, precio: 16000, prof: ['nati'] },
    { id: 'facial', nombre: 'Limpieza facial', dur: 60, precio: 20000, prof: ['sofi'] },
    { id: 'cejas', nombre: 'Perfilado de cejas', dur: 30, precio: 7000, prof: ['sofi'] },
  ],
  clientes: [
    { id: 'c01', nombre: 'Lucía Benítez', tel: '376 •••-0101' },
    { id: 'c02', nombre: 'Marta Sosa', tel: '376 •••-0102' },
    { id: 'c03', nombre: 'Florencia Ríos', tel: '376 •••-0103' },
    { id: 'c04', nombre: 'Daniela Acosta', tel: '376 •••-0104' },
    { id: 'c05', nombre: 'Paula Giménez', tel: '376 •••-0105' },
    { id: 'c06', nombre: 'Romina Ferreyra', tel: '376 •••-0106' },
    { id: 'c07', nombre: 'Valeria Duarte', tel: '376 •••-0107' },
    { id: 'c08', nombre: 'Camila Ortiz', tel: '376 •••-0108' },
    { id: 'c09', nombre: 'Natalia Aguirre', tel: '376 •••-0109' },
    { id: 'c10', nombre: 'Silvia Romero', tel: '376 •••-0110' },
    { id: 'c11', nombre: 'Agustina Vera', tel: '376 •••-0111' },
    { id: 'c12', nombre: 'Gabriela Medina', tel: '376 •••-0112' },
    { id: 'c13', nombre: 'Belén Castro', tel: '376 •••-0113' },
    { id: 'c14', nombre: 'Rocío Núñez', tel: '376 •••-0114' },
    { id: 'c15', nombre: 'Julieta Paz', tel: '376 •••-0115' },
    { id: 'c16', nombre: 'Andrea Molina', tel: '376 •••-0116' },
    { id: 'c17', nombre: 'Carolina Ledesma', tel: '376 •••-0117' },
    { id: 'c18', nombre: 'Mariana Cabrera', tel: '376 •••-0118' },
    { id: 'c19', nombre: 'Soledad Ruiz', tel: '376 •••-0119' },
    { id: 'c20', nombre: 'Victoria Herrera', tel: '376 •••-0120' },
    { id: 'c21', nombre: 'Laura Domínguez', tel: '376 •••-0121' },
    { id: 'c22', nombre: 'Noelia Franco', tel: '376 •••-0122' },
    { id: 'c23', nombre: 'Cecilia Morales', tel: '376 •••-0123' },
    { id: 'c24', nombre: 'Ana Villalba', tel: '376 •••-0124' },
  ],
};
