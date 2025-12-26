import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import config from '../config/api';
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaFilter, FaTimes, FaDownload, FaCalculator } from 'react-icons/fa';
import './Sales.css';

const Sales = () => {
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filters, setFilters] = useState({});
    const [activeFilterColumn, setActiveFilterColumn] = useState(null);
    const [showCalculator, setShowCalculator] = useState(false);
    const [selectedCells, setSelectedCells] = useState([]);
    const { currentUser } = useAuth();

    // Define columns
    const columns = [
        { key: 'srNo', header: 'Sr No', width: '80px' },
        { key: 'sellerInfo', header: 'Seller', width: '180px' },
        { key: 'policyNumber', header: 'Policy Number', width: '150px' },
        { key: 'policyType', header: 'Policy Type', width: '100px' },
        { key: 'productName', header: 'Product Name', width: '180px' },
        { key: 'clientName', header: 'Client Name', width: '150px' },
        { key: 'insurer', header: 'Insurer', width: '150px' },
        { key: 'sumInsured', header: 'Sum Insured', width: '120px', type: 'currency' },
        { key: 'netPremium', header: 'Net Premium', width: '120px', type: 'currency' },
        { key: 'payOut', header: 'Pay Out', width: '100px', type: 'currency' },
        { key: 'riskStart', header: 'Risk Start', width: '120px', type: 'date' },
        { key: 'riskEnd', header: 'Risk End', width: '120px', type: 'date' },
        { key: 'vehicleNo', header: 'Vehicle No', width: '120px' },
        { key: 'coCode', header: 'CO Code', width: '100px' },
        { key: 'policyDate', header: 'Policy Date', width: '120px', type: 'date' }
    ];

    useEffect(() => {
        fetchAllSales();
    }, []);

    const fetchAllSales = async () => {
        setLoading(true);
        setError('');
        try {
            const token = await currentUser.getIdToken();
            const response = await fetch(
                `${config.baseURL}${config.endpoints.sales.allSales}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            const data = await response.json();

            if (data.status === 'success') {
                setSalesData(data.sales);
            } else {
                setError(data.message || 'Failed to fetch sales data');
            }
        } catch (err) {
            setError('Failed to fetch sales data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Format value based on column type
    const formatValue = (value, type) => {
        if (!value) return '-';
        
        if (type === 'currency') {
            const num = Number(value);
            if (isNaN(num)) return value;
            return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
        }
        
        if (type === 'date') {
            try {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                    return date.toLocaleDateString('en-IN');
                }
            } catch (e) {}
            return value;
        }
        
        return value;
    };

    // Get unique values for a column (for filtering)
    const getUniqueValues = (key) => {
        const values = new Set();
        salesData.forEach(sale => {
            if (sale[key]) values.add(sale[key]);
        });
        return Array.from(values).sort();
    };

    // Sort handler
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Filter handler
    const handleFilter = (key, value) => {
        setFilters(prev => {
            const newFilters = { ...prev };
            if (value === '') {
                delete newFilters[key];
            } else {
                newFilters[key] = value;
            }
            return newFilters;
        });
        setActiveFilterColumn(null);
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({});
        setSearchTerm('');
    };

    // Process data with search, filter, and sort
    const processedData = useMemo(() => {
        let result = [...salesData];

        // Apply search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(sale =>
                Object.values(sale).some(val =>
                    String(val).toLowerCase().includes(term)
                )
            );
        }

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
            result = result.filter(sale => String(sale[key]) === String(value));
        });

        // Apply sort
        if (sortConfig.key) {
            result.sort((a, b) => {
                let aVal = a[sortConfig.key] || '';
                let bVal = b[sortConfig.key] || '';

                // Handle numeric values
                const col = columns.find(c => c.key === sortConfig.key);
                if (col?.type === 'currency') {
                    aVal = Number(aVal) || 0;
                    bVal = Number(bVal) || 0;
                }

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [salesData, searchTerm, filters, sortConfig]);

    // Calculate summary statistics
    const summaryStats = useMemo(() => {
        const currencyColumns = columns.filter(c => c.type === 'currency');
        const stats = {};

        currencyColumns.forEach(col => {
            const values = processedData
                .map(sale => Number(sale[col.key]) || 0)
                .filter(v => !isNaN(v));

            stats[col.key] = {
                sum: values.reduce((a, b) => a + b, 0),
                avg: values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0,
                min: values.length ? Math.min(...values) : 0,
                max: values.length ? Math.max(...values) : 0,
                count: values.length
            };
        });

        return stats;
    }, [processedData]);

    // Export to CSV
    const exportToCSV = () => {
        const headers = columns.map(c => c.header).join(',');
        const rows = processedData.map(sale =>
            columns.map(col => {
                let val = sale[col.key] || '';
                // Escape commas and quotes
                if (String(val).includes(',') || String(val).includes('"')) {
                    val = `"${String(val).replace(/"/g, '""')}"`;
                }
                return val;
            }).join(',')
        );

        const csv = [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales_data_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Render sort icon
    const renderSortIcon = (key) => {
        if (sortConfig.key !== key) return <FaSort className="sort-icon" />;
        return sortConfig.direction === 'asc' 
            ? <FaSortUp className="sort-icon active" />
            : <FaSortDown className="sort-icon active" />;
    };

    if (loading) {
        return (
            <div className="sales-container">
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Loading sales data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="sales-container">
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button onClick={fetchAllSales} className="retry-btn">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="sales-container">
            <div className="sales-header">
                <h1>Sales Data</h1>
                <div className="header-actions">
                    <span className="sales-count">
                        {processedData.length} of {salesData.length} records
                    </span>
                    <button onClick={() => setShowCalculator(!showCalculator)} className="calc-btn">
                        <FaCalculator /> Summary
                    </button>
                    <button onClick={exportToCSV} className="export-btn">
                        <FaDownload /> Export CSV
                    </button>
                    <button onClick={fetchAllSales} className="refresh-btn">
                        Refresh
                    </button>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="table-controls">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search all columns..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <FaTimes 
                            className="clear-search" 
                            onClick={() => setSearchTerm('')}
                        />
                    )}
                </div>

                {Object.keys(filters).length > 0 && (
                    <div className="active-filters">
                        {Object.entries(filters).map(([key, value]) => (
                            <span key={key} className="filter-tag">
                                {columns.find(c => c.key === key)?.header}: {value}
                                <FaTimes onClick={() => handleFilter(key, '')} />
                            </span>
                        ))}
                        <button className="clear-filters-btn" onClick={clearFilters}>
                            Clear All
                        </button>
                    </div>
                )}
            </div>

            {/* Summary Statistics */}
            {showCalculator && (
                <div className="summary-panel">
                    <h3>Summary Statistics</h3>
                    <div className="summary-grid">
                        {columns.filter(c => c.type === 'currency').map(col => (
                            <div key={col.key} className="summary-card">
                                <h4>{col.header}</h4>
                                <div className="stat-row">
                                    <span>Sum:</span>
                                    <strong>{formatValue(summaryStats[col.key]?.sum, 'currency')}</strong>
                                </div>
                                <div className="stat-row">
                                    <span>Average:</span>
                                    <strong>{formatValue(summaryStats[col.key]?.avg, 'currency')}</strong>
                                </div>
                                <div className="stat-row">
                                    <span>Min:</span>
                                    <strong>{formatValue(summaryStats[col.key]?.min, 'currency')}</strong>
                                </div>
                                <div className="stat-row">
                                    <span>Max:</span>
                                    <strong>{formatValue(summaryStats[col.key]?.max, 'currency')}</strong>
                                </div>
                                <div className="stat-row">
                                    <span>Count:</span>
                                    <strong>{summaryStats[col.key]?.count}</strong>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Data Table */}
            <div className="table-container">
                {processedData.length > 0 ? (
                    <table className="data-table">
                        <thead>
                            <tr>
                                {columns.map(col => (
                                    <th 
                                        key={col.key} 
                                        style={{ minWidth: col.width }}
                                    >
                                        <div className="th-content">
                                            <span 
                                                className="th-label"
                                                onClick={() => handleSort(col.key)}
                                            >
                                                {col.header}
                                                {renderSortIcon(col.key)}
                                            </span>
                                            <FaFilter 
                                                className={`filter-icon ${filters[col.key] ? 'active' : ''}`}
                                                onClick={() => setActiveFilterColumn(
                                                    activeFilterColumn === col.key ? null : col.key
                                                )}
                                            />
                                        </div>

                                        {/* Filter Dropdown */}
                                        {activeFilterColumn === col.key && (
                                            <div className="filter-dropdown">
                                                <select 
                                                    value={filters[col.key] || ''}
                                                    onChange={(e) => handleFilter(col.key, e.target.value)}
                                                >
                                                    <option value="">All</option>
                                                    {getUniqueValues(col.key).map(val => (
                                                        <option key={val} value={val}>
                                                            {formatValue(val, col.type)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {processedData.map((sale, rowIdx) => (
                                <tr key={sale.id || rowIdx}>
                                    {columns.map(col => (
                                        <td key={col.key}>
                                            {col.key === 'policyType' 
                                                ? (sale[col.key]?.charAt(0).toUpperCase() + sale[col.key]?.slice(1))
                                                : formatValue(sale[col.key], col.type)
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="no-data">
                        <p>No sales data available</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sales;