import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import config from '../config/api';
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaFilter, FaTimes, FaDownload, FaCalculator, FaFileAlt, FaTimesCircle, FaCalendarAlt, FaCheck } from 'react-icons/fa';
import './Sales.css';

const Sales = () => {
    const [salesData, setSalesData] = useState([]);
    const [columnsConfig, setColumnsConfig] = useState([]);
    const [allColumnsFromApi, setAllColumnsFromApi] = useState([]); // Store all columns including invisible ones
    const [loading, setLoading] = useState(true);
    const [columnsLoading, setColumnsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filters, setFilters] = useState({});
    const [activeFilterColumn, setActiveFilterColumn] = useState(null);
    const [showCalculator, setShowCalculator] = useState(false);
    const [policyStatus, setPolicyStatus] = useState({});
    const [dateRangeInput, setDateRangeInput] = useState({ startDate: '', endDate: '' });
    const [appliedDateRange, setAppliedDateRange] = useState({ startDate: '', endDate: '' });
    const { currentUser } = useAuth();

    // Fetch column configuration from API
    const fetchColumnConfig = useCallback(async () => {
        setColumnsLoading(true);
        try {
            const response = await fetch(
                `${config.baseURL}${config.endpoints.sales.colInfo}`
            );
            const data = await response.json();

            if (data.status === 'success') {
                // Store all columns (for date filtering)
                const allCols = data.columns.map(col => ({
                    key: col.columnname,
                    id: col.id,
                    header: col.displayname,
                    type: mapColumnType(col.type),
                    casing: col.casing,
                    visibility: col.visibility,
                    width: getColumnWidth(col.type, col.displayname)
                }));
                setAllColumnsFromApi(allCols);

                // Filter only visible columns for display
                const visibleColumns = allCols
                    .filter(col => col.visibility === 'visible')
                    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

                setColumnsConfig(visibleColumns);
                
                // Log date columns for debugging
                const dateCols = allCols.filter(col => col.type === 'date');
                console.log('Date columns found:', dateCols);
            } else {
                console.error('Failed to fetch column config:', data.message);
            }
        } catch (err) {
            console.error('Error fetching column config:', err);
        } finally {
            setColumnsLoading(false);
        }
    }, []);

    // Map API column type to internal type
    const mapColumnType = (apiType) => {
        const typeMap = {
            'numeric': 'number',
            'number': 'number',
            'currency': 'currency',
            'date': 'date',
            'text': 'text'
        };
        return typeMap[apiType?.toLowerCase()] || 'text';
    };

    // Calculate column width based on type and header
    const getColumnWidth = (type, header) => {
        const headerLength = header?.length || 10;
        const baseWidth = Math.max(headerLength * 10, 80);
        
        if (type === 'date') return '120px';
        if (type === 'numeric' || type === 'number' || type === 'currency') return '120px';
        if (headerLength > 15) return '180px';
        return `${Math.min(baseWidth, 200)}px`;
    };

    // Apply casing to value
    const applyCasing = (value, casing) => {
        if (!value || typeof value !== 'string') return value;
        
        switch (casing?.toLowerCase()) {
            case 'lower case':
                return value.toLowerCase();
            case 'upper case':
                return value.toUpperCase();
            case 'normal':
            default:
                return value
                    .toLowerCase()
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
        }
    };

    // Format value based on column type and casing
    const formatValue = (value, type, casing) => {
        if (value === null || value === undefined || value === '') return '-';
        
        if (type === 'number' || type === 'currency') {
            const num = Number(value);
            if (isNaN(num)) return applyCasing(String(value), casing);
            if (type === 'currency') {
                return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
            }
            return num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
        }
        
        if (type === 'date') {
            try {
                const date = parseDate(value);
                if (date) {
                    return date.toLocaleDateString('en-IN');
                }
            } catch (e) {}
            return value;
        }
        
        return applyCasing(String(value), casing);
    };

    // Get value from sale object using column key
    const getSaleValue = (sale, columnKey) => {
        if (!sale || !columnKey) return undefined;

        // Direct match first
        if (sale[columnKey] !== undefined) {
            return sale[columnKey];
        }

        // Try lowercase version of key
        const lowerKey = columnKey.toLowerCase();
        if (sale[lowerKey] !== undefined) {
            return sale[lowerKey];
        }

        // Try removing spaces and special characters
        const normalizedKey = columnKey.toLowerCase().replace(/[\s.]+/g, '_');
        if (sale[normalizedKey] !== undefined) {
            return sale[normalizedKey];
        }

        // Try with spaces replaced by nothing
        const noSpaceKey = columnKey.toLowerCase().replace(/[\s.]+/g, '');
        if (sale[noSpaceKey] !== undefined) {
            return sale[noSpaceKey];
        }

        // Search through all keys for a case-insensitive match
        const saleKeys = Object.keys(sale);
        const matchingKey = saleKeys.find(k => 
            k.toLowerCase().replace(/[\s._]+/g, '') === columnKey.toLowerCase().replace(/[\s._]+/g, '')
        );
        
        if (matchingKey) {
            return sale[matchingKey];
        }

        return undefined;
    };

    // Get coCode from sale
    const getCoCode = (sale) => {
        return getSaleValue(sale, 'cocode') || 
               getSaleValue(sale, 'coCode') || 
               getSaleValue(sale, 'COCODE') || 
               '';
    };

    // Get policy number from sale
    const getPolicyNo = (sale) => {
        return getSaleValue(sale, 'policy no.') || 
               getSaleValue(sale, 'policy no') || 
               getSaleValue(sale, 'policyno') || 
               getSaleValue(sale, 'policy_no') ||
               getSaleValue(sale, 'policynumber') ||
               getSaleValue(sale, 'policy number') ||
               '';
    };

    // Parse date string to Date object (handles multiple formats)
    const parseDate = (dateValue) => {
        if (!dateValue) return null;
        
        // If already a Date object
        if (dateValue instanceof Date) {
            return isNaN(dateValue.getTime()) ? null : dateValue;
        }

        // Handle Firestore Timestamp
        if (dateValue._seconds !== undefined) {
            return new Date(dateValue._seconds * 1000);
        }

        if (dateValue.seconds !== undefined) {
            return new Date(dateValue.seconds * 1000);
        }

        // Try parsing as ISO string or standard date
        let date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
            return date;
        }

        // Try DD/MM/YYYY or DD-MM-YYYY format
        if (typeof dateValue === 'string') {
            const parts = dateValue.split(/[\/\-\.]/);
            if (parts.length === 3) {
                // Assume DD/MM/YYYY
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const year = parseInt(parts[2], 10);
                
                if (day && month >= 0 && year) {
                    date = new Date(year, month, day);
                    if (!isNaN(date.getTime())) {
                        return date;
                    }
                }
            }
        }

        return null;
    };

    // Get all date columns from API config
    const dateColumnsFromApi = useMemo(() => {
        const dateCols = allColumnsFromApi.filter(col => col.type === 'date');
        console.log('Date columns for filtering:', dateCols.map(c => c.key));
        return dateCols;
    }, [allColumnsFromApi]);

    // Check if a sale has any date field within the date range
    const isWithinDateRange = useCallback((sale) => {
        // If no date range applied, include all records
        if (!appliedDateRange.startDate && !appliedDateRange.endDate) {
            return true;
        }

        const startDate = appliedDateRange.startDate ? new Date(appliedDateRange.startDate) : null;
        const endDate = appliedDateRange.endDate ? new Date(appliedDateRange.endDate) : null;

        // Set start date to beginning of day
        if (startDate) {
            startDate.setHours(0, 0, 0, 0);
        }

        // Set end date to end of day
        if (endDate) {
            endDate.setHours(23, 59, 59, 999);
        }

        // Check all date columns from API config
        for (const col of dateColumnsFromApi) {
            const dateValue = getSaleValue(sale, col.key);
            
            if (!dateValue) continue;

            const saleDate = parseDate(dateValue);
            
            if (!saleDate) continue;

            // Normalize sale date to compare just the date part
            const saleDateNormalized = new Date(saleDate);
            saleDateNormalized.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

            const afterStart = !startDate || saleDateNormalized >= startDate;
            const beforeEnd = !endDate || saleDateNormalized <= endDate;

            // If ANY date column is within range, include this record
            if (afterStart && beforeEnd) {
                console.log(`Match found for ${col.key}:`, {
                    value: dateValue,
                    parsed: saleDate,
                    startDate,
                    endDate
                });
                return true;
            }
        }

        // No matching date found in any date column
        return false;
    }, [appliedDateRange, dateColumnsFromApi]);

    // Handle policy download
    const handlePolicyDownload = async (sale) => {
        const coCode = getCoCode(sale).toString().toUpperCase().trim();
        const policyNo = getPolicyNo(sale)
            .toString()
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]/g, '');
        
        const saleId = sale.id || `${coCode}-${policyNo}`;

        if (!coCode || !policyNo) {
            setPolicyStatus(prev => ({ ...prev, [saleId]: 'unavailable' }));
            return;
        }

        try {
            const token = await currentUser.getIdToken();
            const response = await fetch(
                `${config.baseURL}${config.endpoints.policy.download}/${coCode}/${policyNo}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `policy_${policyNo}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                setPolicyStatus(prev => ({ ...prev, [saleId]: 'available' }));
            } else {
                setPolicyStatus(prev => ({ ...prev, [saleId]: 'unavailable' }));
            }
        } catch (err) {
            console.error('Error downloading policy:', err);
            setPolicyStatus(prev => ({ ...prev, [saleId]: 'unavailable' }));
        }
    };

    // Render policy download button
    const renderPolicyButton = (sale) => {
        const saleId = sale.id || `${getCoCode(sale)}-${getPolicyNo(sale)}`;
        const status = policyStatus[saleId];
        const policyNo = getPolicyNo(sale);

        if (!policyNo) {
            return <span className="policy-unavailable">No Policy No.</span>;
        }

        if (status === 'unavailable') {
            return (
                <span className="policy-unavailable">
                    <FaTimesCircle /> Not Available
                </span>
            );
        }

        return (
            <button 
                className="policy-download-btn"
                onClick={() => handlePolicyDownload(sale)}
                title="Download Policy Copy"
            >
                <FaFileAlt /> View
            </button>
        );
    };

    // Handle date range input change
    const handleDateRangeChange = (field, value) => {
        setDateRangeInput(prev => ({ ...prev, [field]: value }));
    };

    // Apply date range filter
    const applyDateRange = () => {
        console.log('Applying date range:', dateRangeInput);
        setAppliedDateRange({ ...dateRangeInput });
    };

    // Clear date range
    const clearDateRange = () => {
        setDateRangeInput({ startDate: '', endDate: '' });
        setAppliedDateRange({ startDate: '', endDate: '' });
    };

    // Check if date range has pending changes
    const hasDateRangeChanges = () => {
        return (dateRangeInput.startDate !== appliedDateRange.startDate || 
                dateRangeInput.endDate !== appliedDateRange.endDate) &&
               (dateRangeInput.startDate || dateRangeInput.endDate);
    };

    useEffect(() => {
        fetchColumnConfig();
    }, [fetchColumnConfig]);

    useEffect(() => {
        if (!columnsLoading) {
            fetchAllSales();
        }
    }, [columnsLoading]);

    const fetchAllSales = async () => {
        setLoading(true);
        setError('');
        setPolicyStatus({});
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
                if (data.sales.length > 0) {
                    console.log('Sample sale keys:', Object.keys(data.sales[0]));
                    console.log('Sample sale data:', data.sales[0]);
                    
                    // Log date values for debugging
                    dateColumnsFromApi.forEach(col => {
                        const val = getSaleValue(data.sales[0], col.key);
                        console.log(`Date column "${col.key}" value:`, val, 'parsed:', parseDate(val));
                    });
                }
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

    // Get unique values for a column (for filtering)
    const getUniqueValues = (columnKey) => {
        const values = new Set();
        salesData.forEach(sale => {
            const val = getSaleValue(sale, columnKey);
            if (val !== null && val !== undefined && val !== '') {
                values.add(val);
            }
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
        clearDateRange();
    };

    // Process data with search, filter, date range, and sort
    const processedData = useMemo(() => {
        let result = [...salesData];

        console.log('Processing data:', {
            total: result.length,
            appliedDateRange,
            dateColumnsCount: dateColumnsFromApi.length
        });

        // Apply search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(sale =>
                Object.values(sale).some(val =>
                    String(val).toLowerCase().includes(term)
                )
            );
        }

        // Apply date range filter
        if (appliedDateRange.startDate || appliedDateRange.endDate) {
            const beforeCount = result.length;
            result = result.filter(sale => isWithinDateRange(sale));
            console.log(`Date filter: ${beforeCount} -> ${result.length} records`);
        }

        // Apply column filters
        Object.entries(filters).forEach(([key, value]) => {
            result = result.filter(sale => {
                const saleVal = getSaleValue(sale, key);
                return String(saleVal) === String(value);
            });
        });

        // Apply sort
        if (sortConfig.key) {
            const col = columnsConfig.find(c => c.key === sortConfig.key);
            
            result.sort((a, b) => {
                let aVal = getSaleValue(a, sortConfig.key);
                let bVal = getSaleValue(b, sortConfig.key);

                if (aVal === null || aVal === undefined || aVal === '') {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                if (bVal === null || bVal === undefined || bVal === '') {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }

                if (col?.type === 'number' || col?.type === 'currency') {
                    aVal = Number(aVal) || 0;
                    bVal = Number(bVal) || 0;
                    return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
                }

                if (col?.type === 'date') {
                    const dateA = parseDate(aVal);
                    const dateB = parseDate(bVal);
                    const timeA = dateA ? dateA.getTime() : 0;
                    const timeB = dateB ? dateB.getTime() : 0;
                    return sortConfig.direction === 'asc' ? timeA - timeB : timeB - timeA;
                }

                const strA = String(aVal).toLowerCase();
                const strB = String(bVal).toLowerCase();
                
                if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [salesData, searchTerm, filters, sortConfig, columnsConfig, appliedDateRange, isWithinDateRange, dateColumnsFromApi]);

    // Calculate summary statistics
    const summaryStats = useMemo(() => {
        const numericColumns = columnsConfig.filter(c => c.type === 'number' || c.type === 'currency');
        const stats = {};

        numericColumns.forEach(col => {
            const values = processedData
                .map(sale => Number(getSaleValue(sale, col.key)) || 0)
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
    }, [processedData, columnsConfig]);

    // Export to CSV
    const exportToCSV = () => {
        const headers = columnsConfig.map(c => c.header).join(',');
        const rows = processedData.map(sale =>
            columnsConfig.map(col => {
                let val = getSaleValue(sale, col.key) || '';
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

    if (loading || columnsLoading) {
        return (
            <div className="sales-container">
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>{columnsLoading ? 'Loading configuration...' : 'Loading sales data...'}</p>
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

    const numericColumns = columnsConfig.filter(c => c.type === 'number' || c.type === 'currency');
    const hasActiveFilters = Object.keys(filters).length > 0 || appliedDateRange.startDate || appliedDateRange.endDate;
    const isDateRangeApplied = appliedDateRange.startDate || appliedDateRange.endDate;

    return (
        <div className="sales-container">
            <div className="sales-header">
                <h1>Sales Data</h1>
                <div className="header-actions">
                    <span className="sales-count">
                        {processedData.length} of {salesData.length} records
                    </span>
                    {numericColumns.length > 0 && (
                        <button onClick={() => setShowCalculator(!showCalculator)} className="calc-btn">
                            <FaCalculator /> Summary
                        </button>
                    )}
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

                {/* Date Range Filter */}
                <div className={`date-range-filter ${isDateRangeApplied ? 'applied' : ''}`}>
                    <FaCalendarAlt className="date-icon" />
                    <div className="date-inputs">
                        <div className="date-input-group">
                            <label>From:</label>
                            <input
                                type="date"
                                value={dateRangeInput.startDate}
                                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                            />
                        </div>
                        <div className="date-input-group">
                            <label>To:</label>
                            <input
                                type="date"
                                value={dateRangeInput.endDate}
                                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="date-actions">
                        <button 
                            className={`apply-date-btn ${hasDateRangeChanges() ? 'pending' : ''}`}
                            onClick={applyDateRange}
                            title="Apply date filter"
                            disabled={!dateRangeInput.startDate && !dateRangeInput.endDate}
                        >
                            <FaCheck /> Apply
                        </button>
                        {(dateRangeInput.startDate || dateRangeInput.endDate || isDateRangeApplied) && (
                            <button 
                                className="clear-date-btn" 
                                onClick={clearDateRange} 
                                title="Clear date range"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
                <div className="active-filters">
                    {isDateRangeApplied && (
                        <span className="filter-tag date-filter-tag">
                            <FaCalendarAlt />
                            <span className="filter-text">
                                {appliedDateRange.startDate && appliedDateRange.endDate 
                                    ? `${new Date(appliedDateRange.startDate).toLocaleDateString('en-IN')} - ${new Date(appliedDateRange.endDate).toLocaleDateString('en-IN')}`
                                    : appliedDateRange.startDate 
                                        ? `From ${new Date(appliedDateRange.startDate).toLocaleDateString('en-IN')}`
                                        : `Until ${new Date(appliedDateRange.endDate).toLocaleDateString('en-IN')}`
                                }
                            </span>
                            <FaTimes onClick={clearDateRange} className="remove-filter" />
                        </span>
                    )}
                    {Object.entries(filters).map(([key, value]) => (
                        <span key={key} className="filter-tag">
                            <span className="filter-text">
                                {columnsConfig.find(c => c.key === key)?.header}: {value}
                            </span>
                            <FaTimes onClick={() => handleFilter(key, '')} className="remove-filter" />
                        </span>
                    ))}
                    <button className="clear-filters-btn" onClick={clearFilters}>
                        Clear All
                    </button>
                </div>
            )}

            {/* Summary Statistics */}
            {showCalculator && numericColumns.length > 0 && (
                <div className="summary-panel">
                    <h3>Summary Statistics</h3>
                    <div className="summary-grid">
                        {numericColumns.map(col => (
                            <div key={col.key} className="summary-card">
                                <h4>{col.header}</h4>
                                <div className="stat-row">
                                    <span>Sum:</span>
                                    <strong>{formatValue(summaryStats[col.key]?.sum, col.type)}</strong>
                                </div>
                                <div className="stat-row">
                                    <span>Average:</span>
                                    <strong>{formatValue(summaryStats[col.key]?.avg, col.type)}</strong>
                                </div>
                                <div className="stat-row">
                                    <span>Min:</span>
                                    <strong>{formatValue(summaryStats[col.key]?.min, col.type)}</strong>
                                </div>
                                <div className="stat-row">
                                    <span>Max:</span>
                                    <strong>{formatValue(summaryStats[col.key]?.max, col.type)}</strong>
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
                                {columnsConfig.map(col => (
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

                                        {activeFilterColumn === col.key && (
                                            <div className="filter-dropdown">
                                                <select 
                                                    value={filters[col.key] || ''}
                                                    onChange={(e) => handleFilter(col.key, e.target.value)}
                                                >
                                                    <option value="">All</option>
                                                    {getUniqueValues(col.key).map((val) => (
                                                        <option key={val} value={val}>
                                                            {formatValue(val, col.type, col.casing)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </th>
                                ))}
                                <th style={{ minWidth: '120px' }}>
                                    <div className="th-content">
                                        <span className="th-label">Policy Copy</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {processedData.map((sale, rowIdx) => (
                                <tr key={sale.id || rowIdx}>
                                    {columnsConfig.map(col => (
                                        <td key={col.key}>
                                            {formatValue(getSaleValue(sale, col.key), col.type, col.casing)}
                                        </td>
                                    ))}
                                    <td className="policy-copy-cell">
                                        {renderPolicyButton(sale)}
                                    </td>
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