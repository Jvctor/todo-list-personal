import { ListTodo, Settings } from "lucide-react";
import avatarUrl from "../assets/avatar.png";

// Left navigation column from the Figma frames: profile on top, a divider,
// then the "My Tasks" (active) and "Settings" menu items. Stacks above the
// content on small screens and becomes a fixed column from `md` upwards.
export function Sidebar() {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-6 bg-sidebar px-6 py-8 shadow-sidebar md:min-h-screen md:w-72 md:gap-8">
      <div className="flex items-center gap-4 md:flex-col md:text-center">
        <img
          src={avatarUrl}
          alt="Foto de perfil de Jane Doe"
          className="h-16 w-16 rounded-full object-cover md:h-24 md:w-24"
        />
        <div>
          <p className="text-lg font-bold text-fg">Jane Doe</p>
          <p className="text-sm text-subtle">janedoe@gmail.com</p>
        </div>
      </div>

      <hr className="border-t border-divider" />

      <nav aria-label="Navegação principal">
        <ul className="flex flex-col gap-2">
          <li>
            <a
              href="#minhas-tarefas"
              aria-current="page"
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
      </nav>
    </aside>
  );
}
