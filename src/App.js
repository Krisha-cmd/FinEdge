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
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Profile from './pages/Profile';
import ErrorBoundary from './components/ErrorBoundary';
import SignUp from './pages/SignUp';
import SetPassword from './pages/SetPassword'; // Assuming you have this component for success modal
import ResetPassword from './pages/ResetPassword'; // Import the ResetPassword component
import Sales from './pages/Sales'; // Import the Sales page

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
            <Sales />
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
        <Route path="/signup" element={
          <PageTransition>
            <SignUp />
          </PageTransition>
        } />


        <Route path="/set-password" element={<PageTransition><SetPassword /></PageTransition>} />
        <Route path="/reset-password" element={
          <PageTransition>
            <ResetPassword />
          </PageTransition>
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