import { FilterBar } from "./components/FilterBar";
import { Sidebar } from "./components/Sidebar";
import { ThemeToggle } from "./components/ThemeToggle";
import { TodoForm } from "./components/TodoForm";
import { TodoList } from "./components/TodoList";
import { ErrorState } from "./components/common/ErrorState";
import { LoadingState } from "./components/common/LoadingState";
import { useTheme } from "./hooks/useTheme";
import { useTodos } from "./hooks/useTodos";

function App() {
  const { theme, toggleTheme } = useTheme();
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
    removeTodo,
  } = useTodos();

  const isReady = status === "ready";
  const isLoading = status === "loading";
  const hasError = status === "error";

  return (
    <div className="flex min-h-screen flex-col bg-page md:flex-row">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <main
          id="minhas-tarefas"
          className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-5 py-8 md:px-10 md:py-12"
        >
          <header className="flex items-center justify-between gap-4">
            <h1 className="text-4xl font-bold text-fg md:text-5xl">Minhas tarefas</h1>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </header>

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

export default App;
