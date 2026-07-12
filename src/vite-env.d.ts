/// <reference types="vite/client" />

// Typed environment variables (avoids `any` when reading import.meta.env — rule #7).
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_DATABASE_URL: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_VAPID_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Propriedade antiga do Safari, fora do padrão mas ainda a que responde em parte
// dos iPhones: diz se o site está aberto pela Tela de Início. Declarada aqui para
// não precisar de `any` (regra #7).
interface Navigator {
  readonly standalone?: boolean;
}
