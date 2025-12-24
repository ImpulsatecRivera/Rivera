## RiveraProject

## Integrantes:

Kendrick Daniel López Carrillos + 20200165 (Coordinador)
Rodolfo Antonio Perez Hernández + 20230300 (SubCoordinador)
Ángel Ernesto Hernández Sosa + 20210086 (Secretario)
Diego José Rodriguez Pocasangre + 20230602 (Vocal)


## Descripción del Proyecto:

RIVERA DISTRIBUIDORA Y TRANSPORTE

Descripción:  Prestación de Servicio de Transporte de Carga a Nivel Nacional
 
Descripción de los procesos:  La empresa se dedica a la prestación de servicio de transporte de Carga Empresarial a Nivel Nacional, distribución y logística
 
Como maneja la información: Por medio de Excel, manual y un sistema de GPS


## Creado con:

1. Herramientas
- Visual Studio Code
- Figma
- Mongo
- Git Hub
- Git
- Inteligencias Artificiales
- Puglins

2. Lenguajes de Programación
- JavaScript

3. Frameworks:
- React


## Comandos para la App:
Estos comando se ejecuta en la carpeta backend: para cambiar 
a esa carpeta se ocupa el comando:

cd backend

# Comandos para la aplicación MERN
 
npm init -y : funciona para inicializar el repositorio MERN
 
Modulos que instalar:
npm install express
npm install mongoose
npm install dotenv
npm install nodemailer
npm install crypto
npm install jsonwebtoken
npm install bcryptjs
npm install cookie-parser
 
Para ejecutar:
node index.js

Usos de mapas, GPS el cual es proporcionado por la empresa
Tambien el monitoreo del clima, Hora en tiempo real.


# 📊 Descuentos de Ley - El Salvador

## Descuentos Aplicados en Planillas Quincenales

### 1. **ISSS (Instituto Salvadoreño del Seguro Social)**

**Porcentaje**: 3%  
**Tope quincenal**: $500.00  
**Descuento máximo**: $15.00

#### Fórmula
```javascript
const baseISSS = salarioQuincenal > 500 ? 500 : salarioQuincenal;
const montoISSS = baseISSS * 0.03;
```

#### Ejemplos

| Salario Quincenal | Base de Cálculo | ISSS 3% | Nota |
|-------------------|-----------------|---------|------|
| $204.40 | $204.40 | $6.13 | Sin tope |
| $400.00 | $400.00 | $12.00 | Sin tope |
| $500.00 | $500.00 | **$15.00** | ✅ Tope alcanzado |
| $675.00 | $500.00 | **$15.00** | ✅ Tope aplicado |
| $1,200.00 | $500.00 | **$15.00** | ✅ Tope aplicado |

---

### 2. **AFP (Administradora de Fondos de Pensiones)**

**Porcentaje**: 7.25%  
**Tope**: Sin tope

#### Fórmula
```javascript
const montoAFP = salarioQuincenal * 0.0725;
```

#### Ejemplos

| Salario Quincenal | AFP 7.25% |
|-------------------|-----------|
| $204.40 | $14.82 |
| $400.00 | $29.00 |
| $500.00 | $36.25 |
| $675.00 | $48.94 |
| $1,200.00 | $87.00 |

---

### 3. **Renta**

**Sistema**: Progresivo por tramos  
**Base**: Salario quincenal

| Tramo | Desde | Hasta | % | Cuota Fija |
|-------|-------|-------|---|------------|
| I | $0.01 | $275.00 | 0% | $0 |
| II | $275.01 | $447.62 | 10% | $8.83 |
| III | $447.63 | $1,019.05 | 20% | $30.00 |
| IV | $1,019.06+ | En adelante | 30% | $144.28 |

---

## 🧮 Orden de Cálculo

1. **Salario Quincenal** = Salario Mensual ÷ 2
2. **ISSS** = MIN(Salario Quincenal, $500) × 3%
3. **AFP** = Salario Quincenal × 7.25%
4. **Renta** = Según tabla progresiva
5. **Total Descuentos de Ley** = ISSS + AFP + Renta

---

## 📝 Ejemplos Completos

### Ejemplo 1: CESAR DAVID MELARA NAJARRO
**Salario Mensual**: $408.80  
**Salario Quincenal**: $204.40
```
ISSS:  $204.40 × 3% = $6.13
AFP:   $204.40 × 7.25% = $14.82
Renta: Tramo I = $0.00

Total Descuentos de Ley = $20.95
```

### Ejemplo 2: ROBERTO ANTONIO NERIO RIVERA (Con tope ISSS)
**Salario Mensual**: $1,350.00  
**Salario Quincenal**: $675.00
```
ISSS:  $500.00 × 3% = $15.00 (TOPE APLICADO)
AFP:   $675.00 × 7.25% = $48.94
Renta: Tramo III → $30.00 + ($227.38 × 20%) = $75.48

Total Descuentos de Ley = $139.42
```

---

## ⚠️ Diferencias por Frecuencia de Pago

| Frecuencia | Tope ISSS | Descuento Máximo |
|------------|-----------|------------------|
| Semanal | $250.00 | $7.50 |
| **Quincenal** | **$500.00** | **$15.00** |
| Mensual | $1,000.00 | $30.00 |

---

## 📚 Referencias Legales

- **ISSS**: Artículo 29 Ley del Seguro Social
- **AFP**: Ley del Sistema de Ahorro para Pensiones
- **Renta**: Decreto Ejecutivo 10 año 2025, Art. 37 Ley del Impuesto sobre la Renta

**Fuente**: Ministerio de Hacienda, El Salvador  
🔗 [Tablas de retención - Contaportable](https://www.contaportable.com/tablas-de-retencion-de-renta/)

**Versión**: 1.0 | **Vigencia**: 2025 | **Sistema**: Rivera Transportes
