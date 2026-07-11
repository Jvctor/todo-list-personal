import { FilterBar } from "./components/FilterBar";
import { TodoForm } from "./components/TodoForm";
import { TodoList } from "./components/TodoList";
import { ErrorState } from "./components/common/ErrorState";
import { LoadingState } from "./components/common/LoadingState";
import { useTodos } from "./hooks/useTodos";

function App() {
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
    removeTodo,
    clearCompleted,
  } = useTodos();

  const isReady = status === "ready";
  const isLoading = status === "loading";
  const hasError = status === "error";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold text-text-primary">Minhas tarefas</h1>
        <p className="text-sm text-text-muted">
          Organize seu dia. Tudo fica salvo no seu navegador.
        </p>
      </header>

      <main className="flex flex-col gap-6">
        <TodoForm onAdd={addTodo} disabled={!isReady} />

        {isLoading && <LoadingState label="Carregando suas tarefas..." />}

        {hasError && (
          <ErrorState
            message={errorMessage}
            onRetry={() => window.location.reload()}
          />
        )}

        {isReady && (
          <section className="flex flex-col gap-4">
            <TodoList
              todos={visibleTodos}
              totalCount={todos.length}
              onToggle={toggleTodo}
              onRemove={removeTodo}
            />

            {todos.length > 0 && (
              <FilterBar
                filter={filter}
                activeCount={activeCount}
                completedCount={completedCount}
                onFilterChange={setFilter}
                onClearCompleted={clearCompleted}
              />
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
