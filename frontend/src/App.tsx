import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificareProvider } from './context/NotificareContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProprietateDetail from './pages/ProprietateDetail';
import Cont from './pages/Cont';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminProprietati from './pages/Admin/Proprietati';
import AdminCamere from './pages/Admin/Camere';
import AdminUtilizatori from './pages/Admin/Utilizatori';
import AdaugaCazare from './pages/AdaugaCazare';
import CazarileMele from './pages/CazarileMele';
import Evenimente from './pages/Evenimente';
import EvenimentDetail from './pages/EvenimentDetail';
import CazariEveniment from './pages/CazariEveniment';
import AdminEvenimente from './pages/Admin/Evenimente';
import RecenzieReminderModal from './components/RecenzieReminderModal';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// Guard pentru rutele accesibile doar proprietarilor si adminilor
function ProprietarRoute({ children }: { children: React.ReactNode }) {
  const { user, isProprietar, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isProprietar() && !isAdmin()) return <Navigate to="/cont" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <RecenzieReminderModal />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/proprietati/:id" element={<ProprietateDetail />} />
        <Route path="/cont" element={<PrivateRoute><Cont /></PrivateRoute>} />
        <Route path="/adauga-cazare" element={<ProprietarRoute><AdaugaCazare /></ProprietarRoute>} />
        <Route path="/cazarile-mele" element={<ProprietarRoute><CazarileMele /></ProprietarRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/proprietati" element={<AdminRoute><AdminProprietati /></AdminRoute>} />
        <Route path="/admin/camere" element={<AdminRoute><AdminCamere /></AdminRoute>} />
        <Route path="/admin/utilizatori" element={<AdminRoute><AdminUtilizatori /></AdminRoute>} />
        <Route path="/admin/evenimente" element={<AdminRoute><AdminEvenimente /></AdminRoute>} />
        <Route path="/evenimente" element={<Evenimente />} />
        <Route path="/evenimente/:id" element={<EvenimentDetail />} />
        <Route path="/evenimente/:id/cazari" element={<CazariEveniment />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NotificareProvider>
          <AppRoutes />
        </NotificareProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
