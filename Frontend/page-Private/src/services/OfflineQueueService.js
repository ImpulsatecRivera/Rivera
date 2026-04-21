import axios from "axios";

const QUEUE_STORAGE_KEY = "offlineRequestQueue";
const MAX_ATTEMPTS = 5;
const MUTATING_METHODS = ["post", "put", "patch", "delete"];
const SKIPPED_URLS = ["/login", "/logout", "/check-auth", "/recovery", "/forgot-password"];

const loadQueue = () => {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("OfflineQueueService: error loading queue", error);
    return [];
  }
};

const saveQueue = (queue) => {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue || []));
    window.dispatchEvent(new CustomEvent("offlineQueueUpdated", { detail: { length: queue?.length || 0 } }));
  } catch (error) {
    console.error("OfflineQueueService: error saving queue", error);
  }
};

const serializeData = (data) => {
  if (!data) return null;

  if (typeof FormData !== "undefined" && data instanceof FormData) {
    return Object.fromEntries(data.entries());
  }

  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }

  if (typeof data === "object") {
    return data;
  }

  return data;
};

const isMutatingRequest = (config) => {
  return MUTATING_METHODS.includes((config.method || "").toLowerCase());
};

const isSkippedUrl = (url = "") => {
  return SKIPPED_URLS.some((path) => url.includes(path));
};

const shouldQueueError = (error) => {
  const status = error?.response?.status;

  if (!navigator.onLine) return true;
  if (!error?.response) return true;
  if (error.code === "ERR_NETWORK" || /network error/i.test(error.message)) return true;
  if (status >= 500) return true;
  if (status === 408 || status === 429) return true;
  return false;
};

const buildQueueItem = (config) => {
  const headers = config.headers || {};
  const savedHeaders = {};

  if (headers["Content-Type"]) {
    savedHeaders["Content-Type"] = headers["Content-Type"];
  }
  if (headers["content-type"]) {
    savedHeaders["content-type"] = headers["content-type"];
  }

  return {
    id: `offline-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: new Date().toISOString(),
    method: (config.method || "post").toLowerCase(),
    url: config.url,
    baseURL: config.baseURL || null,
    params: config.params || null,
    data: serializeData(config.data),
    headers: savedHeaders,
    attempts: 0,
    lastError: null,
  };
};

const queueRequest = (config) => {
  if (!config || !isMutatingRequest(config) || isSkippedUrl(config.url) || config.skipOfflineQueue) {
    return false;
  }

  const queue = loadQueue();
  const item = buildQueueItem(config);
  queue.push(item);
  saveQueue(queue);
  console.info("OfflineQueueService: queued request", item.url, item.method);
  return true;
};

const createRequestClient = (item) => {
  const clientOptions = {
    withCredentials: true,
  };

  if (item.baseURL) {
    clientOptions.baseURL = item.baseURL;
  }

  const client = axios.create(clientOptions);
  return client;
};

const replayQueueItem = async (item) => {
  const client = createRequestClient(item);
  const response = await client.request({
    method: item.method,
    url: item.url,
    params: item.params,
    data: item.data,
    headers: item.headers,
    withCredentials: true,
  });
  return response;
};

const processQueue = async () => {
  if (!navigator.onLine) {
    console.info("OfflineQueueService: offline, queue processing postponed");
    return;
  }

  const queue = loadQueue();
  if (!queue.length) {
    return;
  }

  const remaining = [...queue];

  while (remaining.length > 0) {
    const item = remaining[0];

    if (item.attempts >= MAX_ATTEMPTS) {
      console.warn(`OfflineQueueService: dropping request after ${MAX_ATTEMPTS} attempts`, item.url);
      remaining.shift();
      continue;
    }

    try {
      await replayQueueItem(item);
      remaining.shift();
      saveQueue(remaining);
      console.info("OfflineQueueService: synced queued request", item.url);
    } catch (error) {
      const status = error?.response?.status;
      item.attempts += 1;
      item.lastError = error?.message || "Unknown error";

      if (!error?.response || status >= 500 || status === 408 || status === 429) {
        remaining[0] = item;
        saveQueue(remaining);
        console.info("OfflineQueueService: will retry queued request later", item.url);
        break;
      }

      if (status === 401) {
        remaining[0] = item;
        saveQueue(remaining);
        console.info("OfflineQueueService: auth required, retry queued request after login", item.url);
        break;
      }

      console.warn("OfflineQueueService: removing invalid queued request", item.url, status);
      remaining.shift();
      saveQueue(remaining);
    }
  }
};

let initializedInstances = new WeakSet();
let onlineHandlerAdded = false;

export const initOfflineQueue = (axiosInstance = axios) => {
  if (!initializedInstances.has(axiosInstance)) {
    axiosInstance.interceptors.request.use(
      (config) => {
        if (navigator.onLine === false && isMutatingRequest(config) && !isSkippedUrl(config.url) && !config.skipOfflineQueue) {
          queueRequest(config);
          return Promise.reject({
            message: "Offline mode: request queued locally and will be retried when the network returns.",
            config,
            isOfflineQueued: true,
          });
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    axiosInstance.interceptors.response.use(
      (response) => {
        if (navigator.onLine && isMutatingRequest(response.config)) {
          processQueue();
        }
        return response;
      },
      async (error) => {
        const config = error?.config;
        if (config && shouldQueueError(error) && queueRequest(config)) {
          return Promise.reject({
            message: "Network error: request queued locally and will be retried when the network returns.",
            config,
            isOfflineQueued: true,
            originalError: error,
          });
        }
        return Promise.reject(error);
      }
    );

    initializedInstances.add(axiosInstance);
  }

  if (!onlineHandlerAdded) {
    window.addEventListener("online", () => {
      console.info("OfflineQueueService: online event detected, attempting sync");
      processQueue();
    });
    window.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        processQueue();
      }
    });
    processQueue();
    onlineHandlerAdded = true;
  }
};

export const getOfflineQueueLength = () => {
  return loadQueue().length;
};

export const flushOfflineQueue = async () => {
  await processQueue();
};
