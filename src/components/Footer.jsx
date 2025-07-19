import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3 className="footer-title">About Us</h3>
                    <p className="footer-about">Ten Infinity is your trusted insurance broker.</p>
                </div>
                <div className="footer-section">
                    <h3 className="footer-title">Quick Links</h3>
                    <div className="footer-links">
                        <Link to="/privacy-policy" className="footer-link">Privacy Policy</Link>
                        <Link to="/terms-of-service" className="footer-link">Terms of Service</Link>
                        <Link to="/contact" className="footer-link">Contact Us</Link>
                    </div>
                </div>
                <div className="footer-section">
                    <h3 className="footer-title">Contact Info</h3>
                    <div className="footer-contact">
                        {/* <p>📍 123 Infinity Road, Suite 456</p> */}
                        <p>📧 info@teninfinity.com</p>
                        <p>📞 +91 75750 74333</p>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Ten Infinity. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;