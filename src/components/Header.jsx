import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpg';
import './Header.css';
import ThemeToggle from './ThemeToggle';
import { scrollToSection } from '../utils/scrollHelper';
import config from '../config/api';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeFragment, setActiveFragment] = useState('');
    const { currentUser, logout } = useAuth();
    const [userName, setUserName] = useState('Profile');
    const navigate = useNavigate();

    // Add this useEffect to fetch user name
    useEffect(() => {
        const fetchUserName = async () => {
            if (currentUser) {
                try {
                    const token = await currentUser.getIdToken();
                    const response = await fetch(`${config.baseURL}${config.endpoints.profile}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    const data = await response.json();
                    if (data.status === 'success') {
                        setUserName(data.profile.name);
                    }
                } catch (error) {
                    console.error('Error fetching user name:', error);
                }
            }
        };

        fetchUserName();
    }, [currentUser]);

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

    const handleFragmentClick = (e, sectionId) => {
        e.preventDefault();
        handleNavClick();
        if (window.location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                scrollToSection(sectionId);
            }, 100);
        } else {
            scrollToSection(sectionId);
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

    // Scroll detection useEffect
    useEffect(() => {
        const handleScroll = () => {
            const sections = ['features', 'products', 'contact'];
            const scrollPosition = window.scrollY + 100; // offset for header

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 100 && rect.bottom >= 100) {
                        setActiveFragment(section);
                        return;
                    }
                }
            }
            setActiveFragment('');
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
                                        to="/features"
                                        className={`nav-link ${activeFragment === 'features'}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleFragmentClick(e, 'features');
                                            window.location.href = '/#/#features';
                                        }}
                                    >
                                        Features
                                    </NavLink>
                                    <NavLink
                                        to="/products"
                                        className={`nav-link ${activeFragment === 'products'}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleFragmentClick(e, 'products');
                                            window.location.href = '/#/#products';
                                        }}
                                    >
                                        Products
                                    </NavLink>
                                    <NavLink
                                        to="/contact"
                                        className={`nav-link ${activeFragment === 'contact' ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleFragmentClick(e, 'contact');
                                            window.location.href = '/#/#contact';
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
                                    {/* <NavLink 
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
                                    </NavLink> */}
                                    <NavLink
                                        to="/profile"
                                        className="nav-link"
                                        onClick={handleNavClick}
                                    >
                                        {userName}
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