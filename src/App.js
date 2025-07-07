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
    <Router>
      <div className="App">
        <Header />
        <AnimatedRoutes />
        <Footer />
      </div>
    </Router>
  );
}

export default App;