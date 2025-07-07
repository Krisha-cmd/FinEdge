import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import './Header.css';


const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
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
                <button 
                    className="mobile-menu-btn" 
                    onClick={toggleMenu}
                    aria-label="Toggle navigation menu"
                    aria-expanded={isMenuOpen}
                >
                    <span className="menu-icon">{isMenuOpen ? '×' : '☰'}</span>
                </button>
                <nav className={`nav ${isMenuOpen ? 'active' : ''}`}>
                    <NavLink 
                        to="/" 
                        className="nav-link" 
                        onClick={toggleMenu}
                        exact
                    >
                        Home
                    </NavLink>
                    <NavLink 
                        to="/login" 
                        className="nav-link" 
                        onClick={toggleMenu}
                    >
                        Login
                    </NavLink>
                    <NavLink 
                        to="/sales" 
                        className="nav-link" 
                        onClick={toggleMenu}
                    >
                        Sales
                    </NavLink>
                    <NavLink 
                        to="/activity" 
                        className="nav-link" 
                        onClick={toggleMenu}
                    >
                        Activity Points
                    </NavLink>
                    <NavLink 
                        to="/profile" 
                        className="nav-link" 
                        onClick={toggleMenu}
                    >
                        Profile
                    </NavLink>
                </nav>
            </div>
            {isMenuOpen && <div className="menu-overlay" onClick={toggleMenu} />}
        </header>
    );
};

export default Header;