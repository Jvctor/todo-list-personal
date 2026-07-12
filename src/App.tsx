import { AuthScreen } from "./components/AuthScreen";
import { TodoApp } from "./components/TodoApp";
import { LoadingState } from "./components/common/LoadingState";
import { useAuth } from "./hooks/useAuth";
import { useTheme } from "./hooks/useTheme";

function App() {
  const { theme, toggleTheme } = useTheme();
  const {
    user,
    status,
    isConfigured,
    errorMessage,
    isSubmitting,
    signInWithGoogle,
    signOut,
  } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <LoadingState label="Carregando..." />
      </div>
    );
  }

  if (user) {
    return (
      <TodoApp
        user={user}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSignOut={signOut}
      />
    );
  }

  return (
    <AuthScreen
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      isConfigured={isConfigured}
      theme={theme}
      onToggleTheme={toggleTheme}
      onGoogle={signInWithGoogle}
    />
  );
}

export default App;
