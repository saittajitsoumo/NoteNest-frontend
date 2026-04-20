import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster position="bottom-right" />
    </AuthProvider>
  );
}

export default App;