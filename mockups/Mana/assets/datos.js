/* Generado por scripts/generar_datos.py - NO EDITAR A MANO.
   Datos SIMULADOS con estructura real del negocio.
   Semilla 20260922 - generado el 2026-09-22 */
window.DATOS = {
 "meta": {
  "generado": "2026-09-22",
  "semilla": 20260922,
  "periodoActual": "2026-09",
  "periodos": [
   "2026-09",
   "2026-08",
   "2026-07"
  ],
  "aviso": "Datos simulados. La estructura del negocio es real (rubros, dotacion, horarios); los numeros no salen de Holistor ni de Todosoft."
 },
 "negocio": {
  "nombre": "Panificados Maná",
  "bajada": "El origen del pan",
  "domicilio": "Av. Rep. Oriental del Uruguay 2677, Posadas",
  "empleados": 53,
  "cajas": 3,
  "horario": "24 horas, todos los días",
  "administrativos": 1,
  "administrativosAntes": 3
 },
 "rubros": [
  {
   "id": "pan",
   "nombre": "Pan"
  },
  {
   "id": "galleta",
   "nombre": "Galleta y torradas"
  },
  {
   "id": "facturas",
   "nombre": "Facturas"
  },
  {
   "id": "bizcochos",
   "nombre": "Bizcochos"
  },
  {
   "id": "chipas",
   "nombre": "Chipas"
  },
  {
   "id": "alfajores",
   "nombre": "Alfajores"
  },
  {
   "id": "tortas",
   "nombre": "Tortas"
  },
  {
   "id": "tartas",
   "nombre": "Tartas"
  },
  {
   "id": "postres",
   "nombre": "Postres"
  },
  {
   "id": "masas",
   "nombre": "Masas finas"
  },
  {
   "id": "especiales",
   "nombre": "Sin TACC y sin lactosa"
  }
 ],
 "proveedores": [
  {
   "nombre": "Molinos del Litoral SA",
   "cuit": "30-61234567-8",
   "rubro": "Harinas"
  },
  {
   "nombre": "Distribuidora Guaraní SRL",
   "cuit": "30-70987654-3",
   "rubro": "Almacén"
  },
  {
   "nombre": "Lácteos Posadas SA",
   "cuit": "30-65432109-1",
   "rubro": "Lácteos"
  },
  {
   "nombre": "Huevos San José",
   "cuit": "20-24567890-5",
   "rubro": "Huevos"
  },
  {
   "nombre": "Insumos Misioneros SRL",
   "cuit": "30-71234509-6",
   "rubro": "Envases"
  },
  {
   "nombre": "Azucarera del Norte SA",
   "cuit": "30-60112233-4",
   "rubro": "Azúcar"
  },
  {
   "nombre": "Grasas y Margarinas del Sur",
   "cuit": "30-68877665-2",
   "rubro": "Grasas"
  },
  {
   "nombre": "Frigorífico Iguazú SA",
   "cuit": "30-63344556-7",
   "rubro": "Fiambres"
  },
  {
   "nombre": "Chocolates Paraná SRL",
   "cuit": "30-71199887-0",
   "rubro": "Chocolate"
  },
  {
   "nombre": "Frutas del Alto Uruguay",
   "cuit": "20-27889900-1",
   "rubro": "Frutas"
  },
  {
   "nombre": "Papelera Posadas SRL",
   "cuit": "30-70011223-9",
   "rubro": "Descartables"
  },
  {
   "nombre": "Energía de Misiones",
   "cuit": "30-99887766-5",
   "rubro": "Servicios"
  }
 ],
 "productos": [
  {
   "id": "P001",
   "nombre": "Pan francés",
   "rubro": "pan",
   "unidad": "kg",
   "precio": 3450,
   "precioDesde": "2026-06-30",
   "costo": 2034,
   "costoAnterior": 1912,
   "fechaCosto": "2026-07-18",
   "proveedor": "Molinos del Litoral SA",
   "margen": 41.0,
   "margenObjetivo": 38,
   "precioSugerido": 3280,
   "ventaMes": 1617
  },
  {
   "id": "P002",
   "nombre": "Pan de campo",
   "rubro": "pan",
   "unidad": "kg",
   "precio": 4200,
   "precioDesde": "2026-06-28",
   "costo": 3237,
   "costoAnterior": 2653,
   "fechaCosto": "2026-08-29",
   "proveedor": "Molinos del Litoral SA",
   "margen": 22.9,
   "margenObjetivo": 38,
   "precioSugerido": 5220,
   "ventaMes": 1221
  },
  {
   "id": "P003",
   "nombre": "Pan casero",
   "rubro": "pan",
   "unidad": "unidad",
   "precio": 2800,
   "precioDesde": "2026-06-09",
   "costo": 1764,
   "costoAnterior": 1605,
   "fechaCosto": "2026-04-18",
   "proveedor": "Molinos del Litoral SA",
   "margen": 37.0,
   "margenObjetivo": 38,
   "precioSugerido": 2850,
   "ventaMes": 1116
  },
  {
   "id": "P004",
   "nombre": "Pan lactal",
   "rubro": "pan",
   "unidad": "unidad",
   "precio": 4600,
   "precioDesde": "2026-06-18",
   "costo": 2818,
   "costoAnterior": 2705,
   "fechaCosto": "2026-04-04",
   "proveedor": "Molinos del Litoral SA",
   "margen": 38.7,
   "margenObjetivo": 38,
   "precioSugerido": 4550,
   "ventaMes": 446
  },
  {
   "id": "P005",
   "nombre": "Pan integral",
   "rubro": "pan",
   "unidad": "kg",
   "precio": 4800,
   "precioDesde": "2026-06-25",
   "costo": 2985,
   "costoAnterior": 2716,
   "fechaCosto": "2026-07-17",
   "proveedor": "Molinos del Litoral SA",
   "margen": 37.8,
   "margenObjetivo": 38,
   "precioSugerido": 4810,
   "ventaMes": 547
  },
  {
   "id": "P006",
   "nombre": "Pan de salvado",
   "rubro": "pan",
   "unidad": "kg",
   "precio": 4900,
   "precioDesde": "2026-08-01",
   "costo": 3178,
   "costoAnterior": 2943,
   "fechaCosto": "2026-09-12",
   "proveedor": "Molinos del Litoral SA",
   "margen": 35.1,
   "margenObjetivo": 38,
   "precioSugerido": 5130,
   "ventaMes": 430
  },
  {
   "id": "P007",
   "nombre": "Pan árabe x6",
   "rubro": "pan",
   "unidad": "paquete",
   "precio": 2600,
   "precioDesde": "2026-08-25",
   "costo": 1863,
   "costoAnterior": 1527,
   "fechaCosto": "2026-09-10",
   "proveedor": "Molinos del Litoral SA",
   "margen": 28.3,
   "margenObjetivo": 38,
   "precioSugerido": 3000,
   "ventaMes": 625
  },
  {
   "id": "P008",
   "nombre": "Pan de hamburguesa x6",
   "rubro": "pan",
   "unidad": "paquete",
   "precio": 3100,
   "precioDesde": "2026-08-02",
   "costo": 1942,
   "costoAnterior": 1825,
   "fechaCosto": "2026-06-22",
   "proveedor": "Molinos del Litoral SA",
   "margen": 37.4,
   "margenObjetivo": 38,
   "precioSugerido": 3130,
   "ventaMes": 598
  },
  {
   "id": "P009",
   "nombre": "Pan de pancho x6",
   "rubro": "pan",
   "unidad": "paquete",
   "precio": 2950,
   "precioDesde": "2026-08-31",
   "costo": 2263,
   "costoAnterior": 1855,
   "fechaCosto": "2026-08-28",
   "proveedor": "Molinos del Litoral SA",
   "margen": 23.3,
   "margenObjetivo": 38,
   "precioSugerido": 3650,
   "ventaMes": 430
  },
  {
   "id": "P010",
   "nombre": "Pan saborizado",
   "rubro": "pan",
   "unidad": "unidad",
   "precio": 3900,
   "precioDesde": "2026-08-11",
   "costo": 2431,
   "costoAnterior": 2212,
   "fechaCosto": "2026-08-08",
   "proveedor": "Molinos del Litoral SA",
   "margen": 37.7,
   "margenObjetivo": 38,
   "precioSugerido": 3920,
   "ventaMes": 277
  },
  {
   "id": "P011",
   "nombre": "Baguette",
   "rubro": "pan",
   "unidad": "unidad",
   "precio": 2400,
   "precioDesde": "2026-08-14",
   "costo": 1729,
   "costoAnterior": 1417,
   "fechaCosto": "2026-08-27",
   "proveedor": "Molinos del Litoral SA",
   "margen": 28.0,
   "margenObjetivo": 38,
   "precioSugerido": 2790,
   "ventaMes": 620
  },
  {
   "id": "P012",
   "nombre": "Pan de centeno",
   "rubro": "pan",
   "unidad": "kg",
   "precio": 5600,
   "precioDesde": "2026-08-31",
   "costo": 4271,
   "costoAnterior": 3501,
   "fechaCosto": "2026-09-15",
   "proveedor": "Molinos del Litoral SA",
   "margen": 23.7,
   "margenObjetivo": 38,
   "precioSugerido": 6890,
   "ventaMes": 178
  },
  {
   "id": "P013",
   "nombre": "Galleta de campo",
   "rubro": "galleta",
   "unidad": "kg",
   "precio": 4100,
   "precioDesde": "2026-07-20",
   "costo": 2701,
   "costoAnterior": 2289,
   "fechaCosto": "2026-09-06",
   "proveedor": "Molinos del Litoral SA",
   "margen": 34.1,
   "margenObjetivo": 42,
   "precioSugerido": 4660,
   "ventaMes": 372
  },
  {
   "id": "P014",
   "nombre": "Galleta marina",
   "rubro": "galleta",
   "unidad": "kg",
   "precio": 3900,
   "precioDesde": "2026-07-21",
   "costo": 2739,
   "costoAnterior": 2245,
   "fechaCosto": "2026-09-05",
   "proveedor": "Molinos del Litoral SA",
   "margen": 29.8,
   "margenObjetivo": 42,
   "precioSugerido": 4720,
   "ventaMes": 269
  },
  {
   "id": "P015",
   "nombre": "Torradas clásicas",
   "rubro": "galleta",
   "unidad": "paquete",
   "precio": 2700,
   "precioDesde": "2026-09-01",
   "costo": 1473,
   "costoAnterior": 1414,
   "fechaCosto": "2026-05-21",
   "proveedor": "Molinos del Litoral SA",
   "margen": 45.4,
   "margenObjetivo": 42,
   "precioSugerido": 2540,
   "ventaMes": 204
  },
  {
   "id": "P016",
   "nombre": "Torradas integrales",
   "rubro": "galleta",
   "unidad": "paquete",
   "precio": 3000,
   "precioDesde": "2026-06-17",
   "costo": 1642,
   "costoAnterior": 1576,
   "fechaCosto": "2026-04-05",
   "proveedor": "Molinos del Litoral SA",
   "margen": 45.3,
   "margenObjetivo": 42,
   "precioSugerido": 2830,
   "ventaMes": 243
  },
  {
   "id": "P017",
   "nombre": "Grisines",
   "rubro": "galleta",
   "unidad": "paquete",
   "precio": 2300,
   "precioDesde": "2026-08-07",
   "costo": 1339,
   "costoAnterior": 1218,
   "fechaCosto": "2026-06-08",
   "proveedor": "Molinos del Litoral SA",
   "margen": 41.8,
   "margenObjetivo": 42,
   "precioSugerido": 2310,
   "ventaMes": 213
  },
  {
   "id": "P018",
   "nombre": "Palitos de queso",
   "rubro": "galleta",
   "unidad": "paquete",
   "precio": 2900,
   "precioDesde": "2026-06-15",
   "costo": 1664,
   "costoAnterior": 1597,
   "fechaCosto": "2026-08-04",
   "proveedor": "Molinos del Litoral SA",
   "margen": 42.6,
   "margenObjetivo": 42,
   "precioSugerido": 2870,
   "ventaMes": 165
  },
  {
   "id": "P019",
   "nombre": "Medialuna de manteca",
   "rubro": "facturas",
   "unidad": "unidad",
   "precio": 700,
   "precioDesde": "2026-07-19",
   "costo": 362,
   "costoAnterior": 329,
   "fechaCosto": "2026-07-29",
   "proveedor": "Grasas y Margarinas del Sur",
   "margen": 48.3,
   "margenObjetivo": 45,
   "precioSugerido": 660,
   "ventaMes": 8059
  },
  {
   "id": "P020",
   "nombre": "Medialuna de grasa",
   "rubro": "facturas",
   "unidad": "unidad",
   "precio": 620,
   "precioDesde": "2026-08-17",
   "costo": 332,
   "costoAnterior": 302,
   "fechaCosto": "2026-03-27",
   "proveedor": "Grasas y Margarinas del Sur",
   "margen": 46.5,
   "margenObjetivo": 45,
   "precioSugerido": 600,
   "ventaMes": 4679
  },
  {
   "id": "P021",
   "nombre": "Vigilante",
   "rubro": "facturas",
   "unidad": "unidad",
   "precio": 680,
   "precioDesde": "2026-05-29",
   "costo": 415,
   "costoAnterior": 374,
   "fechaCosto": "2026-09-20",
   "proveedor": "Grasas y Margarinas del Sur",
   "margen": 39.0,
   "margenObjetivo": 45,
   "precioSugerido": 750,
   "ventaMes": 3715
  },
  {
   "id": "P022",
   "nombre": "Cañoncito de dulce de leche",
   "rubro": "facturas",
   "unidad": "unidad",
   "precio": 950,
   "precioDesde": "2026-06-30",
   "costo": 514,
   "costoAnterior": 493,
   "fechaCosto": "2026-08-05",
   "proveedor": "Grasas y Margarinas del Sur",
   "margen": 45.9,
   "margenObjetivo": 45,
   "precioSugerido": 930,
   "ventaMes": 1821
  },
  {
   "id": "P023",
   "nombre": "Churro relleno",
   "rubro": "facturas",
   "unidad": "unidad",
   "precio": 1050,
   "precioDesde": "2026-08-23",
   "costo": 593,
   "costoAnterior": 549,
   "fechaCosto": "2026-09-07",
   "proveedor": "Grasas y Margarinas del Sur",
   "margen": 43.5,
   "margenObjetivo": 45,
   "precioSugerido": 1080,
   "ventaMes": 1207
  },
  {
   "id": "P024",
   "nombre": "Bola de fraile",
   "rubro": "facturas",
   "unidad": "unidad",
   "precio": 880,
   "precioDesde": "2026-07-15",
   "costo": 456,
   "costoAnterior": 429,
   "fechaCosto": "2026-04-17",
   "proveedor": "Grasas y Margarinas del Sur",
   "margen": 48.2,
   "margenObjetivo": 45,
   "precioSugerido": 830,
   "ventaMes": 1547
  },
  {
   "id": "P025",
   "nombre": "Sacramento",
   "rubro": "facturas",
   "unidad": "unidad",
   "precio": 900,
   "precioDesde": "2026-08-28",
   "costo": 555,
   "costoAnterior": 500,
   "fechaCosto": "2026-09-10",
   "proveedor": "Grasas y Margarinas del Sur",
   "margen": 38.3,
   "margenObjetivo": 45,
   "precioSugerido": 1010,
   "ventaMes": 1175
  },
  {
   "id": "P026",
   "nombre": "Docena surtida",
   "rubro": "facturas",
   "unidad": "docena",
   "precio": 8400,
   "precioDesde": "2026-07-07",
   "costo": 4397,
   "costoAnterior": 4001,
   "fechaCosto": "2026-04-23",
   "proveedor": "Grasas y Margarinas del Sur",
   "margen": 47.7,
   "margenObjetivo": 45,
   "precioSugerido": 7990,
   "ventaMes": 103
  },
  {
   "id": "P027",
   "nombre": "Bizcocho de grasa",
   "rubro": "bizcochos",
   "unidad": "kg",
   "precio": 5200,
   "precioDesde": "2026-07-09",
   "costo": 2776,
   "costoAnterior": 2609,
   "fechaCosto": "2026-06-14",
   "proveedor": "Grasas y Margarinas del Sur",
   "margen": 46.6,
   "margenObjetivo": 44,
   "precioSugerido": 4960,
   "ventaMes": 415
  },
  {
   "id": "P028",
   "nombre": "Bizcocho dulce",
   "rubro": "bizcochos",
   "unidad": "kg",
   "precio": 5600,
   "precioDesde": "2026-07-07",
   "costo": 3241,
   "costoAnterior": 3058,
   "fechaCosto": "2026-09-10",
   "proveedor": "Grasas y Margarinas del Sur",
   "margen": 42.1,
   "margenObjetivo": 44,
   "precioSugerido": 5790,
   "ventaMes": 323
  },
  {
   "id": "P029",
   "nombre": "Bizcochuelo",
   "rubro": "bizcochos",
   "unidad": "unidad",
   "precio": 6800,
   "precioDesde": "2026-08-27",
   "costo": 3597,
   "costoAnterior": 3453,
   "fechaCosto": "2026-06-16",
   "proveedor": "Grasas y Margarinas del Sur",
   "margen": 47.1,
   "margenObjetivo": 44,
   "precioSugerido": 6420,
   "ventaMes": 209
  },
  {
   "id": "P030",
   "nombre": "Budín de limón",
   "rubro": "bizcochos",
   "unidad": "unidad",
   "precio": 7400,
   "precioDesde": "2026-07-16",
   "costo": 4170,
   "costoAnterior": 3920,
   "fechaCosto": "2026-06-16",
   "proveedor": "Grasas y Margarinas del Sur",
   "margen": 43.6,
   "margenObjetivo": 44,
   "precioSugerido": 7450,
   "ventaMes": 143
  },
  {
   "id": "P031",
   "nombre": "Budín marmolado",
   "rubro": "bizcochos",
   "unidad": "unidad",
   "precio": 7400,
   "precioDesde": "2026-07-31",
   "costo": 3970,
   "costoAnterior": 3811,
   "fechaCosto": "2026-05-08",
   "proveedor": "Grasas y Margarinas del Sur",
   "margen": 46.4,
   "margenObjetivo": 44,
   "precioSugerido": 7090,
   "ventaMes": 100
  },
  {
   "id": "P032",
   "nombre": "Roscas de anís",
   "rubro": "bizcochos",
   "unidad": "kg",
   "precio": 5900,
   "precioDesde": "2026-07-16",
   "costo": 3312,
   "costoAnterior": 3113,
   "fechaCosto": "2026-06-01",
   "proveedor": "Grasas y Margarinas del Sur",
   "margen": 43.9,
   "margenObjetivo": 44,
   "precioSugerido": 5910,
   "ventaMes": 90
  },
  {
   "id": "P033",
   "nombre": "Chipa tradicional",
   "rubro": "chipas",
   "unidad": "kg",
   "precio": 7200,
   "precioDesde": "2026-07-25",
   "costo": 4318,
   "costoAnterior": 3659,
   "fechaCosto": "2026-09-07",
   "proveedor": "Lácteos Posadas SA",
   "margen": 40.0,
   "margenObjetivo": 46,
   "precioSugerido": 8000,
   "ventaMes": 361
  },
  {
   "id": "P034",
   "nombre": "Chipa mbocá",
   "rubro": "chipas",
   "unidad": "unidad",
   "precio": 1400,
   "precioDesde": "2026-06-24",
   "costo": 723,
   "costoAnterior": 658,
   "fechaCosto": "2026-05-27",
   "proveedor": "Lácteos Posadas SA",
   "margen": 48.4,
   "margenObjetivo": 46,
   "precioSugerido": 1340,
   "ventaMes": 1129
  },
  {
   "id": "P035",
   "nombre": "Chipa guazú porción",
   "rubro": "chipas",
   "unidad": "porción",
   "precio": 2600,
   "precioDesde": "2026-08-13",
   "costo": 1379,
   "costoAnterior": 1296,
   "fechaCosto": "2026-06-09",
   "proveedor": "Lácteos Posadas SA",
   "margen": 47.0,
   "margenObjetivo": 46,
   "precioSugerido": 2550,
   "ventaMes": 627
  },
  {
   "id": "P036",
   "nombre": "Mbejú",
   "rubro": "chipas",
   "unidad": "unidad",
   "precio": 2100,
   "precioDesde": "2026-08-12",
   "costo": 1108,
   "costoAnterior": 1064,
   "fechaCosto": "2026-04-27",
   "proveedor": "Lácteos Posadas SA",
   "margen": 47.2,
   "margenObjetivo": 46,
   "precioSugerido": 2050,
   "ventaMes": 562
  },
  {
   "id": "P037",
   "nombre": "Chipa So'o",
   "rubro": "chipas",
   "unidad": "unidad",
   "precio": 2400,
   "precioDesde": "2026-06-24",
   "costo": 1284,
   "costoAnterior": 1207,
   "fechaCosto": "2026-06-23",
   "proveedor": "Lácteos Posadas SA",
   "margen": 46.5,
   "margenObjetivo": 46,
   "precioSugerido": 2380,
   "ventaMes": 301
  },
  {
   "id": "P038",
   "nombre": "Alfajor de maicena",
   "rubro": "alfajores",
   "unidad": "unidad",
   "precio": 1500,
   "precioDesde": "2026-06-10",
   "costo": 781,
   "costoAnterior": 734,
   "fechaCosto": "2026-04-24",
   "proveedor": "Chocolates Paraná SRL",
   "margen": 47.9,
   "margenObjetivo": 48,
   "precioSugerido": 1500,
   "ventaMes": 1257
  },
  {
   "id": "P039",
   "nombre": "Alfajor de chocolate",
   "rubro": "alfajores",
   "unidad": "unidad",
   "precio": 1750,
   "precioDesde": "2026-06-28",
   "costo": 894,
   "costoAnterior": 814,
   "fechaCosto": "2026-04-04",
   "proveedor": "Chocolates Paraná SRL",
   "margen": 48.9,
   "margenObjetivo": 48,
   "precioSugerido": 1720,
   "ventaMes": 476
  },
  {
   "id": "P040",
   "nombre": "Alfajor marplatense",
   "rubro": "alfajores",
   "unidad": "unidad",
   "precio": 1900,
   "precioDesde": "2026-07-30",
   "costo": 1204,
   "costoAnterior": 987,
   "fechaCosto": "2026-09-09",
   "proveedor": "Chocolates Paraná SRL",
   "margen": 36.6,
   "margenObjetivo": 48,
   "precioSugerido": 2320,
   "ventaMes": 341
  },
  {
   "id": "P041",
   "nombre": "Caja de alfajores x6",
   "rubro": "alfajores",
   "unidad": "caja",
   "precio": 9600,
   "precioDesde": "2026-06-25",
   "costo": 4698,
   "costoAnterior": 4416,
   "fechaCosto": "2026-05-26",
   "proveedor": "Chocolates Paraná SRL",
   "margen": 51.1,
   "margenObjetivo": 48,
   "precioSugerido": 9030,
   "ventaMes": 51
  },
  {
   "id": "P042",
   "nombre": "Torta selva negra",
   "rubro": "tortas",
   "unidad": "unidad",
   "precio": 34000,
   "precioDesde": "2026-08-16",
   "costo": 15487,
   "costoAnterior": 14868,
   "fechaCosto": "2026-04-20",
   "proveedor": "Lácteos Posadas SA",
   "margen": 54.4,
   "margenObjetivo": 52,
   "precioSugerido": 32260,
   "ventaMes": 93
  },
  {
   "id": "P043",
   "nombre": "Torta chocotorta",
   "rubro": "tortas",
   "unidad": "unidad",
   "precio": 29000,
   "precioDesde": "2026-09-01",
   "costo": 13562,
   "costoAnterior": 13020,
   "fechaCosto": "2026-05-04",
   "proveedor": "Lácteos Posadas SA",
   "margen": 53.2,
   "margenObjetivo": 52,
   "precioSugerido": 28250,
   "ventaMes": 50
  },
  {
   "id": "P044",
   "nombre": "Torta de frutilla",
   "rubro": "tortas",
   "unidad": "unidad",
   "precio": 32000,
   "precioDesde": "2026-07-14",
   "costo": 16283,
   "costoAnterior": 15077,
   "fechaCosto": "2026-09-04",
   "proveedor": "Lácteos Posadas SA",
   "margen": 49.1,
   "margenObjetivo": 52,
   "precioSugerido": 33920,
   "ventaMes": 41
  },
  {
   "id": "P045",
   "nombre": "Torta rogel",
   "rubro": "tortas",
   "unidad": "unidad",
   "precio": 36000,
   "precioDesde": "2026-05-28",
   "costo": 18763,
   "costoAnterior": 16459,
   "fechaCosto": "2026-09-18",
   "proveedor": "Lácteos Posadas SA",
   "margen": 47.9,
   "margenObjetivo": 52,
   "precioSugerido": 39090,
   "ventaMes": 33
  },
  {
   "id": "P046",
   "nombre": "Torta infantil decorada",
   "rubro": "tortas",
   "unidad": "unidad",
   "precio": 48000,
   "precioDesde": "2026-06-19",
   "costo": 24365,
   "costoAnterior": 21373,
   "fechaCosto": "2026-09-09",
   "proveedor": "Lácteos Posadas SA",
   "margen": 49.2,
   "margenObjetivo": 52,
   "precioSugerido": 50760,
   "ventaMes": 15
  },
  {
   "id": "P047",
   "nombre": "Torta de cumpleaños clásica",
   "rubro": "tortas",
   "unidad": "unidad",
   "precio": 28000,
   "precioDesde": "2026-07-22",
   "costo": 14078,
   "costoAnterior": 12683,
   "fechaCosto": "2026-09-14",
   "proveedor": "Lácteos Posadas SA",
   "margen": 49.7,
   "margenObjetivo": 52,
   "precioSugerido": 29330,
   "ventaMes": 33
  },
  {
   "id": "P048",
   "nombre": "Cheesecake de frambuesa",
   "rubro": "tortas",
   "unidad": "unidad",
   "precio": 33000,
   "precioDesde": "2026-07-04",
   "costo": 15849,
   "costoAnterior": 14423,
   "fechaCosto": "2026-07-15",
   "proveedor": "Lácteos Posadas SA",
   "margen": 52.0,
   "margenObjetivo": 52,
   "precioSugerido": 33020,
   "ventaMes": 26
  },
  {
   "id": "P049",
   "nombre": "Tarta de ricota",
   "rubro": "tartas",
   "unidad": "unidad",
   "precio": 16500,
   "precioDesde": "2026-06-28",
   "costo": 8383,
   "costoAnterior": 8048,
   "fechaCosto": "2026-08-08",
   "proveedor": "Frigorífico Iguazú SA",
   "margen": 49.2,
   "margenObjetivo": 46,
   "precioSugerido": 15520,
   "ventaMes": 134
  },
  {
   "id": "P050",
   "nombre": "Tarta de manzana",
   "rubro": "tartas",
   "unidad": "unidad",
   "precio": 17800,
   "precioDesde": "2026-07-22",
   "costo": 10749,
   "costoAnterior": 9684,
   "fechaCosto": "2026-09-06",
   "proveedor": "Frigorífico Iguazú SA",
   "margen": 39.6,
   "margenObjetivo": 46,
   "precioSugerido": 19910,
   "ventaMes": 75
  },
  {
   "id": "P051",
   "nombre": "Pascualina",
   "rubro": "tartas",
   "unidad": "unidad",
   "precio": 15200,
   "precioDesde": "2026-08-05",
   "costo": 10202,
   "costoAnterior": 8362,
   "fechaCosto": "2026-09-14",
   "proveedor": "Frigorífico Iguazú SA",
   "margen": 32.9,
   "margenObjetivo": 46,
   "precioSugerido": 18890,
   "ventaMes": 53
  },
  {
   "id": "P052",
   "nombre": "Tarta de jamón y queso",
   "rubro": "tartas",
   "unidad": "unidad",
   "precio": 16900,
   "precioDesde": "2026-08-04",
   "costo": 8959,
   "costoAnterior": 8153,
   "fechaCosto": "2026-05-21",
   "proveedor": "Frigorífico Iguazú SA",
   "margen": 47.0,
   "margenObjetivo": 46,
   "precioSugerido": 16590,
   "ventaMes": 50
  },
  {
   "id": "P053",
   "nombre": "Tarta de verdura",
   "rubro": "tartas",
   "unidad": "unidad",
   "precio": 15800,
   "precioDesde": "2026-08-09",
   "costo": 8431,
   "costoAnterior": 7925,
   "fechaCosto": "2026-04-25",
   "proveedor": "Frigorífico Iguazú SA",
   "margen": 46.6,
   "margenObjetivo": 46,
   "precioSugerido": 15610,
   "ventaMes": 38
  },
  {
   "id": "P054",
   "nombre": "Flan casero porción",
   "rubro": "postres",
   "unidad": "porción",
   "precio": 3200,
   "precioDesde": "2026-07-27",
   "costo": 1516,
   "costoAnterior": 1380,
   "fechaCosto": "2026-04-17",
   "proveedor": "Lácteos Posadas SA",
   "margen": 52.6,
   "margenObjetivo": 50,
   "precioSugerido": 3030,
   "ventaMes": 423
  },
  {
   "id": "P055",
   "nombre": "Tiramisú porción",
   "rubro": "postres",
   "unidad": "porción",
   "precio": 4600,
   "precioDesde": "2026-06-18",
   "costo": 2630,
   "costoAnterior": 2229,
   "fechaCosto": "2026-08-31",
   "proveedor": "Lácteos Posadas SA",
   "margen": 42.8,
   "margenObjetivo": 50,
   "precioSugerido": 5260,
   "ventaMes": 201
  },
  {
   "id": "P056",
   "nombre": "Mousse de chocolate",
   "rubro": "postres",
   "unidad": "porción",
   "precio": 4200,
   "precioDesde": "2026-08-07",
   "costo": 2039,
   "costoAnterior": 1957,
   "fechaCosto": "2026-08-13",
   "proveedor": "Lácteos Posadas SA",
   "margen": 51.5,
   "margenObjetivo": 50,
   "precioSugerido": 4080,
   "ventaMes": 180
  },
  {
   "id": "P057",
   "nombre": "Postre Balcarce porción",
   "rubro": "postres",
   "unidad": "porción",
   "precio": 4400,
   "precioDesde": "2026-08-20",
   "costo": 2161,
   "costoAnterior": 2075,
   "fechaCosto": "2026-06-18",
   "proveedor": "Lácteos Posadas SA",
   "margen": 50.9,
   "margenObjetivo": 50,
   "precioSugerido": 4320,
   "ventaMes": 94
  },
  {
   "id": "P058",
   "nombre": "Copa de frutas",
   "rubro": "postres",
   "unidad": "porción",
   "precio": 3900,
   "precioDesde": "2026-06-08",
   "costo": 1918,
   "costoAnterior": 1803,
   "fechaCosto": "2026-04-01",
   "proveedor": "Lácteos Posadas SA",
   "margen": 50.8,
   "margenObjetivo": 50,
   "precioSugerido": 3840,
   "ventaMes": 104
  },
  {
   "id": "P059",
   "nombre": "Masas finas surtidas",
   "rubro": "masas",
   "unidad": "kg",
   "precio": 26000,
   "precioDesde": "2026-06-09",
   "costo": 12189,
   "costoAnterior": 11092,
   "fechaCosto": "2026-05-19",
   "proveedor": "Huevos San José",
   "margen": 53.1,
   "margenObjetivo": 54,
   "precioSugerido": 26500,
   "ventaMes": 57
  },
  {
   "id": "P060",
   "nombre": "Masitas secas",
   "rubro": "masas",
   "unidad": "kg",
   "precio": 18500,
   "precioDesde": "2026-07-16",
   "costo": 7916,
   "costoAnterior": 7599,
   "fechaCosto": "2026-08-13",
   "proveedor": "Huevos San José",
   "margen": 57.2,
   "margenObjetivo": 54,
   "precioSugerido": 17210,
   "ventaMes": 50
  },
  {
   "id": "P061",
   "nombre": "Petit four",
   "rubro": "masas",
   "unidad": "kg",
   "precio": 24000,
   "precioDesde": "2026-06-07",
   "costo": 11033,
   "costoAnterior": 10371,
   "fechaCosto": "2026-06-23",
   "proveedor": "Huevos San José",
   "margen": 54.0,
   "margenObjetivo": 54,
   "precioSugerido": 23980,
   "ventaMes": 24
  },
  {
   "id": "P062",
   "nombre": "Bandeja de bocaditos",
   "rubro": "masas",
   "unidad": "bandeja",
   "precio": 21000,
   "precioDesde": "2026-06-13",
   "costo": 9025,
   "costoAnterior": 8664,
   "fechaCosto": "2026-04-27",
   "proveedor": "Huevos San José",
   "margen": 57.0,
   "margenObjetivo": 54,
   "precioSugerido": 19620,
   "ventaMes": 21
  },
  {
   "id": "P063",
   "nombre": "Pionono relleno",
   "rubro": "masas",
   "unidad": "unidad",
   "precio": 12500,
   "precioDesde": "2026-05-30",
   "costo": 5860,
   "costoAnterior": 5333,
   "fechaCosto": "2026-08-06",
   "proveedor": "Huevos San José",
   "margen": 53.1,
   "margenObjetivo": 54,
   "precioSugerido": 12740,
   "ventaMes": 35
  },
  {
   "id": "P064",
   "nombre": "Pan sin TACC",
   "rubro": "especiales",
   "unidad": "unidad",
   "precio": 6800,
   "precioDesde": "2026-06-11",
   "costo": 3362,
   "costoAnterior": 3059,
   "fechaCosto": "2026-08-06",
   "proveedor": "Distribuidora Guaraní SRL",
   "margen": 50.6,
   "margenObjetivo": 50,
   "precioSugerido": 6720,
   "ventaMes": 145
  },
  {
   "id": "P065",
   "nombre": "Budín sin TACC",
   "rubro": "especiales",
   "unidad": "unidad",
   "precio": 9200,
   "precioDesde": "2026-07-10",
   "costo": 4602,
   "costoAnterior": 4188,
   "fechaCosto": "2026-05-17",
   "proveedor": "Distribuidora Guaraní SRL",
   "margen": 50.0,
   "margenObjetivo": 50,
   "precioSugerido": 9200,
   "ventaMes": 68
  },
  {
   "id": "P066",
   "nombre": "Alfajor sin TACC",
   "rubro": "especiales",
   "unidad": "unidad",
   "precio": 2400,
   "precioDesde": "2026-08-05",
   "costo": 1326,
   "costoAnterior": 1195,
   "fechaCosto": "2026-09-06",
   "proveedor": "Distribuidora Guaraní SRL",
   "margen": 44.8,
   "margenObjetivo": 50,
   "precioSugerido": 2650,
   "ventaMes": 194
  },
  {
   "id": "P067",
   "nombre": "Torta sin lactosa",
   "rubro": "especiales",
   "unidad": "unidad",
   "precio": 41000,
   "precioDesde": "2026-06-16",
   "costo": 23717,
   "costoAnterior": 19440,
   "fechaCosto": "2026-09-08",
   "proveedor": "Distribuidora Guaraní SRL",
   "margen": 42.2,
   "margenObjetivo": 50,
   "precioSugerido": 47430,
   "ventaMes": 8
  },
  {
   "id": "P068",
   "nombre": "Galletitas sin TACC",
   "rubro": "especiales",
   "unidad": "paquete",
   "precio": 5400,
   "precioDesde": "2026-08-27",
   "costo": 3295,
   "costoAnterior": 2701,
   "fechaCosto": "2026-09-10",
   "proveedor": "Distribuidora Guaraní SRL",
   "margen": 39.0,
   "margenObjetivo": 50,
   "precioSugerido": 6590,
   "ventaMes": 53
  },
  {
   "id": "P069",
   "nombre": "Pan sin lactosa",
   "rubro": "especiales",
   "unidad": "unidad",
   "precio": 5600,
   "precioDesde": "2026-08-02",
   "costo": 2778,
   "costoAnterior": 2528,
   "fechaCosto": "2026-06-29",
   "proveedor": "Distribuidora Guaraní SRL",
   "margen": 50.4,
   "margenObjetivo": 50,
   "precioSugerido": 5560,
   "ventaMes": 40
  }
 ],
 "iva": {
  "2026-09": {
   "compras": {
    "neto": 47800000,
    "iva": 10038000,
    "comprobantes": 258,
    "fuente": "Holistor"
   },
   "ventas": {
    "neto": 96400000,
    "iva": 20244000,
    "comprobantes": 10137,
    "fuente": "Todosoft"
   },
   "diferencias": [
    {
     "id": "D0901",
     "tipo": "falta_holistor",
     "titulo": "No cargado en Holistor",
     "detalle": "El comprobante figura en ARCA pero nadie lo cargó en Holistor.",
     "comprobante": "Factura A 0005-00074053",
     "proveedor": "Papelera Posadas SRL",
     "cuit": "30-70011223-9",
     "fecha": "2026-09-13",
     "neto": 208100,
     "iva": 43701,
     "estado": "abierta",
     "fuentes": {
      "holistor": null,
      "todosoft": {
       "neto": 208100,
       "iva": 43701
      },
      "arca": {
       "neto": 208100,
       "iva": 43701
      }
     }
    },
    {
     "id": "D0902",
     "tipo": "falta_todosoft",
     "titulo": "No registrado en Todosoft",
     "detalle": "ARCA tiene la venta emitida, pero el cierre de caja no la incluye.",
     "comprobante": "Factura A 0002-00056054",
     "proveedor": "Frigorífico Iguazú SA",
     "cuit": "30-63344556-7",
     "fecha": "2026-09-05",
     "neto": 412000,
     "iva": 86520,
     "estado": "abierta",
     "fuentes": {
      "holistor": {
       "neto": 412000,
       "iva": 86520
      },
      "todosoft": null,
      "arca": {
       "neto": 412000,
       "iva": 86520
      }
     }
    },
    {
     "id": "D0903",
     "tipo": "monto",
     "titulo": "El IVA no coincide",
     "detalle": "En Holistor el IVA está cargado al 10,5% y en ARCA figura al 21%.",
     "comprobante": "Factura A 0002-00027922",
     "proveedor": "Chocolates Paraná SRL",
     "cuit": "30-71199887-0",
     "fecha": "2026-09-20",
     "neto": 246300,
     "iva": 51723,
     "estado": "abierta",
     "fuentes": {
      "holistor": {
       "neto": 246300,
       "iva": 25862
      },
      "todosoft": {
       "neto": 246300,
       "iva": 51723
      },
      "arca": {
       "neto": 246300,
       "iva": 51723
      }
     }
    },
    {
     "id": "D0904",
     "tipo": "duplicado",
     "titulo": "Cargado dos veces",
     "detalle": "El comprobante aparece repetido en Holistor.",
     "comprobante": "Factura A 0003-00050532",
     "proveedor": "Frutas del Alto Uruguay",
     "cuit": "20-27889900-1",
     "fecha": "2026-09-10",
     "neto": 329800,
     "iva": 69258,
     "estado": "abierta",
     "fuentes": {
      "holistor": {
       "neto": 329800,
       "iva": 69258
      },
      "todosoft": {
       "neto": 329800,
       "iva": 69258
      },
      "arca": {
       "neto": 329800,
       "iva": 69258
      }
     },
     "repeticiones": 2
    },
    {
     "id": "D0905",
     "tipo": "periodo",
     "titulo": "Fuera de período",
     "detalle": "Es una factura del mes anterior cargada en este período.",
     "comprobante": "Factura A 0003-00038137",
     "proveedor": "Insumos Misioneros SRL",
     "cuit": "30-71234509-6",
     "fecha": "2026-08-21",
     "neto": 132900,
     "iva": 27909,
     "estado": "abierta",
     "fuentes": {
      "holistor": {
       "neto": 132900,
       "iva": 27909
      },
      "todosoft": {
       "neto": 132900,
       "iva": 27909
      },
      "arca": {
       "neto": 132900,
       "iva": 27909
      }
     }
    },
    {
     "id": "D0906",
     "tipo": "falta_holistor",
     "titulo": "No cargado en Holistor",
     "detalle": "El comprobante figura en ARCA pero nadie lo cargó en Holistor.",
     "comprobante": "Factura A 0005-00049026",
     "proveedor": "Huevos San José",
     "cuit": "20-24567890-5",
     "fecha": "2026-09-05",
     "neto": 276400,
     "iva": 58044,
     "estado": "abierta",
     "fuentes": {
      "holistor": null,
      "todosoft": {
       "neto": 276400,
       "iva": 58044
      },
      "arca": {
       "neto": 276400,
       "iva": 58044
      }
     }
    },
    {
     "id": "D0907",
     "tipo": "falta_todosoft",
     "titulo": "No registrado en Todosoft",
     "detalle": "ARCA tiene la venta emitida, pero el cierre de caja no la incluye.",
     "comprobante": "Factura A 0005-00087004",
     "proveedor": "Lácteos Posadas SA",
     "cuit": "30-65432109-1",
     "fecha": "2026-09-14",
     "neto": 91300,
     "iva": 19173,
     "estado": "abierta",
     "fuentes": {
      "holistor": {
       "neto": 91300,
       "iva": 19173
      },
      "todosoft": null,
      "arca": {
       "neto": 91300,
       "iva": 19173
      }
     }
    }
   ],
   "horasManuales": 6
  },
  "2026-08": {
   "compras": {
    "neto": 44454000,
    "iva": 9335340,
    "comprobantes": 203,
    "fuente": "Holistor"
   },
   "ventas": {
    "neto": 89652000,
    "iva": 18826920,
    "comprobantes": 11407,
    "fuente": "Todosoft"
   },
   "diferencias": [
    {
     "id": "D0801",
     "tipo": "falta_holistor",
     "titulo": "No cargado en Holistor",
     "detalle": "El comprobante figura en ARCA pero nadie lo cargó en Holistor.",
     "comprobante": "Factura A 0005-00050616",
     "proveedor": "Papelera Posadas SRL",
     "cuit": "30-70011223-9",
     "fecha": "2026-08-26",
     "neto": 208100,
     "iva": 43701,
     "estado": "abierta",
     "fuentes": {
      "holistor": null,
      "todosoft": {
       "neto": 208100,
       "iva": 43701
      },
      "arca": {
       "neto": 208100,
       "iva": 43701
      }
     }
    },
    {
     "id": "D0802",
     "tipo": "falta_todosoft",
     "titulo": "No registrado en Todosoft",
     "detalle": "ARCA tiene la venta emitida, pero el cierre de caja no la incluye.",
     "comprobante": "Factura A 0002-00082348",
     "proveedor": "Frutas del Alto Uruguay",
     "cuit": "20-27889900-1",
     "fecha": "2026-08-23",
     "neto": 58700,
     "iva": 12327,
     "estado": "abierta",
     "fuentes": {
      "holistor": {
       "neto": 58700,
       "iva": 12327
      },
      "todosoft": null,
      "arca": {
       "neto": 58700,
       "iva": 12327
      }
     }
    },
    {
     "id": "D0803",
     "tipo": "monto",
     "titulo": "El IVA no coincide",
     "detalle": "En Holistor el IVA está cargado al 10,5% y en ARCA figura al 21%.",
     "comprobante": "Factura A 0005-00047135",
     "proveedor": "Chocolates Paraná SRL",
     "cuit": "30-71199887-0",
     "fecha": "2026-08-13",
     "neto": 184600,
     "iva": 38766,
     "estado": "abierta",
     "fuentes": {
      "holistor": {
       "neto": 184600,
       "iva": 19383
      },
      "todosoft": {
       "neto": 184600,
       "iva": 38766
      },
      "arca": {
       "neto": 184600,
       "iva": 38766
      }
     }
    }
   ],
   "horasManuales": 5
  },
  "2026-07": {
   "compras": {
    "neto": 41108000,
    "iva": 8632680,
    "comprobantes": 193,
    "fuente": "Holistor"
   },
   "ventas": {
    "neto": 82904000,
    "iva": 17409840,
    "comprobantes": 13742,
    "fuente": "Todosoft"
   },
   "diferencias": [
    {
     "id": "D0701",
     "tipo": "falta_holistor",
     "titulo": "No cargado en Holistor",
     "detalle": "El comprobante figura en ARCA pero nadie lo cargó en Holistor.",
     "comprobante": "Factura A 0003-00050291",
     "proveedor": "Frigorífico Iguazú SA",
     "cuit": "30-63344556-7",
     "fecha": "2026-07-12",
     "neto": 58700,
     "iva": 12327,
     "estado": "abierta",
     "fuentes": {
      "holistor": null,
      "todosoft": {
       "neto": 58700,
       "iva": 12327
      },
      "arca": {
       "neto": 58700,
       "iva": 12327
      }
     }
    },
    {
     "id": "D0702",
     "tipo": "falta_todosoft",
     "titulo": "No registrado en Todosoft",
     "detalle": "ARCA tiene la venta emitida, pero el cierre de caja no la incluye.",
     "comprobante": "Factura A 0002-00034593",
     "proveedor": "Insumos Misioneros SRL",
     "cuit": "30-71234509-6",
     "fecha": "2026-07-13",
     "neto": 329800,
     "iva": 69258,
     "estado": "abierta",
     "fuentes": {
      "holistor": {
       "neto": 329800,
       "iva": 69258
      },
      "todosoft": null,
      "arca": {
       "neto": 329800,
       "iva": 69258
      }
     }
    }
   ],
   "horasManuales": 7
  }
 },
 "sectores": [
  {
   "id": "produccion",
   "nombre": "Producción",
   "dotacion": 16
  },
  {
   "id": "pasteleria",
   "nombre": "Pastelería",
   "dotacion": 9
  },
  {
   "id": "mostrador",
   "nombre": "Mostrador",
   "dotacion": 14
  },
  {
   "id": "cajas",
   "nombre": "Cajas",
   "dotacion": 6
  },
  {
   "id": "reparto",
   "nombre": "Reparto",
   "dotacion": 4
  },
  {
   "id": "limpieza",
   "nombre": "Limpieza",
   "dotacion": 3
  },
  {
   "id": "administracion",
   "nombre": "Administración",
   "dotacion": 1
  }
 ],
 "franjas": [
  {
   "id": "manana",
   "nombre": "Mañana",
   "desde": "06:00",
   "hasta": "14:00"
  },
  {
   "id": "tarde",
   "nombre": "Tarde",
   "desde": "14:00",
   "hasta": "22:00"
  },
  {
   "id": "noche",
   "nombre": "Noche",
   "desde": "22:00",
   "hasta": "06:00"
  }
 ],
 "empleados": [
  {
   "id": "E001",
   "nombre": "Aldana Schmidt",
   "sector": "produccion",
   "sectorNombre": "Producción",
   "franjaHabitual": "manana",
   "ingreso": "2023-03-17",
   "antiguedad": 3.5,
   "turnosSemana": 9
  },
  {
   "id": "E002",
   "nombre": "Carlos Benítez",
   "sector": "produccion",
   "sectorNombre": "Producción",
   "franjaHabitual": "noche",
   "ingreso": "2016-06-22",
   "antiguedad": 10.3,
   "turnosSemana": 7
  },
  {
   "id": "E003",
   "nombre": "Marisa Duarte",
   "sector": "produccion",
   "sectorNombre": "Producción",
   "franjaHabitual": "tarde",
   "ingreso": "2024-09-17",
   "antiguedad": 2.0,
   "turnosSemana": 3
  },
  {
   "id": "E004",
   "nombre": "Hernán Kowalski",
   "sector": "produccion",
   "sectorNombre": "Producción",
   "franjaHabitual": "tarde",
   "ingreso": "2015-04-16",
   "antiguedad": 11.4,
   "turnosSemana": 7
  },
  {
   "id": "E005",
   "nombre": "Silvana Ojeda",
   "sector": "produccion",
   "sectorNombre": "Producción",
   "franjaHabitual": "manana",
   "ingreso": "2023-11-09",
   "antiguedad": 2.9,
   "turnosSemana": 9
  },
  {
   "id": "E006",
   "nombre": "Ramón Escalante",
   "sector": "produccion",
   "sectorNombre": "Producción",
   "franjaHabitual": "tarde",
   "ingreso": "2016-07-18",
   "antiguedad": 10.2,
   "turnosSemana": 5
  },
  {
   "id": "E007",
   "nombre": "Lucía Fernández",
   "sector": "produccion",
   "sectorNombre": "Producción",
   "franjaHabitual": "tarde",
   "ingreso": "2015-07-09",
   "antiguedad": 11.2,
   "turnosSemana": 4
  },
  {
   "id": "E008",
   "nombre": "Diego Cabrera",
   "sector": "produccion",
   "sectorNombre": "Producción",
   "franjaHabitual": "noche",
   "ingreso": "2015-08-19",
   "antiguedad": 11.1,
   "turnosSemana": 6
  },
  {
   "id": "E009",
   "nombre": "Roxana Silva",
   "sector": "produccion",
   "sectorNombre": "Producción",
   "franjaHabitual": "noche",
   "ingreso": "2018-12-24",
   "antiguedad": 7.8,
   "turnosSemana": 9
  },
  {
   "id": "E010",
   "nombre": "Matías González",
   "sector": "produccion",
   "sectorNombre": "Producción",
   "franjaHabitual": "manana",
   "ingreso": "2023-04-30",
   "antiguedad": 3.4,
   "turnosSemana": 7
  },
  {
   "id": "E011",
   "nombre": "Tamara Wenger",
   "sector": "produccion",
   "sectorNombre": "Producción",
   "franjaHabitual": "tarde",
   "ingreso": "2015-10-16",
   "antiguedad": 10.9,
   "turnosSemana": 2
  },
  {
   "id": "E012",
   "nombre": "Hugo Villalba",
   "sector": "produccion",
   "sectorNombre": "Producción",
   "franjaHabitual": "tarde",
   "ingreso": "2020-12-01",
   "antiguedad": 5.8,
   "turnosSemana": 3
  },
  {
   "id": "E013",
   "nombre": "Andrea Rojas",
   "sector": "produccion",
   "sectorNombre": "Producción",
   "franjaHabitual": "tarde",
   "ingreso": "2018-05-05",
   "antiguedad": 8.4,
   "turnosSemana": 6
  },
  {
   "id": "E014",
   "nombre": "Sergio Martínez",
   "sector": "produccion",
   "sectorNombre": "Producción",
   "franjaHabitual": "tarde",
   "ingreso": "2022-06-27",
   "antiguedad": 4.2,
   "turnosSemana": 2
  },
  {
   "id": "E015",
   "nombre": "Patricia Gómez",
   "sector": "produccion",
   "sectorNombre": "Producción",
   "franjaHabitual": "manana",
   "ingreso": "2021-06-22",
   "antiguedad": 5.3,
   "turnosSemana": 8
  },
  {
   "id": "E016",
   "nombre": "Fabián Acosta",
   "sector": "produccion",
   "sectorNombre": "Producción",
   "franjaHabitual": "tarde",
   "ingreso": "2022-06-08",
   "antiguedad": 4.3,
   "turnosSemana": 2
  },
  {
   "id": "E017",
   "nombre": "Mariela Soto",
   "sector": "pasteleria",
   "sectorNombre": "Pastelería",
   "franjaHabitual": "tarde",
   "ingreso": "2022-03-19",
   "antiguedad": 4.5,
   "turnosSemana": 5
  },
  {
   "id": "E018",
   "nombre": "Rubén Chávez",
   "sector": "pasteleria",
   "sectorNombre": "Pastelería",
   "franjaHabitual": "manana",
   "ingreso": "2015-08-27",
   "antiguedad": 11.1,
   "turnosSemana": 7
  },
  {
   "id": "E019",
   "nombre": "Karina Medina",
   "sector": "pasteleria",
   "sectorNombre": "Pastelería",
   "franjaHabitual": "manana",
   "ingreso": "2017-07-10",
   "antiguedad": 9.2,
   "turnosSemana": 11
  },
  {
   "id": "E020",
   "nombre": "Julio Ferreyra",
   "sector": "pasteleria",
   "sectorNombre": "Pastelería",
   "franjaHabitual": "manana",
   "ingreso": "2025-08-11",
   "antiguedad": 1.1,
   "turnosSemana": 3
  },
  {
   "id": "E021",
   "nombre": "Sandra Alvez",
   "sector": "pasteleria",
   "sectorNombre": "Pastelería",
   "franjaHabitual": "manana",
   "ingreso": "2021-02-09",
   "antiguedad": 5.6,
   "turnosSemana": 8
  },
  {
   "id": "E022",
   "nombre": "Walter Núñez",
   "sector": "pasteleria",
   "sectorNombre": "Pastelería",
   "franjaHabitual": "manana",
   "ingreso": "2019-09-30",
   "antiguedad": 7.0,
   "turnosSemana": 3
  },
  {
   "id": "E023",
   "nombre": "Vanesa Riquelme",
   "sector": "pasteleria",
   "sectorNombre": "Pastelería",
   "franjaHabitual": "manana",
   "ingreso": "2015-11-01",
   "antiguedad": 10.9,
   "turnosSemana": 6
  },
  {
   "id": "E024",
   "nombre": "Cristian Páez",
   "sector": "pasteleria",
   "sectorNombre": "Pastelería",
   "franjaHabitual": "manana",
   "ingreso": "2026-03-27",
   "antiguedad": 0.5,
   "turnosSemana": 9
  },
  {
   "id": "E025",
   "nombre": "Liliana Barrios",
   "sector": "pasteleria",
   "sectorNombre": "Pastelería",
   "franjaHabitual": "manana",
   "ingreso": "2016-02-11",
   "antiguedad": 10.6,
   "turnosSemana": 4
  },
  {
   "id": "E026",
   "nombre": "Omar Zárate",
   "sector": "mostrador",
   "sectorNombre": "Mostrador",
   "franjaHabitual": "manana",
   "ingreso": "2021-01-14",
   "antiguedad": 5.7,
   "turnosSemana": 7
  },
  {
   "id": "E027",
   "nombre": "Gabriela Ruiz",
   "sector": "mostrador",
   "sectorNombre": "Mostrador",
   "franjaHabitual": "manana",
   "ingreso": "2022-06-26",
   "antiguedad": 4.2,
   "turnosSemana": 7
  },
  {
   "id": "E028",
   "nombre": "Néstor Cardozo",
   "sector": "mostrador",
   "sectorNombre": "Mostrador",
   "franjaHabitual": "manana",
   "ingreso": "2019-11-25",
   "antiguedad": 6.8,
   "turnosSemana": 4
  },
  {
   "id": "E029",
   "nombre": "Fernanda López",
   "sector": "mostrador",
   "sectorNombre": "Mostrador",
   "franjaHabitual": "noche",
   "ingreso": "2019-12-07",
   "antiguedad": 6.8,
   "turnosSemana": 0
  },
  {
   "id": "E030",
   "nombre": "Mauricio Sosa",
   "sector": "mostrador",
   "sectorNombre": "Mostrador",
   "franjaHabitual": "tarde",
   "ingreso": "2024-09-27",
   "antiguedad": 2.0,
   "turnosSemana": 11
  },
  {
   "id": "E031",
   "nombre": "Aurora Britez",
   "sector": "mostrador",
   "sectorNombre": "Mostrador",
   "franjaHabitual": "noche",
   "ingreso": "2017-03-02",
   "antiguedad": 9.6,
   "turnosSemana": 6
  },
  {
   "id": "E032",
   "nombre": "Alejandro Vera",
   "sector": "mostrador",
   "sectorNombre": "Mostrador",
   "franjaHabitual": "manana",
   "ingreso": "2021-02-17",
   "antiguedad": 5.6,
   "turnosSemana": 7
  },
  {
   "id": "E033",
   "nombre": "Natalia Ayala",
   "sector": "mostrador",
   "sectorNombre": "Mostrador",
   "franjaHabitual": "manana",
   "ingreso": "2024-03-06",
   "antiguedad": 2.5,
   "turnosSemana": 2
  },
  {
   "id": "E034",
   "nombre": "Pablo Domínguez",
   "sector": "mostrador",
   "sectorNombre": "Mostrador",
   "franjaHabitual": "noche",
   "ingreso": "2016-07-06",
   "antiguedad": 10.2,
   "turnosSemana": 4
  },
  {
   "id": "E035",
   "nombre": "Rocío Maidana",
   "sector": "mostrador",
   "sectorNombre": "Mostrador",
   "franjaHabitual": "tarde",
   "ingreso": "2025-10-03",
   "antiguedad": 1.0,
   "turnosSemana": 7
  },
  {
   "id": "E036",
   "nombre": "Ariel Correa",
   "sector": "mostrador",
   "sectorNombre": "Mostrador",
   "franjaHabitual": "tarde",
   "ingreso": "2024-06-24",
   "antiguedad": 2.2,
   "turnosSemana": 8
  },
  {
   "id": "E037",
   "nombre": "Verónica Giménez",
   "sector": "mostrador",
   "sectorNombre": "Mostrador",
   "franjaHabitual": "noche",
   "ingreso": "2018-03-27",
   "antiguedad": 8.5,
   "turnosSemana": 3
  },
  {
   "id": "E038",
   "nombre": "Marcelo Insaurralde",
   "sector": "mostrador",
   "sectorNombre": "Mostrador",
   "franjaHabitual": "tarde",
   "ingreso": "2024-11-27",
   "antiguedad": 1.8,
   "turnosSemana": 8
  },
  {
   "id": "E039",
   "nombre": "Daiana Ríos",
   "sector": "mostrador",
   "sectorNombre": "Mostrador",
   "franjaHabitual": "tarde",
   "ingreso": "2018-01-22",
   "antiguedad": 8.7,
   "turnosSemana": 8
  },
  {
   "id": "E040",
   "nombre": "Luis Quiroga",
   "sector": "cajas",
   "sectorNombre": "Cajas",
   "franjaHabitual": "noche",
   "ingreso": "2018-07-23",
   "antiguedad": 8.2,
   "turnosSemana": 7
  },
  {
   "id": "E041",
   "nombre": "Sonia Peralta",
   "sector": "cajas",
   "sectorNombre": "Cajas",
   "franjaHabitual": "manana",
   "ingreso": "2016-08-28",
   "antiguedad": 10.1,
   "turnosSemana": 6
  },
  {
   "id": "E042",
   "nombre": "Emanuel Vallejos",
   "sector": "cajas",
   "sectorNombre": "Cajas",
   "franjaHabitual": "tarde",
   "ingreso": "2021-11-01",
   "antiguedad": 4.9,
   "turnosSemana": 7
  },
  {
   "id": "E043",
   "nombre": "Carolina Méndez",
   "sector": "cajas",
   "sectorNombre": "Cajas",
   "franjaHabitual": "manana",
   "ingreso": "2018-05-10",
   "antiguedad": 8.4,
   "turnosSemana": 7
  },
  {
   "id": "E044",
   "nombre": "Iván Bogado",
   "sector": "cajas",
   "sectorNombre": "Cajas",
   "franjaHabitual": "manana",
   "ingreso": "2019-06-21",
   "antiguedad": 7.3,
   "turnosSemana": 5
  },
  {
   "id": "E045",
   "nombre": "Yésica Portillo",
   "sector": "cajas",
   "sectorNombre": "Cajas",
   "franjaHabitual": "tarde",
   "ingreso": "2017-03-16",
   "antiguedad": 9.5,
   "turnosSemana": 2
  },
  {
   "id": "E046",
   "nombre": "Gustavo Almirón",
   "sector": "reparto",
   "sectorNombre": "Reparto",
   "franjaHabitual": "manana",
   "ingreso": "2023-09-03",
   "antiguedad": 3.1,
   "turnosSemana": 5
  },
  {
   "id": "E047",
   "nombre": "Miriam Leiva",
   "sector": "reparto",
   "sectorNombre": "Reparto",
   "franjaHabitual": "manana",
   "ingreso": "2018-05-29",
   "antiguedad": 8.3,
   "turnosSemana": 2
  },
  {
   "id": "E048",
   "nombre": "Damián Galeano",
   "sector": "reparto",
   "sectorNombre": "Reparto",
   "franjaHabitual": "manana",
   "ingreso": "2020-09-18",
   "antiguedad": 6.0,
   "turnosSemana": 8
  },
  {
   "id": "E049",
   "nombre": "Estela Cáceres",
   "sector": "reparto",
   "sectorNombre": "Reparto",
   "franjaHabitual": "manana",
   "ingreso": "2015-08-07",
   "antiguedad": 11.1,
   "turnosSemana": 5
  },
  {
   "id": "E050",
   "nombre": "Nicolás Ramírez",
   "sector": "limpieza",
   "sectorNombre": "Limpieza",
   "franjaHabitual": "noche",
   "ingreso": "2016-09-02",
   "antiguedad": 10.1,
   "turnosSemana": 8
  },
  {
   "id": "E051",
   "nombre": "Belén Aquino",
   "sector": "limpieza",
   "sectorNombre": "Limpieza",
   "franjaHabitual": "manana",
   "ingreso": "2017-11-07",
   "antiguedad": 8.9,
   "turnosSemana": 8
  },
  {
   "id": "E052",
   "nombre": "César Ibarra",
   "sector": "limpieza",
   "sectorNombre": "Limpieza",
   "franjaHabitual": "tarde",
   "ingreso": "2024-12-09",
   "antiguedad": 1.8,
   "turnosSemana": 4
  },
  {
   "id": "E053",
   "nombre": "Mónica Talavera",
   "sector": "administracion",
   "sectorNombre": "Administración",
   "franjaHabitual": "manana",
   "ingreso": "2026-02-06",
   "antiguedad": 0.6,
   "turnosSemana": 7
  }
 ],
 "semana": {
  "desde": "2026-09-21",
  "hasta": "2026-09-27",
  "grilla": [
   {
    "fecha": "2026-09-21",
    "dia": "Lunes",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "produccion",
    "sectorNombre": "Producción",
    "requeridos": 5,
    "empleados": [
     "E015",
     "E010",
     "E005",
     "E001",
     "E004"
    ]
   },
   {
    "fecha": "2026-09-21",
    "dia": "Lunes",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "pasteleria",
    "sectorNombre": "Pastelería",
    "requeridos": 4,
    "empleados": [
     "E019",
     "E018",
     "E023",
     "E021"
    ]
   },
   {
    "fecha": "2026-09-21",
    "dia": "Lunes",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "mostrador",
    "sectorNombre": "Mostrador",
    "requeridos": 5,
    "empleados": [
     "E027",
     "E026",
     "E032",
     "E028",
     "E030"
    ]
   },
   {
    "fecha": "2026-09-21",
    "dia": "Lunes",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "cajas",
    "sectorNombre": "Cajas",
    "requeridos": 2,
    "empleados": [
     "E043",
     "E044"
    ]
   },
   {
    "fecha": "2026-09-21",
    "dia": "Lunes",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "reparto",
    "sectorNombre": "Reparto",
    "requeridos": 2,
    "empleados": [
     "E049",
     "E048"
    ]
   },
   {
    "fecha": "2026-09-21",
    "dia": "Lunes",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "limpieza",
    "sectorNombre": "Limpieza",
    "requeridos": 1,
    "empleados": [
     "E051"
    ]
   },
   {
    "fecha": "2026-09-21",
    "dia": "Lunes",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "administracion",
    "sectorNombre": "Administración",
    "requeridos": 1,
    "empleados": [
     "E053"
    ]
   },
   {
    "fecha": "2026-09-21",
    "dia": "Lunes",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "produccion",
    "sectorNombre": "Producción",
    "requeridos": 4,
    "empleados": [
     "E007",
     "E006",
     "E003",
     "E008"
    ]
   },
   {
    "fecha": "2026-09-21",
    "dia": "Lunes",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "pasteleria",
    "sectorNombre": "Pastelería",
    "requeridos": 3,
    "empleados": [
     "E019",
     "E023",
     "E018"
    ]
   },
   {
    "fecha": "2026-09-21",
    "dia": "Lunes",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "mostrador",
    "sectorNombre": "Mostrador",
    "requeridos": 5,
    "empleados": [
     "E039",
     "E035",
     "E038",
     "E036",
     "E030"
    ]
   },
   {
    "fecha": "2026-09-21",
    "dia": "Lunes",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "cajas",
    "sectorNombre": "Cajas",
    "requeridos": 2,
    "empleados": [
     "E042",
     "E045"
    ]
   },
   {
    "fecha": "2026-09-21",
    "dia": "Lunes",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "reparto",
    "sectorNombre": "Reparto",
    "requeridos": 1,
    "empleados": [
     "E046"
    ]
   },
   {
    "fecha": "2026-09-21",
    "dia": "Lunes",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "limpieza",
    "sectorNombre": "Limpieza",
    "requeridos": 1,
    "empleados": [
     "E052"
    ]
   },
   {
    "fecha": "2026-09-21",
    "dia": "Lunes",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "produccion",
    "sectorNombre": "Producción",
    "requeridos": 4,
    "empleados": [
     "E002",
     "E009",
     "E001",
     "E005"
    ]
   },
   {
    "fecha": "2026-09-21",
    "dia": "Lunes",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "pasteleria",
    "sectorNombre": "Pastelería",
    "requeridos": 1,
    "empleados": [
     "E019"
    ]
   },
   {
    "fecha": "2026-09-21",
    "dia": "Lunes",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "mostrador",
    "sectorNombre": "Mostrador",
    "requeridos": 2,
    "empleados": [
     "E034",
     "E028"
    ]
   },
   {
    "fecha": "2026-09-21",
    "dia": "Lunes",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "cajas",
    "sectorNombre": "Cajas",
    "requeridos": 1,
    "empleados": [
     "E040"
    ]
   },
   {
    "fecha": "2026-09-21",
    "dia": "Lunes",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "limpieza",
    "sectorNombre": "Limpieza",
    "requeridos": 1,
    "empleados": [
     "E050"
    ]
   },
   {
    "fecha": "2026-09-22",
    "dia": "Martes",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "produccion",
    "sectorNombre": "Producción",
    "requeridos": 5,
    "empleados": [
     "E015",
     "E010",
     "E005",
     "E001",
     "E004"
    ]
   },
   {
    "fecha": "2026-09-22",
    "dia": "Martes",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "pasteleria",
    "sectorNombre": "Pastelería",
    "requeridos": 4,
    "empleados": [
     "E024",
     "E019",
     "E022",
     "E025"
    ]
   },
   {
    "fecha": "2026-09-22",
    "dia": "Martes",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "mostrador",
    "sectorNombre": "Mostrador",
    "requeridos": 5,
    "empleados": [
     "E032",
     "E027",
     "E026",
     "E030",
     "E033"
    ]
   },
   {
    "fecha": "2026-09-22",
    "dia": "Martes",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "cajas",
    "sectorNombre": "Cajas",
    "requeridos": 2,
    "empleados": [
     "E043",
     "E044"
    ]
   },
   {
    "fecha": "2026-09-22",
    "dia": "Martes",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "reparto",
    "sectorNombre": "Reparto",
    "requeridos": 2,
    "empleados": [
     "E046",
     "E048"
    ]
   },
   {
    "fecha": "2026-09-22",
    "dia": "Martes",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "limpieza",
    "sectorNombre": "Limpieza",
    "requeridos": 1,
    "empleados": [
     "E051"
    ]
   },
   {
    "fecha": "2026-09-22",
    "dia": "Martes",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "administracion",
    "sectorNombre": "Administración",
    "requeridos": 1,
    "empleados": [
     "E053"
    ]
   },
   {
    "fecha": "2026-09-22",
    "dia": "Martes",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "produccion",
    "sectorNombre": "Producción",
    "requeridos": 4,
    "empleados": [
     "E014",
     "E004",
     "E013",
     "E003"
    ]
   },
   {
    "fecha": "2026-09-22",
    "dia": "Martes",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "pasteleria",
    "sectorNombre": "Pastelería",
    "requeridos": 3,
    "empleados": [
     "E021",
     "E019",
     "E023"
    ]
   },
   {
    "fecha": "2026-09-22",
    "dia": "Martes",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "mostrador",
    "sectorNombre": "Mostrador",
    "requeridos": 5,
    "empleados": [
     "E035",
     "E036",
     "E038",
     "E030",
     "E039"
    ]
   },
   {
    "fecha": "2026-09-22",
    "dia": "Martes",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "cajas",
    "sectorNombre": "Cajas",
    "requeridos": 2,
    "empleados": [
     "E042",
     "E040"
    ]
   },
   {
    "fecha": "2026-09-22",
    "dia": "Martes",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "reparto",
    "sectorNombre": "Reparto",
    "requeridos": 1,
    "empleados": [
     "E048"
    ]
   },
   {
    "fecha": "2026-09-22",
    "dia": "Martes",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "limpieza",
    "sectorNombre": "Limpieza",
    "requeridos": 1,
    "empleados": [
     "E050"
    ]
   },
   {
    "fecha": "2026-09-22",
    "dia": "Martes",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "produccion",
    "sectorNombre": "Producción",
    "requeridos": 4,
    "empleados": [
     "E002",
     "E009",
     "E001",
     "E008"
    ]
   },
   {
    "fecha": "2026-09-22",
    "dia": "Martes",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "pasteleria",
    "sectorNombre": "Pastelería",
    "requeridos": 1,
    "empleados": [
     "E018"
    ]
   },
   {
    "fecha": "2026-09-22",
    "dia": "Martes",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "mostrador",
    "sectorNombre": "Mostrador",
    "requeridos": 2,
    "empleados": [
     "E028",
     "E037"
    ]
   },
   {
    "fecha": "2026-09-22",
    "dia": "Martes",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "cajas",
    "sectorNombre": "Cajas",
    "requeridos": 1,
    "empleados": [
     "E040"
    ]
   },
   {
    "fecha": "2026-09-22",
    "dia": "Martes",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "limpieza",
    "sectorNombre": "Limpieza",
    "requeridos": 1,
    "empleados": [
     "E050"
    ]
   },
   {
    "fecha": "2026-09-23",
    "dia": "Miércoles",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "produccion",
    "sectorNombre": "Producción",
    "requeridos": 5,
    "empleados": [
     "E005",
     "E015",
     "E010",
     "E001",
     "E009"
    ]
   },
   {
    "fecha": "2026-09-23",
    "dia": "Miércoles",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "pasteleria",
    "sectorNombre": "Pastelería",
    "requeridos": 4,
    "empleados": [
     "E025",
     "E018",
     "E022",
     "E024"
    ]
   },
   {
    "fecha": "2026-09-23",
    "dia": "Miércoles",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "mostrador",
    "sectorNombre": "Mostrador",
    "requeridos": 5,
    "empleados": [
     "E032",
     "E027",
     "E026",
     "E039",
     "E030"
    ]
   },
   {
    "fecha": "2026-09-23",
    "dia": "Miércoles",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "cajas",
    "sectorNombre": "Cajas",
    "requeridos": 2,
    "empleados": [
     "E043",
     "E044"
    ]
   },
   {
    "fecha": "2026-09-23",
    "dia": "Miércoles",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "reparto",
    "sectorNombre": "Reparto",
    "requeridos": 2,
    "empleados": [
     "E048",
     "E047"
    ]
   },
   {
    "fecha": "2026-09-23",
    "dia": "Miércoles",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "limpieza",
    "sectorNombre": "Limpieza",
    "requeridos": 1,
    "empleados": [
     "E051"
    ]
   },
   {
    "fecha": "2026-09-23",
    "dia": "Miércoles",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "administracion",
    "sectorNombre": "Administración",
    "requeridos": 1,
    "empleados": [
     "E053"
    ]
   },
   {
    "fecha": "2026-09-23",
    "dia": "Miércoles",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "produccion",
    "sectorNombre": "Producción",
    "requeridos": 4,
    "empleados": [
     "E006",
     "E007",
     "E004",
     "E016"
    ]
   },
   {
    "fecha": "2026-09-23",
    "dia": "Miércoles",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "pasteleria",
    "sectorNombre": "Pastelería",
    "requeridos": 3,
    "empleados": [
     "E017",
     "E024",
     "E020"
    ]
   },
   {
    "fecha": "2026-09-23",
    "dia": "Miércoles",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "mostrador",
    "sectorNombre": "Mostrador",
    "requeridos": 5,
    "empleados": [
     "E039",
     "E030",
     "E035",
     "E038",
     "E036"
    ]
   },
   {
    "fecha": "2026-09-23",
    "dia": "Miércoles",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "cajas",
    "sectorNombre": "Cajas",
    "requeridos": 2,
    "empleados": [
     "E042",
     "E045"
    ]
   },
   {
    "fecha": "2026-09-23",
    "dia": "Miércoles",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "reparto",
    "sectorNombre": "Reparto",
    "requeridos": 1,
    "empleados": [
     "E049"
    ]
   },
   {
    "fecha": "2026-09-23",
    "dia": "Miércoles",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "limpieza",
    "sectorNombre": "Limpieza",
    "requeridos": 1,
    "empleados": [
     "E050"
    ]
   },
   {
    "fecha": "2026-09-23",
    "dia": "Miércoles",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "produccion",
    "sectorNombre": "Producción",
    "requeridos": 4,
    "empleados": [
     "E002",
     "E009",
     "E012",
     "E008"
    ]
   },
   {
    "fecha": "2026-09-23",
    "dia": "Miércoles",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "pasteleria",
    "sectorNombre": "Pastelería",
    "requeridos": 1,
    "empleados": [
     "E019"
    ]
   },
   {
    "fecha": "2026-09-23",
    "dia": "Miércoles",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "mostrador",
    "sectorNombre": "Mostrador",
    "requeridos": 2,
    "empleados": [
     "E033",
     "E031"
    ]
   },
   {
    "fecha": "2026-09-23",
    "dia": "Miércoles",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "cajas",
    "sectorNombre": "Cajas",
    "requeridos": 1,
    "empleados": [
     "E040"
    ]
   },
   {
    "fecha": "2026-09-23",
    "dia": "Miércoles",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "limpieza",
    "sectorNombre": "Limpieza",
    "requeridos": 1,
    "empleados": [
     "E050"
    ]
   },
   {
    "fecha": "2026-09-24",
    "dia": "Jueves",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "produccion",
    "sectorNombre": "Producción",
    "requeridos": 5,
    "empleados": [
     "E015",
     "E010",
     "E005",
     "E001",
     "E009"
    ]
   },
   {
    "fecha": "2026-09-24",
    "dia": "Jueves",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "pasteleria",
    "sectorNombre": "Pastelería",
    "requeridos": 4,
    "empleados": [
     "E023",
     "E019",
     "E020",
     "E021"
    ]
   },
   {
    "fecha": "2026-09-24",
    "dia": "Jueves",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "mostrador",
    "sectorNombre": "Mostrador",
    "requeridos": 5,
    "empleados": [
     "E027",
     "E032",
     "E026",
     "E038",
     "E037"
    ]
   },
   {
    "fecha": "2026-09-24",
    "dia": "Jueves",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "cajas",
    "sectorNombre": "Cajas",
    "requeridos": 2,
    "empleados": [
     "E043",
     "E041"
    ]
   },
   {
    "fecha": "2026-09-24",
    "dia": "Jueves",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "reparto",
    "sectorNombre": "Reparto",
    "requeridos": 2,
    "empleados": [
     "E048",
     "E046"
    ]
   },
   {
    "fecha": "2026-09-24",
    "dia": "Jueves",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "limpieza",
    "sectorNombre": "Limpieza",
    "requeridos": 1,
    "empleados": [
     "E051"
    ]
   },
   {
    "fecha": "2026-09-24",
    "dia": "Jueves",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "administracion",
    "sectorNombre": "Administración",
    "requeridos": 1,
    "empleados": [
     "E053"
    ]
   },
   {
    "fecha": "2026-09-24",
    "dia": "Jueves",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "produccion",
    "sectorNombre": "Producción",
    "requeridos": 4,
    "empleados": [
     "E013",
     "E014",
     "E004",
     "E006"
    ]
   },
   {
    "fecha": "2026-09-24",
    "dia": "Jueves",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "pasteleria",
    "sectorNombre": "Pastelería",
    "requeridos": 3,
    "empleados": [
     "E023",
     "E022",
     "E018"
    ]
   },
   {
    "fecha": "2026-09-24",
    "dia": "Jueves",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "mostrador",
    "sectorNombre": "Mostrador",
    "requeridos": 5,
    "empleados": [
     "E030",
     "E039",
     "E035",
     "E038",
     "E036"
    ]
   },
   {
    "fecha": "2026-09-24",
    "dia": "Jueves",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "cajas",
    "sectorNombre": "Cajas",
    "requeridos": 2,
    "empleados": [
     "E042",
     "E041"
    ]
   },
   {
    "fecha": "2026-09-24",
    "dia": "Jueves",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "reparto",
    "sectorNombre": "Reparto",
    "requeridos": 1,
    "empleados": [
     "E047"
    ]
   },
   {
    "fecha": "2026-09-24",
    "dia": "Jueves",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "limpieza",
    "sectorNombre": "Limpieza",
    "requeridos": 1,
    "empleados": [
     "E052"
    ]
   },
   {
    "fecha": "2026-09-24",
    "dia": "Jueves",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "produccion",
    "sectorNombre": "Producción",
    "requeridos": 4,
    "empleados": [
     "E009",
     "E002",
     "E015",
     "E004"
    ]
   },
   {
    "fecha": "2026-09-24",
    "dia": "Jueves",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "pasteleria",
    "sectorNombre": "Pastelería",
    "requeridos": 1,
    "empleados": [
     "E021"
    ]
   },
   {
    "fecha": "2026-09-24",
    "dia": "Jueves",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "mostrador",
    "sectorNombre": "Mostrador",
    "requeridos": 2,
    "empleados": [
     "E034",
     "E031"
    ]
   },
   {
    "fecha": "2026-09-24",
    "dia": "Jueves",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "cajas",
    "sectorNombre": "Cajas",
    "requeridos": 1,
    "empleados": [
     "E040"
    ]
   },
   {
    "fecha": "2026-09-24",
    "dia": "Jueves",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "limpieza",
    "sectorNombre": "Limpieza",
    "requeridos": 1,
    "empleados": [
     "E052"
    ]
   },
   {
    "fecha": "2026-09-25",
    "dia": "Viernes",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "produccion",
    "sectorNombre": "Producción",
    "requeridos": 5,
    "empleados": [
     "E005",
     "E001",
     "E015",
     "E010",
     "E003"
    ]
   },
   {
    "fecha": "2026-09-25",
    "dia": "Viernes",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "pasteleria",
    "sectorNombre": "Pastelería",
    "requeridos": 4,
    "empleados": [
     "E024",
     "E019",
     "E021",
     "E018"
    ]
   },
   {
    "fecha": "2026-09-25",
    "dia": "Viernes",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "mostrador",
    "sectorNombre": "Mostrador",
    "requeridos": 5,
    "empleados": [
     "E027",
     "E032",
     "E026",
     "E038",
     "E036"
    ]
   },
   {
    "fecha": "2026-09-25",
    "dia": "Viernes",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "cajas",
    "sectorNombre": "Cajas",
    "requeridos": 2,
    "empleados": [
     "E043",
     "E044"
    ]
   },
   {
    "fecha": "2026-09-25",
    "dia": "Viernes",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "reparto",
    "sectorNombre": "Reparto",
    "requeridos": 2,
    "empleados": [
     "E049",
     "E048"
    ]
   },
   {
    "fecha": "2026-09-25",
    "dia": "Viernes",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "limpieza",
    "sectorNombre": "Limpieza",
    "requeridos": 1,
    "empleados": [
     "E051"
    ]
   },
   {
    "fecha": "2026-09-25",
    "dia": "Viernes",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "administracion",
    "sectorNombre": "Administración",
    "requeridos": 1,
    "empleados": [
     "E053"
    ]
   },
   {
    "fecha": "2026-09-25",
    "dia": "Viernes",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "produccion",
    "sectorNombre": "Producción",
    "requeridos": 4,
    "empleados": [
     "E012",
     "E007",
     "E013",
     "E011"
    ]
   },
   {
    "fecha": "2026-09-25",
    "dia": "Viernes",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "pasteleria",
    "sectorNombre": "Pastelería",
    "requeridos": 3,
    "empleados": [
     "E024",
     "E019",
     "E018"
    ]
   },
   {
    "fecha": "2026-09-25",
    "dia": "Viernes",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "mostrador",
    "sectorNombre": "Mostrador",
    "requeridos": 5,
    "empleados": [
     "E038",
     "E039",
     "E030",
     "E035",
     "E036"
    ]
   },
   {
    "fecha": "2026-09-25",
    "dia": "Viernes",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "cajas",
    "sectorNombre": "Cajas",
    "requeridos": 2,
    "empleados": [
     "E042",
     "E041"
    ]
   },
   {
    "fecha": "2026-09-25",
    "dia": "Viernes",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "reparto",
    "sectorNombre": "Reparto",
    "requeridos": 1,
    "empleados": [
     "E049"
    ]
   },
   {
    "fecha": "2026-09-25",
    "dia": "Viernes",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "limpieza",
    "sectorNombre": "Limpieza",
    "requeridos": 1,
    "empleados": [
     "E052"
    ]
   },
   {
    "fecha": "2026-09-25",
    "dia": "Viernes",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "produccion",
    "sectorNombre": "Producción",
    "requeridos": 4,
    "empleados": [
     "E009",
     "E002",
     "E008"
    ]
   },
   {
    "fecha": "2026-09-25",
    "dia": "Viernes",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "pasteleria",
    "sectorNombre": "Pastelería",
    "requeridos": 1,
    "empleados": [
     "E017"
    ]
   },
   {
    "fecha": "2026-09-25",
    "dia": "Viernes",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "mostrador",
    "sectorNombre": "Mostrador",
    "requeridos": 2,
    "empleados": [
     "E031",
     "E037"
    ]
   },
   {
    "fecha": "2026-09-25",
    "dia": "Viernes",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "cajas",
    "sectorNombre": "Cajas",
    "requeridos": 1,
    "empleados": []
   },
   {
    "fecha": "2026-09-25",
    "dia": "Viernes",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "limpieza",
    "sectorNombre": "Limpieza",
    "requeridos": 1,
    "empleados": [
     "E050"
    ]
   },
   {
    "fecha": "2026-09-26",
    "dia": "Sábado",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "produccion",
    "sectorNombre": "Producción",
    "requeridos": 5,
    "empleados": [
     "E005",
     "E010",
     "E001",
     "E015",
     "E008"
    ]
   },
   {
    "fecha": "2026-09-26",
    "dia": "Sábado",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "pasteleria",
    "sectorNombre": "Pastelería",
    "requeridos": 4,
    "empleados": [
     "E019",
     "E017",
     "E021",
     "E020"
    ]
   },
   {
    "fecha": "2026-09-26",
    "dia": "Sábado",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "mostrador",
    "sectorNombre": "Mostrador",
    "requeridos": 5,
    "empleados": [
     "E032",
     "E027",
     "E026",
     "E031",
     "E028"
    ]
   },
   {
    "fecha": "2026-09-26",
    "dia": "Sábado",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "cajas",
    "sectorNombre": "Cajas",
    "requeridos": 2,
    "empleados": [
     "E041",
     "E043"
    ]
   },
   {
    "fecha": "2026-09-26",
    "dia": "Sábado",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "reparto",
    "sectorNombre": "Reparto",
    "requeridos": 2,
    "empleados": [
     "E048",
     "E049"
    ]
   },
   {
    "fecha": "2026-09-26",
    "dia": "Sábado",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "limpieza",
    "sectorNombre": "Limpieza",
    "requeridos": 1,
    "empleados": [
     "E051"
    ]
   },
   {
    "fecha": "2026-09-26",
    "dia": "Sábado",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "administracion",
    "sectorNombre": "Administración",
    "requeridos": 1,
    "empleados": [
     "E053"
    ]
   },
   {
    "fecha": "2026-09-26",
    "dia": "Sábado",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "produccion",
    "sectorNombre": "Producción",
    "requeridos": 4,
    "empleados": [
     "E006",
     "E007",
     "E008",
     "E011"
    ]
   },
   {
    "fecha": "2026-09-26",
    "dia": "Sábado",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "pasteleria",
    "sectorNombre": "Pastelería",
    "requeridos": 3,
    "empleados": [
     "E019",
     "E024",
     "E017"
    ]
   },
   {
    "fecha": "2026-09-26",
    "dia": "Sábado",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "mostrador",
    "sectorNombre": "Mostrador",
    "requeridos": 5,
    "empleados": [
     "E035",
     "E039",
     "E030",
     "E036"
    ]
   },
   {
    "fecha": "2026-09-26",
    "dia": "Sábado",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "cajas",
    "sectorNombre": "Cajas",
    "requeridos": 2,
    "empleados": [
     "E042",
     "E043"
    ]
   },
   {
    "fecha": "2026-09-26",
    "dia": "Sábado",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "reparto",
    "sectorNombre": "Reparto",
    "requeridos": 1,
    "empleados": []
   },
   {
    "fecha": "2026-09-26",
    "dia": "Sábado",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "limpieza",
    "sectorNombre": "Limpieza",
    "requeridos": 1,
    "empleados": [
     "E050"
    ]
   },
   {
    "fecha": "2026-09-26",
    "dia": "Sábado",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "produccion",
    "sectorNombre": "Producción",
    "requeridos": 4,
    "empleados": [
     "E009",
     "E002",
     "E004"
    ]
   },
   {
    "fecha": "2026-09-26",
    "dia": "Sábado",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "pasteleria",
    "sectorNombre": "Pastelería",
    "requeridos": 1,
    "empleados": [
     "E024"
    ]
   },
   {
    "fecha": "2026-09-26",
    "dia": "Sábado",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "mostrador",
    "sectorNombre": "Mostrador",
    "requeridos": 2,
    "empleados": [
     "E034"
    ]
   },
   {
    "fecha": "2026-09-26",
    "dia": "Sábado",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "cajas",
    "sectorNombre": "Cajas",
    "requeridos": 1,
    "empleados": [
     "E040"
    ]
   },
   {
    "fecha": "2026-09-26",
    "dia": "Sábado",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "limpieza",
    "sectorNombre": "Limpieza",
    "requeridos": 1,
    "empleados": []
   },
   {
    "fecha": "2026-09-27",
    "dia": "Domingo",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "produccion",
    "sectorNombre": "Producción",
    "requeridos": 5,
    "empleados": [
     "E010",
     "E005",
     "E015",
     "E001",
     "E013"
    ]
   },
   {
    "fecha": "2026-09-27",
    "dia": "Domingo",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "pasteleria",
    "sectorNombre": "Pastelería",
    "requeridos": 4,
    "empleados": [
     "E025",
     "E024",
     "E023",
     "E021"
    ]
   },
   {
    "fecha": "2026-09-27",
    "dia": "Domingo",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "mostrador",
    "sectorNombre": "Mostrador",
    "requeridos": 5,
    "empleados": [
     "E026",
     "E032",
     "E027",
     "E031",
     "E030"
    ]
   },
   {
    "fecha": "2026-09-27",
    "dia": "Domingo",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "cajas",
    "sectorNombre": "Cajas",
    "requeridos": 2,
    "empleados": [
     "E044",
     "E041"
    ]
   },
   {
    "fecha": "2026-09-27",
    "dia": "Domingo",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "reparto",
    "sectorNombre": "Reparto",
    "requeridos": 2,
    "empleados": [
     "E046",
     "E048"
    ]
   },
   {
    "fecha": "2026-09-27",
    "dia": "Domingo",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "limpieza",
    "sectorNombre": "Limpieza",
    "requeridos": 1,
    "empleados": [
     "E051"
    ]
   },
   {
    "fecha": "2026-09-27",
    "dia": "Domingo",
    "franja": "manana",
    "franjaNombre": "Mañana",
    "desde": "06:00",
    "hasta": "14:00",
    "sector": "administracion",
    "sectorNombre": "Administración",
    "requeridos": 1,
    "empleados": [
     "E053"
    ]
   },
   {
    "fecha": "2026-09-27",
    "dia": "Domingo",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "produccion",
    "sectorNombre": "Producción",
    "requeridos": 4,
    "empleados": [
     "E012",
     "E013",
     "E006",
     "E016"
    ]
   },
   {
    "fecha": "2026-09-27",
    "dia": "Domingo",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "pasteleria",
    "sectorNombre": "Pastelería",
    "requeridos": 3,
    "empleados": [
     "E017",
     "E025",
     "E021"
    ]
   },
   {
    "fecha": "2026-09-27",
    "dia": "Domingo",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "mostrador",
    "sectorNombre": "Mostrador",
    "requeridos": 5,
    "empleados": [
     "E035",
     "E039",
     "E036",
     "E038",
     "E030"
    ]
   },
   {
    "fecha": "2026-09-27",
    "dia": "Domingo",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "cajas",
    "sectorNombre": "Cajas",
    "requeridos": 2,
    "empleados": [
     "E042",
     "E041"
    ]
   },
   {
    "fecha": "2026-09-27",
    "dia": "Domingo",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "reparto",
    "sectorNombre": "Reparto",
    "requeridos": 1,
    "empleados": [
     "E046"
    ]
   },
   {
    "fecha": "2026-09-27",
    "dia": "Domingo",
    "franja": "tarde",
    "franjaNombre": "Tarde",
    "desde": "14:00",
    "hasta": "22:00",
    "sector": "limpieza",
    "sectorNombre": "Limpieza",
    "requeridos": 1,
    "empleados": [
     "E050"
    ]
   },
   {
    "fecha": "2026-09-27",
    "dia": "Domingo",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "produccion",
    "sectorNombre": "Producción",
    "requeridos": 4,
    "empleados": [
     "E002",
     "E009",
     "E013",
     "E005"
    ]
   },
   {
    "fecha": "2026-09-27",
    "dia": "Domingo",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "pasteleria",
    "sectorNombre": "Pastelería",
    "requeridos": 1,
    "empleados": [
     "E024"
    ]
   },
   {
    "fecha": "2026-09-27",
    "dia": "Domingo",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "mostrador",
    "sectorNombre": "Mostrador",
    "requeridos": 2,
    "empleados": [
     "E031",
     "E034"
    ]
   },
   {
    "fecha": "2026-09-27",
    "dia": "Domingo",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "cajas",
    "sectorNombre": "Cajas",
    "requeridos": 1,
    "empleados": [
     "E040"
    ]
   },
   {
    "fecha": "2026-09-27",
    "dia": "Domingo",
    "franja": "noche",
    "franjaNombre": "Noche",
    "desde": "22:00",
    "hasta": "06:00",
    "sector": "limpieza",
    "sectorNombre": "Limpieza",
    "requeridos": 1,
    "empleados": [
     "E051"
    ]
   }
  ]
 },
 "horas": {
  "2026-09": [
   {
    "empleadoId": "E001",
    "normales": 168,
    "nocturnas": 3,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 4
   },
   {
    "empleadoId": "E002",
    "normales": 168,
    "nocturnas": 98,
    "feriado": 8,
    "francosAdeudados": 0,
    "extras": 4
   },
   {
    "empleadoId": "E003",
    "normales": 184,
    "nocturnas": 10,
    "feriado": 8,
    "francosAdeudados": 0,
    "extras": 6
   },
   {
    "empleadoId": "E004",
    "normales": 152,
    "nocturnas": 0,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 4
   },
   {
    "empleadoId": "E005",
    "normales": 160,
    "nocturnas": 8,
    "feriado": 16,
    "francosAdeudados": 0,
    "extras": 6
   },
   {
    "empleadoId": "E006",
    "normales": 184,
    "nocturnas": 5,
    "feriado": 8,
    "francosAdeudados": 1,
    "extras": 6
   },
   {
    "empleadoId": "E007",
    "normales": 160,
    "nocturnas": 16,
    "feriado": 8,
    "francosAdeudados": 1,
    "extras": 4
   },
   {
    "empleadoId": "E008",
    "normales": 168,
    "nocturnas": 148,
    "feriado": 8,
    "francosAdeudados": 0,
    "extras": 4
   },
   {
    "empleadoId": "E009",
    "normales": 176,
    "nocturnas": 110,
    "feriado": 8,
    "francosAdeudados": 1,
    "extras": 12
   },
   {
    "empleadoId": "E010",
    "normales": 184,
    "nocturnas": 7,
    "feriado": 8,
    "francosAdeudados": 2,
    "extras": 0
   },
   {
    "empleadoId": "E011",
    "normales": 160,
    "nocturnas": 34,
    "feriado": 0,
    "francosAdeudados": 1,
    "extras": 0
   },
   {
    "empleadoId": "E012",
    "normales": 176,
    "nocturnas": 12,
    "feriado": 8,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E013",
    "normales": 184,
    "nocturnas": 21,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E014",
    "normales": 176,
    "nocturnas": 21,
    "feriado": 8,
    "francosAdeudados": 0,
    "extras": 4
   },
   {
    "empleadoId": "E015",
    "normales": 176,
    "nocturnas": 0,
    "feriado": 16,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E016",
    "normales": 152,
    "nocturnas": 19,
    "feriado": 8,
    "francosAdeudados": 2,
    "extras": 0
   },
   {
    "empleadoId": "E017",
    "normales": 168,
    "nocturnas": 1,
    "feriado": 16,
    "francosAdeudados": 1,
    "extras": 12
   },
   {
    "empleadoId": "E018",
    "normales": 152,
    "nocturnas": 8,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E019",
    "normales": 160,
    "nocturnas": 3,
    "feriado": 16,
    "francosAdeudados": 2,
    "extras": 0
   },
   {
    "empleadoId": "E020",
    "normales": 168,
    "nocturnas": 8,
    "feriado": 8,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E021",
    "normales": 176,
    "nocturnas": 0,
    "feriado": 8,
    "francosAdeudados": 2,
    "extras": 0
   },
   {
    "empleadoId": "E022",
    "normales": 168,
    "nocturnas": 4,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 12
   },
   {
    "empleadoId": "E023",
    "normales": 168,
    "nocturnas": 1,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E024",
    "normales": 152,
    "nocturnas": 4,
    "feriado": 8,
    "francosAdeudados": 1,
    "extras": 6
   },
   {
    "empleadoId": "E025",
    "normales": 184,
    "nocturnas": 7,
    "feriado": 0,
    "francosAdeudados": 1,
    "extras": 0
   },
   {
    "empleadoId": "E026",
    "normales": 176,
    "nocturnas": 5,
    "feriado": 16,
    "francosAdeudados": 0,
    "extras": 6
   },
   {
    "empleadoId": "E027",
    "normales": 184,
    "nocturnas": 1,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E028",
    "normales": 184,
    "nocturnas": 2,
    "feriado": 0,
    "francosAdeudados": 1,
    "extras": 0
   },
   {
    "empleadoId": "E029",
    "normales": 176,
    "nocturnas": 128,
    "feriado": 16,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E030",
    "normales": 152,
    "nocturnas": 0,
    "feriado": 8,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E031",
    "normales": 160,
    "nocturnas": 129,
    "feriado": 0,
    "francosAdeudados": 2,
    "extras": 8
   },
   {
    "empleadoId": "E032",
    "normales": 168,
    "nocturnas": 6,
    "feriado": 0,
    "francosAdeudados": 1,
    "extras": 0
   },
   {
    "empleadoId": "E033",
    "normales": 184,
    "nocturnas": 6,
    "feriado": 0,
    "francosAdeudados": 1,
    "extras": 0
   },
   {
    "empleadoId": "E034",
    "normales": 176,
    "nocturnas": 106,
    "feriado": 8,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E035",
    "normales": 160,
    "nocturnas": 23,
    "feriado": 8,
    "francosAdeudados": 0,
    "extras": 12
   },
   {
    "empleadoId": "E036",
    "normales": 176,
    "nocturnas": 24,
    "feriado": 16,
    "francosAdeudados": 0,
    "extras": 4
   },
   {
    "empleadoId": "E037",
    "normales": 160,
    "nocturnas": 132,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 12
   },
   {
    "empleadoId": "E038",
    "normales": 152,
    "nocturnas": 19,
    "feriado": 16,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E039",
    "normales": 176,
    "nocturnas": 24,
    "feriado": 8,
    "francosAdeudados": 1,
    "extras": 0
   },
   {
    "empleadoId": "E040",
    "normales": 152,
    "nocturnas": 111,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 4
   },
   {
    "empleadoId": "E041",
    "normales": 168,
    "nocturnas": 7,
    "feriado": 8,
    "francosAdeudados": 0,
    "extras": 6
   },
   {
    "empleadoId": "E042",
    "normales": 160,
    "nocturnas": 29,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 12
   },
   {
    "empleadoId": "E043",
    "normales": 184,
    "nocturnas": 2,
    "feriado": 8,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E044",
    "normales": 152,
    "nocturnas": 8,
    "feriado": 16,
    "francosAdeudados": 0,
    "extras": 6
   },
   {
    "empleadoId": "E045",
    "normales": 160,
    "nocturnas": 1,
    "feriado": 0,
    "francosAdeudados": 2,
    "extras": 0
   },
   {
    "empleadoId": "E046",
    "normales": 176,
    "nocturnas": 0,
    "feriado": 0,
    "francosAdeudados": 1,
    "extras": 0
   },
   {
    "empleadoId": "E047",
    "normales": 152,
    "nocturnas": 6,
    "feriado": 0,
    "francosAdeudados": 2,
    "extras": 4
   },
   {
    "empleadoId": "E048",
    "normales": 176,
    "nocturnas": 0,
    "feriado": 16,
    "francosAdeudados": 1,
    "extras": 0
   },
   {
    "empleadoId": "E049",
    "normales": 152,
    "nocturnas": 8,
    "feriado": 0,
    "francosAdeudados": 1,
    "extras": 0
   },
   {
    "empleadoId": "E050",
    "normales": 168,
    "nocturnas": 149,
    "feriado": 0,
    "francosAdeudados": 2,
    "extras": 4
   },
   {
    "empleadoId": "E051",
    "normales": 184,
    "nocturnas": 0,
    "feriado": 16,
    "francosAdeudados": 2,
    "extras": 6
   },
   {
    "empleadoId": "E052",
    "normales": 168,
    "nocturnas": 11,
    "feriado": 8,
    "francosAdeudados": 0,
    "extras": 8
   },
   {
    "empleadoId": "E053",
    "normales": 160,
    "nocturnas": 0,
    "feriado": 8,
    "francosAdeudados": 0,
    "extras": 6
   }
  ],
  "2026-08": [
   {
    "empleadoId": "E001",
    "normales": 160,
    "nocturnas": 6,
    "feriado": 0,
    "francosAdeudados": 1,
    "extras": 12
   },
   {
    "empleadoId": "E002",
    "normales": 152,
    "nocturnas": 97,
    "feriado": 0,
    "francosAdeudados": 1,
    "extras": 8
   },
   {
    "empleadoId": "E003",
    "normales": 176,
    "nocturnas": 22,
    "feriado": 8,
    "francosAdeudados": 0,
    "extras": 12
   },
   {
    "empleadoId": "E004",
    "normales": 160,
    "nocturnas": 24,
    "feriado": 16,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E005",
    "normales": 160,
    "nocturnas": 7,
    "feriado": 16,
    "francosAdeudados": 0,
    "extras": 12
   },
   {
    "empleadoId": "E006",
    "normales": 176,
    "nocturnas": 23,
    "feriado": 16,
    "francosAdeudados": 2,
    "extras": 0
   },
   {
    "empleadoId": "E007",
    "normales": 184,
    "nocturnas": 5,
    "feriado": 8,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E008",
    "normales": 176,
    "nocturnas": 131,
    "feriado": 16,
    "francosAdeudados": 2,
    "extras": 12
   },
   {
    "empleadoId": "E009",
    "normales": 160,
    "nocturnas": 134,
    "feriado": 0,
    "francosAdeudados": 1,
    "extras": 8
   },
   {
    "empleadoId": "E010",
    "normales": 152,
    "nocturnas": 6,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 4
   },
   {
    "empleadoId": "E011",
    "normales": 160,
    "nocturnas": 7,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 4
   },
   {
    "empleadoId": "E012",
    "normales": 160,
    "nocturnas": 13,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E013",
    "normales": 184,
    "nocturnas": 27,
    "feriado": 8,
    "francosAdeudados": 0,
    "extras": 6
   },
   {
    "empleadoId": "E014",
    "normales": 152,
    "nocturnas": 13,
    "feriado": 16,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E015",
    "normales": 168,
    "nocturnas": 8,
    "feriado": 0,
    "francosAdeudados": 1,
    "extras": 6
   },
   {
    "empleadoId": "E016",
    "normales": 160,
    "nocturnas": 25,
    "feriado": 0,
    "francosAdeudados": 2,
    "extras": 0
   },
   {
    "empleadoId": "E017",
    "normales": 176,
    "nocturnas": 26,
    "feriado": 0,
    "francosAdeudados": 1,
    "extras": 0
   },
   {
    "empleadoId": "E018",
    "normales": 160,
    "nocturnas": 5,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E019",
    "normales": 152,
    "nocturnas": 2,
    "feriado": 8,
    "francosAdeudados": 0,
    "extras": 6
   },
   {
    "empleadoId": "E020",
    "normales": 160,
    "nocturnas": 8,
    "feriado": 8,
    "francosAdeudados": 1,
    "extras": 12
   },
   {
    "empleadoId": "E021",
    "normales": 184,
    "nocturnas": 3,
    "feriado": 0,
    "francosAdeudados": 1,
    "extras": 12
   },
   {
    "empleadoId": "E022",
    "normales": 176,
    "nocturnas": 8,
    "feriado": 8,
    "francosAdeudados": 2,
    "extras": 8
   },
   {
    "empleadoId": "E023",
    "normales": 160,
    "nocturnas": 8,
    "feriado": 8,
    "francosAdeudados": 0,
    "extras": 6
   },
   {
    "empleadoId": "E024",
    "normales": 168,
    "nocturnas": 3,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E025",
    "normales": 168,
    "nocturnas": 7,
    "feriado": 8,
    "francosAdeudados": 1,
    "extras": 8
   },
   {
    "empleadoId": "E026",
    "normales": 184,
    "nocturnas": 5,
    "feriado": 8,
    "francosAdeudados": 2,
    "extras": 4
   },
   {
    "empleadoId": "E027",
    "normales": 168,
    "nocturnas": 1,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 12
   },
   {
    "empleadoId": "E028",
    "normales": 176,
    "nocturnas": 4,
    "feriado": 8,
    "francosAdeudados": 1,
    "extras": 8
   },
   {
    "empleadoId": "E029",
    "normales": 160,
    "nocturnas": 91,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 8
   },
   {
    "empleadoId": "E030",
    "normales": 176,
    "nocturnas": 14,
    "feriado": 8,
    "francosAdeudados": 1,
    "extras": 0
   },
   {
    "empleadoId": "E031",
    "normales": 184,
    "nocturnas": 124,
    "feriado": 8,
    "francosAdeudados": 0,
    "extras": 8
   },
   {
    "empleadoId": "E032",
    "normales": 184,
    "nocturnas": 2,
    "feriado": 0,
    "francosAdeudados": 2,
    "extras": 0
   },
   {
    "empleadoId": "E033",
    "normales": 176,
    "nocturnas": 0,
    "feriado": 8,
    "francosAdeudados": 0,
    "extras": 6
   },
   {
    "empleadoId": "E034",
    "normales": 168,
    "nocturnas": 101,
    "feriado": 16,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E035",
    "normales": 152,
    "nocturnas": 24,
    "feriado": 16,
    "francosAdeudados": 0,
    "extras": 8
   },
   {
    "empleadoId": "E036",
    "normales": 160,
    "nocturnas": 4,
    "feriado": 8,
    "francosAdeudados": 2,
    "extras": 0
   },
   {
    "empleadoId": "E037",
    "normales": 168,
    "nocturnas": 103,
    "feriado": 8,
    "francosAdeudados": 0,
    "extras": 6
   },
   {
    "empleadoId": "E038",
    "normales": 176,
    "nocturnas": 27,
    "feriado": 0,
    "francosAdeudados": 1,
    "extras": 4
   },
   {
    "empleadoId": "E039",
    "normales": 176,
    "nocturnas": 2,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E040",
    "normales": 168,
    "nocturnas": 100,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E041",
    "normales": 184,
    "nocturnas": 4,
    "feriado": 0,
    "francosAdeudados": 1,
    "extras": 0
   },
   {
    "empleadoId": "E042",
    "normales": 184,
    "nocturnas": 2,
    "feriado": 8,
    "francosAdeudados": 1,
    "extras": 4
   },
   {
    "empleadoId": "E043",
    "normales": 152,
    "nocturnas": 2,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E044",
    "normales": 160,
    "nocturnas": 1,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E045",
    "normales": 184,
    "nocturnas": 31,
    "feriado": 16,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E046",
    "normales": 160,
    "nocturnas": 3,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 8
   },
   {
    "empleadoId": "E047",
    "normales": 184,
    "nocturnas": 3,
    "feriado": 16,
    "francosAdeudados": 2,
    "extras": 0
   },
   {
    "empleadoId": "E048",
    "normales": 160,
    "nocturnas": 1,
    "feriado": 0,
    "francosAdeudados": 1,
    "extras": 8
   },
   {
    "empleadoId": "E049",
    "normales": 152,
    "nocturnas": 6,
    "feriado": 16,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E050",
    "normales": 160,
    "nocturnas": 138,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 12
   },
   {
    "empleadoId": "E051",
    "normales": 176,
    "nocturnas": 7,
    "feriado": 8,
    "francosAdeudados": 1,
    "extras": 0
   },
   {
    "empleadoId": "E052",
    "normales": 152,
    "nocturnas": 13,
    "feriado": 16,
    "francosAdeudados": 0,
    "extras": 6
   },
   {
    "empleadoId": "E053",
    "normales": 184,
    "nocturnas": 8,
    "feriado": 8,
    "francosAdeudados": 0,
    "extras": 8
   }
  ],
  "2026-07": [
   {
    "empleadoId": "E001",
    "normales": 176,
    "nocturnas": 0,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E002",
    "normales": 168,
    "nocturnas": 124,
    "feriado": 8,
    "francosAdeudados": 1,
    "extras": 8
   },
   {
    "empleadoId": "E003",
    "normales": 152,
    "nocturnas": 23,
    "feriado": 0,
    "francosAdeudados": 2,
    "extras": 12
   },
   {
    "empleadoId": "E004",
    "normales": 160,
    "nocturnas": 4,
    "feriado": 8,
    "francosAdeudados": 0,
    "extras": 12
   },
   {
    "empleadoId": "E005",
    "normales": 184,
    "nocturnas": 1,
    "feriado": 8,
    "francosAdeudados": 2,
    "extras": 12
   },
   {
    "empleadoId": "E006",
    "normales": 176,
    "nocturnas": 1,
    "feriado": 16,
    "francosAdeudados": 0,
    "extras": 8
   },
   {
    "empleadoId": "E007",
    "normales": 176,
    "nocturnas": 23,
    "feriado": 16,
    "francosAdeudados": 1,
    "extras": 6
   },
   {
    "empleadoId": "E008",
    "normales": 160,
    "nocturnas": 115,
    "feriado": 0,
    "francosAdeudados": 2,
    "extras": 8
   },
   {
    "empleadoId": "E009",
    "normales": 184,
    "nocturnas": 121,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E010",
    "normales": 168,
    "nocturnas": 8,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 4
   },
   {
    "empleadoId": "E011",
    "normales": 160,
    "nocturnas": 26,
    "feriado": 8,
    "francosAdeudados": 1,
    "extras": 0
   },
   {
    "empleadoId": "E012",
    "normales": 152,
    "nocturnas": 33,
    "feriado": 16,
    "francosAdeudados": 1,
    "extras": 6
   },
   {
    "empleadoId": "E013",
    "normales": 176,
    "nocturnas": 6,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 6
   },
   {
    "empleadoId": "E014",
    "normales": 176,
    "nocturnas": 34,
    "feriado": 16,
    "francosAdeudados": 0,
    "extras": 4
   },
   {
    "empleadoId": "E015",
    "normales": 184,
    "nocturnas": 7,
    "feriado": 16,
    "francosAdeudados": 0,
    "extras": 6
   },
   {
    "empleadoId": "E016",
    "normales": 152,
    "nocturnas": 2,
    "feriado": 16,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E017",
    "normales": 168,
    "nocturnas": 15,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E018",
    "normales": 168,
    "nocturnas": 0,
    "feriado": 8,
    "francosAdeudados": 1,
    "extras": 0
   },
   {
    "empleadoId": "E019",
    "normales": 176,
    "nocturnas": 4,
    "feriado": 8,
    "francosAdeudados": 1,
    "extras": 6
   },
   {
    "empleadoId": "E020",
    "normales": 168,
    "nocturnas": 0,
    "feriado": 16,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E021",
    "normales": 168,
    "nocturnas": 8,
    "feriado": 16,
    "francosAdeudados": 0,
    "extras": 6
   },
   {
    "empleadoId": "E022",
    "normales": 160,
    "nocturnas": 5,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 4
   },
   {
    "empleadoId": "E023",
    "normales": 152,
    "nocturnas": 0,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E024",
    "normales": 152,
    "nocturnas": 4,
    "feriado": 8,
    "francosAdeudados": 1,
    "extras": 8
   },
   {
    "empleadoId": "E025",
    "normales": 152,
    "nocturnas": 5,
    "feriado": 8,
    "francosAdeudados": 0,
    "extras": 12
   },
   {
    "empleadoId": "E026",
    "normales": 152,
    "nocturnas": 7,
    "feriado": 0,
    "francosAdeudados": 1,
    "extras": 0
   },
   {
    "empleadoId": "E027",
    "normales": 168,
    "nocturnas": 1,
    "feriado": 0,
    "francosAdeudados": 1,
    "extras": 4
   },
   {
    "empleadoId": "E028",
    "normales": 160,
    "nocturnas": 5,
    "feriado": 8,
    "francosAdeudados": 1,
    "extras": 0
   },
   {
    "empleadoId": "E029",
    "normales": 152,
    "nocturnas": 137,
    "feriado": 0,
    "francosAdeudados": 1,
    "extras": 8
   },
   {
    "empleadoId": "E030",
    "normales": 168,
    "nocturnas": 26,
    "feriado": 8,
    "francosAdeudados": 2,
    "extras": 6
   },
   {
    "empleadoId": "E031",
    "normales": 168,
    "nocturnas": 149,
    "feriado": 0,
    "francosAdeudados": 2,
    "extras": 12
   },
   {
    "empleadoId": "E032",
    "normales": 176,
    "nocturnas": 4,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 12
   },
   {
    "empleadoId": "E033",
    "normales": 168,
    "nocturnas": 7,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 8
   },
   {
    "empleadoId": "E034",
    "normales": 184,
    "nocturnas": 123,
    "feriado": 8,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E035",
    "normales": 160,
    "nocturnas": 10,
    "feriado": 16,
    "francosAdeudados": 1,
    "extras": 4
   },
   {
    "empleadoId": "E036",
    "normales": 160,
    "nocturnas": 34,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E037",
    "normales": 160,
    "nocturnas": 141,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 6
   },
   {
    "empleadoId": "E038",
    "normales": 176,
    "nocturnas": 21,
    "feriado": 0,
    "francosAdeudados": 2,
    "extras": 6
   },
   {
    "empleadoId": "E039",
    "normales": 168,
    "nocturnas": 19,
    "feriado": 0,
    "francosAdeudados": 1,
    "extras": 12
   },
   {
    "empleadoId": "E040",
    "normales": 176,
    "nocturnas": 144,
    "feriado": 8,
    "francosAdeudados": 0,
    "extras": 0
   },
   {
    "empleadoId": "E041",
    "normales": 168,
    "nocturnas": 3,
    "feriado": 8,
    "francosAdeudados": 1,
    "extras": 8
   },
   {
    "empleadoId": "E042",
    "normales": 168,
    "nocturnas": 24,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 8
   },
   {
    "empleadoId": "E043",
    "normales": 168,
    "nocturnas": 1,
    "feriado": 16,
    "francosAdeudados": 2,
    "extras": 0
   },
   {
    "empleadoId": "E044",
    "normales": 176,
    "nocturnas": 8,
    "feriado": 16,
    "francosAdeudados": 1,
    "extras": 4
   },
   {
    "empleadoId": "E045",
    "normales": 160,
    "nocturnas": 30,
    "feriado": 8,
    "francosAdeudados": 1,
    "extras": 6
   },
   {
    "empleadoId": "E046",
    "normales": 160,
    "nocturnas": 4,
    "feriado": 16,
    "francosAdeudados": 2,
    "extras": 0
   },
   {
    "empleadoId": "E047",
    "normales": 168,
    "nocturnas": 0,
    "feriado": 0,
    "francosAdeudados": 1,
    "extras": 6
   },
   {
    "empleadoId": "E048",
    "normales": 152,
    "nocturnas": 7,
    "feriado": 8,
    "francosAdeudados": 1,
    "extras": 8
   },
   {
    "empleadoId": "E049",
    "normales": 152,
    "nocturnas": 6,
    "feriado": 8,
    "francosAdeudados": 1,
    "extras": 0
   },
   {
    "empleadoId": "E050",
    "normales": 184,
    "nocturnas": 117,
    "feriado": 8,
    "francosAdeudados": 0,
    "extras": 4
   },
   {
    "empleadoId": "E051",
    "normales": 152,
    "nocturnas": 2,
    "feriado": 0,
    "francosAdeudados": 1,
    "extras": 8
   },
   {
    "empleadoId": "E052",
    "normales": 168,
    "nocturnas": 34,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 6
   },
   {
    "empleadoId": "E053",
    "normales": 176,
    "nocturnas": 1,
    "feriado": 0,
    "francosAdeudados": 0,
    "extras": 8
   }
  ]
 },
 "resguardo": {
  "copias": [
   {
    "fecha": "2026-09-22",
    "hora": "03:15",
    "tamanoMB": 2177,
    "duracionMin": 15,
    "destinoLocal": true,
    "destinoExterno": true,
    "estado": "ok",
    "detalle": "Copia completa verificada"
   },
   {
    "fecha": "2026-09-21",
    "hora": "03:15",
    "tamanoMB": 2509,
    "duracionMin": 8,
    "destinoLocal": true,
    "destinoExterno": true,
    "estado": "ok",
    "detalle": "Copia completa verificada"
   },
   {
    "fecha": "2026-09-20",
    "hora": "03:15",
    "tamanoMB": 2331,
    "duracionMin": 8,
    "destinoLocal": true,
    "destinoExterno": true,
    "estado": "ok",
    "detalle": "Copia completa verificada"
   },
   {
    "fecha": "2026-09-19",
    "hora": "03:15",
    "tamanoMB": 2477,
    "duracionMin": 13,
    "destinoLocal": true,
    "destinoExterno": true,
    "estado": "ok",
    "detalle": "Copia completa verificada"
   },
   {
    "fecha": "2026-09-18",
    "hora": "03:15",
    "tamanoMB": 2545,
    "duracionMin": 9,
    "destinoLocal": true,
    "destinoExterno": true,
    "estado": "alerta",
    "detalle": "La copia fuera del local tardó más de lo habitual"
   },
   {
    "fecha": "2026-09-17",
    "hora": "03:15",
    "tamanoMB": 2500,
    "duracionMin": 11,
    "destinoLocal": true,
    "destinoExterno": true,
    "estado": "ok",
    "detalle": "Copia completa verificada"
   },
   {
    "fecha": "2026-09-16",
    "hora": "03:15",
    "tamanoMB": 2502,
    "duracionMin": 18,
    "destinoLocal": true,
    "destinoExterno": true,
    "estado": "ok",
    "detalle": "Copia completa verificada"
   },
   {
    "fecha": "2026-09-15",
    "hora": "03:15",
    "tamanoMB": 2470,
    "duracionMin": 16,
    "destinoLocal": true,
    "destinoExterno": true,
    "estado": "ok",
    "detalle": "Copia completa verificada"
   },
   {
    "fecha": "2026-09-14",
    "hora": "03:15",
    "tamanoMB": 2144,
    "duracionMin": 6,
    "destinoLocal": true,
    "destinoExterno": true,
    "estado": "ok",
    "detalle": "Copia completa verificada"
   },
   {
    "fecha": "2026-09-13",
    "hora": "03:15",
    "tamanoMB": 2334,
    "duracionMin": 18,
    "destinoLocal": true,
    "destinoExterno": false,
    "estado": "error",
    "detalle": "La PC de Caja 1 estaba apagada, no se generó copia"
   },
   {
    "fecha": "2026-09-12",
    "hora": "03:15",
    "tamanoMB": 2461,
    "duracionMin": 9,
    "destinoLocal": true,
    "destinoExterno": true,
    "estado": "ok",
    "detalle": "Copia completa verificada"
   },
   {
    "fecha": "2026-09-11",
    "hora": "03:15",
    "tamanoMB": 2288,
    "duracionMin": 16,
    "destinoLocal": true,
    "destinoExterno": true,
    "estado": "ok",
    "detalle": "Copia completa verificada"
   },
   {
    "fecha": "2026-09-10",
    "hora": "03:15",
    "tamanoMB": 2510,
    "duracionMin": 18,
    "destinoLocal": true,
    "destinoExterno": true,
    "estado": "ok",
    "detalle": "Copia completa verificada"
   },
   {
    "fecha": "2026-09-09",
    "hora": "03:15",
    "tamanoMB": 2147,
    "duracionMin": 15,
    "destinoLocal": true,
    "destinoExterno": true,
    "estado": "ok",
    "detalle": "Copia completa verificada"
   }
  ],
  "ultimaPrueba": "2026-09-11",
  "resultadoPrueba": "ok",
  "minutosRestauracion": 24
 },
 "conexiones": [
  {
   "id": "holistor",
   "nombre": "Holistor",
   "que": "Compras, proveedores e impuestos",
   "tipo": "nube",
   "estado": "ok",
   "modo": "automatico",
   "ultima": "2026-09-22 03:40",
   "detalle": "218 comprobantes leídos",
   "ruta": "Lectura automática (a confirmar en el relevamiento)"
  },
  {
   "id": "todosoft",
   "nombre": "Todosoft",
   "que": "Ventas y cierres de las 3 cajas",
   "tipo": "local",
   "estado": "ok",
   "modo": "automatico",
   "ultima": "2026-09-22 03:12",
   "detalle": "Cierres de las 3 cajas al día",
   "ruta": "Solo lectura sobre SQL Server en Caja 1"
  },
  {
   "id": "arca",
   "nombre": "ARCA",
   "que": "Comprobantes emitidos y recibidos",
   "tipo": "nube",
   "estado": "ok",
   "modo": "automatico",
   "ultima": "2026-09-22 04:05",
   "detalle": "Mis Comprobantes del período 09/2026",
   "ruta": "Descarga con la clave fiscal del cliente"
  }
 ]
};
