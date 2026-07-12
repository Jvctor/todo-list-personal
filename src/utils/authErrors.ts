import { FirebaseError } from "firebase/app";

// Maps Firebase Auth error codes to friendly pt-BR messages. Using an object
// lookup (not a chain of ternaries) per project rule #3.
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/user-disabled": "Esta conta foi desativada.",
  "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
  "auth/network-request-failed": "Falha de rede. Verifique sua conexão.",
  "auth/popup-closed-by-user": "Login cancelado.",
  "auth/cancelled-popup-request": "Login cancelado.",
  "auth/popup-blocked": "O navegador bloqueou o pop-up de login.",
  "auth/unauthorized-domain":
    "Este domínio não está autorizado no Firebase Console.",
  "auth/operation-not-allowed":
    "Login com Google não habilitado no Firebase Console.",
};

export function getAuthErrorMessage(err: unknown): string {
  if (err instanceof FirebaseError) {
    const mapped = AUTH_ERROR_MESSAGES[err.code];
    if (mapped) {
      return mapped;
    }
  }
  return "Não foi possível concluir. Tente novamente.";
}
