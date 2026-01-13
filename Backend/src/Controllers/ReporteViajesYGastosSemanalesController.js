import Viajes from '../Models/Viajes.js';
import CajaChica from '../Models/CajaChica.js';
import PlanillaSemanal from '../Models/PlanillaSemanal.js';
import MantenimientoCamiones from '../Models/MantenimientoCamiones.js';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Función para convertir imagen a base64
const convertirImagenABase64 = (rutaImagen) => {
    try {
        console.log('Intentando leer imagen desde:', rutaImagen);

        if (!fs.existsSync(rutaImagen)) {
            console.error('La imagen no existe en la ruta:', rutaImagen);
            return null;
        }

        const imagen = fs.readFileSync(rutaImagen);
        const base64 = imagen.toString('base64');
        const ext = path.extname(rutaImagen).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';

        console.log('Imagen convertida exitosamente a base64');
        return `data:${mimeType};base64,${base64}`;
    } catch (error) {
        console.error('Error al convertir imagen:', error);
        return null;
    }
};

// Ruta al logo
const RUTA_LOGO = path.join(process.cwd(), 'src', 'imagenes', 'imagen_15.png');

const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const formatearHora = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatMoney = (n) => {
    return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
};

const getWeekRange = (d) => {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    
    const day = dt.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
    
    let monday, saturday;
    
    if (day === 0) {
        // Si es domingo, usar el lunes de la semana SIGUIENTE
        monday = new Date(dt);
        monday.setDate(dt.getDate() + 1);
        monday.setHours(0, 0, 0, 0);
    } else if (day >= 1 && day <= 6) {
        // Si es lunes a sábado, usar el lunes de ESA misma semana
        monday = new Date(dt);
        monday.setDate(dt.getDate() - (day - 1));
        monday.setHours(0, 0, 0, 0);
    }
    
    saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5);
    saturday.setHours(23, 59, 59, 999);
    
    return { monday, saturday };
};

const formatWeekLabel = (start, end) => {
    const startDay = start.getDate();
    const endDay = end.getDate();
    const startMonth = start.toLocaleDateString('es-ES', { month: 'long' });
    const endMonth = end.toLocaleDateString('es-ES', { month: 'long' });
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();
    
    // Si la semana cruza de mes o año
    if (start.getMonth() !== end.getMonth() || startYear !== endYear) {
        if (startYear !== endYear) {
            return `Semana del ${startDay} (lunes) de ${startMonth.charAt(0).toUpperCase() + startMonth.slice(1)} de ${startYear} al ${endDay} (sábado) de ${endMonth.charAt(0).toUpperCase() + endMonth.slice(1)} de ${endYear}`;
        } else {
            return `Semana del ${startDay} (lunes) de ${startMonth.charAt(0).toUpperCase() + startMonth.slice(1)} al ${endDay} (sábado) de ${endMonth.charAt(0).toUpperCase() + endMonth.slice(1)} de ${endYear}`;
        }
    }
    
    return `Semana del ${startDay} (lunes) al ${endDay} (sábado) de ${startMonth.charAt(0).toUpperCase() + startMonth.slice(1)} de ${startYear}`;
};

const ReporteController = {};

ReporteController.generarReporteSemanal = async (req, res) => {
    try {
        const { date, startDate, pettyCashAmount = 250, manualEntries = [] } = req.body || {};
        const target = date ? new Date(date) : (startDate ? new Date(startDate) : new Date());

        const { monday: weekStart, saturday: weekEnd } = getWeekRange(target);
        const prevWeekStart = new Date(weekStart);
        prevWeekStart.setDate(weekStart.getDate() - 7);
        prevWeekStart.setHours(0, 0, 0, 0);
        const prevWeekEnd = new Date(prevWeekStart);
        prevWeekEnd.setDate(prevWeekStart.getDate() + 5);
        prevWeekEnd.setHours(23, 59, 59, 999);

        // Aggregate viajes per client
        const aggregateViajes = async (start, end) => {
            const pipeline = [
                { $match: { departureTime: { $gte: start, $lte: end }, 'estado.actual': 'completado' } },
                { $addFields: { monto: '$montoAcordado' } },
                { $group: { 
                    _id: { 
                        clienteNombre: { $ifNull: ['$clienteNombre', null] }, 
                        clienteOperativo: { $ifNull: ['$clienteOperativo', null] } 
                    }, 
                    viajes: { $sum: 1 }, 
                    monto: { $sum: '$monto' } 
                } },
                { $project: { 
                    clienteNombre: '$_id.clienteNombre', 
                    clienteOperativo: '$_id.clienteOperativo', 
                    viajes: 1, 
                    monto: 1, 
                    _id: 0 
                } }
            ];
            const rows = await Viajes.aggregate(pipeline);
            return rows.map(r => ({ 
                cliente: r.clienteNombre || (r.clienteOperativo ? String(r.clienteOperativo) : 'SIN CLIENTE'), 
                viajes: r.viajes, 
                monto: Number(r.monto || 0) 
            }));
        };

        const viajesThis = await aggregateViajes(weekStart, weekEnd);
        const viajesPrev = await aggregateViajes(prevWeekStart, prevWeekEnd);

        const weekLabel = formatWeekLabel(weekStart, weekEnd);
        const prevWeekLabel = formatWeekLabel(prevWeekStart, prevWeekEnd);

        const viajesThisFormatted = viajesThis.map(r => ({ 
            cliente: r.cliente, 
            semana: weekLabel, 
            viajes: r.viajes, 
            monto: r.monto 
        }));
        const viajesPrevFormatted = viajesPrev.map(r => ({ 
            cliente: r.cliente, 
            semana: prevWeekLabel, 
            viajes: r.viajes, 
            monto: r.monto 
        }));

        // Caja chica records
        let cajaRecords = await CajaChica.find({ 
            date: { $gte: weekStart, $lte: weekEnd } 
        }).sort({ date: 1 }).lean();

        // NO agregamos manualEntries a caja chica

        // Calculate totals de caja chica (SOLO registros de BD)
        let totalExpenses = 0;
        let totalReintegros = 0;
        cajaRecords.forEach(r => {
            const amt = Number(r.amount || 0);
            if ((r.type || '').toLowerCase() === 'expense') {
                totalExpenses += amt;
            } else {
                totalReintegros += amt;
            }
        });

        const gastoNetoCaja = totalExpenses - totalReintegros;

        // Last balance in the week
        const lastRecord = await CajaChica.findOne({ 
            date: { $gte: weekStart, $lte: weekEnd } 
        }).sort({ date: -1 }).lean();
        const lastCurrentBalance = lastRecord ? Number(lastRecord.currentBalance || 0) : 0;

        // Get all planillas that overlap with the selected week
        const planillas = await PlanillaSemanal.find({
            fechaInicio: { $lte: weekEnd },
            fechaFin: { $gte: weekStart }
        }).sort({ fechaInicio: 1 }).lean();

        let efectivoViaje = 0;
        planillas.forEach(p => {
            // Usar totalAPagar en lugar de totalViaticos
            efectivoViaje += Number(p.totales?.totalAPagar || 0);
        });

        // Mantenimientos con detalles individuales
        const mantens = await MantenimientoCamiones.find({ 
            fecha_mantenimiento: { $gte: weekStart, $lte: weekEnd }, 
            estado: 'completado' 
        }).populate('ciculatioCard', 'licensePlate').lean();

        // Calcular total de mantenimientos y preparar array de registros
        const mantenimientosDetalle = [];
        let maintenanceTotal = 0;
        
        mantens.forEach(m => {
            const totalManto = m.detalles.reduce((sum, d) => sum + (Number(d.subTotal) || 0), 0);
            maintenanceTotal += totalManto;
            mantenimientosDetalle.push({
                placa: m.ciculatioCard?.licensePlate || 'Sin placa',
                descripcion: m.descripcion || m.tipo_de_mantenimiento || 'Mantenimiento',
                monto: totalManto
            });
        });

        // Total viajes
        const totalViajes = viajesThis.reduce((s, r) => s + Number(r.monto || 0), 0);

        // Total de efectivo de viaje (planilla + mantenimientos + manualEntries)
        const totalManualEntries = Array.isArray(manualEntries) ? manualEntries.reduce((s, m) => s + (Number(m.amount) || 0), 0) : 0;
        const totalEfectivoViaje = efectivoViaje + maintenanceTotal + totalManualEntries;

        // Sobrante de efectivo = total viajes - total efectivo de viaje
        const sobranteEfectivo = totalViajes - totalEfectivoViaje;

        // Cantidad para reponer caja chica (lo que falta para llegar al monto definido)
        const cajaDefinedAmount = Number(pettyCashAmount || 250);
        const reponerCajaChica = Math.max(0, cajaDefinedAmount - lastCurrentBalance);

        // Bancos = sobrante de efectivo - lo que se debe reponer a caja chica
        const bancos = sobranteEfectivo - reponerCajaChica;

        const summaryEntries = [
            { tipo: '', concepto: 'Efectivo', monto: sobranteEfectivo, montoFormatted: formatMoney(sobranteEfectivo) },
            { tipo: '', concepto: 'Reintegro Caja Chica', monto: reponerCajaChica, montoFormatted: formatMoney(reponerCajaChica) },
            { tipo: 'Debe', concepto: 'Bancos', monto: bancos, montoFormatted: formatMoney(bancos) }
        ];

        return res.json({
            success: true,
            period: { 
                weekStart, 
                weekEnd, 
                previousWeekStart: prevWeekStart, 
                previousWeekEnd: prevWeekEnd, 
                weekLabel, 
                prevWeekLabel 
            },
            viajes: { 
                selectedWeek: viajesThisFormatted, 
                previousWeek: viajesPrevFormatted, 
                totalSelectedWeek: totalViajes 
            },
            cajaChica: { 
                records: cajaRecords, 
                totals: { 
                    totalExpenses, 
                    totalReintegros, 
                    gastoNetoCaja, 
                    lastCurrentBalance, 
                    cajaDefinedAmount 
                } 
            },
            planilla: { planillas, efectivoViaje },
            mantenimientos: { records: mantens, mantenimientosDetalle, maintenanceTotal },
            computations: { 
                sobranteEfectivo, 
                reponerCajaChica, 
                totalReintegros, 
                bancos 
            },
            summaryEntries
        });

    } catch (error) {
        console.error('Error generating weekly trips & expenses report:', error);
        res.status(500).json({ success: false, message: 'Error generating report', error: error.message });
    }
};

ReporteController.generarPDFSemanal = async (req, res) => {
    let browser;
    try {
        const { date, startDate, pettyCashAmount = 250, manualEntries = [] } = req.body || {};
        const target = date ? new Date(date) : (startDate ? new Date(startDate) : new Date());

        const { monday: weekStart, saturday: weekEnd } = getWeekRange(target);
        const prevWeekStart = new Date(weekStart);
        prevWeekStart.setDate(weekStart.getDate() - 7);
        prevWeekStart.setHours(0, 0, 0, 0);
        const prevWeekEnd = new Date(prevWeekStart);
        prevWeekEnd.setDate(prevWeekStart.getDate() + 5);
        prevWeekEnd.setHours(23, 59, 59, 999);

        // Aggregate viajes
        const aggregateViajes = async (start, end) => {
            const pipeline = [
                { $match: { departureTime: { $gte: start, $lte: end }, 'estado.actual': 'completado' } },
                { $addFields: { monto: '$montoAcordado' } },
                { $group: { 
                    _id: { 
                        clienteNombre: { $ifNull: ['$clienteNombre', null] }, 
                        clienteOperativo: { $ifNull: ['$clienteOperativo', null] } 
                    }, 
                    viajes: { $sum: 1 }, 
                    monto: { $sum: '$monto' } 
                } },
                { $project: { 
                    clienteNombre: '$_id.clienteNombre', 
                    clienteOperativo: '$_id.clienteOperativo', 
                    viajes: 1, 
                    monto: 1, 
                    _id: 0 
                } }
            ];
            const rows = await Viajes.aggregate(pipeline);
            return rows.map(r => ({ 
                cliente: r.clienteNombre || (r.clienteOperativo ? String(r.clienteOperativo) : 'SIN CLIENTE'), 
                viajes: r.viajes, 
                monto: Number(r.monto || 0) 
            }));
        };

        const viajesThis = await aggregateViajes(weekStart, weekEnd);
        const viajesPrev = await aggregateViajes(prevWeekStart, prevWeekEnd);

        const weekLabel = formatWeekLabel(weekStart, weekEnd);
        const prevWeekLabel = formatWeekLabel(prevWeekStart, prevWeekEnd);

        // Caja chica
        let cajaRecords = await CajaChica.find({ 
            date: { $gte: weekStart, $lte: weekEnd } 
        }).sort({ date: 1 }).lean();

        // NO agregamos manualEntries a caja chica

        let totalExpenses = 0;
        let totalReintegros = 0;
        cajaRecords.forEach(r => {
            const amt = Number(r.amount || 0);
            if ((r.type || '').toLowerCase() === 'expense') {
                totalExpenses += amt;
            } else {
                totalReintegros += amt;
            }
        });

        const lastRecord = await CajaChica.findOne({ 
            date: { $gte: weekStart, $lte: weekEnd } 
        }).sort({ date: -1 }).lean();
        const lastCurrentBalance = lastRecord ? Number(lastRecord.currentBalance || 0) : 0;

        // Planillas
        const planillas = await PlanillaSemanal.find({
            fechaInicio: { $lte: weekEnd },
            fechaFin: { $gte: weekStart }
        }).sort({ fechaInicio: 1 }).lean();

        let efectivoViaje = 0;
        planillas.forEach(p => {
            // Usar totalAPagar en lugar de totalViaticos
            efectivoViaje += Number(p.totales?.totalAPagar || 0);
        });

        // Mantenimientos con detalles individuales
        const mantens = await MantenimientoCamiones.find({ 
            fecha_mantenimiento: { $gte: weekStart, $lte: weekEnd }, 
            estado: 'completado' 
        }).populate('ciculatioCard', 'licensePlate').lean();

        // Calcular total de mantenimientos y preparar array de registros
        const mantenimientosDetalle = [];
        let maintenanceTotal = 0;
        
        mantens.forEach(m => {
            const totalManto = m.detalles.reduce((sum, d) => sum + (Number(d.subTotal) || 0), 0);
            maintenanceTotal += totalManto;
            mantenimientosDetalle.push({
                placa: m.ciculatioCard?.licensePlate || 'Sin placa',
                descripcion: m.descripcion || m.tipo_de_mantenimiento || 'Mantenimiento',
                monto: totalManto
            });
        });

        const totalViajes = viajesThis.reduce((s, r) => s + Number(r.monto || 0), 0);
        
        // Total de efectivo de viaje (planilla + mantenimientos + manualEntries)
        const totalManualEntries = Array.isArray(manualEntries) ? manualEntries.reduce((s, m) => s + (Number(m.amount) || 0), 0) : 0;
        const totalEfectivoViaje = efectivoViaje + maintenanceTotal + totalManualEntries;
        
        const sobranteEfectivo = totalViajes - totalEfectivoViaje;
        const cajaDefinedAmount = Number(pettyCashAmount || 250);
        const reponerCajaChica = Math.max(0, cajaDefinedAmount - lastCurrentBalance);
        const bancos = sobranteEfectivo - reponerCajaChica;

        // Formato de fecha para el período de caja chica
        const cajaStartDate = weekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
        const cajaEndDate = weekEnd.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });

        // Convertir logo a base64
        const logoBase64 = convertirImagenABase64(RUTA_LOGO);

        // HTML para PDF
        const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: Arial, sans-serif;
                    padding: 30px;
                    color: #34353A;
                    background: #fff;
                }
                .header {
                    text-align: center;
                    margin-bottom: 25px;
                    padding-bottom: 15px;
                    border-bottom: 3px solid #5F8EAD;
                }
                .header .logo-container {
                    margin-bottom: 8px;
                }
                .header .logo-container img {
                    max-width: 180px;
                    height: auto;
                }
                .header h1 {
                    font-size: 20px;
                    font-weight: bold;
                    text-transform: uppercase;
                    margin-bottom: 5px;
                    color: #34353A;
                }
                .header .subtitle {
                    font-size: 12px;
                    color: #666;
                    margin-top: 5px;
                }
                .section-title {
                    font-size: 13px;
                    font-weight: bold;
                    margin: 20px 0 10px 0;
                    color: #34353A;
                    text-transform: uppercase;
                    border-bottom: 2px solid #5D9646;
                    padding-bottom: 5px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                    font-size: 11px;
                }
                th {
                    background-color: #5F8EAD;
                    color: white;
                    padding: 8px;
                    text-align: left;
                    font-weight: bold;
                    font-size: 10px;
                }
                td {
                    padding: 6px 8px;
                    border-bottom: 1px solid #ddd;
                }
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                .text-right {
                    text-align: right;
                }
                .total-row {
                    font-weight: bold;
                    background-color: #5D9646 !important;
                    color: white;
                }
                .total-row td {
                    border-bottom: none;
                }
                .viajes-table {
                    display: inline-block;
                    width: 48%;
                    vertical-align: top;
                    margin-right: 2%;
                }
                .viajes-table:last-child {
                    margin-right: 0;
                }
                .summary-box {
                    background-color: #f5f5f5;
                    border: 2px solid #34353A;
                    padding: 15px;
                    margin: 20px 0;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 8px 0;
                    font-size: 12px;
                }
                .summary-row strong {
                    font-weight: bold;
                }
                .accounting-entry {
                    margin: 5px 0;
                    padding: 8px;
                    background-color: #f9f9f9;
                    border-left: 4px solid #5F8EAD;
                    font-size: 12px;
                    display: flex;
                    justify-content: space-between;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 9px;
                    color: #666;
                    border-top: 1px solid #ddd;
                    padding-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo-container">
                    ${logoBase64 ? `<img src="${logoBase64}" alt="Rivera Logo" />` : '<p>RIVERA - Distribuidora y Transportes</p>'}
                </div>
                <h1>VIAJES, INGRESOS Y GASTOS DE LA SEMANA</h1>
                <div class="subtitle">${weekLabel}</div>
            </div>

            <!-- SECCIÓN VIAJES -->
            <div class="section-title">Viajes Realizados</div>
            <div style="display: flex; justify-content: space-between;">
                <div class="viajes-table">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>CLIENTE</th>
                                <th class="text-right">VIAJES</th>
                                <th class="text-right">MONTO</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${viajesThis.map((v, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td>${v.cliente}</td>
                                    <td class="text-right">${v.viajes}</td>
                                    <td class="text-right">$ ${formatMoney(v.monto)}</td>
                                </tr>
                            `).join('')}
                            <tr class="total-row">
                                <td colspan="2">TOTAL</td>
                                <td class="text-right">${viajesThis.reduce((s, v) => s + v.viajes, 0)}</td>
                                <td class="text-right">$ ${formatMoney(totalViajes)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div style="font-size: 10px; margin-top: 5px; font-weight: bold;">${weekLabel}</div>
                </div>
                <div class="viajes-table">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>CLIENTE</th>
                                <th class="text-right">VIAJES</th>
                                <th class="text-right">MONTO</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${viajesPrev.map((v, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td>${v.cliente}</td>
                                    <td class="text-right">${v.viajes}</td>
                                    <td class="text-right">$ ${formatMoney(v.monto)}</td>
                                </tr>
                            `).join('')}
                            <tr class="total-row">
                                <td colspan="2">TOTAL</td>
                                <td class="text-right">${viajesPrev.reduce((s, v) => s + v.viajes, 0)}</td>
                                <td class="text-right">$ ${formatMoney(viajesPrev.reduce((s, v) => s + v.monto, 0))}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div style="font-size: 10px; margin-top: 5px; font-weight: bold;">${prevWeekLabel}</div>
                </div>
            </div>

            <!-- SECCIÓN CAJA CHICA -->
            <div class="section-title">Caja Chica - $ ${formatMoney(cajaDefinedAmount)}</div>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>GASTOS</th>
                        <th class="text-right">MONTO</th>
                    </tr>
                </thead>
                <tbody>
                    ${cajaRecords.map((r, i) => {
                        const esPrimerRegistro = i === 0;
                        const esReintegro = r.type === 'income';
                        const mostrarComoPositivo = esPrimerRegistro && esReintegro;
                        
                        return `
                        <tr>
                            <td>${i + 1}</td>
                            <td>${r.reason}${esReintegro ? ' (REINTEGRO)' : ''}</td>
                            <td class="text-right">${mostrarComoPositivo ? '$ ' : (esReintegro ? '- $ ' : '$ ')}${formatMoney(Math.abs(r.amount))}</td>
                        </tr>
                        `;
                    }).join('')}
                    <tr class="total-row">
                        <td colspan="2">TOTAL</td>
                        <td class="text-right">$ ${formatMoney(totalExpenses - (totalReintegros - (cajaRecords.length > 0 && cajaRecords[0].type === 'income' ? Math.abs(cajaRecords[0].amount) : 0)))}</td>
                    </tr>
                </tbody>
            </table>
            <div style="font-size: 11px; margin: 10px 0;">
                <strong>FALTANTE/SOBRANTE CAJA CHICA: $ ${formatMoney(lastCurrentBalance)}</strong>
            </div>

            <!-- SECCIÓN EFECTIVO DE VIAJE -->
            <div class="section-title">Efectivo de Viaje</div>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>GASTO EFECTIVO DE VIAJES</th>
                        <th class="text-right">MONTO</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td>PLANILLA SEMANAL, EXTRA Y ANTICIPO</td>
                        <td class="text-right">$ ${formatMoney(efectivoViaje)}</td>
                    </tr>
                    ${mantenimientosDetalle.map((mant, i) => `
                        <tr>
                            <td>${2 + i}</td>
                            <td>MANTENIMIENTO ${mant.placa} - ${mant.descripcion}</td>
                            <td class="text-right">$ ${formatMoney(mant.monto)}</td>
                        </tr>
                    `).join('')}
                    ${Array.isArray(manualEntries) && manualEntries.length > 0 ? manualEntries.map((m, i) => `
                        <tr>
                            <td>${2 + mantenimientosDetalle.length + i}</td>
                            <td>${m.name || `MANUAL ${i + 1}`}</td>
                            <td class="text-right">$ ${formatMoney(m.amount || 0)}</td>
                        </tr>
                    `).join('') : ''}
                    <tr class="total-row">
                        <td colspan="2">TOTAL</td>
                        <td class="text-right">$ ${formatMoney(totalEfectivoViaje)}</td>
                    </tr>
                </tbody>
            </table>

            <!-- RESUMEN CONTABLE -->
            <div class="summary-box">
                <div style="font-size: 13px; font-weight: bold; margin-bottom: 10px;">SOBRANTE DE EFECTIVO: $ ${formatMoney(sobranteEfectivo)}</div>
                <div style="margin: 15px 0; border-top: 2px solid #34353A; padding-top: 10px;">
                    <div class="accounting-entry">
                        <span><strong>Efectivo</strong></span>
                        <span>$ ${formatMoney(sobranteEfectivo)}</span>
                    </div>
                    <div class="accounting-entry">
                        <span><strong>Reintegro Caja Chica</strong></span>
                        <span>$ ${formatMoney(reponerCajaChica)}</span>
                    </div>
                    <div class="accounting-entry">
                        <span><strong>Bancos</strong></span>
                        <span>$ ${formatMoney(bancos)}</span>
                    </div>
                </div>
                <div style="font-size: 11px; margin-top: 15px; text-align: center; font-weight: bold;">
                    CAJA CHICA DEL ${cajaStartDate} AL ${cajaEndDate}: $ ${formatMoney(cajaDefinedAmount)}
                </div>
            </div>

            <div class="footer">
                <p>Documento generado el ${formatearFecha(new Date())} a las ${formatearHora(new Date())}</p>
                <p>Sistema de Gestión Rivera Distribuidora y Transportes © ${new Date().getFullYear()}</p>
            </div>
        </body>
        </html>
        `;

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'Letter',
            printBackground: true,
            margin: {
                top: '15px',
                right: '15px',
                bottom: '15px',
                left: '15px'
            }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="reporte-semanal-${weekStart.toISOString().split('T')[0]}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF semanal:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el PDF',
            error: error.message
        });
    }
};

export default ReporteController;