import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { ThemeProvider } from './hooks/use-theme';
import { AuthLayout } from './layouts/AuthLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MapPage from './pages/MapPage'; // Adjust this path if you placed MapPage inside the './pages/' folder

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Set the default home path to render your MapPage */}
          <Route path="/" element={<MapPage />} />
          
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {/* Catch-all: sends unknown URLs to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
