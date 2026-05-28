import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from '@/components/Layout';

import WarRoom from '@/pages/WarRoom';
import Matters from '@/pages/Matters';
import MatterDetail from '@/pages/MatterDetail';
import ChronosCore from '@/pages/ChronosCore';
import IntelFeed from '@/pages/IntelFeed';
import DocAutomator from '@/pages/DocAutomator';
import Settings from '@/pages/Settings';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'hsl(var(--background))' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-charcoal flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l9-4 9 4v6c0 5-4 9-9 11-5-2-9-6-9-11V6z" />
            </svg>
          </div>
          <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tempora Lex Loading…</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<WarRoom />} />
        <Route path="/matters" element={<Matters />} />
        <Route path="/matters/:id" element={<MatterDetail />} />
        <Route path="/chronos" element={<ChronosCore />} />
        <Route path="/intel" element={<IntelFeed />} />
        <Route path="/docauto" element={<DocAutomator />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App