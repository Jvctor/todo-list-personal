import { useCallback, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { getAuthInstance, isFirebaseConfigured } from "../lib/firebase";
import { getAuthErrorMessage } from "../utils/authErrors";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface UseAuthResult {
  user: User | null;
  status: AuthStatus;
  isConfigured: boolean;
  errorMessage: string;
  isSubmitting: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setStatus("unauthenticated");
      return;
    }
    const unsubscribe = onAuthStateChanged(getAuthInstance(), (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        setStatus("authenticated");
      } else {
        setStatus("unauthenticated");
      }
    });
    return unsubscribe;
  }, []);

  // Shared wrapper: guards against unconfigured Firebase, locks against
  // duplicate submits (rule #5) and funnels errors to a friendly message.
  const runAction = useCallback(async (action: () => Promise<unknown>) => {
    if (!isFirebaseConfigured) {
      setErrorMessage("Configure o Firebase no arquivo .env para entrar.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await action();
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const signInWithGoogle = useCallback(
    () =>
      runAction(() =>
        signInWithPopup(getAuthInstance(), new GoogleAuthProvider()),
      ),
    [runAction],
  );

  const signOut = useCallback(
    () => runAction(() => firebaseSignOut(getAuthInstance())),
    [runAction],
  );

  return {
    user,
    status,
    isConfigured: isFirebaseConfigured,
    errorMessage,
    isSubmitting,
    signInWithGoogle,
    signOut,
  };
}
