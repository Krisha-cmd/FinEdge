import React, { useState, useRef } from 'react';
import './InsuranceProducts.css';

// Direct import of PNG files
import healthIcon from '../assets/health-insurance.png';
import lifeIcon from '../assets/life-insurance.png';
import carIcon from '../assets/car-insurance.png';
import scooterIcon from '../assets/scooter-insurance.png';

const insuranceData = [
    {
        id: 'health',
        icon: healthIcon,
        title: 'Health Insurance',
        description: 'Health insurance is not a new term in today’s world. Above this, the global pandemic has also knocked on our door to secure ourselves from unwanted situations. This is where healthcare insurance comes into play. This is a mutual agreement between a policyholder and insurance company to offer compensation as a medical expense in case you meet with an accident or get hospitalized.',
        features: ['Family Health Insurance', 'Senior Citizen Health Insurance', 'Critical Illness Health Insurance', 'Personal Accident Health Insurance']
    },
    {
        id: 'life',
        icon: lifeIcon,
        title: 'Life Insurance',
        description: "Life insurance is an agreement between you and the insurance company where you pay money to an insurance company regularly and in return, they promise to give a certain amount of money to the people you choose (called beneficiaries) after your death. It acts like a safety net for your loved ones.",
        features: ['Replacing lost income', 'Paying off debts', "Children's education", 'Everyday expenses']
    },
    {
        id: 'car',
        icon: carIcon,
        title: 'Car Insurance',
        description: "Car insurance or four wheeler insurance provides you with financial covers for the damage of your car from accidents, theft, and fires. It also protects you from expenses caused by natural disasters, animal attacks, and damage caused by people. Plus, it covers any legal costs if you harm someone else or their property. In India, it's required by law to have at least third-party car insurance to drive legally.",
        features: ['Zero Depreciation', 'Roadside Assistance', '24/7 Claim Support', 'NCB Protection']
    },
    {
        id: 'scooter',
        icon: scooterIcon,
        title: 'Two-Wheeler Insurance',
        description: "Bike insurance, also known as two-wheeler insurance, provides you with financial protection for your bike against various unforeseen situations such as accidents, theft, fire, strikes, natural disasters, third-party damages, and more. A bike insurance policy covers all kinds of bikes, including motorcycles, electric bikes, mopeds, and scooters.",
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
            <p className="insurance-subheading">
                Discover our comprehensive range of insurance solutions designed to protect what matters most to you
            </p>
            <div className="insurance-container">
                <div className="insurance-grid">
                    {insuranceData.map((insurance) => (
                        <React.Fragment key={insurance.id}>
                            <button
                                className={`insurance-icon-box ${selectedProduct === insurance.id ? 'active' : ''}`}
                                onClick={() => handleProductClick(insurance.id)}
                            >
                                <div className="icon-wrapper">
                                    <img src={insurance.icon} alt={insurance.title} className="insurance-icon" />
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
                                            <img src={insurance.icon} alt={insurance.title} />
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
                                    <img src={insurance.icon} alt={insurance.title} />
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