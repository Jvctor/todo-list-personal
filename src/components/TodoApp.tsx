import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import type { User } from "firebase/auth";
import { FilterBar } from "./FilterBar";
import { NotificationPrompt } from "./NotificationPrompt";
import { ProgressCard } from "./ProgressCard";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { TodoForm } from "./TodoForm";
import { TodoList } from "./TodoList";
import { ErrorState } from "./common/ErrorState";
import { LoadingState } from "./common/LoadingState";
import type { Theme } from "../hooks/useTheme";
import { useNotifications } from "../hooks/useNotifications";
import { useTodos } from "../hooks/useTodos";
import { pluralize } from "../utils/pluralize";

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
    completedCount,
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

  const lateCount = todos.filter(
    (todo) => !todo.done && todo.dueAt !== null && todo.dueAt < Date.now(),
  ).length;

  // O subtítulo é a única linha que muda de humor conforme a lista: atrasado
  // primeiro, porque é o que exige ação.
  function getSubtitle(): string {
    if (lateCount > 0) {
      return `${pluralize(lateCount, "tarefa atrasada", "tarefas atrasadas")}. Bora resolver.`;
    }
    if (todos.length === 0) {
      return "Sua lista está limpa.";
    }
    if (activeCount === 0) {
      return "Nada pendente. Aproveita.";
    }
    return "Nada atrasado por aqui.";
  }

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
          className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:py-10"
        >
          <header className="flex items-start gap-3">
            <button
              type="button"
              onClick={openSidebar}
              aria-label="Abrir menu"
              aria-expanded={isSidebarOpen}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-field border border-field-border bg-card text-fg shadow-card transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">
                Minhas tarefas
              </h1>
              <p className="text-sm text-muted">{getSubtitle()}</p>
            </div>

            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </header>

          {isReady && todos.length > 0 && (
            <ProgressCard doneCount={completedCount} totalCount={todos.length} />
          )}

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
            <section className="flex flex-1 flex-col gap-4">
              {todos.length > 0 && (
                <FilterBar
                  filter={filter}
                  activeCount={activeCount}
                  onFilterChange={setFilter}
                />
              )}

              {/* A `key` é o filtro: trocar de aba remonta a lista e a animação
                  de entrada roda de novo. Marcar uma tarefa não remonta nada —
                  senão a lista inteira piscaria a cada clique no checkbox. */}
              <div key={filter} className="list-enter">
                <TodoList
                  todos={visibleTodos}
                  totalCount={todos.length}
                  onToggle={toggleTodo}
                  onEdit={editTodo}
                  onSetDueAt={setDueAt}
                  onRemove={removeTodo}
                />
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
