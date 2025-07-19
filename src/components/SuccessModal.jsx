import React from 'react';
import './SuccessModal.css';
import { FaCheckCircle } from 'react-icons/fa';

const SuccessModal = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="success-modal">
                <div className="success-icon">
                    <FaCheckCircle />
                </div>
                <h2>Registration Successful!</h2>
                <p>{message}</p>
                <button className="modal-button" onClick={onClose}>
                    Continue to Login
                </button>
            </div>
        </div>
    );
};

export default SuccessModal;