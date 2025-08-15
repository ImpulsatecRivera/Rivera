import clienteModel from "../Models/Clientes.js"
import bcryptjs from "bcryptjs";

const clienteCon={}

clienteCon.get = async(req , res) => {
    try {
        const newCliente = await clienteModel.find()
    res.status(200).json(newCliente);
    } catch (error) {
          res.status(500).json({ message: "Error al obtener clientes", error: error.message });
    }
}

clienteCon.PutClientes = async(req,res) => {
    try {
        const{firtsName,lastName,email,idNumber,birthDate,password,phone,address}=req.body;

        const clienteActual = await clienteModel.findById(req.params.id);
        if(!clienteActual){
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        const datosActualizados = {};
        if(firtsName)datosActualizados.firtsName=firtsName;
        if(lastName)datosActualizados.lastName=lastName;
        if(idNumber)datosActualizados.idNumber=idNumber;
        if(email)datosActualizados.email=email;
        if(birthDate)datosActualizados.birthDate=birthDate;
        if(password)datosActualizados.password=password;
        if(phone)datosActualizados.phone=phone;
        if(address)datosActualizados.address=address;


        if(password){
            datosActualizados.password= await bcryptjs.hash(password,10);
        }

        const clienteActualizado = await clienteModel.findByIdAndUpdate(
            req.params.id,
            datosActualizados,
            {new:true,runValidators:true}
        )
          res.status(200).json({ 
            message: "Cliente actualizado correctamente",
            empleado: clienteActualizado
        });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar cliente", error: error.message });
    }
}


clienteCon.deleteClientes = async (req,res) =>{
    try {
        const deleteCliente = await clienteModel.findByIdAndDelete(req.params.id);
        if (!deleteCliente) {
         return res.status(404).json({ message: "Cliente no encontrado" });
        }
        res.status(200).json({ message: "Cliente eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el cliente", error: error.message });
    }
}

// 📊 MÉTODO PARA CALCULAR USUARIOS ACTIVOS
clienteCon.getUsuariosActivos = async (req, res) => {
    try {
        // ⏰ Fecha actual y rangos de tiempo
        const ahora = new Date();
        const hace30Dias = new Date(ahora.getTime() - (30 * 24 * 60 * 60 * 1000));
        const hace7Dias = new Date(ahora.getTime() - (7 * 24 * 60 * 60 * 1000));
        const hace24Horas = new Date(ahora.getTime() - (24 * 60 * 60 * 1000));

        // 📊 AGREGACIÓN PARA CALCULAR MÉTRICAS DE USUARIOS ACTIVOS
        const metricas = await clienteModel.aggregate([
            {
                $facet: {
                    // 👥 Total de usuarios registrados
                    totalUsuarios: [
                        { $count: "total" }
                    ],
                    
                    // 🟢 Usuarios activos (últimos 30 días)
                    usuariosActivos30Dias: [
                        {
                            $match: {
                                $or: [
                                    { ultimoAcceso: { $gte: hace30Dias } },
                                    { updatedAt: { $gte: hace30Dias } },
                                    { createdAt: { $gte: hace30Dias } }
                                ]
                            }
                        },
                        { $count: "activos" }
                    ],

                    // 🔥 Usuarios muy activos (últimos 7 días)
                    usuariosMuyActivos: [
                        {
                            $match: {
                                $or: [
                                    { ultimoAcceso: { $gte: hace7Dias } },
                                    { updatedAt: { $gte: hace7Dias } }
                                ]
                            }
                        },
                        { $count: "muyActivos" }
                    ],

                    // ⚡ Usuarios online (últimas 24 horas)
                    usuariosOnline: [
                        {
                            $match: {
                                $or: [
                                    { ultimoAcceso: { $gte: hace24Horas } },
                                    { updatedAt: { $gte: hace24Horas } }
                                ]
                            }
                        },
                        { $count: "online" }
                    ],

                    // 📈 Usuarios por período (para calcular tendencias)
                    usuariosPorPeriodo: [
                        {
                            $match: {
                                createdAt: { $exists: true }
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    año: { $year: "$createdAt" },
                                    mes: { $month: "$createdAt" }
                                },
                                nuevosUsuarios: { $sum: 1 }
                            }
                        },
                        { $sort: { "_id.año": -1, "_id.mes": -1 } },
                        { $limit: 6 }
                    ],

                    // 📊 Distribución por estado/actividad
                    distribucionActividad: [
                        {
                            $addFields: {
                                estadoActividad: {
                                    $cond: {
                                        if: { $gte: ["$ultimoAcceso", hace24Horas] },
                                        then: "online",
                                        else: {
                                            $cond: {
                                                if: { $gte: ["$ultimoAcceso", hace7Dias] },
                                                then: "activo",
                                                else: {
                                                    $cond: {
                                                        if: { $gte: ["$ultimoAcceso", hace30Dias] },
                                                        then: "poco_activo",
                                                        else: "inactivo"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $group: {
                                _id: "$estadoActividad",
                                cantidad: { $sum: 1 }
                            }
                        }
                    ]
                }
            }
        ]);

        // 🔄 Procesar resultados
        const resultados = metricas[0];
        
        const totalUsuarios = resultados.totalUsuarios[0]?.total || 0;
        const usuariosActivos = resultados.usuariosActivos30Dias[0]?.activos || 0;
        const usuariosMuyActivos = resultados.usuariosMuyActivos[0]?.muyActivos || 0;
        const usuariosOnline = resultados.usuariosOnline[0]?.online || 0;

        // 📈 Calcular tendencias (comparar con el mes anterior)
        const hace60Dias = new Date(ahora.getTime() - (60 * 24 * 60 * 60 * 1000));
        const usuariosActivosAnterior = await clienteModel.countDocuments({
            $or: [
                { 
                    ultimoAcceso: { 
                        $gte: hace60Dias, 
                        $lt: hace30Dias 
                    } 
                },
                { 
                    updatedAt: { 
                        $gte: hace60Dias, 
                        $lt: hace30Dias 
                    } 
                }
            ]
        });

        // 📊 Calcular porcentaje de cambio
        const tendencia = usuariosActivosAnterior > 0 
            ? ((usuariosActivos - usuariosActivosAnterior) / usuariosActivosAnterior * 100).toFixed(1)
            : usuariosActivos > 0 ? "+100" : "0";

        // 📋 Respuesta estructurada
        const response = {
            success: true,
            data: {
                // 🎯 Métricas principales
                usuariosActivos: {
                    total: usuariosActivos,
                    porcentaje: totalUsuarios > 0 ? ((usuariosActivos / totalUsuarios) * 100).toFixed(1) : "0",
                    tendencia: tendencia > 0 ? `+${tendencia}%` : `${tendencia}%`,
                    tipoCambio: tendencia > 0 ? "positive" : tendencia < 0 ? "negative" : "neutral"
                },

                // 📊 Métricas detalladas
                detalles: {
                    totalUsuarios,
                    usuariosOnline,
                    usuariosMuyActivos,
                    usuariosActivos,
                    usuariosInactivos: totalUsuarios - usuariosActivos
                },

                // 📈 Distribución por actividad
                distribucion: resultados.distribucionActividad.reduce((acc, item) => {
                    acc[item._id || 'sin_datos'] = item.cantidad;
                    return acc;
                }, {}),

                // 🕐 Períodos de referencia
                periodos: {
                    online: "Últimas 24 horas",
                    muyActivos: "Últimos 7 días", 
                    activos: "Últimos 30 días",
                    tendencia: "Comparado con mes anterior"
                }
            },

            // 🔍 Metadatos
            metadata: {
                fechaConsulta: ahora.toISOString(),
                criterioActividad: "ultimoAcceso o updatedAt en últimos 30 días",
                totalRegistros: totalUsuarios,
                version: "1.0"
            },

            message: `${usuariosActivos} usuarios activos de ${totalUsuarios} registrados`
        };

        res.status(200).json(response);

    } catch (error) {
        console.error("❌ Error al calcular usuarios activos:", error);
        res.status(500).json({ 
            success: false,
            message: "Error al calcular usuarios activos", 
            error: error.message 
        });
    }
};

// 📊 MÉTODO ADICIONAL: Resumen rápido para métricas del dashboard
clienteCon.getResumenUsuarios = async (req, res) => {
    try {
        const hace30Dias = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
        
        // 📊 Consulta simple y rápida
        const [total, activos] = await Promise.all([
            clienteModel.countDocuments(),
            clienteModel.countDocuments({
                $or: [
                    { ultimoAcceso: { $gte: hace30Dias } },
                    { updatedAt: { $gte: hace30Dias } },
                    { createdAt: { $gte: hace30Dias } }
                ]
            })
        ]);

        // 📈 Formato compatible con tu frontend
        res.status(200).json({
            success: true,
            data: {
                usuariosActivos: activos.toLocaleString(),
                totalUsuarios: total.toLocaleString(),
                porcentajeActividad: total > 0 ? ((activos / total) * 100).toFixed(1) : "0",
                tendencia: "positive", // Puedes calcular esto comparando con períodos anteriores
                cambio: "+12%" // Ejemplo - calcular real comparando con mes anterior
            }
        });

    } catch (error) {
        console.error("❌ Error al obtener resumen de usuarios:", error);
        res.status(500).json({ 
            success: false,
            message: "Error al obtener resumen", 
            error: error.message 
        });
    }
};
export default clienteCon;