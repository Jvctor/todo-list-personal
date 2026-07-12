import { useEffect, useRef } from "react";
import { ListTodo, LogOut, Settings, X } from "lucide-react";
import type { User } from "firebase/auth";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSignOut: () => void;
}

// Mobile-first: the sidebar is an off-canvas drawer by default (slides in from
// the left over a backdrop) and only becomes a static, always-visible column
// from `lg` upwards.
function getSidebarClasses(isOpen: boolean): string {
  const base =
    "fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85%] shrink-0 flex-col gap-8 overflow-y-auto bg-sidebar px-6 py-8 shadow-sidebar transition-transform duration-300 ease-out lg:static lg:z-auto lg:max-w-none lg:translate-x-0";
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

function ProfileAvatar({ user }: { user: User }) {
  if (user.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt={`Foto de perfil de ${getDisplayName(user)}`}
        referrerPolicy="no-referrer"
        className="h-20 w-20 rounded-full object-cover sm:h-24 sm:w-24"
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className="grid h-20 w-20 place-items-center rounded-full bg-nav text-3xl font-bold text-nav-fg sm:h-24 sm:w-24"
    >
      {getInitial(user)}
    </div>
  );
}

export function Sidebar({ isOpen, onClose, user, onSignOut }: SidebarProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Move focus into the drawer when it opens (basic focus management).
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
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <aside aria-label="Menu lateral" className={getSidebarClasses(isOpen)}>
        <div className="flex justify-end lg:hidden">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="grid h-10 w-10 place-items-center rounded-full text-fg transition hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/20 dark:hover:bg-white/10"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 text-center">
          <ProfileAvatar user={user} />
          <div className="max-w-full">
            <p className="truncate text-lg font-bold text-fg">
              {getDisplayName(user)}
            </p>
            {user.email && (
              <p className="truncate text-sm text-subtle">{user.email}</p>
            )}
          </div>
        </div>

        <hr className="border-t border-divider" />

        <nav aria-label="Navegação principal" className="flex flex-1 flex-col">
          <ul className="flex flex-col gap-2">
            <li>
              <a
                href="#minhas-tarefas"
                aria-current="page"
                onClick={onClose}
                className="flex items-center gap-3 rounded-card bg-nav px-4 py-3 text-lg font-bold text-nav-fg"
              >
                <ListTodo className="h-6 w-6" aria-hidden="true" />
                <span>Minhas tarefas</span>
              </a>
            </li>
            <li>
              <button
                type="button"
                aria-disabled="true"
                title="Configurações (em breve)"
                className="flex w-full cursor-default items-center gap-3 rounded-card px-4 py-3 text-left text-lg font-bold text-fg/60"
              >
                <Settings className="h-6 w-6" aria-hidden="true" />
                <span>Configurações</span>
              </button>
            </li>
          </ul>

          <button
            type="button"
            onClick={onSignOut}
            className="mt-auto flex items-center gap-3 rounded-card px-4 py-3 text-left text-lg font-bold text-fg transition hover:bg-accent/10 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <LogOut className="h-6 w-6" aria-hidden="true" />
            <span>Sair</span>
          </button>
        </nav>
      </aside>
    </>
  );
}
