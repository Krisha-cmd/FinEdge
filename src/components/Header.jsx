import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpg';
import './Header.css';
import ThemeToggle from './ThemeToggle';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleNavClick = () => {
        setIsMenuOpen(false);
        document.body.classList.remove('no-scroll');
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
            handleNavClick();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    // Close menu when clicking outside
    useEffect(() => {
        const closeMenu = (e) => {
            if (isMenuOpen && !e.target.closest('.nav') && !e.target.closest('.mobile-menu-btn')) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('click', closeMenu);
        return () => document.removeEventListener('click', closeMenu);
    }, [isMenuOpen]);

    // Handle body scroll lock in useEffect
    useEffect(() => {
        // Only add the class if needed
        if (isMenuOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }

        // Cleanup function
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, [isMenuOpen]);

    return (
        <header className="header">
            <div className="header-container">
                <div className="logo">
                    <Link to="/">
                        <img src={logo} alt="One Infinity FinEdge Pvt Ltd" />
                    </Link>
                </div>
                <div className="nav-container">
                    <div className="header-controls">
                        <nav className={`nav ${isMenuOpen ? 'active' : ''}`}>
                            <NavLink 
                                to="/" 
                                className="nav-link" 
                                onClick={handleNavClick}
                                end
                            >
                                Home
                            </NavLink>
                            
                            {!currentUser && (
                                <>
                                    <NavLink 
                                        to="/#features" 
                                        className="nav-link" 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
                                            handleNavClick();
                                        }}
                                    >
                                        Features
                                    </NavLink>
                                    <NavLink 
                                        to="/#products" 
                                        className="nav-link" 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
                                            handleNavClick();
                                        }}
                                    >
                                        Products
                                    </NavLink>
                                    <NavLink 
                                        to="/#contact" 
                                        className="nav-link" 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
                                            handleNavClick();
                                        }}
                                    >
                                        Contact
                                    </NavLink>
                                    <NavLink 
                                        to="/login" 
                                        className="nav-link" 
                                        onClick={handleNavClick}
                                    >
                                        Login
                                    </NavLink>
                                </>
                            )}
                            
                            {currentUser && (
                                <>
                                    <NavLink 
                                        to="/sales" 
                                        className="nav-link" 
                                        onClick={handleNavClick}
                                    >
                                        Sales
                                    </NavLink>
                                    <NavLink 
                                        to="/activity" 
                                        className="nav-link" 
                                        onClick={handleNavClick}
                                    >
                                        Activity Points
                                    </NavLink>
                                    <NavLink 
                                        to="/profile" 
                                        className="nav-link" 
                                        onClick={handleNavClick}
                                    >
                                        Profile
                                    </NavLink>
                                    <button 
                                        className="nav-link logout-btn" 
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </>
                            )}
                        </nav>
                        <ThemeToggle />
                        <button 
                            className="mobile-menu-btn" 
                            onClick={toggleMenu}
                            aria-label="Toggle navigation menu"
                            aria-expanded={isMenuOpen}
                        >
                            <span className="menu-icon">{isMenuOpen ? '×' : '☰'}</span>
                        </button>
                    </div>
                </div>
            </div>
            {isMenuOpen && <div className="menu-overlay" onClick={toggleMenu} />}
        </header>
    );
};

export default Header;