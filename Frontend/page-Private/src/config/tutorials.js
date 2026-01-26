// src/config/tutorials.js
// ⬇️ ESTE ES EL ÚNICO ARCHIVO - TIENE TODOS LOS TUTORIALES

export const TUTORIALS = {
  // 🏠 DASHBOARD
  sidebar: {
    checkDataEndpoint: null, // Siempre disponible
    steps: [
      {
        element: '.h-screen.bg-\\[\\#2C2D31\\]',
        popover: {
          title: '🧭 Bienvenido al Menú de Navegación',
          description: 'Este es tu menú lateral desde donde accedes a todos los módulos del sistema Rivera.',
          side: 'right',
        }
      },
      {
        element: 'button:has(> svg.lucide-chevron-left), button:has(> svg.lucide-chevron-right)',
        popover: {
          title: '↔️ Expandir/Contraer',
          description: 'Haz clic aquí para expandir o contraer el menú. En modo contraído verás solo los íconos para ahorrar espacio.',
          side: 'right'
        }
      },
      {
        element: 'nav.flex-1',
        popover: {
          title: '📂 Módulos del Sistema',
          description: 'Aquí están todos los módulos disponibles: Inicio, Planilla, Mantenimientos, Diesel, Viajes, Caja Chica y Ventas.',
          side: 'right'
        }
      },
      {
        element: 'button:has(> svg.lucide-home)',
        popover: {
          title: '🏠 Dashboard / Inicio',
          description: 'El Dashboard muestra un resumen general con estadísticas, gráficos y alertas de todos los módulos.',
          side: 'right'
        }
      },
      {
        element: 'button:has(> svg.lucide-bar-chart-3)',
        popover: {
          title: '💰 Planilla',
          description: 'Gestiona las nóminas de empleados con cálculo automático de ISSS, AFP e ISR. Solo visible para Administradores.',
          side: 'right'
        }
      },
      {
        element: 'button:has(> svg.lucide-wrench)',
        popover: {
          title: '🔧 Mantenimientos',
          description: 'Programa y registra mantenimientos preventivos y correctivos de tu flota. Incluye alertas automáticas.',
          side: 'right'
        }
      },
      {
        element: 'button:has(> svg.lucide-fuel)',
        popover: {
          title: '⛽ Diesel',
          description: 'Controla el consumo de combustible, analiza eficiencia y genera reportes de gastos por vehículo.',
          side: 'right'
        }
      },
      {
        element: 'button:has(> svg.lucide-route)',
        popover: {
          title: '🗺️ Viajes',
          description: 'Administra viajes operativos: asigna camiones, define rutas, registra cargas y controla costos e ingresos.',
          side: 'right'
        }
      },
      {
        element: 'button:has(> svg.lucide-vault)',
        popover: {
          title: '💼 Caja Chica',
          description: 'Gestiona gastos menores y efectivo disponible. Registra ingresos, gastos y genera reportes por categoría.',
          side: 'right'
        }
      },
      {
        element: 'button:has(> svg.lucide-receipt)',
        popover: {
          title: '🧾 Ventas',
          description: 'Gestiona ventas, clientes, cotizaciones y facturación. Calcula automáticamente IVA y totales.',
          side: 'right'
        }
      },
      {
        element: 'button:has(> svg.lucide-help-circle)',
        popover: {
          title: '❓ Botón de Ayuda',
          description: 'Cada módulo tiene su propio tutorial. Haz clic en este botón cuando necesites ayuda sobre la sección actual.',
          side: 'right'
        }
      },
      {
        element: 'button:has(> svg.lucide-log-out)',
        popover: {
          title: '🚪 Cerrar Sesión',
          description: 'Desde aquí puedes cerrar sesión completamente o cambiar de proceso sin cerrar sesión.',
          side: 'right'
        }
      },
      {
        element: '.bg-white\\/5.rounded-xl.border.border-white\\/5',
        popover: {
          title: '👤 Información del Usuario',
          description: 'Aquí ves tu nombre y tipo de usuario (Administrador u Operador). Algunos módulos varían según tu rol.',
          side: 'right'
        }
      }
    ]
  },
    planillasDashboard: {
    checkDataEndpoint: '/api/planillas/quincenal',
    steps: [
      {
        element: 'body',
        popover: {
          title: '💰 Dashboard de Planillas',
          description: 'Gestiona todas las nóminas de tu empresa desde un solo lugar.',
          side: 'bottom'
        }
      },
      {
        element: '.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4',
        popover: {
          title: '📊 Métricas Principales',
          description: 'Visualiza estadísticas clave: total de planillas, monto pagado, pendientes y empleados.',
          side: 'bottom'
        }
      },
      {
        element: 'button:has(> svg.lucide-bar-chart-3)',
        popover: {
          title: '📈 Menú de Reportes',
          description: 'Genera reportes consolidados: mensuales, multi-mes (trimestre/semestre) o anuales.',
          side: 'bottom'
        }
      },
      {
        element: 'button:has(> svg.lucide-plus)',
        popover: {
          title: '➕ Nueva Planilla',
          description: 'Crea una planilla Quincenal (cada 15 días) o Semanal (viáticos y anticipos).',
          side: 'left'
        }
      },
      {
        element: '.bg-white.rounded-xl.p-5.border-2',
        popover: {
          title: '🔍 Filtros',
          description: 'Filtra planillas por tipo: todas, quincenales o semanales.',
          side: 'top'
        }
      },
      {
        element: 'table',
        popover: {
          title: '📋 Lista de Planillas',
          description: 'Visualiza todas tus planillas con su estado: Pendiente, Aprobada o Pagada.',
          side: 'top'
        }
      },
      {
        element: 'button:has(> svg.lucide-eye)',
        popover: {
          title: '👁️ Ver Planilla',
          description: 'Abre una planilla para ver o editar detalles (solo si está pendiente).',
          side: 'left'
        }
      },
      {
        element: 'button:has(> svg.lucide-download)',
        popover: {
          title: '📄 Descargar PDF',
          description: 'Genera el PDF oficial de la planilla con el formato y branding de Rivera.',
          side: 'left'
        }
      }
    ]
  },

  // 📅 PLANILLA QUINCENAL
  planillaQuincenal: {
    checkDataEndpoint: null,
    steps: [
      {
        element: 'body',
        popover: {
          title: '📅 Planilla Quincenal',
          description: 'Gestiona nóminas quincenales con cálculo automático de deducciones legales.',
          side: 'bottom'
        }
      },
      {
        element: 'button:has(> svg.lucide-users)',
        popover: {
          title: '👥 Panel de Personal',
          description: 'Muestra empleados y motoristas disponibles. Haz clic para abrir/cerrar.',
          side: 'right'
        }
      },
      {
        element: '.bg-white.rounded-2xl.p-5.shadow-sm.sticky',
        popover: {
          title: '➕ Agregar Personal',
          description: 'Arrastra o haz clic en una persona para agregarla a la planilla.',
          side: 'right'
        }
      },
      {
        element: 'button:has(> .text-\\[\\#5F8EAD\\])',
        popover: {
          title: '📋 Cargar Datos Anteriores',
          description: 'Carga automáticamente los empleados de la planilla anterior.',
          side: 'bottom'
        }
      },
      {
        element: 'table thead',
        popover: {
          title: '📊 Estructura de la Tabla',
          description: 'Columnas: Salario quincenal, viáticos, sábado/domingo, deducciones legales (ISSS, AFP, Renta) y descuentos.',
          side: 'bottom'
        }
      },
      {
        element: 'td.bg-green-50',
        popover: {
          title: '💵 Campos Editables',
          description: 'Haz clic en las celdas verdes para editar viáticos y trabajo de sábado/domingo.',
          side: 'top'
        }
      },
      {
        element: 'td.bg-red-50',
        popover: {
          title: '➖ Otros Descuentos',
          description: 'Haz clic en las celdas rojas para editar anticipos, préstamos u otros descuentos.',
          side: 'top'
        }
      },
      {
        element: 'tfoot',
        popover: {
          title: '🧮 Totales',
          description: 'El sistema calcula automáticamente todos los totales: salarios, deducciones y total a pagar.',
          side: 'top'
        }
      },
      {
        element: 'button:has(> svg.lucide-check-circle)',
        popover: {
          title: '✅ Aprobar Planilla',
          description: 'Una vez revisada, aprueba la planilla. Ya no podrás editarla después.',
          side: 'bottom'
        }
      }
    ]
  },

  // 📆 PLANILLA SEMANAL
  planillaSemanal: {
    checkDataEndpoint: null,
    steps: [
      {
        element: 'body',
        popover: {
          title: '⏱️ Planilla Semanal',
          description: 'Gestiona viáticos diarios y anticipos para pagos semanales (lunes a sábado).',
          side: 'bottom'
        }
      },
      {
        element: '.grid.grid-cols-4',
        popover: {
          title: '📊 Resumen de la Semana',
          description: 'Visualiza empleados incluidos, total base, total viáticos y total a pagar.',
          side: 'bottom'
        }
      },
      {
        element: 'button:has(> svg.lucide-users)',
        popover: {
          title: '👥 Panel de Empleados',
          description: 'Arrastra o haz clic en empleados disponibles para agregarlos a la planilla semanal.',
          side: 'right'
        }
      },
      {
        element: 'table thead',
        popover: {
          title: '📅 Estructura por Días',
          description: 'Cada día tiene columna BASE (calculada automáticamente) y VIÁTICO (editable).',
          side: 'bottom'
        }
      },
      {
        element: 'td.bg-blue-50',
        popover: {
          title: '💵 Editar Viáticos',
          description: 'Haz clic en las celdas azules para editar el viático de cada día.',
          side: 'top'
        }
      },
      {
        element: 'td.bg-amber-50',
        popover: {
          title: '💰 Anticipos',
          description: 'Haz clic en la columna Anticipos para registrar el monto total semanal.',
          side: 'top'
        }
      },
      {
        element: '.text-red-600',
        popover: {
          title: '⚠️ Marcar Faltas',
          description: 'Clic DERECHO en un día para marcar falta injustificada y aplicar descuento.',
          side: 'left'
        }
      },
      {
        element: '.bg-gradient-to-r.from-indigo-100',
        popover: {
          title: '🧮 Fila de Totales',
          description: 'Suma automática de todos los viáticos, anticipos y total a pagar de la semana.',
          side: 'top'
        }
      },
      {
        element: 'button:has(> svg.lucide-download)',
        popover: {
          title: '📄 Generar PDF',
          description: 'Descarga el reporte detallado de la planilla semanal en formato PDF.',
          side: 'bottom'
        }
      }
    ]
  },

  // ✨ CREAR PLANILLA SEMANAL (WIZARD)
  planillaSemanalNueva: {
    checkDataEndpoint: null,
    steps: [
      {
        element: 'body',
        popover: {
          title: '🎯 Asistente de Creación',
          description: 'Te guiaremos paso a paso para crear tu planilla semanal.',
          side: 'bottom'
        }
      },
      {
        element: '.flex.items-center.justify-between.max-w-2xl',
        popover: {
          title: '🔢 Progreso en 3 Pasos',
          description: 'Paso 1: Período, Paso 2: Empleados, Paso 3: Confirmar.',
          side: 'bottom'
        }
      },
      {
        element: 'input[type="date"]',
        popover: {
          title: '📅 Fecha de Inicio',
          description: 'IMPORTANTE: Debe ser un LUNES. El sistema calcula automáticamente el sábado (6 días).',
          side: 'bottom'
        }
      },
      {
        element: 'input[type="number"]',
        popover: {
          title: '📊 Días Hábiles del Mes',
          description: 'Ingresa los días hábiles del mes (20-31) para calcular la base diaria correctamente.',
          side: 'bottom'
        }
      },
      {
        element: '.grid.grid-cols-6',
        popover: {
          title: '👁️ Vista Previa',
          description: 'Visualiza los 6 días de la semana: Lunes a Sábado.',
          side: 'top'
        }
      },
      {
        element: 'button:has(> svg.lucide-chevron-right)',
        popover: {
          title: '➡️ Continuar al Paso 2',
          description: 'Haz clic en "Continuar" para pasar a seleccionar empleados. El tutorial se pausará aquí.',
          side: 'left'
        },
        waitForInteraction: true // 🎯 PAUSA AQUÍ
      },
      // 👇 PASO 2 - Se reanuda después de hacer clic en Continuar
      {
        element: '.grid.grid-cols-2',
        popover: {
          title: '👥 Seleccionar Empleados',
          description: 'Haz clic en cada empleado para agregarlo. Verás empleados y motoristas separados.',
          side: 'right'
        }
      },
      {
        element: 'button:has(> svg.lucide-download)',
        popover: {
          title: '⚡ Cargar Datos Anteriores',
          description: 'Carga automáticamente los empleados de la última planilla semanal.',
          side: 'bottom'
        }
      },
      {
        element: '.bg-gradient-to-br.from-\\[\\#5D9646\\]',
        popover: {
          title: '✅ Empleados Seleccionados',
          description: 'Lista de empleados que incluirás. Puedes remover cualquiera antes de crear.',
          side: 'top'
        }
      },
      {
        element: 'button:has(> span:contains("Continuar"))',
        popover: {
          title: '➡️ Continuar a Confirmar',
          description: 'Haz clic para ver el resumen final. El tutorial se pausará de nuevo.',
          side: 'left'
        },
        waitForInteraction: true // 🎯 PAUSA AQUÍ
      },
      // 👇 PASO 3 - Se reanuda después del segundo clic
      {
        element: '.bg-gray-50.border-2.border-gray-200.rounded-2xl.p-6',
        popover: {
          title: '📋 Resumen Final',
          description: 'Revisa todos los datos antes de crear la planilla.',
          side: 'top'
        }
      },
      {
        element: '.bg-gradient-to-r.from-\\[\\#34353A\\]',
        popover: {
          title: '🚀 Crear Planilla',
          description: 'Confirma y crea tu planilla. Podrás agregar más empleados después si es necesario.',
          side: 'top'
        }
      }
    ]
  },
  dashboard: {
    checkDataEndpoint: null,
    steps: [
      {
        element: '.min-h-screen',
        popover: {
          title: '👋 ¡Bienvenido a Rivera Distribuidora!',
          description: 'Te guiaré por las funcionalidades principales del dashboard para que aproveches al máximo el sistema.',
          side: 'bottom',
        }
      },
      {
        element: '.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4',
        popover: {
          title: '📊 Métricas Principales',
          description: 'Aquí ves las estadísticas más importantes: viajes activos, ingresos totales, flota operando y mantenimientos pendientes.',
          side: 'bottom'
        }
      },
      {
        element: 'select',
        popover: {
          title: '📅 Selector de Período',
          description: 'Cambia el período de análisis entre 7, 30 o 90 días para ver diferentes rangos de tiempo.',
          side: 'left'
        }
      },
      {
        element: '.bg-gradient-to-br.from-gray-50',
        popover: {
          title: '💰 Gráfico Ingresos vs Gastos',
          description: 'Visualiza de forma clara tus ingresos, gastos y balance del período. Pasa el mouse sobre las barras para ver detalles.',
          side: 'top'
        }
      },
      {
        element: '.grid.grid-cols-3.gap-4',
        popover: {
          title: '📈 Resumen Financiero',
          description: 'Tarjetas con totales de ingresos, gastos y balance. El color indica si el balance es positivo o requiere atención.',
          side: 'top'
        }
      },
      {
        element: '.space-y-3:has(> .bg-gray-50)',
        popover: {
          title: '📋 Resumen por Módulos',
          description: 'Cada módulo muestra su progreso: viajes, mantenimientos, diésel y planillas. Incluye totales, completados y pendientes.',
          side: 'left'
        }
      },
      {
        element: '.space-y-6',
        popover: {
          title: '🔔 Alertas y Reportes',
          description: 'Panel lateral con alertas importantes, acceso a reportes PDF y actividad reciente del sistema.',
          side: 'left'
        }
      }
    ]
  },

  // 💰 PLANILLA
  planilla: {
    checkDataEndpoint: '/api/planillas/quincenal',
    steps: [
      {
        element: 'body',
        popover: {
          title: '💰 Sistema de Planillas',
          description: 'Gestiona las nóminas de tus empleados de forma automática y eficiente.',
          side: 'bottom'
        }
      },
      {
        element: '.create-payroll-btn',
        popover: {
          title: '➕ Crear Nueva Planilla',
          description: 'Haz clic aquí para procesar una nueva nómina semanal o quincenal.',
          side: 'right'
        }
      },
      {
        element: '.payroll-type-selector',
        popover: {
          title: '📅 Tipo de Nómina',
          description: 'Selecciona si es nómina semanal o quincenal. El sistema calculará automáticamente las fechas y deducciones.',
          side: 'bottom'
        }
      },
      {
        element: '.employee-selector',
        popover: {
          title: '👥 Selección de Empleados',
          description: 'Marca los empleados a incluir en esta planilla. Puedes seleccionar todos o filtrar por departamento.',
          side: 'right'
        }
      },
      {
        element: '.deductions-preview',
        popover: {
          title: '💵 Cálculo Automático',
          description: 'El sistema calcula automáticamente ISSS (3%), AFP (7.25%) e ISR según la tabla del Ministerio de Hacienda de El Salvador.',
          side: 'left'
        }
      },
      {
        element: '.generate-pdf-btn',
        popover: {
          title: '📄 Generar Reporte PDF',
          description: 'Una vez revisado todo, genera el PDF oficial con el formato y branding de Rivera.',
          side: 'top'
        }
      }
    ]
  },

  // 🔧 MANTENIMIENTOS
  mantenimientos: {
    checkDataEndpoint: '/api/mantenimientos',
    steps: [
      {
        element: 'body',
        popover: {
          title: '🔧 Gestión de Mantenimientos',
          description: 'Controla el mantenimiento preventivo y correctivo de toda tu flota.',
          side: 'bottom'
        }
      },
      {
        element: '.create-maintenance-btn',
        popover: {
          title: '➕ Programar Mantenimiento',
          description: 'Registra un nuevo mantenimiento preventivo o correctivo para cualquier vehículo.',
          side: 'right'
        }
      },
      {
        element: '.truck-selector',
        popover: {
          title: '🚛 Seleccionar Vehículo',
          description: 'Elige el camión que requiere mantenimiento. Verás su historial y kilometraje actual.',
          side: 'bottom'
        }
      },
      {
        element: '.maintenance-type',
        popover: {
          title: '🔨 Tipo de Mantenimiento',
          description: 'Indica si es preventivo (programado) o correctivo (reparación de falla).',
          side: 'right'
        }
      },
      {
        element: '.parts-list',
        popover: {
          title: '🔩 Repuestos y Servicios',
          description: 'Agrega los repuestos, servicios y mano de obra. El total se calcula automáticamente.',
          side: 'left'
        }
      },
      {
        element: '.maintenance-calendar',
        popover: {
          title: '📅 Calendario de Mantenimientos',
          description: 'Visualiza todos los mantenimientos programados y su estado: pendiente, en proceso o completado.',
          side: 'top'
        }
      },
      {
        element: '.alerts-panel',
        popover: {
          title: '⚠️ Alertas Automáticas',
          description: 'El sistema te avisará cuando un vehículo necesite mantenimiento según kilometraje o fechas.',
          side: 'left'
        }
      }
    ]
  },

  // ⛽ DIESEL
  diesel: {
    checkDataEndpoint: '/api/resumen',
    steps: [
      {
        element: 'body',
        popover: {
          title: '⛽ Control de Combustible',
          description: 'Registra y monitorea el consumo de diésel de tu flota para optimizar costos.',
          side: 'bottom'
        }
      },
      {
        element: '.fuel-record-btn',
        popover: {
          title: '➕ Registrar Carga',
          description: 'Cada vez que cargues diésel, regístralo aquí con fecha, cantidad, costo y kilometraje.',
          side: 'right'
        }
      },
      {
        element: '.truck-fuel-selector',
        popover: {
          title: '🚛 Seleccionar Camión',
          description: 'Elige el vehículo al que le cargaste combustible.',
          side: 'bottom'
        }
      },
      {
        element: '.fuel-amount',
        popover: {
          title: '⛽ Cantidad y Costo',
          description: 'Ingresa los galones cargados y el costo total. El sistema calculará el precio por galón.',
          side: 'right'
        }
      },
      {
        element: '.fuel-efficiency-chart',
        popover: {
          title: '📊 Análisis de Eficiencia',
          description: 'Monitorea el rendimiento de cada camión (km/galón) y detecta anomalías en el consumo.',
          side: 'left'
        }
      },
      {
        element: '.fuel-history',
        popover: {
          title: '📜 Historial de Cargas',
          description: 'Consulta todas las cargas de combustible por vehículo, fecha o conductor.',
          side: 'top'
        }
      },
      {
        element: '.fuel-reports',
        popover: {
          title: '📈 Reportes de Consumo',
          description: 'Genera reportes detallados de gastos de combustible por período, vehículo o ruta.',
          side: 'left'
        }
      }
    ]
  },

  // 🗺️ VIAJES
  viajes: {
    checkDataEndpoint: '/api/viajes-operativos/listar',
    steps: [
      {
        element: 'body',
        popover: {
          title: '🗺️ Gestión de Viajes',
          description: 'Administra todos los viajes operativos de tu flota desde aquí.',
          side: 'bottom'
        }
      },
      {
        element: '.create-trip-btn',
        popover: {
          title: '➕ Crear Nuevo Viaje',
          description: 'Registra un nuevo viaje con todos los detalles: origen, destino, carga y costos.',
          side: 'right'
        }
      },
      {
        element: '.trip-truck-selector',
        popover: {
          title: '🚛 Asignar Camión',
          description: 'Selecciona el camión que realizará el viaje. Solo verás vehículos disponibles.',
          side: 'bottom'
        }
      },
      {
        element: '.trip-route',
        popover: {
          title: '📍 Ruta del Viaje',
          description: 'Define origen, destino y puntos intermedios. El sistema calculará la distancia estimada.',
          side: 'right'
        }
      },
      {
        element: '.trip-cargo',
        popover: {
          title: '📦 Información de Carga',
          description: 'Registra tipo de carga, peso, cliente destinatario y documentación necesaria.',
          side: 'left'
        }
      },
      {
        element: '.trip-costs',
        popover: {
          title: '💰 Costos y Pagos',
          description: 'Ingresa el monto acordado con el cliente y gastos del viaje (peajes, alimentación, etc.).',
          side: 'top'
        }
      },
      {
        element: '.trip-status',
        popover: {
          title: '🚦 Estado del Viaje',
          description: 'Actualiza el estado: Pendiente, En Ruta, Completado o Cancelado. Incluye fecha de salida y llegada real.',
          side: 'left'
        }
      },
      {
        element: '.trips-map',
        popover: {
          title: '🗺️ Mapa de Viajes',
          description: 'Visualiza en tiempo real la ubicación de tus vehículos en ruta.',
          side: 'bottom'
        }
      }
    ]
  },

  // 💼 CAJA CHICA
  cajaChica: {
    checkDataEndpoint: '/api/cajaChica',
    steps: [
      {
        element: 'body',
        popover: {
          title: '💼 Caja Chica',
          description: 'Gestiona los gastos menores y el efectivo disponible para operaciones diarias.',
          side: 'bottom'
        }
      },
      {
        element: '.add-transaction-btn',
        popover: {
          title: '➕ Nueva Transacción',
          description: 'Registra ingresos o gastos de caja chica con su respectivo comprobante.',
          side: 'right'
        }
      },
      {
        element: '.transaction-type',
        popover: {
          title: '💵 Tipo de Transacción',
          description: 'Selecciona si es un Ingreso (entrada de dinero) o Gasto (salida de dinero).',
          side: 'bottom'
        }
      },
      {
        element: '.transaction-category',
        popover: {
          title: '🏷️ Categoría',
          description: 'Clasifica el gasto: Combustible, Alimentación, Peajes, Mantenimiento Menor, etc.',
          side: 'right'
        }
      },
      {
        element: '.balance-display',
        popover: {
          title: '💰 Balance Actual',
          description: 'Visualiza el saldo disponible en caja chica y el historial de movimientos.',
          side: 'left'
        }
      },
      {
        element: '.transactions-list',
        popover: {
          title: '📜 Historial de Transacciones',
          description: 'Consulta todos los movimientos con filtros por fecha, categoría o monto.',
          side: 'top'
        }
      },
      {
        element: '.petty-cash-reports',
        popover: {
          title: '📊 Reportes',
          description: 'Genera reportes de gastos de caja chica por período y categoría.',
          side: 'left'
        }
      }
    ]
  },

  // 🧾 VENTAS
  ventas: {
    checkDataEndpoint: '/api/ventas',
    steps: [
      {
        element: 'body',
        popover: {
          title: '🧾 Módulo de Ventas',
          description: 'Gestiona tus ventas, clientes, cotizaciones y facturación.',
          side: 'bottom'
        }
      },
      {
        element: '.create-sale-btn',
        popover: {
          title: '➕ Nueva Venta',
          description: 'Registra una nueva venta o factura para tus clientes.',
          side: 'right'
        }
      },
      {
        element: '.client-selector',
        popover: {
          title: '👤 Seleccionar Cliente',
          description: 'Elige el cliente o crea uno nuevo con su información fiscal.',
          side: 'bottom'
        }
      },
      {
        element: '.products-list',
        popover: {
          title: '📦 Productos/Servicios',
          description: 'Agrega los productos o servicios vendidos con cantidad, precio unitario y descuentos.',
          side: 'right'
        }
      },
      {
        element: '.invoice-total',
        popover: {
          title: '💵 Total de la Venta',
          description: 'El sistema calcula automáticamente subtotal, IVA (13%) y total a pagar.',
          side: 'left'
        }
      },
      {
        element: '.payment-method',
        popover: {
          title: '💳 Método de Pago',
          description: 'Registra si el pago fue en Efectivo, Transferencia, Cheque o Crédito.',
          side: 'top'
        }
      },
      {
        element: '.sales-reports',
        popover: {
          title: '📊 Reportes de Ventas',
          description: 'Genera reportes de ventas por período, cliente, producto o método de pago.',
          side: 'left'
        }
      }
    ]
  },

  // 🚛 CAMIONES
  camiones: {
    checkDataEndpoint: '/api/camiones',
    steps: [
      {
        element: 'body',
        popover: {
          title: '🚛 Gestión de Camiones',
          description: 'Administra toda tu flota de vehículos: registra nuevos camiones, actualiza información y monitorea su estado.',
          side: 'bottom'
        }
      },
      {
        element: '.create-truck-btn, button:has(> svg.lucide-plus)',
        popover: {
          title: '➕ Agregar Nuevo Camión',
          description: 'Registra un nuevo vehículo en tu flota con toda su información técnica y operativa.',
          side: 'right'
        }
      },
      {
        element: '.truck-list, table, .grid',
        popover: {
          title: '📋 Lista de Camiones',
          description: 'Visualiza todos tus camiones con información de placa, modelo, estado y kilometraje actual.',
          side: 'bottom'
        }
      },
      {
        element: '.truck-search, input[type="text"]',
        popover: {
          title: '🔍 Buscar Camiones',
          description: 'Busca camiones por placa, modelo, marca o estado operativo.',
          side: 'bottom'
        }
      },
      {
        element: '.truck-status, .status-badge',
        popover: {
          title: '📊 Estado de Camiones',
          description: 'Los colores indican el estado: verde (operativo), amarillo (mantenimiento), rojo (fuera de servicio).',
          side: 'left'
        }
      },
      {
        element: '.truck-actions, .action-buttons',
        popover: {
          title: '⚙️ Acciones por Camión',
          description: 'Edita información, registra mantenimiento, asigna viajes o genera reportes individuales.',
          side: 'left'
        }
      }
    ]
  },

  // 👥 CLIENTES
  clientes: {
    checkDataEndpoint: '/api/clientes',
    steps: [
      {
        element: 'body',
        popover: {
          title: '👥 Gestión de Clientes',
          description: 'Administra tu base de datos de clientes: registra nuevos, actualiza información y gestiona relaciones comerciales.',
          side: 'bottom'
        }
      },
      {
        element: '.create-client-btn, button:has(> svg.lucide-plus)',
        popover: {
          title: '➕ Agregar Nuevo Cliente',
          description: 'Registra un nuevo cliente con información de contacto, dirección y datos fiscales.',
          side: 'right'
        }
      },
      {
        element: '.client-list, table, .grid',
        popover: {
          title: '📋 Lista de Clientes',
          description: 'Visualiza todos tus clientes con información de nombre, contacto, ubicación y estado de cuenta.',
          side: 'bottom'
        }
      },
      {
        element: '.client-search, input[type="text"]',
        popover: {
          title: '🔍 Buscar Clientes',
          description: 'Busca clientes por nombre, NIT, teléfono o ubicación.',
          side: 'bottom'
        }
      },
      {
        element: '.client-type, .type-selector',
        popover: {
          title: '🏷️ Tipo de Cliente',
          description: 'Clasifica tus clientes por tipo: mayorista, minorista, corporativo, etc.',
          side: 'left'
        }
      },
      {
        element: '.client-actions, .action-buttons',
        popover: {
          title: '⚙️ Acciones por Cliente',
          description: 'Edita información, registra ventas, genera facturas o ve historial de pedidos.',
          side: 'left'
        }
      }
    ]
  },

  // 👷 EMPLEADOS
  empleados: {
    checkDataEndpoint: '/api/empleados',
    steps: [
      {
        element: 'body',
        popover: {
          title: '👷 Gestión de Empleados',
          description: 'Administra tu equipo de trabajo: registra empleados, asigna roles y gestiona información laboral.',
          side: 'bottom'
        }
      },
      {
        element: '.create-employee-btn, button:has(> svg.lucide-plus)',
        popover: {
          title: '➕ Agregar Nuevo Empleado',
          description: 'Registra un nuevo empleado con datos personales, cargo, salario y fecha de ingreso.',
          side: 'right'
        }
      },
      {
        element: '.employee-list, table, .grid',
        popover: {
          title: '📋 Lista de Empleados',
          description: 'Visualiza todos tus empleados con información de nombre, cargo, departamento y estado.',
          side: 'bottom'
        }
      },
      {
        element: '.employee-search, input[type="text"]',
        popover: {
          title: '🔍 Buscar Empleados',
          description: 'Busca empleados por nombre, cargo, departamento o número de DUI.',
          side: 'bottom'
        }
      },
      {
        element: '.employee-role, .role-selector',
        popover: {
          title: '🏷️ Roles y Departamentos',
          description: 'Asigna roles específicos: administrador, contador, operador, etc. y departamentos correspondientes.',
          side: 'left'
        }
      },
      {
        element: '.employee-actions, .action-buttons',
        popover: {
          title: '⚙️ Acciones por Empleado',
          description: 'Edita información, registra asistencias, genera reportes o administra permisos.',
          side: 'left'
        }
      }
    ]
  },

  // 🏢 PROVEEDORES
  proveedores: {
    checkDataEndpoint: '/api/proveedores',
    steps: [
      {
        element: 'body',
        popover: {
          title: '🏢 Gestión de Proveedores',
          description: 'Administra tus proveedores: registra empresas, contacta información y gestiona relaciones comerciales.',
          side: 'bottom'
        }
      },
      {
        element: '.create-supplier-btn, button:has(> svg.lucide-plus)',
        popover: {
          title: '➕ Agregar Nuevo Proveedor',
          description: 'Registra un nuevo proveedor con información de empresa, contacto y especialidad.',
          side: 'right'
        }
      },
      {
        element: '.supplier-list, table, .grid',
        popover: {
          title: '📋 Lista de Proveedores',
          description: 'Visualiza todos tus proveedores con información de empresa, contacto y tipo de servicio.',
          side: 'bottom'
        }
      },
      {
        element: '.supplier-search, input[type="text"]',
        popover: {
          title: '🔍 Buscar Proveedores',
          description: 'Busca proveedores por nombre de empresa, contacto, especialidad o ubicación.',
          side: 'bottom'
        }
      },
      {
        element: '.supplier-category, .category-selector',
        popover: {
          title: '🏷️ Categorías de Proveedores',
          description: 'Clasifica proveedores por especialidad: repuestos, servicios, combustible, seguros, etc.',
          side: 'left'
        }
      },
      {
        element: '.supplier-actions, .action-buttons',
        popover: {
          title: '⚙️ Acciones por Proveedor',
          description: 'Edita información, registra compras, genera órdenes de compra o ve historial de transacciones.',
          side: 'left'
        }
      }
    ]
  },

  // 🚚 MOTORISTAS
  motoristas: {
    checkDataEndpoint: '/api/motoristas',
    steps: [
      {
        element: 'body',
        popover: {
          title: '🚚 Gestión de Motoristas',
          description: 'Administra tus conductores: registra motoristas, asigna vehículos y monitorea su desempeño.',
          side: 'bottom'
        }
      },
      {
        element: '.create-driver-btn, button:has(> svg.lucide-plus)',
        popover: {
          title: '➕ Agregar Nuevo Motorista',
          description: 'Registra un nuevo conductor con licencia, experiencia y datos de contacto.',
          side: 'right'
        }
      },
      {
        element: '.driver-list, table, .grid',
        popover: {
          title: '📋 Lista de Motoristas',
          description: 'Visualiza todos tus conductores con información de nombre, licencia, vehículo asignado y estado.',
          side: 'bottom'
        }
      },
      {
        element: '.driver-search, input[type="text"]',
        popover: {
          title: '🔍 Buscar Motoristas',
          description: 'Busca motoristas por nombre, número de licencia, vehículo asignado o estado.',
          side: 'bottom'
        }
      },
      {
        element: '.driver-license, .license-info',
        popover: {
          title: '📄 Información de Licencia',
          description: 'Revisa fechas de vencimiento de licencias y tipos de vehículo autorizados.',
          side: 'left'
        }
      },
      {
        element: '.driver-actions, .action-buttons',
        popover: {
          title: '⚙️ Acciones por Motorista',
          description: 'Edita información, asigna vehículos, registra viajes o genera reportes de desempeño.',
          side: 'left'
        }
      }
    ]
  },

  // 🗺️ VIAJES INTERNOS
  viajesInternos: {
    checkDataEndpoint: '/api/viajes-internos',
    steps: [
      {
        element: 'body',
        popover: {
          title: '🗺️ Gestión de Viajes Internos',
          description: 'Administra viajes locales y de distribución interna: asigna rutas, registra cargas y controla costos.',
          side: 'bottom'
        }
      },
      {
        element: '.create-trip-btn, button:has(> svg.lucide-plus)',
        popover: {
          title: '➕ Programar Nuevo Viaje',
          description: 'Crea un nuevo viaje interno con origen, destino, carga y vehículo asignado.',
          side: 'right'
        }
      },
      {
        element: '.trip-list, table, .grid',
        popover: {
          title: '📋 Lista de Viajes',
          description: 'Visualiza todos los viajes programados con estado, vehículo, motorista y fechas.',
          side: 'bottom'
        }
      },
      {
        element: '.trip-search, input[type="text"]',
        popover: {
          title: '🔍 Buscar Viajes',
          description: 'Busca viajes por fecha, destino, vehículo, motorista o estado.',
          side: 'bottom'
        }
      },
      {
        element: '.trip-status, .status-indicator',
        popover: {
          title: '📊 Estados de Viajes',
          description: 'Estados: Programado (azul), En Ruta (verde), Completado (gris), Cancelado (rojo).',
          side: 'left'
        }
      },
      {
        element: '.trip-route, .route-info',
        popover: {
          title: '🛣️ Información de Ruta',
          description: 'Revisa origen, destino, distancia estimada y tiempo de viaje programado.',
          side: 'left'
        }
      },
      {
        element: '.trip-actions, .action-buttons',
        popover: {
          title: '⚙️ Acciones por Viaje',
          description: 'Edita detalles, registra llegada, genera reportes o marca como completado.',
          side: 'left'
        }
      }
    ]
  },

  // 📊 DASHBOARD GENERAL
  dashboardGeneral: {
    checkDataEndpoint: null,
    steps: [
      {
        element: 'body',
        popover: {
          title: '📊 Dashboard General',
          description: 'Vista completa del estado operativo de tu empresa con métricas clave y alertas importantes.',
          side: 'bottom'
        }
      },
      {
        element: '.metrics-grid, .grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4',
        popover: {
          title: '📈 Métricas Principales',
          description: 'Indicadores clave: flota operativa, viajes activos, ingresos del mes y mantenimientos pendientes.',
          side: 'bottom'
        }
      },
      {
        element: 'select, .period-selector',
        popover: {
          title: '📅 Selector de Período',
          description: 'Cambia el período de análisis: últimos 7, 30 o 90 días para diferentes perspectivas.',
          side: 'left'
        }
      },
      {
        element: '.charts-container, .bg-gradient-to-br.from-gray-50',
        popover: {
          title: '📊 Gráficos de Rendimiento',
          description: 'Visualiza ingresos vs gastos, eficiencia de flota y tendencias por módulo.',
          side: 'top'
        }
      },
      {
        element: '.modules-summary, .space-y-3',
        popover: {
          title: '📋 Resumen por Módulos',
          description: 'Estado de cada módulo: planillas procesadas, mantenimientos completados, viajes realizados.',
          side: 'left'
        }
      },
      {
        element: '.alerts-panel, .space-y-6',
        popover: {
          title: '🔔 Alertas y Notificaciones',
          description: 'Alertas importantes: vencimientos, mantenimientos requeridos, pagos pendientes.',
          side: 'left'
        }
      },
      {
        element: '.reports-section, .bg-white',
        popover: {
          title: '📄 Reportes Rápidos',
          description: 'Acceso directo a reportes PDF de cada módulo para análisis detallado.',
          side: 'right'
        }
      }
    ]
  }
};