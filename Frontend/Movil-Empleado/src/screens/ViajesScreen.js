// src/screens/ViajesScreen.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  RefreshControl,
  TouchableOpacity,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";
import { useTrips } from "../hooks/useTrips";
import { useProfile } from "../hooks/useProfile";
import { useAuth } from "../Context/authContext";
import HistoryItem from "../components/HistoryItem";
import senalImg from "../images/senal.png";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

/* =========================
   API Base (igual que InfoViaje)
========================= */
const RAW_BASE = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/+$/, "");
const CLEAN_BASE = RAW_BASE.replace(/\/api$/i, "");
const API_BASE_URL =
  (CLEAN_BASE || "https://rivera-test-629395560179.us-west1.run.app") + "/api";

/* =========================
   Utils
========================= */
const normalize = (v) => String(v ?? "").trim().toLowerCase();
const isHex24 = (s) => /^[0-9a-f]{24}$/i.test(String(s || "").trim());

const dedupeBy = (arr, getKey) => {
  const seen = new Set();
  return (arr || []).filter((x) => {
    const k = getKey(x);
    if (!k) return true;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

const resolveTripId = (t) => {
  const raw = t?.raw || t;
  const id =
    raw?._id?.$oid ||
    raw?._id ||
    raw?.id ||
    raw?.viajeId ||
    t?._id?.$oid ||
    t?._id ||
    t?.id ||
    t?.viajeId ||
    null;

  return id ? String(id).trim() : "";
};

/* =========================
   Fetch con token
========================= */
const getPayload = (resp) => {
  if (!resp || typeof resp !== "object") return resp;
  if (Object.prototype.hasOwnProperty.call(resp, "data")) return resp.data;
  if (resp.success && resp.data !== undefined) return resp.data;
  return resp;
};

const fetchWithAuth = async (url, token, signal) => {
  const fallbackToken =
    token ||
    (await AsyncStorage.getItem("userToken")) ||
    (await AsyncStorage.getItem("authToken")) ||
    (await AsyncStorage.getItem("token"));

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(fallbackToken ? { Authorization: `Bearer ${fallbackToken}` } : {}),
  };

  const r = await fetch(url, { headers, signal });
  if (!r.ok) return null;
  try {
    return await r.json();
  } catch {
    return null;
  }
};

const tryFetchFirst = async (urls = [], token, signal) => {
  for (const u of urls) {
    const j = await fetchWithAuth(u, token, signal);
    const p = getPayload(j);
    if (p) return p;
  }
  return null;
};

// pool simple para no reventar el backend
const runPool = async (items, worker, concurrency = 4) => {
  const results = [];
  let i = 0;

  const runners = Array.from({ length: concurrency }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx]);
    }
  });

  await Promise.all(runners);
  return results;
};

/* =========================
   Filtros
========================= */
const FILTERS = [
  { key: "TODOS", label: "Todos" },
  { key: "PENDIENTE", label: "Pendientes" },
  { key: "EN_RUTA", label: "En curso" },
  { key: "COMPLETADO", label: "Completados" },
  { key: "CANCELADO", label: "Cancelados" },
];

/* =========================
   Estado robusto (FIX)
   ✅ Prioriza estado textual del backend
   ✅ NO marca COMPLETADO por arrivalTime/fechaLlegada/estimadas
========================= */
const extractEstadoText = (raw) => {
  const s =
    raw?.estado?.actual ??
    raw?.estado?.status ??
    raw?.estado ??
    raw?.status ??
    raw?.state ??
    raw?.situacion ??
    raw?.situación ??
    raw?.estadoViaje ??
    raw?.tripStatus ??
    "";
  return normalize(s);
};

const isNumericCode = (s) => /^\d+$/.test(String(s || "").trim());

const inferEstado = (trip) => {
  const t = trip || {};
  const full = t.__full || null;
  const raw = full || t.raw || t;

  // 1) ✅ Estado directo (texto / numérico) = máxima prioridad
  const s = extractEstadoText(raw);

  // códigos numéricos si tu backend los usa
  if (isNumericCode(s)) {
    const n = Number(s);
    if (n === 2) return "COMPLETADO";
    if (n === 3) return "CANCELADO";
    if (n === 1) return "EN_RUTA";
    return "PENDIENTE";
  }

  // ✅ Si dice pendiente/programado/confirmado, NO lo marques completado aunque tenga fechas
  if (
    s.includes("pend") ||
    s.includes("program") ||
    s.includes("confirm") ||
    s.includes("scheduled")
  ) {
    return "PENDIENTE";
  }

  if (s.includes("cancel")) return "CANCELADO";

  if (
    s.includes("complet") ||
    s.includes("finaliz") ||
    s.includes("termin") ||
    s.includes("done") ||
    s.includes("complete")
  ) {
    return "COMPLETADO";
  }

  if (
    s.includes("en_ruta") ||
    s.includes("en ruta") ||
    s.includes("en_curso") ||
    s.includes("en curso") ||
    s.includes("transit") ||
    s.includes("progress") ||
    s.includes("in_progress")
  ) {
    return "EN_RUTA";
  }

  // 2) flags típicos (por si vienen sin texto)
  const canceledFlag =
    raw?.cancelado || raw?.isCanceled || raw?.isCancelled || raw?.cancelled;
  if (canceledFlag) return "CANCELADO";

  const completedFlag =
    raw?.completado ||
    raw?.isCompleted ||
    raw?.completed ||
    raw?.finalizado ||
    raw?.finished;
  if (completedFlag) return "COMPLETADO";

  const startedFlag =
    raw?.iniciado ||
    raw?.started ||
    raw?.isStarted ||
    raw?.enRuta ||
    raw?.inRoute ||
    raw?.in_progress ||
    raw?.inProgress;
  if (startedFlag) return "EN_RUTA";

  // 3) ✅ timestamps REALES (NO usar arrivalTime/fechaLlegada/estimadas)
  const completedAt =
    raw?.completedAt ||
    raw?.finishedAt ||
    raw?.endAt ||
    raw?.endTimeReal ||
    raw?.arrivalTimeReal ||
    raw?.fechaFinReal ||
    raw?.fechaFinalReal ||
    raw?.fechaLlegadaReal ||
    raw?.horarios?.fechaFinReal ||
    raw?.horarios?.fechaLlegadaReal ||
    null;

  if (completedAt) return "COMPLETADO";

  const startedAt =
    raw?.startedAt ||
    raw?.startAt ||
    raw?.startTimeReal ||
    raw?.departureTimeReal ||
    raw?.fechaSalidaReal ||
    raw?.horarios?.fechaSalidaReal ||
    null;

  if (startedAt) return "EN_RUTA";

  // fallback seguro
  return "PENDIENTE";
};

/* =========================
   Screen
========================= */
const ViajesScreen = ({ navigation }) => {
  const { user, token, isAuthenticated, motoristaId: ctxMotoristaId } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const listBottomSpace = Math.max(insets.bottom, 12) + tabBarHeight + 24;

  const [motoristaId, setMotoristaId] = useState(null);
  const [filter, setFilter] = useState("TODOS");

  // ✅ mapa con viajes completos traídos del backend por ID
  const [fullById, setFullById] = useState({}); // { [id]: viajeCompleto }
  const [enriching, setEnriching] = useState(false);

  const obtenerMotoristaId = useCallback(async () => {
    try {
      if (ctxMotoristaId) return String(ctxMotoristaId);

      const storedId = await AsyncStorage.getItem("motoristaId");
      if (storedId) return storedId;

      const contextId = user?._id || user?.id;
      if (contextId) return String(contextId);

      const profileId = profile?._id || profile?.id;
      if (profileId) return String(profileId);

      return null;
    } catch {
      return null;
    }
  }, [ctxMotoristaId, user, profile]);

  useEffect(() => {
    let mounted = true;
    const setup = async () => {
      if (!isAuthenticated) {
        if (mounted) setMotoristaId(null);
        return;
      }
      const id = await obtenerMotoristaId();
      if (mounted && id && id !== motoristaId) setMotoristaId(id);
    };
    setup();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, obtenerMotoristaId, motoristaId]);

  // --- Hook: lista de viajes (resumida)
  const { trips, loading, error, refrescarViajes } = useTrips(
    motoristaId,
    "historial"
  );

  const baseTrips = useMemo(
    () =>
      dedupeBy(trips, (x) =>
        String(
          x?._id ||
            x?.id ||
            x?.viajeId ||
            x?.codigo ||
            x?._fechaSalidaISO ||
            x?.raw?._id ||
            ""
        )
      ),
    [trips]
  );

  /* =========================
     ✅ ENRIQUECER DESDE BACKEND
     (trae viaje completo para estado real)
  ========================= */
  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      if (!baseTrips?.length) return;

      const ids = baseTrips
        .map((t) => resolveTripId(t))
        .filter((id) => isHex24(id));

      if (!ids.length) return;

      const toFetch = ids.filter((id) => !fullById[id]);
      if (!toFetch.length) return;

      setEnriching(true);

      const results = await runPool(
        toFetch,
        async (id) => {
          const full = await tryFetchFirst(
            [
              `${API_BASE_URL}/viajes/${encodeURIComponent(id)}`,
              `${API_BASE_URL}/trips/${encodeURIComponent(id)}`,
            ],
            token,
            controller.signal
          );
          return { id, full };
        },
        4
      );

      const patch = {};
      for (const r of results) {
        if (r?.id && r?.full) patch[r.id] = r.full;
      }

      if (!controller.signal.aborted && Object.keys(patch).length) {
        setFullById((prev) => ({ ...prev, ...patch }));
      }

      if (!controller.signal.aborted) setEnriching(false);
    };

    run().catch(() => {
      if (!controller.signal.aborted) setEnriching(false);
    });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseTrips, token]);

  // mezcla: trip + su full si existe
  const tripsWithFull = useMemo(() => {
    return baseTrips.map((t) => {
      const id = resolveTripId(t);
      const full = id && fullById[id] ? fullById[id] : null;
      return full ? { ...t, __full: full } : t;
    });
  }, [baseTrips, fullById]);

  // categoría cacheada
  const tripsWithCat = useMemo(() => {
    return tripsWithFull.map((t) => ({
      ...t,
      __cat: inferEstado(t),
    }));
  }, [tripsWithFull]);

  const counts = useMemo(() => {
    let pendientes = 0;
    let completados = 0;
    let enCurso = 0;
    let cancelados = 0;

    for (const v of tripsWithCat) {
      if (v.__cat === "PENDIENTE") pendientes++;
      else if (v.__cat === "COMPLETADO") completados++;
      else if (v.__cat === "EN_RUTA") enCurso++;
      else if (v.__cat === "CANCELADO") cancelados++;
    }

    return { total: tripsWithCat.length, pendientes, completados, enCurso, cancelados };
  }, [tripsWithCat]);

  const filteredTrips = useMemo(() => {
    if (filter === "TODOS") return tripsWithCat;
    return tripsWithCat.filter((v) => v.__cat === filter);
  }, [tripsWithCat, filter]);

  const onRefresh = useCallback(() => {
    setFullById({}); // ✅ limpia cache para volver a pedir estados reales
    refrescarViajes();
  }, [refrescarViajes]);

  const handleInfoPress = useCallback(
    (item) => {
      navigation.navigate("InfoViaje", {
        trip: {
          id: item.id || item._id || item.viajeId || item.codigo,
          tipo: item.tipo,
          cotizacion: item.cotizacion ?? "Cliente no especificado",
          camion: item.camion ?? "N/A",
          descripcion: item.descripcion ?? "Sin descripción",
          horaLlegada: item.horaLlegada ?? "No especificada",
          horaSalida: item.horaSalida ?? "No especificada",
          asistente: item.asistente ?? "Por asignar",
          estado:
            item?.__full?.estado ??
            item.estado ??
            item?.estado?.actual ??
            item.status ??
            item.state,
          origen: item.origen,
          destino: item.destino,
          fecha: item.fecha,
          hora: item.hora,
          raw: item.__full || item,
        },
      });
    },
    [navigation]
  );

  if (profileLoading || (isAuthenticated && !motoristaId) || (motoristaId && loading)) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>Cargando viajes...</Text>
        {!isAuthenticated && <Text style={styles.errorText}>Por favor, inicia sesión</Text>}
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center, { paddingHorizontal: 20 }]}>
        <Text style={styles.errorText}>No se pudieron cargar los viajes.</Text>
        <TouchableOpacity
          style={[styles.resetFilterButton, { marginTop: 16 }]}
          onPress={onRefresh}
        >
          <Text style={styles.resetFilterText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const FilterChips = () => (
    <View style={styles.filtersWrap}>
      {FILTERS.map((f) => {
        const active = filter === f.key;
        return (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.85}
            style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
          >
            <Text
              style={[
                styles.chipText,
                active ? styles.chipTextActive : styles.chipTextInactive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const currentFilterLabel =
    FILTERS.find((f) => f.key === filter)?.label ?? "Todos";

  return (
    <View style={styles.container}>
      <FlatList
        style={{ flex: 1 }}
        data={filteredTrips}
        extraData={[filter, enriching, Object.keys(fullById).length]}
        keyExtractor={(item, index) => {
          const id =
            item?.id ??
            item?._id ??
            item?.viajeId ??
            item?.codigo ??
            item?.raw?._id ??
            item?.__full?._id;
          return id ? String(id) : `row-${index}`;
        }}
        renderItem={({ item }) => (
          <HistoryItem item={item} onInfoPress={handleInfoPress} />
        )}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: Math.max(insets.top, 12) + 16,
          paddingBottom: listBottomSpace,
        }}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Historial de viajes</Text>

            <View style={styles.greetingContainer}>
              <Text style={styles.subtitle}>
                Aquí podrás ver todos tus viajes realizados con nosotros
              </Text>
              <Image source={senalImg} style={styles.avatarImage} />
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{counts.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{counts.enCurso}</Text>
                <Text style={styles.statLabel}>En curso</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{counts.completados}</Text>
                <Text style={styles.statLabel}>Completados</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={styles.sectionTitle}>Filtrar</Text>
              {enriching && <Text style={{ color: "#666", fontSize: 12 }}>Actualizando estados…</Text>}
            </View>

            <FilterChips />

            <Text style={[styles.sectionTitle, { marginTop: 14 }]}>
              {filter === "TODOS" ? "Todos tus viajes" : `Viajes: ${currentFilterLabel}`}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.noTripsContainer}>
            <LottieView
              source={require("../images/Speedy car.json")}
              autoPlay
              loop
              style={styles.emptyAnimation}
            />
            <Text style={styles.noTripsText}>
              {filter === "TODOS"
                ? "No tienes viajes registrados"
                : "No hay viajes en este filtro"}
            </Text>
            <Text style={styles.noTripsSubtext}>
              {filter === "TODOS"
                ? "Cuando tengas viajes asignados, aparecerán aquí"
                : "Probá con otro estado"}
            </Text>

            {filter !== "TODOS" && (
              <TouchableOpacity
                style={[styles.resetFilterButton, { marginTop: 10 }]}
                onPress={() => setFilter("TODOS")}
              >
                <Text style={styles.resetFilterText}>Ver todos</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        refreshControl={<RefreshControl refreshing={!!loading} onRefresh={onRefresh} />}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  center: { justifyContent: "center", alignItems: "center" },

  title: { fontSize: 28, fontWeight: "bold", color: "#000", marginBottom: 10 },

  greetingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  subtitle: { fontSize: 16, color: "#666", flex: 1, marginRight: 15 },
  avatarImage: { width: 120, height: 120, resizeMode: "contain" },

  statsContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
  statCard: {
    backgroundColor: "#fff",
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: { fontSize: 24, fontWeight: "bold", color: "#000" },
  statLabel: { fontSize: 12, color: "#666", marginTop: 5 },

  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#000", marginBottom: 10 },

  filtersWrap: { flexDirection: "row", flexWrap: "wrap", marginBottom: 6 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 10,
    marginBottom: 10,
  },
  chipActive: { backgroundColor: "#E8F5E9", borderColor: "#4CAF50" },
  chipInactive: { backgroundColor: "#fff", borderColor: "rgba(0,0,0,0.08)" },
  chipText: { fontSize: 13, fontWeight: "800" },
  chipTextActive: { color: "#2E7D32" },
  chipTextInactive: { color: "#555" },

  noTripsContainer: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginVertical: 20,
  },
  emptyAnimation: { width: 200, height: 200, marginBottom: 15 },
  noTripsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  noTripsSubtext: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 10 },

  resetFilterButton: { backgroundColor: "#4CAF50", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  resetFilterText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  loadingText: { color: "#333", fontSize: 16, marginTop: 12 },
  errorText: { color: "#c00", fontSize: 14, marginTop: 8, textAlign: "center" },
});

export default ViajesScreen;
