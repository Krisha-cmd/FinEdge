import React, { useState, useEffect, useRef } from 'react';
import { FaHeartbeat, FaUserShield, FaCar, FaMotorcycle } from 'react-icons/fa';
import './InsuranceProducts.css';

const insuranceData = [
    {
        id: 'health',
        icon: <FaHeartbeat />,
        title: 'Health Insurance',
        description: 'Comprehensive health coverage for you and your family with cashless treatment at 10,000+ hospitals nationwide.',
        features: ['Cashless Hospitalization', '100% Day Care Coverage', 'No Claim Bonus', 'Pre & Post Hospitalization']
    },
    {
        id: 'life',
        icon: <FaUserShield />,
        title: 'Life Insurance',
        description: "Secure your family's future with our comprehensive life insurance plans offering both protection and investment benefits.",
        features: ['Term Life Coverage', 'Investment Options', 'Critical Illness Rider', 'Accidental Death Benefit']
    },
    {
        id: 'car',
        icon: <FaCar />,
        title: 'Car Insurance',
        description: 'Protect your vehicle with comprehensive coverage including third-party liability and own damage protection.',
        features: ['Zero Depreciation', 'Roadside Assistance', '24/7 Claim Support', 'NCB Protection']
    },
    {
        id: 'scooter',
        icon: <FaMotorcycle />,
        title: 'Two-Wheeler Insurance',
        description: 'Affordable and comprehensive coverage for your two-wheeler with hassle-free claim settlement.',
        features: ['Personal Accident Cover', 'Third Party Liability', 'Quick Claim Settlement', 'Add-on Covers']
    }
];

const InsuranceProducts = () => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const detailsRef = useRef(null);

    const handleProductClick = (productId) => {
        if (selectedProduct === productId) {
            setSelectedProduct(null);
        } else {
            setSelectedProduct(productId);
            // Scroll to details on mobile
            if (window.innerWidth <= 968) {
                setTimeout(() => {
                    const element = document.querySelector('.insurance-details.active');
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                }, 100);
            }
        }
    };

    return (
        <section className="insurance-section">
            <h2 className="insurance-heading">Our Insurance Products</h2>
            <div className="insurance-container">
                <div className="insurance-grid">
                    {insuranceData.map((insurance) => (
                        <React.Fragment key={insurance.id}>
                            <button
                                className={`insurance-icon-box ${selectedProduct === insurance.id ? 'active' : ''}`}
                                onClick={() => handleProductClick(insurance.id)}
                            >
                                <div className="icon-wrapper">
                                    {insurance.icon}
                                </div>
                                <span>{insurance.title}</span>
                            </button>
                            {/* Details appear right after the clicked icon on mobile */}
                            {window.innerWidth <= 968 && selectedProduct === insurance.id && (
                                <div
                                    ref={detailsRef}
                                    className="insurance-details active"
                                >
                                    <div className="details-content">
                                        <div className="details-text">
                                            <h3>{insurance.title}</h3>
                                            <p>{insurance.description}</p>
                                            <ul className="features-list">
                                                {insurance.features.map((feature, index) => (
                                                    <li key={index}>{feature}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="details-icon">
                                            {insurance.icon}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
                {/* Details appear at bottom for desktop */}
                {window.innerWidth > 968 && (
                    insuranceData.map((insurance) => (
                        <div
                            key={insurance.id}
                            className={`insurance-details ${selectedProduct === insurance.id ? 'active' : ''}`}
                        >
                            <div className="details-content">
                                <div className="details-text">
                                    <h3>{insurance.title}</h3>
                                    <p>{insurance.description}</p>
                                    <ul className="features-list">
                                        {insurance.features.map((feature, index) => (
                                            <li key={index}>{feature}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="details-icon">
                                    {insurance.icon}
                                </div>
                            </div>
                        </div>
                    )))
                }
            </div>
        </section>
    );
};

export default InsuranceProducts;