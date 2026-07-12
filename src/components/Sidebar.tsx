import { useEffect, useRef } from "react";
import { Check, ListTodo, LogOut, X } from "lucide-react";
import type { User } from "firebase/auth";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSignOut: () => void;
}

// Mobile-first: gaveta off-canvas por padrão, coluna fixa a partir de `lg`.
function getSidebarClasses(isOpen: boolean): string {
  const base =
    "fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85%] shrink-0 flex-col gap-7 overflow-y-auto border-r border-field-border bg-sidebar px-5 py-7 shadow-sidebar transition-transform duration-300 ease-out lg:static lg:z-auto lg:max-w-none lg:translate-x-0 lg:shadow-none";
  if (isOpen) {
    return `${base} translate-x-0`;
  }
  return `${base} -translate-x-full lg:translate-x-0`;
}

function getDisplayName(user: User): string {
  if (user.displayName) {
    return user.displayName;
  }
  if (user.email) {
    return user.email;
  }
  return "Usuário";
}

function getInitial(user: User): string {
  const source = user.displayName ?? user.email ?? "?";
  return source.charAt(0).toUpperCase();
}

// O anel cônico é a paleta inteira em volta da foto — a assinatura visual do app
// aparece no lugar mais pessoal da tela.
function ProfileAvatar({ user }: { user: User }) {
  const ringClasses =
    "h-23 w-23 shrink-0 rounded-full bg-[conic-gradient(from_200deg,#fb2c5a,#ff8a3d,#ffd24a,#12c7a0,#fb2c5a)] p-[3px]";

  if (user.photoURL) {
    return (
      <div className={ringClasses}>
        <img
          src={user.photoURL}
          alt={`Foto de perfil de ${getDisplayName(user)}`}
          referrerPolicy="no-referrer"
          className="h-full w-full rounded-full border-[3px] border-sidebar object-cover"
        />
      </div>
    );
  }

  return (
    <div className={ringClasses}>
      <div
        aria-hidden="true"
        className="grid h-full w-full place-items-center rounded-full border-[3px] border-sidebar bg-sunken font-display text-3xl text-fg"
      >
        {getInitial(user)}
      </div>
    </div>
  );
}

const NAV_ITEM_BASE =
  "flex w-full items-center gap-3 rounded-field px-3.5 py-3 text-left font-bold transition";

export function Sidebar({ isOpen, onClose, user, onSignOut }: SidebarProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      )}

      <aside aria-label="Menu lateral" className={getSidebarClasses(isOpen)}>
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-2.5 font-display text-xl font-bold text-fg">
            <span
              aria-hidden="true"
              className="grid h-8 w-8 place-items-center rounded-xl bg-linear-to-br from-accent to-tangerine text-white shadow-pop"
            >
              <Check className="h-4 w-4" strokeWidth={3} />
            </span>
            <span>tarefas</span>
          </p>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-sunken hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 lg:hidden"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-2.5 text-center">
          <ProfileAvatar user={user} />
          <div className="max-w-full">
            <p className="truncate font-display text-lg font-semibold text-fg">
              {getDisplayName(user)}
            </p>
            {user.email && (
              <p className="truncate text-sm text-muted">{user.email}</p>
            )}
          </div>
        </div>

        <nav aria-label="Navegação principal" className="flex flex-1 flex-col">
          <ul className="flex flex-col gap-1.5">
            <li>
              <a
                href="#minhas-tarefas"
                aria-current="page"
                onClick={onClose}
                className={`${NAV_ITEM_BASE} bg-nav text-nav-fg`}
              >
                <ListTodo className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                <span>Minhas tarefas</span>
              </a>
            </li>
          </ul>

          <button
            type="button"
            onClick={onSignOut}
            className={`${NAV_ITEM_BASE} mt-auto text-muted hover:bg-accent/10 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40`}
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>Sair</span>
          </button>
        </nav>
      </aside>
    </>
  );
}
