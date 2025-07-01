import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import './styles/theme.css';
import Header from './components/Header';
import Home from './pages/Home';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import './styles/variables.css';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/sales" component={() => <div>Sales Page</div>} />
          <Route path="/activity" component={() => <div>Activity Points Page</div>} />
          <Route path="/profile" component={() => <div>Profile Page</div>} />
        </Switch>
        <Footer />
      </div>
    </Router>
  );
}

export default App;