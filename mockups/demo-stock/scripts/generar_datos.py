"""Genera assets/datos.js para la demo de Encastre Stock.

Todos los datos son inventados: marcas, códigos, referencias, máquinas y proveedores
son ficticios. No sale nada de ningún cliente. Uso: python scripts/generar_datos.py
"""
import json
import random
from pathlib import Path

rnd = random.Random(20260928)

DEP = 'CEN'

MARCAS = ['FILTREX', 'SELLTEC', 'HIDROVAL', 'VOLTRAK', 'TERMIX', 'MOTORPAR', 'RODANTE']
PROVEEDORES = ['NR', 'LT', 'AZ', 'PM', 'SUR']
MAQUINAS = ['EX-120', 'EX-210', 'EX-330', 'CX-45', 'CX-60', 'RT-900', 'RT-950', 'PL-18', 'PL-22', 'MX-400', 'MX-450', 'TX-7']

# categoria -> (subcategorías, descripciones, marca preferida, prefijo de código, rango de costo FOB)
CATALOGO = {
    'Filtros': (['Aire', 'Aceite', 'Combustible', 'Hidráulico', 'Aire cabina', 'Separador agua'],
                {'Aire': ['FILTRO AIRE PRIMARIO', 'FILTRO AIRE SECUNDARIO'], 'Aceite': ['FILTRO ACEITE MOTOR'],
                 'Combustible': ['FILTRO COMBUSTIBLE', 'PREFILTRO COMBUSTIBLE'], 'Hidráulico': ['FILTRO HIDRAULICO RETORNO', 'FILTRO HIDRAULICO PILOTO'],
                 'Aire cabina': ['FILTRO AIRE CABINA'], 'Separador agua': ['SEPARADOR AGUA COMBUSTIBLE']},
                'FILTREX', 'FX', (3, 38)),
    'Sellos y Juntas': (None, ['O RING', 'KIT SELLOS CILINDRO', 'RETEN CIGUEÑAL', 'JUNTA TAPA VALVULAS', 'KIT SELLOS BOMBA'], 'SELLTEC', 'SL', (0.3, 22)),
    'Piezas Hidráulicas': (None, ['VALVULA ALIVIO', 'MANGUERA HIDRAULICA 1/2', 'ACOPLE RAPIDO', 'BOMBA ENGRANAJES'], 'HIDROVAL', 'HV', (6, 180)),
    'Sistema Eléctrico': (None, ['SENSOR TEMPERATURA', 'SENSOR PRESION ACEITE', 'RELE ARRANQUE', 'ALTERNADOR 24V', 'FUSIBLE 30A'], 'VOLTRAK', 'VT', (1, 140)),
    'Sistema de Enfriamiento': (None, ['TERMOSTATO', 'BOMBA DE AGUA', 'CORREA VENTILADOR', 'TAPA RADIADOR'], 'TERMIX', 'TM', (4, 95)),
    'Componentes de Motor': (None, ['JUEGO AROS', 'COJINETE BIELA', 'VALVULA ADMISION', 'TURBO COMPRESOR'], 'MOTORPAR', 'MP', (5, 320)),
    'Rodaje': (None, ['RODILLO INFERIOR', 'ZAPATA', 'RUEDA GUIA'], 'RODANTE', 'RD', (40, 260)),
    'Accesorios': (None, ['GRASERA', 'ABRAZADERA', 'ESPEJO RETROVISOR', 'ASIENTO OPERADOR'], '', 'AC', (0.5, 60)),
}
PESO_CAT = {'Filtros': 40, 'Sellos y Juntas': 18, 'Piezas Hidráulicas': 8, 'Sistema Eléctrico': 9,
            'Sistema de Enfriamiento': 7, 'Componentes de Motor': 8, 'Rodaje': 3, 'Accesorios': 7}

# ---------------- depósito ----------------
ubicaciones = []
for letra in 'ABCDEF':
    for nivel in range(5):
        ubicaciones.append({'id': f'{letra}{nivel}', 'zona': 'rack', 'nombre': f'Estantería {letra} · Nivel {nivel}'})
ubicaciones += [
    {'id': 'EST1', 'zona': 'estante', 'nombre': 'Estante 1'},
    {'id': 'EST1-C1', 'zona': 'caja', 'nombre': 'Estante 1 › Caja Nº1'},
    {'id': 'EST1-C2', 'zona': 'caja', 'nombre': 'Estante 1 › Caja Nº2'},
    {'id': 'MOST', 'zona': 'mostrador', 'nombre': 'Mostrador'},
    {'id': 'SIN', 'zona': 'sin', 'nombre': 'Sin ubicación'},
]
cajas = [
    {'id': 'EST1-C1', 'estante': 'EST1', 'numero': 1, 'nombre': 'Caja Nº1', 'colorExcel': '#4FBE8E'},
    {'id': 'EST1-C2', 'estante': 'EST1', 'numero': 2, 'nombre': 'Caja Nº2', 'colorExcel': '#E8EDE8'},
]
# A1 queda reservada: es la que abre el conteo del celular y tiene pocos productos para contar en un video corto
racks = [u['id'] for u in ubicaciones if u['zona'] == 'rack' and u['id'] != 'A1']


def producto(n, categoria, sub=None, desc=None, stock=None):
    subs, descs, marca, pref, (cmin, cmax) = CATALOGO[categoria]
    if subs and sub is None:
        sub = rnd.choice(subs)
    if desc is None:
        desc = rnd.choice(descs[sub] if isinstance(descs, dict) else descs)
    codigo = f'{pref}-{rnd.randint(10000, 99999)}'
    fob = round(rnd.uniform(cmin, cmax), 2) if rnd.random() < 0.8 else None
    mult = rnd.choice([2.2, 2.5, 2.8]) if fob and rnd.random() < 0.3 else None
    tipo = 'genuina' if rnd.random() < 0.08 else 'alternativa'
    if stock is None:
        cant = rnd.choice([0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20])
        stock = [{'dep': DEP, 'ubic': rnd.choice(racks), 'cant': cant}]
        if rnd.random() < 0.12:
            stock.append({'dep': DEP, 'ubic': rnd.choice(racks), 'cant': rnd.randint(1, 6)})
    p = {
        'codigo': codigo, 'codigoExcel': codigo, 'descripcion': desc, 'variantesDesc': [],
        'categoria': categoria, 'subcategoria': sub, 'tipoParte': tipo,
        'empaque': rnd.choice([10, 20]) if desc == 'O RING' else None,
        'marca': marca if rnd.random() < 0.85 else '',
        'proveedores': [rnd.choice(PROVEEDORES)],
        'pesoKg': round(rnd.uniform(0.05, 4), 3), 'pesoDudoso': False,
        'costoFob': fob, 'costoArg': round(fob * mult, 2) if mult else None,
        'refs': [f'{rnd.choice("KLRZ")}{rnd.randint(100000, 999999)}' for _ in range(rnd.choice([0, 1, 1, 2]))],
        'compat': [' '.join(sorted(rnd.sample(MAQUINAS, rnd.randint(1, 4))))] if rnd.random() < 0.6 else [],
        'stock': stock, 'filas': [n + 1], 'alertas': [], 'id': f'P{n:04d}',
    }
    if mult:
        p['multiplicador'] = mult
    return p


productos = []
cats = [c for c, w in PESO_CAT.items() for _ in range(w)]
for n in range(1, 241):
    if n == 61:
        # Producto destacado de la demo (03 y 04 lo abren por defecto): 3 unidades, mínimo 2.
        # Vendiendo 2 queda "Bajo mínimo", que es lo que se muestra en el reel.
        p = producto(n, 'Filtros', 'Combustible', 'FILTRO COMBUSTIBLE',
                     [{'dep': DEP, 'ubic': 'A1', 'cant': 3}])
        p.update(codigo='FX-20418', codigoExcel='FX-20418', marca='FILTREX', costoFob=9.4, costoArg=None,
                 refs=['K418220', 'L20418'], compat=['EX-120 EX-210 CX-60'], tipoParte='alternativa')
        p.pop('multiplicador', None)
    else:
        p = producto(n, rnd.choice(cats))
    productos.append(p)

# Ubicación A1: el producto destacado + 3 más, para contarla rápido en la demo
for p in rnd.sample([p for p in productos if p['id'] != 'P0061' and len(p['stock']) == 1 and p['stock'][0]['cant'] > 0], 3):
    p['stock'][0]['ubic'] = 'A1'
# Algunos pendientes de contar y en cajas, para que el sistema muestre esos estados
for p in rnd.sample([p for p in productos if p['stock'][0]['ubic'] != 'A1'], 3):
    p['stock'][0]['aContar'] = True
    p['alertas'].append('Cantidad sin confirmar: hay que contar')
for p in [p for p in productos if p['descripcion'] == 'O RING'][:4]:
    p['stock'] = [{'dep': DEP, 'ubic': rnd.choice(['EST1-C1', 'EST1-C2']), 'cant': rnd.randint(1, 6)}]

datos = {'resumen': {'demo': True, 'productosUnicos': len(productos)},
         'productos': productos, 'ubicaciones': ubicaciones, 'cajas': cajas}
salida = Path(__file__).resolve().parent.parent / 'assets' / 'datos.js'
salida.write_text('// Generado por scripts/generar_datos.py — datos inventados para la demo\n'
                  'window.DEMO_DATA = ' + json.dumps(datos, ensure_ascii=False, separators=(',', ':')) + ';\n',
                  encoding='utf8')
print(f'{len(productos)} productos -> {salida}')
