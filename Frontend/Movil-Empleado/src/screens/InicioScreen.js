// src/screens/InicioScreen.js
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import LottieView from "lottie-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"; // ✅ CLAVE

import { useTrips } from "../hooks/useTrips";
import { useProfile } from "../hooks/useProfile";

// Components
import LogoHeader from "../components/LogoHeader";
import ServiceCard from "../components/ServiceCard";

const InicioScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight(); // ✅ altura real del tabBar
  const { profile, loading: profileLoading } = useProfile();

  // Estados para clima y hora
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0); // 0 = hoy, 1 = mañana, etc.

  // Animaciones
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Timers/refs
  const clockTimerRef = useRef(null);
  const weatherTimerRef = useRef(null);
  const pulseLoopRef = useRef(null);

  const motoristaId = profile?.id || profile?._id;

  const {
    loading: tripsLoading,
    totalTrips,
    refrescarViajes,
    getViajesHoy,
    getEstadisticas,
    viajesPorDia,
  } = useTrips(motoristaId);

  const loading = profileLoading || tripsLoading;

  // ✅ ESPACIO REAL para que el último cuadro NO quede debajo del tab flotante
  const bottomSpace = tabBarHeight + 24;

  // ===== ANIMACIONES =====
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    const pulseAnimation = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);

    pulseLoopRef.current = Animated.loop(pulseAnimation);
    pulseLoopRef.current.start();

    return () => {
      try {
        pulseLoopRef.current?.stop?.();
      } catch {}
    };
  }, [pulseAnim, slideAnim]);

  // ===== HORA =====
  useEffect(() => {
    clockTimerRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => {
      if (clockTimerRef.current) clearInterval(clockTimerRef.current);
    };
  }, []);

  // ===== CLIMA =====
  const obtenerClima = async () => {
    setWeatherLoading(true);

    // ✅ limpia timeout anterior si el usuario refresca rápido
    if (weatherTimerRef.current) clearTimeout(weatherTimerRef.current);

    try {
      weatherTimerRef.current = setTimeout(() => {
        const climas = [
          { temp: 28, descripcion: "Perfecto para manejar", icono: "☀️", color: "#FFD700", bg: "#FFF8DC" },
          { temp: 25, descripcion: "Día agradable", icono: "⛅", color: "#87CEEB", bg: "#F0F8FF" },
          { temp: 22, descripcion: "Fresco y cómodo", icono: "☁️", color: "#B0C4DE", bg: "#F5F5F5" },
          { temp: 30, descripcion: "¡Mantente hidratado!", icono: "🌡️", color: "#FF6347", bg: "#FFE4E1" },
          { temp: 26, descripcion: "Clima ideal", icono: "🌤️", color: "#98FB98", bg: "#F0FFF0" },
        ];
        setWeather(climas[Math.floor(Math.random() * climas.length)]);
        setWeatherLoading(false);
      }, 900);
    } catch {
      setWeather({
        temp: "🤷",
        descripcion: "Sorpresa del clima",
        icono: "🌈",
        color: "#FF69B4",
        bg: "#FFF0F5",
      });
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    obtenerClima();
    return () => {
      if (weatherTimerRef.current) clearTimeout(weatherTimerRef.current);
    };
  }, []);

  // ===== UTILIDADES =====
  const formatearHora = (fecha) =>
    fecha.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: false });

  const obtenerSaludo = (hora) => {
    const h = hora.getHours();
    const saludos = {
      mañana: ["¡Buenos días!", "¡Que tengas un gran día!", "¡Empecemos con energía!"],
      tarde: ["¡Buenas tardes!", "¡Sigue así!", "¡Excelente trabajo!"],
      noche: ["¡Buenas noches!", "¡Ya casi terminas!", "¡Último esfuerzo!"],
    };

    let categoria = "noche";
    if (h >= 5 && h < 12) categoria = "mañana";
    else if (h >= 12 && h < 18) categoria = "tarde";

    const opciones = saludos[categoria];
    return opciones[Math.floor(Math.random() * opciones.length)];
  };

  const getInitials = (name) => {
    if (!name) return "😊";
    return name
      .split(" ")
      .map((w) => w.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getFirstName = (fullName) => {
    if (!fullName) return "Conductor";
    return fullName.split(" ")[0];
  };

  // Formatea la hora de un viaje de forma segura
  const formatearHoraViaje = (viaje) => {
    try {
      if (!viaje) return "—";
      // Intenta con las diferentes propiedades posibles
      const fecha = viaje._fechaSalidaISO || viaje.horaSalida || viaje.fechaSalida;
      if (!fecha) return "—";
      
      const fechaObj = new Date(fecha);
      if (isNaN(fechaObj.getTime())) return "—"; // Invalid Date
      
      return fechaObj.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  // Genera lista de 7 días desde hoy
  const getDiasSemana = () => {
    const dias = [];
    const hoy = new Date();
    const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sab"];

    for (let i = 0; i < 7; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      const pad = (n) => String(n).padStart(2, "0");
      const fechaISO = `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;
      
      dias.push({
        label: diasSemana[fecha.getDay()],
        day: fecha.getDate(),
        fecha: fechaISO,
        isToday: i === 0,
        fullDate: fecha,
      });
    }
    return dias;
  };

  const diasSemana = useMemo(() => getDiasSemana(), []);
  const diaSeleccionado = diasSemana[selectedDay];
  
  // Buscar viajes del día seleccionado
  const viajesDelDia = useMemo(() => {
    if (!diaSeleccionado || !viajesPorDia) {
      console.log("❌ Sin data:", { diaSeleccionado, viajesPorDia });
      return [];
    }
    
    const diaFecha = diaSeleccionado.fecha;
    console.log("🔍 Buscando viajes para:", diaFecha);
    console.log("📋 Total días con viajes:", viajesPorDia.length);
    
    if (Array.isArray(viajesPorDia)) {
      const diaEncontrado = viajesPorDia.find((d) => d.fecha === diaFecha);
      console.log("✅ Día encontrado:", diaEncontrado);
      
      if (diaEncontrado && Array.isArray(diaEncontrado.viajes)) {
        console.log("✈️ Viajes del día:", diaEncontrado.viajes.length);
        return diaEncontrado.viajes;
      }
    }
    
    console.log("⚠️ No hay viajes para:", diaFecha);
    return [];
  }, [viajesPorDia, diaSeleccionado]);

  const getEstadoColor = (estado) => {
    if (estado === "completado") return "#5D9646";
    if (estado === "en_curso" || estado === "en curso") return "#5F8EAD";
    if (estado === "cancelado") return "#E74C3C";
    return "#F39C12"; // pendiente
  };

  const getEstadoLabel = (estado) => {
    if (estado === "completado") return "✓ Completado";
    if (estado === "en_curso" || estado === "en curso") return "▶ En Curso";
    if (estado === "cancelado") return "✗ Cancelado";
    return "○ Pendiente";
  };

  // ===== HANDLERS =====
  const handleTripPress = (trip) => navigation.navigate("InfoViaje", { trip });

  const onRefresh = () => {
    refrescarViajes?.();
    obtenerClima();
  };

  const handleButtonPress = (action) => action?.();

  // ===== UI =====
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollIndicatorInsets={{ bottom: bottomSpace }}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(10, insets.top),
            paddingBottom: bottomSpace,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={!!loading}
            onRefresh={onRefresh}
            tintColor="#4CAF50"
            colors={["#4CAF50", "#FF6B35", "#FF9800"]}
          />
        }
      >
        <LogoHeader />

        {/* HEADER CON CLIMA */}
        <Animated.View
          style={[
            styles.headerPizarra,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.timeTextBig}>{formatearHora(currentTime)}</Text>
              <Text style={styles.nameTextHeader}>{getFirstName(profile?.name || profile?.nombre)}</Text>
            </View>

            <TouchableOpacity
              style={styles.weatherSectionPizarra}
              onPress={() => handleButtonPress(obtenerClima)}
              activeOpacity={0.7}
            >
              {weatherLoading ? (
                <Text style={styles.weatherIconBig}>🔄</Text>
              ) : weather ? (
                <>
                  <Text style={styles.weatherIconBig}>{weather.icono}</Text>
                  <Text style={styles.tempTextBig}>{weather.temp}°</Text>
                </>
              ) : null}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* PIZARRA - DÍAS DE LA SEMANA */}
        <View style={styles.pizarraContainer}>
          {/* Selector de días */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.diasScroll}
            contentContainerStyle={styles.diasContent}
          >
            {diasSemana.map((dia, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.diaButton,
                  selectedDay === idx && styles.diaButtonActive,
                ]}
                onPress={() => setSelectedDay(idx)}
                activeOpacity={0.7}
              >
                <Text style={[styles.diaLabel, selectedDay === idx && styles.diaLabelActive]}>
                  {dia.label}
                </Text>
                <Text style={[styles.dayNumber, selectedDay === idx && styles.dayNumberActive]}>
                  {dia.day}
                </Text>
                {dia.isToday && (
                  <View style={styles.todayBadge}>
                    <Text style={styles.todayDot}>●</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Programación del día seleccionado */}
          <View style={styles.programacionDia}>
            <View style={styles.programacionHeader}>
              <View style={styles.programacionTitleContainer}>
                <LottieView
                  source={require('../../assets/lottie/Calendar Animation.json')}
                  autoPlay
                  loop
                  style={styles.programacionLottie}
                />
                <Text style={styles.programacionTitle}>
                  {diaSeleccionado.isToday ? "HOY" : diaSeleccionado.label.toUpperCase()}
                </Text>
              </View>
              <View style={styles.viajesBadge}>
                <Text style={styles.viajesBadgeText}>{viajesDelDia.length}</Text>
              </View>
            </View>

            {viajesDelDia.length === 0 ? (
              <View style={styles.noViajesContainer}>
                <Text style={styles.noViajesIcon}>🚛</Text>
                <Text style={styles.noViajesText}>Sin viajes este día</Text>
              </View>
            ) : (
              <View style={styles.viajesList}>
                {viajesDelDia.map((viaje, idx) => {
                  const horaFormato = formatearHoraViaje(viaje);
                  const estadoColor = getEstadoColor(viaje.estado);

                  return (
                    <TouchableOpacity
                      key={viaje._id || idx}
                      style={[styles.viajeCard, { borderLeftColor: estadoColor }]}
                      onPress={() => handleTripPress(viaje)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.viajeCardHeader}>
                        <View style={styles.viajeTimeIcon}>
                          <Text style={styles.viajeTimeText}>{horaFormato}</Text>
                        </View>
                        <View style={styles.viajeInfo}>
                          <Text style={styles.viajeTipo} numberOfLines={1}>
                            {viaje.origen} → {viaje.destino}
                          </Text>
                          <Text style={styles.viajeDescripcion} numberOfLines={1}>
                            {viaje.descripcion || "Transporte de carga"}
                          </Text>
                        </View>
                        <View style={[styles.estadoBadge, { backgroundColor: estadoColor }]}>
                          <Text style={styles.estadoLabel}>{getEstadoLabel(viaje.estado)}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* ESTADÍSTICAS RÁPIDAS */}
        {totalTrips > 0 && (
          <View style={styles.quickStatsContainer}>
            <View style={[styles.statCard, styles.todayCard]}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statNumber}>{viajesHoy.length}</Text>
              <Text style={styles.statLabel}>Hoy</Text>
            </View>

            <View style={[styles.statCard, styles.totalCard]}>
              <Text style={styles.statIcon}>🎯</Text>
              <Text style={styles.statNumber}>{totalTrips}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>

            <View style={[styles.statCard, styles.nextCard]}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={styles.statNumber}>{viajesPorDia?.length || 0}</Text>
              <Text style={styles.statLabel}>Días</Text>
            </View>
          </View>
        )}

        {/* ACCIONES RÁPIDAS */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.historyAction]}
            onPress={() => handleButtonPress(() => navigation.navigate("Viajes"))}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Mi Historial</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.refreshAction]}
            onPress={() => handleButtonPress(onRefresh)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>🔄</Text>
            <Text style={styles.actionText}>Actualizar</Text>
          </TouchableOpacity>
        </View>

        {/* MOTIVACIÓN */}
        <View style={styles.motivationFooter}>
          <Text style={styles.motivationFooterText}>
            ¡Cada viaje es una nueva oportunidad! 🚀
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f8" },
  scrollView: { flex: 1 },
  content: { flexGrow: 1 },

  // HEADER PIZARRA
  headerPizarra: {
    backgroundColor: "#2c3e50",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  timeTextBig: {
    fontSize: 42,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 5,
  },

  nameTextHeader: {
    fontSize: 16,
    color: "#ecf0f1",
    fontWeight: "600",
  },

  weatherSectionPizarra: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 15,
    borderRadius: 20,
    minWidth: 100,
  },

  weatherIconBig: {
    fontSize: 40,
    marginBottom: 5,
  },

  tempTextBig: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },

  // PIZARRA CONTAINER
  pizarraContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
  },

  diasScroll: {
    borderBottomWidth: 2,
    borderBottomColor: "#ecf0f1",
  },

  diasContent: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    gap: 8,
  },

  diaButton: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "#ddd",
    minWidth: 70,
  },

  diaButtonActive: {
    backgroundColor: "#34353A",
    borderColor: "#34353A",
  },

  diaLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7f8c8d",
    marginBottom: 4,
  },

  diaLabelActive: {
    color: "#fff",
  },

  dayNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2c3e50",
  },

  dayNumberActive: {
    color: "#fff",
  },

  todayBadge: {
    marginTop: 4,
  },

  todayDot: {
    color: "#e74c3c",
    fontSize: 8,
  },

  // PROGRAMACIÓN DEL DÍA
  programacionDia: {
    padding: 20,
  },

  programacionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#ecf0f1",
  },

  programacionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  programacionLottie: {
    width: 56,
    height: 56,
  },

  programacionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2c3e50",
  },

  viajesBadge: {
    backgroundColor: "#34353A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  viajesBadgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  noViajesContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },

  noViajesIcon: {
    fontSize: 48,
    marginBottom: 12,
  },

  noViajesText: {
    fontSize: 16,
    color: "#95a5a6",
    fontWeight: "600",
  },

  viajesList: {
    gap: 12,
  },

  viajeCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  viajeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  viajeTimeIcon: {
    backgroundColor: "#34353A",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 55,
    alignItems: "center",
  },

  viajeTimeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  viajeInfo: {
    flex: 1,
  },

  viajeTipo: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 4,
  },

  viajeDescripcion: {
    fontSize: 12,
    color: "#7f8c8d",
    fontWeight: "500",
  },

  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },

  estadoLabel: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  // ESTADÍSTICAS
  quickStatsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    justifyContent: "space-between",
    marginBottom: 25,
    gap: 12,
  },

  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 18,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  todayCard: { backgroundColor: "#ff6b35" },
  totalCard: { backgroundColor: "#66bb6a" },
  nextCard: { backgroundColor: "#5F8EAD" },

  statIcon: { fontSize: 24, marginBottom: 8 },
  statNumber: { fontSize: 24, fontWeight: "800", color: "#fff", marginBottom: 4 },
  statLabel: { fontSize: 11, color: "#fff", fontWeight: "600", opacity: 0.9 },

  // ACCIONES RÁPIDAS
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    justifyContent: "space-between",
    marginBottom: 25,
    gap: 12,
  },

  actionButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },

  historyAction: { backgroundColor: "#3498db" },
  refreshAction: { backgroundColor: "#e67e22" },

  actionIcon: { fontSize: 28, marginBottom: 6 },
  actionText: { fontSize: 14, fontWeight: "700", color: "#fff" },

  // MOTIVACIÓN
  motivationFooter: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: "rgba(155, 89, 182, 0.1)",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(155, 89, 182, 0.2)",
  },

  motivationFooterText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8e44ad",
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default InicioScreen;
