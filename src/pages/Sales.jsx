import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import config from '../config/api';
import { FaUser, FaHeartbeat, FaCar, FaHome, FaTimes, FaSearch, FaCalendarAlt, FaFilter, FaBars } from 'react-icons/fa';
import './Sales.css';

const POLICY_TYPES = {
    life: { icon: FaUser, color: '#4CAF50' },
    nonmotor: { icon: FaUser, color: '#614cafff' },
    health: { icon: FaHeartbeat, color: '#2196F3' },
    motor: { icon: FaCar, color: '#FF9800' },
    loan: { icon: FaHome, color: '#9C27B0' }
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
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
    }, [selectedFilters, fromDate, toDate, searchQuery]); // This will trigger whenever filters change

    // Update fetchRightPanelData to handle empty array case
    const fetchRightPanelData = async (coCode) => {
        if (!coCode) return;
        
        setLoading(true);
        setRightPanelData([]); // Clear existing data before fetching
        
        try {
            const token = await currentUser.getIdToken();
            const queryParams = new URLSearchParams();
            
            if (selectedFilters.length) {
                queryParams.append('policyTypes', selectedFilters.join(','));
            }
            if (fromDate) {
                queryParams.append('fromDate', fromDate);
            }
            if (toDate) {
                queryParams.append('toDate', toDate);
            }
            if (searchQuery.trim()) {
                queryParams.append('clientName', searchQuery.trim());
            }
            
            const queryString = queryParams.toString();
            const url = `${config.baseURL}${config.endpoints.sales.sales}/${coCode}${queryString ? '?' + queryString : ''}`;
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            if (data.status === 'success') {
                setRightPanelData(data.sales);
            }
        } catch (err) {
            setError('Failed to fetch sales data');
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

    // Handle search input
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSelectedFilters([]);
        setFromDate('');
        setToDate('');
        setSearchQuery('');
    };

    // Add window resize listener
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            if (window.innerWidth > 768) {
                setShowFilterMenu(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleFilterMenu = () => {
        setShowFilterMenu(!showFilterMenu);
    };

    return (
        <div className="sales-container">
            {/* Filter Toggle Button (Mobile) */}
            {isMobile && (
                <div className="filter-toggle-container">
                    <button 
                        className="filter-toggle-btn"
                        onClick={toggleFilterMenu}
                    >
                        <FaFilter className="filter-toggle-icon" />
                        Filters
                        {(selectedFilters.length > 0 || fromDate || toDate || searchQuery) && (
                            <span className="filter-badge">
                                {selectedFilters.length + (fromDate ? 1 : 0) + (toDate ? 1 : 0) + (searchQuery ? 1 : 0)}
                            </span>
                        )}
                    </button>
                </div>
            )}

            {/* Filter Menu Overlay (Mobile) */}
            {isMobile && showFilterMenu && (
                <div className="filter-overlay" onClick={toggleFilterMenu}>
                    <div className="filter-menu" onClick={(e) => e.stopPropagation()}>
                        <div className="filter-menu-header">
                            <h3>Filters</h3>
                            <button 
                                className="close-filter-btn"
                                onClick={toggleFilterMenu}
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <div className="filter-menu-content">
                            {/* Policy Type Filters */}
                            <div className="filter-group">
                                <label className="filter-group-label">Policy Types:</label>
                                <div className="filter-buttons mobile">
                                    {Object.entries(POLICY_TYPES).map(([type, { icon: Icon, color }]) => (
                                        <button
                                            key={type}
                                            className={`filter-button mobile ${selectedFilters.includes(type) ? 'active' : ''}`}
                                            onClick={() => handleFilterChange(type)}
                                            style={{ '--button-color': color }}
                                        >
                                            <Icon className="filter-icon" />
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date Range Filter */}
                            <div className="filter-group">
                                <label className="filter-group-label">Date Range:</label>
                                <div className="date-filters mobile">
                                    <div className="date-input-group">
                                        <FaCalendarAlt className="date-icon" />
                                        <input
                                            type="date"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                            placeholder="From Date"
                                            className="date-input"
                                        />
                                    </div>
                                    <div className="date-input-group">
                                        <FaCalendarAlt className="date-icon" />
                                        <input
                                            type="date"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                            placeholder="To Date"
                                            className="date-input"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className="filter-group">
                                <label className="filter-group-label">Search Client:</label>
                                <div className="search-input-group">
                                    <FaSearch className="search-icon" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        placeholder="Search by client name..."
                                        className="search-input"
                                    />
                                    {searchQuery && (
                                        <FaTimes 
                                            className="clear-search"
                                            onClick={() => setSearchQuery('')}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Active Filters */}
                            {(selectedFilters.length > 0 || fromDate || toDate || searchQuery) && (
                                <div className="filter-group">
                                    <div className="active-filters mobile">
                                        {selectedFilters.map(type => (
                                            <span key={type} className="filter-tag policy-tag">
                                                {type}
                                                <FaTimes 
                                                    className="remove-filter"
                                                    onClick={() => handleFilterChange(type)}
                                                />
                                            </span>
                                        ))}
                                        {fromDate && (
                                            <span className="filter-tag date-tag">
                                                From: {fromDate}
                                                <FaTimes 
                                                    className="remove-filter"
                                                    onClick={() => setFromDate('')}
                                                />
                                            </span>
                                        )}
                                        {toDate && (
                                            <span className="filter-tag date-tag">
                                                To: {toDate}
                                                <FaTimes 
                                                    className="remove-filter"
                                                    onClick={() => setToDate('')}
                                                />
                                            </span>
                                        )}
                                        {searchQuery && (
                                            <span className="filter-tag search-tag">
                                                Client: "{searchQuery}"
                                                <FaTimes 
                                                    className="remove-filter"
                                                    onClick={() => setSearchQuery('')}
                                                />
                                            </span>
                                        )}
                                    </div>
                                    <button className="clear-all-filters mobile" onClick={clearAllFilters}>
                                        Clear All Filters
                                    </button>
                                </div>
                            )}

                            <div className="filter-menu-actions">
                                <button className="apply-filters-btn" onClick={toggleFilterMenu}>
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Filter Section */}
            {!isMobile && (
                <div className="filter-section">
                    {/* Policy Type Filters */}
                    <div className="filter-row">
                        <label>Policy Types:</label>
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
                    </div>

                    {/* Date Range Filter */}
                    <div className="filter-row">
                        <label>Date Range:</label>
                        <div className="date-filters">
                            <div className="date-input-group">
                                <FaCalendarAlt className="date-icon" />
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    placeholder="From Date"
                                    className="date-input"
                                />
                            </div>
                            <span className="date-separator">to</span>
                            <div className="date-input-group">
                                <FaCalendarAlt className="date-icon" />
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    placeholder="To Date"
                                    className="date-input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="filter-row">
                        <label>Search Client:</label>
                        <div className="search-input-group">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Search by client name..."
                                className="search-input"
                            />
                            {searchQuery && (
                                <FaTimes 
                                    className="clear-search"
                                    onClick={() => setSearchQuery('')}
                                />
                            )}
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {(selectedFilters.length > 0 || fromDate || toDate || searchQuery) && (
                        <div className="active-filters-section">
                            <div className="active-filters">
                                {selectedFilters.map(type => (
                                    <span key={type} className="filter-tag policy-tag">
                                        {type}
                                        <FaTimes 
                                            className="remove-filter"
                                            onClick={() => handleFilterChange(type)}
                                        />
                                    </span>
                                ))}
                                {fromDate && (
                                    <span className="filter-tag date-tag">
                                        From: {fromDate}
                                        <FaTimes 
                                            className="remove-filter"
                                            onClick={() => setFromDate('')}
                                        />
                                    </span>
                                )}
                                {toDate && (
                                    <span className="filter-tag date-tag">
                                        To: {toDate}
                                        <FaTimes 
                                            className="remove-filter"
                                            onClick={() => setToDate('')}
                                        />
                                    </span>
                                )}
                                {searchQuery && (
                                    <span className="filter-tag search-tag">
                                        Client: "{searchQuery}"
                                        <FaTimes 
                                            className="remove-filter"
                                            onClick={() => setSearchQuery('')}
                                        />
                                    </span>
                                )}
                            </div>
                            <button className="clear-all-filters" onClick={clearAllFilters}>
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="panels-container">
                {/* Left Panel */}
                <div className='panels-container-2'>
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
                                {/* <small className="member-type">L1 Member</small> */}
                            </div>
                            <span className="arrow">→</span>
                        </div>
                    )}
                    
                    {/* L1 Children */}
                    {l1Children.length > 0 && (
                        <>
                            <div className="section-divider"> </div>
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
                                <div className="section-divider"> </div>
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
                </div>

                {/* Update the right panel condition */}
                {(l1Member || selectedL2Member || selectedMidCard) && (
                    <div className="panel right-panel">
                        <div className="policies-grid">
                            {rightPanelData.map((sale) => {
                                const PolicyIcon = POLICY_TYPES[sale.policyType]?.icon;
                                const policyColor = POLICY_TYPES[sale.policyType]?.color;
                                
                                return (
                                    <div 
                                        key={sale.srNo} 
                                        className="policy-card"
                                        data-type={sale.policyType}
                                        style={{ '--policy-color': policyColor }}
                                    >
                                        <div className="policy-header">
                                            {PolicyIcon && <PolicyIcon className="policy-type-icon" />}
                                            <h3>{sale.productName}</h3>
                                        </div>
                                        <div className="policy-content">
                                            {/* <p><strong>Policy Type:</strong> {sale.policyType}</p> */}
                                            <p><strong>Policy Number:</strong> {sale.policyNumber}</p>
                                            {/* <p><strong>Sum Insured:</strong> ₹{sale.sumInsured}</p> */}
                                            <p><strong>Client Name:</strong> {sale.clientName}</p>
                                            {/* <p><strong>Sale Date:</strong> {sale.policyDate}</p> */}
                                            <p><strong>Risk Start Date:</strong> {new Date(sale.riskStart).toLocaleDateString()}</p>
                                            <p><strong>Risk End Date:</strong> {new Date(sale.riskEnd).toLocaleDateString()}</p>
                                            <p><strong>Net Premium:</strong> ₹{sale.netPremium}</p>
                                            <p><strong>Pay Out:</strong> ₹{sale.payOut}</p>
                                            {sale.vehicleNo && (
                                                <p><strong>Vehicle No:</strong> {sale.vehicleNo}</p>
                                            )}
                                            <p><strong>Insurer:</strong> {sale.insurer}</p>
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