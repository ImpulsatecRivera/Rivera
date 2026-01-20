# Reporte de Componentes Encontrados

## Resumen Ejecutivo
Se encontró el componente principal que muestra "Agregar Empleados" con un "Resumen Rápido" en el lado derecho con información de progreso (Paso 2 de 3), días, empleados y totales.

---

## 📁 Archivo Principal Encontrado

### Nombre Exacto del Archivo:
```
Planillasemanalnueva .jsx
```

### Ruta Completa:
```
c:\Users\contr\OneDrive\Escritorio\Riverini\Rivera\Frontend\page-Private\src\pages\Planilla\Planillasemanalnueva .jsx
```

---

## 🔍 Cadenas Encontradas y Sus Líneas

### 1. "Resumen Rápido"
- **Línea 775**: Encabezado del panel de resumen rápido
```jsx
<h3 className="text-[#34353A] font-bold mb-4 flex items-center gap-2">
  <Info size={18} />
  Resumen Rápido
</h3>
```

### 2. "Agregar Empleados"
- **Línea 505**: Título principal del paso 2
```jsx
<h2 className="text-2xl font-bold text-[#34353A]">Agregar Empleados</h2>
```

### 3. Progreso - "Paso 2 de 3"
- **Línea 763**: Texto que muestra el paso actual
```jsx
<span className="text-gray-600 text-sm">Paso {step} de 3</span>
```

### 4. Barra de Progreso - 67% (Paso 2 de 3)
- **Línea 764**: Muestra el porcentaje
```jsx
<span className="text-[#5F8EAD] font-bold">{Math.round((step/3) * 100)}%</span>
```

- **Línea 767**: Barra de progreso animada
```jsx
<div 
  className="h-full bg-gradient-to-r from-[#5F8EAD] to-[#5D9646] transition-all duration-500 rounded-full"
  style={{ width: `${(step/3) * 100}%` }}
/>
```

### 5. "Días: 6" (en Resumen Rápido)
- **Línea 779-783**: Panel de días
```jsx
<div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
  <span className="text-gray-600 text-sm flex items-center gap-2">
    <Calendar size={16} />
    Días
  </span>
  <span className="text-[#34353A] font-bold">6</span>
</div>
```

### 6. "Empleados: {cantidad}" (en Resumen Rápido)
- **Línea 784-789**: Panel de empleados
```jsx
<div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
  <span className="text-gray-600 text-sm flex items-center gap-2">
    <Users size={16} />
    Empleados
  </span>
  <span className="text-[#34353A] font-bold">{empleadosSeleccionados.length}</span>
</div>
```

### 7. "Total Base: {monto}" (en Resumen Rápido)
- **Línea 790-796**: Panel de total base
```jsx
<div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
  <span className="text-gray-600 text-sm flex items-center gap-2">
    <DollarSign size={16} />
    Total Base
  </span>
  <span className="text-[#5D9646] font-bold">
    {formatearMoneda(calcularTotalEstimado())}
  </span>
</div>
```

---

## 🧩 Componentes Principales

### Componente Principal:
```jsx
export default function PlanillaSemanalNueva()
```

### Estados (useState):
```javascript
const [step, setStep] = useState(1);                                    // Línea 23
const [fechaInicio, setFechaInicio] = useState('');                    // Línea 24
const [fechaFin, setFechaFin] = useState('');                          // Línea 25
const [diasHabiles, setDiasHabiles] = useState('26');                  // Línea 26
const [loading, setLoading] = useState(false);                         // Línea 27
const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState([]); // Línea 28
const [empleadosDisponibles, setEmpleadosDisponibles] = useState([]);  // Línea 29
const [busquedaEmpleados, setBusquedaEmpleados] = useState('');        // Línea 30
const [loadingEmpleados, setLoadingEmpleados] = useState(false);       // Línea 31
```

---

## 💼 Información Sobre Tipos de Salario

### Referencia a "planillaTipo" / "tipoSalario":
- **Línea 536-541**: Filtro y clasificación de tipo de planilla
```jsx
<span className={`text-xs px-2 py-1 rounded-lg ${
  empleado.planillaTipo === 'Semanal' 
    ? 'bg-green-100 text-green-700' 
    : empleado.planillaTipo === 'Quincenal'
    ? 'bg-blue-100 text-blue-700'
    : 'bg-gray-100 text-gray-600'
}`}>
  {empleado.planillaTipo}
</span>
```

### Tipos de Planilla Detectados:
1. **Semanal** (verde)
2. **Quincenal** (azul)
3. Otros (gris)

---

## 📊 Funciones de Cálculo de Salarios

### 1. Cálculo de Base Diaria (Línea 155-157):
```javascript
const calcularBaseDiaria = (salario) => {
  return (salario / parseInt(diasHabiles)).toFixed(2);
};
```

### 2. Cálculo de Total Estimado (Línea 159-163):
```javascript
const calcularTotalEstimado = () => {
  return empleadosSeleccionados.reduce((total, emp) => {
    return total + (parseFloat(calcularBaseDiaria(emp.salario)) * 6);
  }, 0);
};
```

---

## 📋 Descripción de la Interfaz

### Paso 2 - "Agregar Empleados" (Step 2):
La interfaz se divide en dos secciones:

#### Sección Izquierda (Línea 498-676):
- **Título**: "Agregar Empleados" (Línea 505)
- **Subtítulo**: Muestra cantidad disponibles: "{n} disponibles (x empleados, y motoristas)" (Línea 507-509)
- **Búsqueda**: Input para filtrar empleados (Línea 517-525)
- **Lista de Empleados Disponibles** (Línea 528-574):
  - Muestra empleados en grid de 2 columnas
  - Cada tarjeta muestra:
    - Nombre del empleado
    - Tipo (Empleado/Motorista)
    - Tipo de Planilla (Semanal/Quincenal)
    - Base Diaria: "{monto} /día"
  - Hace referencia a `planillaTipo` de cada empleado
  - Calcula salario usando `calcularBaseDiaria()`

- **Sección de Seleccionados** (Línea 576-605):
  - Muestra empleados seleccionados
  - Permite remover empleados

#### Sección Derecha - "Resumen Rápido" (Línea 758-796):
- **Tarjeta de Progreso** (Línea 755-771):
  - "Paso {step} de 3"
  - Porcentaje: {Math.round((step/3) * 100)}%
  - Barra de progreso animada

- **Tarjeta de Resumen Rápido** (Línea 773-796):
  - Días: 6
  - Empleados: {empleadosSeleccionados.length}
  - Total Base: {formatearMoneda(calcularTotalEstimado())}

---

## 🔄 Flujo de Pasos

1. **Step 1** (Línea 418): Configurar Período
   - Seleccionar fecha inicio (Lunes)
   - Seleccionar fecha fin (Sábado - automática)
   - Configurar días hábiles del mes

2. **Step 2** (Línea 498): Agregar Empleados
   - Buscar y seleccionar empleados
   - Ver resumen rápido

3. **Step 3** (Línea 607): Confirmar Creación
   - Revisar período
   - Revisar empleados
   - Total estimado
   - Crear planilla

---

## 🔗 Funcionalidades Relacionadas

### Cargar Datos Anteriores (Línea 514-515):
- Botón "Cargar Anteriores" que carga empleados de planilla anterior

### Manejar Agregar Empleado (Línea 147-151):
```javascript
const handleAgregarEmpleado = (empleado) => {
  if (!empleadosSeleccionados.find(e => e._id === empleado._id)) {
    setEmpleadosSeleccionados([...empleadosSeleccionados, empleado]);
  }
};
```

### Manejar Remover Empleado (Línea 153-155):
```javascript
const handleRemoverEmpleado = (empleadoId) => {
  setEmpleadosSeleccionados(empleadosSeleccionados.filter(e => e._id !== empleadoId));
};
```

### Crear Planilla (Línea 165-252):
- Valida fechas y días hábiles
- Crea planilla semanal via API
- Agrega empleados seleccionados
- Navega a la planilla creada

---

## 📌 Notas Importantes

1. **Nombre del archivo con espacio**: El archivo se llama `Planillasemanalnueva .jsx` (con espacio al final del nombre antes de la extensión)

2. **Sistema de Progreso**: Utiliza un estado `step` para controlar qué paso se muestra (1, 2 o 3)

3. **Cálculo de 6 días**: Hardcodeado en línea 789 (de lunes a sábado = 6 días)

4. **Días Hábiles**: Parámetro configurable (entre 20-31) para calcular la base diaria (línea 26, 156-157)

5. **Tipos de Salario**: Detecta automáticamente si es "Semanal", "Quincenal" u otro según el campo `planillaTipo` del empleado

6. **Integración API**: 
   - GET: Obtiene empleados y motoristas (Línea 90-91)
   - POST: Crea planilla semanal (Línea 196)
   - POST: Agrega empleados a la planilla (Línea 211)

---

## 📍 Ubicación de Características Clave

| Característica | Líneas |
|---|---|
| Título "Agregar Empleados" | 505 |
| "Resumen Rápido" | 775 |
| "Paso 2 de 3" | 763 |
| Porcentaje del progreso | 764 |
| Barra de progreso (67% en paso 2) | 767 |
| Días: 6 | 789 |
| Empleados: {n} | 794 |
| Total Base | 796 |
| Cálculo de base diaria | 155-157 |
| Cálculo de total estimado | 159-163 |
| Filtro de planillaTipo | 536-541 |
| Función handleAgregarEmpleado | 147-151 |
| Función handleRemoverEmpleado | 153-155 |

