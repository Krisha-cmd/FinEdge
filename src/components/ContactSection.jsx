import React, { useState } from 'react';
import config from '../config/api';
import './ContactSection.css';

const ContactSection = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await fetch(`${config.baseURL}${config.endpoints.contactUs}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.status === 'success') {
                setSuccess(data.message);
                // Clear form
                setFormData({
                    name: '',
                    email: '',
                    message: ''
                });
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(err.message || 'Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="contact" className="contact-section">
            <div className="contact-container">
                <h2 className="contact-heading">Contact Us</h2>
                <p className="contact-description">If you have any questions or need assistance, feel free to reach out to us.</p>
                
                <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="contact-form-group">
                        <label className="contact-label" htmlFor="name">Name</label>
                        <input 
                            className="contact-input" 
                            type="text" 
                            id="name" 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required 
                        />
                    </div>
                    <div className="contact-form-group">
                        <label className="contact-label" htmlFor="email">Email</label>
                        <input 
                            className="contact-input" 
                            type="email" 
                            id="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required 
                        />
                    </div>
                    <div className="contact-form-group">
                        <label className="contact-label" htmlFor="message">Message</label>
                        <textarea 
                            className="contact-textarea" 
                            id="message" 
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>

                    {error && <div className="contact-error">{error}</div>}
                    {success && <div className="contact-success">{success}</div>}

                    <button 
                        className="contact-submit" 
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Message'}
                    </button>
                </form>

                <div className="contact-info">
                    {/* <h3 className="contact-info-heading">Our Office</h3>
                    <p className="contact-info-text">123 Infinity Road, Suite 456</p>
                    <p className="contact-info-text">City, State, ZIP</p> */}
                    <p className="contact-info-text">Email: info@teninfinity.com</p>
                    <p className="contact-info-text">Phone: +91 75750 74333</p>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;