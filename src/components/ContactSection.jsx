import React from 'react';
import './ContactSection.css';

const ContactSection = () => {
    return (
        <section id="contact" className="contact-section">
            <div className="contact-container">
                <h2 className="contact-heading">Contact Us</h2>
                <p className="contact-description">If you have any questions or need assistance, feel free to reach out to us.</p>
                
                <form className="contact-form">
                    <div className="contact-form-group">
                        <label className="contact-label" htmlFor="name">Name</label>
                        <input className="contact-input" type="text" id="name" name="name" required />
                    </div>
                    <div className="contact-form-group">
                        <label className="contact-label" htmlFor="email">Email</label>
                        <input className="contact-input" type="email" id="email" name="email" required />
                    </div>
                    <div className="contact-form-group">
                        <label className="contact-label" htmlFor="message">Message</label>
                        <textarea className="contact-textarea" id="message" name="message" required></textarea>
                    </div>
                    <button className="contact-submit" type="submit">Send Message</button>
                </form>

                <div className="contact-info">
                    <h3 className="contact-info-heading">Our Office</h3>
                    <p className="contact-info-text">123 Infinity Road, Suite 456</p>
                    <p className="contact-info-text">City, State, ZIP</p>
                    <p className="contact-info-text">Email: info@oneinfinityfinedge.com</p>
                    <p className="contact-info-text">Phone: (123) 456-7890</p>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;