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

**Importante**: Aunque el salario sea superior a $500, el ISSS siempre se calcula sobre un máximo de $500 quincenales.

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

**Nota**: La AFP **no tiene tope**, se aplica el 7.25% sobre todo el salario quincenal.

---

### 3. **Renta**

**Sistema**: Progresivo por tramos  
**Base**: Salario quincenal

Ver tabla completa en: [TABLA_RENTA_QUINCENAL.md](TABLA_RENTA_QUINCENAL.md)

#### Resumen de Tramos

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

## 📝 Ejemplo Completo

**Empleado: CESAR DAVID MELARA NAJARRO**  
**Salario Mensual**: $408.80  
**Salario Quincenal**: $204.40

### Cálculos:

```
ISSS:
  Base = MIN($204.40, $500) = $204.40
  Monto = $204.40 × 3% = $6.13

AFP:
  Monto = $204.40 × 7.25% = $14.82

Renta:
  Tramo I (hasta $275)
  Monto = $0.00

Total Descuentos de Ley = $6.13 + $14.82 + $0.00 = $20.95
```

---

## 📝 Ejemplo con Tope de ISSS

**Motorista: ROBERTO ANTONIO NERIO RIVERA**  
**Salario Mensual**: $1,350.00  
**Salario Quincenal**: $675.00

### Cálculos:

```
ISSS:
  Base = MIN($675.00, $500) = $500.00  ← TOPE APLICADO
  Monto = $500.00 × 3% = $15.00

AFP:
  Monto = $675.00 × 7.25% = $48.94

Renta:
  Tramo III ($447.63 - $1,019.05)
  Exceso = $675.00 - $447.62 = $227.38
  Monto = $30.00 + ($227.38 × 20%) = $75.48

Total Descuentos de Ley = $15.00 + $48.94 + $75.48 = $139.42
```

---

## ⚠️ Diferencias por Frecuencia de Pago

El tope de ISSS varía según la frecuencia:

| Frecuencia | Tope ISSS | Descuento Máximo |
|------------|-----------|------------------|
| Semanal | $250.00 | $7.50 |
| **Quincenal** | **$500.00** | **$15.00** |
| Mensual | $1,000.00 | $30.00 |

**Para este sistema de planillas quincenales, el tope es $500 → máximo $15.00**

---

## 📚 Referencias Legales

- **ISSS**: Artículo 29 Ley del Seguro Social
- **AFP**: Ley del Sistema de Ahorro para Pensiones
- **Renta**: Decreto Ejecutivo 10 año 2025 y Artículo 37 Ley del Impuesto sobre la Renta

---

**Versión**: 1.0  
**Vigencia**: 2025  
**Sistema**: Rivera Transportes

**Fuente**: Ministerio de Hacienda, El Salvador  
🔗 [Tablas de retención de renta – Contaportable](https://www.contaportable.com/tablas-de-retencion-de-renta/)  
**Vigencia**: 2025  
**Tipo**: Remuneraciones gravadas pagaderas quincenalmente


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

**Importante**: Aunque el salario sea superior a $500, el ISSS siempre se calcula sobre un máximo de $500 quincenales.

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

**Nota**: La AFP **no tiene tope**, se aplica el 7.25% sobre todo el salario quincenal.

---

### 3. **Renta**

**Sistema**: Progresivo por tramos  
**Base**: Salario quincenal


#### Resumen de Tramos

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

## 📝 Ejemplo Completo

**Empleado: CESAR DAVID MELARA NAJARRO**  
**Salario Mensual**: $408.80  
**Salario Quincenal**: $204.40

### Cálculos:

```
ISSS:
  Base = MIN($204.40, $500) = $204.40
  Monto = $204.40 × 3% = $6.13

AFP:
  Monto = $204.40 × 7.25% = $14.82

Renta:
  Tramo I (hasta $275)
  Monto = $0.00

Total Descuentos de Ley = $6.13 + $14.82 + $0.00 = $20.95
```

---

## 📝 Ejemplo con Tope de ISSS

**Motorista: ROBERTO ANTONIO NERIO RIVERA**  
**Salario Mensual**: $1,350.00  
**Salario Quincenal**: $675.00

### Cálculos:

```
ISSS:
  Base = MIN($675.00, $500) = $500.00  ← TOPE APLICADO
  Monto = $500.00 × 3% = $15.00

AFP:
  Monto = $675.00 × 7.25% = $48.94

Renta:
  Tramo III ($447.63 - $1,019.05)
  Exceso = $675.00 - $447.62 = $227.38
  Monto = $30.00 + ($227.38 × 20%) = $75.48

Total Descuentos de Ley = $15.00 + $48.94 + $75.48 = $139.42
```

---

## ⚠️ Diferencias por Frecuencia de Pago

El tope de ISSS varía según la frecuencia:

| Frecuencia | Tope ISSS | Descuento Máximo |
|------------|-----------|------------------|
| Semanal | $250.00 | $7.50 |
| **Quincenal** | **$500.00** | **$15.00** |
| Mensual | $1,000.00 | $30.00 |

**Para este sistema de planillas quincenales, el tope es $500 → máximo $15.00**

---

## 📚 Referencias Legales

- **ISSS**: Artículo 29 Ley del Seguro Social
- **AFP**: Ley del Sistema de Ahorro para Pensiones
- **Renta**: Decreto Ejecutivo 10 año 2025 y Artículo 37 Ley del Impuesto sobre la Renta

---

**Versión**: 1.0  
**Vigencia**: 2025  
**Sistema**: Rivera Transportes