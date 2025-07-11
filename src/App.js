import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './styles/theme.css';
import Header from './components/Header';
import Home from './pages/Home';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import './styles/variables.css';
import Login from './pages/Login';
import PageTransition from './components/PageTransition';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Profile from './pages/Profile';
import ErrorBoundary from './components/ErrorBoundary';

function AnimatedRoutes() {
  const location = useLocation();
  console.log('Env:', process.env.NODE_ENV); // should be 'production'


  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition>
            <Home />
          </PageTransition>
        }>
          <Route path="/#features" element={<Home />} />
          <Route path="/#products" element={<Home />} />
          <Route path="/#contact" element={<Home />} />
        </Route>
        <Route path="/login" element={
          <PageTransition>
            <Login />
          </PageTransition>
        } />
        <Route path="/sales" element={
          <PageTransition>
            <div>Sales Page</div>
          </PageTransition>
        } />
        <Route path="/activity" element={
          <PageTransition>
            <div>Activity Points Page</div>
          </PageTransition>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <PageTransition>
              <Profile />
            </PageTransition>
          </PrivateRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <div className="App">
              <Header />
              <AnimatedRoutes />
              <Footer />
            </div>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;