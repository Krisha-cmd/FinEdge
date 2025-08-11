import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import config from '../config/api';
import { FaUser, FaHeartbeat, FaCar, FaHome, FaTimes } from 'react-icons/fa';
import './Sales.css';

const POLICY_TYPES = {
    Life: { icon: FaUser, color: '#4CAF50' },
    Health: { icon: FaHeartbeat, color: '#2196F3' },
    Motor: { icon: FaCar, color: '#FF9800' },
    Loan: { icon: FaHome, color: '#9C27B0' }
};

const Sales = () => {
    const [leftPanelData, setLeftPanelData] = useState([]);
    const [midPanelData, setMidPanelData] = useState([]);
    const [rightPanelData, setRightPanelData] = useState([]);
    const [selectedLeftCard, setSelectedLeftCard] = useState(null);
    const [selectedMidCard, setSelectedMidCard] = useState(null);
    const [showMidPanel, setShowMidPanel] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [policyTypeFilter, setPolicyTypeFilter] = useState('all');
    const { currentUser } = useAuth();
    const [l1Member, setL1Member] = useState(null);
    const [l1Children, setL1Children] = useState([]);
    const [selectedL2Member, setSelectedL2Member] = useState(null);
    const [l2Children, setL2Children] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState([]);

    // Fetch initial left panel data
    useEffect(() => {
        fetchL1MemberAndChildren();
    }, []);

    const fetchL1MemberAndChildren = async () => {
        setLoading(true);
        try {
            // Fetch L1 member first
            const token = await currentUser.getIdToken();
            const l1Response = await fetch(
                `${config.baseURL}${config.endpoints.sales.l1member}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            const l1Data = await l1Response.json();
            
            if (l1Data.status === 'success') {
                setL1Member(l1Data.member);
                
                // Then fetch their children
                const hierarchyResponse = await fetch(
                    `${config.baseURL}${config.endpoints.sales.hierarchy}/${l1Data.member.coCode}`,
                    {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }
                );
                const hierarchyData = await hierarchyResponse.json();
                
                if (hierarchyData.hasChildren) {
                    setL1Children(hierarchyData.children);
                }
            }
        } catch (err) {
            setError('Failed to fetch initial data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleL1ChildClick = async (child) => {
        setLoading(true);
        setSelectedL2Member(child);
        try {
            const token = await currentUser.getIdToken();
            const response = await fetch(
                `${config.baseURL}${config.endpoints.sales.hierarchy}/${child.coCode}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            const data = await response.json();
            
            if (data.hasChildren) {
                setShowMidPanel(true);
                setL2Children(data.children);
            } else {
                setShowMidPanel(false);
                fetchRightPanelData(child.coCode);
            }
        } catch (err) {
            setError('Failed to fetch hierarchy');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleL2ChildClick = (child) => {
        setSelectedMidCard(child);
        fetchRightPanelData(child.coCode);
    };

    // First, modify handleFilterChange to only handle filter state
    const handleFilterChange = (type) => {
        setSelectedFilters(prev => {
            const newFilters = prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type];
            return newFilters;
        });
    };

    // Add a new useEffect to watch for filter changes
    useEffect(() => {
        const refreshData = async () => {
            // Get the currently active coCode
            const activeCoCode = selectedMidCard?.coCode || 
                               selectedL2Member?.coCode || 
                               l1Member?.coCode;

            if (activeCoCode) {
                await fetchRightPanelData(activeCoCode);
            }
        };

        refreshData();
    }, [selectedFilters]); // This will trigger whenever filters change

    // Update fetchRightPanelData to handle empty array case
    const fetchRightPanelData = async (coCode) => {
        if (!coCode) return;
        
        setLoading(true);
        setRightPanelData([]); // Clear existing data before fetching
        
        try {
            const token = await currentUser.getIdToken();
            const queryParams = selectedFilters.length 
                ? `?policyTypes=${selectedFilters.join(',')}`
                : '';
            
            const response = await fetch(
                `${config.baseURL}${config.endpoints.sales.policies}/${coCode}${queryParams}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            const data = await response.json();
            
            if (data.status === 'success') {
                setRightPanelData(data.policies);
            }
        } catch (err) {
            setError('Failed to fetch policies');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleL1MemberClick = () => {
        setSelectedL2Member(null);
        setSelectedMidCard(null);
        setShowMidPanel(false);
        fetchRightPanelData(l1Member.coCode);
    };

    const handleL2MemberClick = () => {
        setSelectedMidCard(null);
        fetchRightPanelData(selectedL2Member.coCode);
    };

    return (
        <div className="sales-container">
            {/* Filter Section */}
            <div className="filter-section">
                <div className="filter-buttons">
                    {Object.entries(POLICY_TYPES).map(([type, { icon: Icon, color }]) => (
                        <button
                            key={type}
                            className={`filter-button ${selectedFilters.includes(type) ? 'active' : ''}`}
                            onClick={() => handleFilterChange(type)}
                            style={{ '--button-color': color }}
                        >
                            <Icon className="filter-icon" />
                            {type}
                        </button>
                    ))}
                </div>
                {selectedFilters.length > 0 && (
                    <div className="active-filters">
                        {selectedFilters.map(type => (
                            <span key={type} className="filter-tag">
                                {type}
                                <FaTimes 
                                    className="remove-filter"
                                    onClick={() => handleFilterChange(type)}
                                />
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="panels-container">
                {/* Left Panel */}
                <div className="panel left-panel">
                    {/* Make L1 Member clickable */}
                    {l1Member && (
                        <div 
                            className="l1-member card"
                            onClick={handleL1MemberClick}
                        >
                            <div className="card-content">
                                <h3>{l1Member.name}</h3>
                                <p>CO Code: {l1Member.coCode}</p>
                                <small className="member-type">L1 Member</small>
                            </div>
                            <span className="arrow">→</span>
                        </div>
                    )}
                    
                    {/* L1 Children */}
                    {l1Children.length > 0 && (
                        <>
                            <div className="section-divider">L1 Children</div>
                            {l1Children.map((child) => (
                                <div 
                                    key={child.coCode}
                                    className={`card ${selectedL2Member?.coCode === child.coCode ? 'active' : ''}`}
                                    onClick={() => handleL1ChildClick(child)}
                                >
                                    <div className="card-content">
                                        <h3>{child.name}</h3>
                                        <p>CO Code: {child.coCode}</p>
                                    </div>
                                    <span className="arrow">→</span>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {/* Mid Panel */}
                {showMidPanel && selectedL2Member && (
                    <div className="panel mid-panel">
                        {/* Make L2 Member clickable */}
                        <div 
                            className="l2-member card"
                            onClick={handleL2MemberClick}
                        >
                            <div className="card-content">
                                <h3>{selectedL2Member.name}</h3>
                                <p>CO Code: {selectedL2Member.coCode}</p>
                                <small className="member-type">Selected Member</small>
                            </div>
                            <span className="arrow">→</span>
                        </div>

                        {/* L2 Children */}
                        {l2Children.length > 0 && (
                            <>
                                <div className="section-divider">L2 Children</div>
                                {l2Children.map((child) => (
                                    <div 
                                        key={child.coCode}
                                        className={`card ${selectedMidCard?.coCode === child.coCode ? 'active' : ''}`}
                                        onClick={() => handleL2ChildClick(child)}
                                    >
                                        <div className="card-content">
                                            <h3>{child.name}</h3>
                                            <p>CO Code: {child.coCode}</p>
                                        </div>
                                        <span className="arrow">→</span>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}

                {/* Update the right panel condition */}
                {(l1Member || selectedL2Member || selectedMidCard) && (
                    <div className="panel right-panel">
                        <div className="policies-grid">
                            {rightPanelData.map((policy) => {
                                const PolicyIcon = POLICY_TYPES[policy.policyType]?.icon;
                                const policyColor = POLICY_TYPES[policy.policyType]?.color;
                                
                                return (
                                    <div 
                                        key={policy.policyNumber} 
                                        className="policy-card"
                                        data-type={policy.policyType}
                                        style={{ '--policy-color': policyColor }}
                                    >
                                        <div className="policy-header">
                                            <PolicyIcon className="policy-type-icon" />
                                            <h3>{policy.productName}</h3>
                                        </div>
                                        <div className="policy-content">
                                            <p><strong>Policy Type:</strong> {policy.policyType}</p>
                                            <p><strong>Policy Number:</strong> {policy.policyNumber}</p>
                                            <p><strong>Sum Insured:</strong> ₹{policy.sumInsured}</p>
                                            <p><strong>Client Name:</strong> {policy.clientName}</p>
                                            {policy.vehicleNo && (
                                                <p><strong>Vehicle No:</strong> {policy.vehicleNo}</p>
                                            )}
                                            <p><strong>Insurer:</strong> {policy.insurer}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {loading && <div className="loading-overlay">Loading...</div>}
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default Sales;