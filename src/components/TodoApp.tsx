import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import type { User } from "firebase/auth";
import { FilterBar } from "./FilterBar";
import { NotificationPrompt } from "./NotificationPrompt";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { TodoForm } from "./TodoForm";
import { TodoList } from "./TodoList";
import { ErrorState } from "./common/ErrorState";
import { LoadingState } from "./common/LoadingState";
import type { Theme } from "../hooks/useTheme";
import { useNotifications } from "../hooks/useNotifications";
import { useTodos } from "../hooks/useTodos";

interface TodoAppProps {
  user: User;
  theme: Theme;
  onToggleTheme: () => void;
  onSignOut: () => void;
}

export function TodoApp({ user, theme, onToggleTheme, onSignOut }: TodoAppProps) {
  const {
    todos,
    visibleTodos,
    filter,
    status,
    errorMessage,
    activeCount,
    setFilter,
    addTodo,
    toggleTodo,
    editTodo,
    setDueAt,
    removeTodo,
  } = useTodos(user.uid);

  const {
    status: pushStatus,
    errorMessage: pushErrorMessage,
    isEnabling: isEnablingPush,
    enable: enablePush,
  } = useNotifications(user.uid);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function openSidebar() {
    setIsSidebarOpen(true);
  }

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  // While the mobile drawer is open, close it on Escape and lock body scroll.
  useEffect(() => {
    if (!isSidebarOpen) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  const isReady = status === "ready";
  const isLoading = status === "loading";
  const hasError = status === "error";

  // "denied" continua mostrando o aviso: é onde explicamos como desbloquear.
  // "granted", "unsupported" e "checking" não pedem nada ao usuário.
  const shouldAskForPush = pushStatus === "default" || pushStatus === "denied";

  return (
    <div className="flex min-h-screen flex-col bg-page lg:flex-row">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        user={user}
        onSignOut={onSignOut}
      />

      <div className="flex flex-1 flex-col">
        <main
          id="minhas-tarefas"
          className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 lg:px-10 lg:py-12"
        >
          <header className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={openSidebar}
              aria-label="Abrir menu"
              aria-expanded={isSidebarOpen}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-fg transition hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/20 lg:hidden dark:hover:bg-white/10"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>

            <h1 className="flex-1 text-3xl font-bold text-fg sm:text-4xl lg:text-5xl">
              Minhas tarefas
            </h1>

            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </header>

          {shouldAskForPush && (
            <NotificationPrompt
              isEnabling={isEnablingPush}
              errorMessage={pushErrorMessage}
              onEnable={enablePush}
            />
          )}

          <TodoForm onAdd={addTodo} disabled={!isReady} />

          {isLoading && <LoadingState label="Carregando suas tarefas..." />}

          {hasError && (
            <ErrorState
              message={errorMessage}
              onRetry={() => window.location.reload()}
            />
          )}

          {isReady && (
            <section className="flex flex-1 flex-col gap-6">
              <TodoList
                todos={visibleTodos}
                totalCount={todos.length}
                onToggle={toggleTodo}
                onEdit={editTodo}
                onSetDueAt={setDueAt}
                onRemove={removeTodo}
              />

              {todos.length > 0 && (
                <FilterBar
                  filter={filter}
                  activeCount={activeCount}
                  onFilterChange={setFilter}
                />
              )}
            </section>
          )}

          <footer className="mt-auto pt-6 text-center text-sm text-subtle">
            © 2025
          </footer>
        </main>
      </div>
    </div>
  );
}
