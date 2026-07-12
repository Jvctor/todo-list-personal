import { useCallback, useEffect, useRef, useState } from "react";
import { ref, set } from "firebase/database";
import { getDb, isFirebaseConfigured } from "../lib/firebase";
import {
  getDeviceTimezone,
  isIosDevice,
  isPushConfigured,
  isPushSupported,
  isStandaloneApp,
  requestPushToken,
} from "../lib/messaging";

// "checking" cobre a checagem inicial de suporte, que é assíncrona.
// "needs-install" = iPhone/iPad fora da Tela de Início. Não é falta de suporte:
//   é um passo que o usuário PODE dar, e por isso merece instrução, não silêncio.
// "unsupported" = navegador que realmente não tem Push API, e não há o que fazer.
type PushStatus =
  | "checking"
  | "needs-install"
  | "unsupported"
  | "default"
  | "granted"
  | "denied";

interface UseNotificationsResult {
  status: PushStatus;
  errorMessage: string;
  isEnabling: boolean;
  enable: () => Promise<void>;
}

const DENIED_MESSAGE =
  "Notificações bloqueadas. Libere nas permissões do site no seu navegador.";
const FAILED_MESSAGE =
  "Não foi possível ativar as notificações. Tente novamente.";

function devicePath(uid: string, token: string): string {
  return `users/${uid}/devices/${token}`;
}

export function useNotifications(uid: string): UseNotificationsResult {
  const [status, setStatus] = useState<PushStatus>("checking");
  const [errorMessage, setErrorMessage] = useState("");
  const [isEnabling, setIsEnabling] = useState(false);

  // Evita gravar o token duas vezes quando o efeito reexecuta (StrictMode).
  const isRegisteringRef = useRef(false);

  // Guarda o aparelho na lista de destinos do usuário. O Worker que dispara os
  // lembretes lê esse nó para saber para onde mandar o push, e o fuso horário
  // para saber que horas é "de manhã" para esta pessoa.
  const registerDevice = useCallback(async () => {
    if (isRegisteringRef.current) {
      return;
    }
    isRegisteringRef.current = true;
    try {
      const token = await requestPushToken();
      await set(ref(getDb(), devicePath(uid, token)), {
        createdAt: Date.now(),
        timezone: getDeviceTimezone(),
      });
      setStatus("granted");
      setErrorMessage("");
    } finally {
      isRegisteringRef.current = false;
    }
  }, [uid]);

  // Na abertura do app: se a permissão já foi dada antes, renova o token em
  // silêncio (o FCM pode trocá-lo) para o aparelho não sumir da lista de envio.
  useEffect(() => {
    let isActive = true;

    async function check() {
      if (!isFirebaseConfigured || !isPushConfigured) {
        if (isActive) {
          setStatus("unsupported");
        }
        return;
      }
      const supported = await isPushSupported();
      if (!isActive) {
        return;
      }
      if (!supported) {
        // No iPhone, "não suportado" quase sempre significa "ainda não instalado".
        // Tratar os dois como a mesma coisa deixaria o usuário sem saída.
        if (isIosDevice() && !isStandaloneApp()) {
          setStatus("needs-install");
          return;
        }
        setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setStatus("denied");
        return;
      }
      if (Notification.permission !== "granted") {
        setStatus("default");
        return;
      }
      try {
        await registerDevice();
      } catch {
        if (isActive) {
          setStatus("default");
        }
      }
    }

    check();
    return () => {
      isActive = false;
    };
  }, [registerDevice]);

  const enable = useCallback(async () => {
    if (isEnabling) {
      return;
    }
    setIsEnabling(true);
    setErrorMessage("");
    try {
      const permission = await Notification.requestPermission();
      if (permission === "denied") {
        setStatus("denied");
        setErrorMessage(DENIED_MESSAGE);
        return;
      }
      if (permission !== "granted") {
        setStatus("default");
        return;
      }
      await registerDevice();
    } catch {
      setErrorMessage(FAILED_MESSAGE);
    } finally {
      setIsEnabling(false);
    }
  }, [isEnabling, registerDevice]);

  return { status, errorMessage, isEnabling, enable };
}
