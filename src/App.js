import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition>
            <Home />
          </PageTransition>
        } />
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
          <PageTransition>
            <div>Profile Page</div>
          </PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Header />
          <AnimatedRoutes />
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;