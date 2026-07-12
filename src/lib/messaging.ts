import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { getFirebaseApp } from "./firebase";

// Chave pública do Web Push. Diferente do service account (que fica só no Worker
// que dispara os lembretes), esta pode ir para o cliente sem risco.
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

const SERVICE_WORKER_URL = "/firebase-messaging-sw.js";

export const isPushConfigured: boolean =
  typeof VAPID_KEY === "string" && VAPID_KEY.length > 0;

// O Safari sem "Adicionar à Tela de Início" e navegadores antigos não têm Push
// API. `isSupported()` do FCM cobre isso; o resto é guarda para ambientes sem DOM.
export async function isPushSupported(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) {
    return false;
  }
  if (!("Notification" in window)) {
    return false;
  }
  return isSupported();
}

// Registra o service worker e pede o token FCM deste aparelho. Só chame depois
// de a permissão ter sido concedida — senão o navegador rejeita.
export async function requestPushToken(): Promise<string> {
  const registration = await navigator.serviceWorker.register(SERVICE_WORKER_URL);
  const messaging = getMessaging(getFirebaseApp());
  return getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });
}

export function getDeviceTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// O iPad moderno se apresenta como Mac; o toque é o que o entrega.
export function isIosDevice(): boolean {
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
    return true;
  }
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

// No iOS, Web Push só existe quando o site foi instalado na Tela de Início.
// `display-mode: standalone` cobre os navegadores modernos; `navigator.standalone`
// é a propriedade antiga do Safari, que ainda é a que responde em parte dos iPhones.
export function isStandaloneApp(): boolean {
  if (window.matchMedia("(display-mode: standalone)").matches) {
    return true;
  }
  return navigator.standalone === true;
}
