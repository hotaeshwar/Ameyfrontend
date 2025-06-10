import React, { useState, useEffect } from 'react';

// API Base URL Configuration
const API_BASE = 'https://api.ameyaaccountsonline.info';

const Travel = () => {
  const [user, setUser] = useState(null);
  const [travelEntries, setTravelEntries] = useState([]);
  const [locations, setLocations] = useState({ states: [], cities: {}, locations: {} });
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMode, setFilterMode] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('view'); // 'view' or 'add' for admin

  // Form data for adding new travel
  const [formData, setFormData] = useState({
    travel_mode: 'Two Wheeler',
    from_state: '',
    from_city: '',
    from_location: '',
    to_state: '',
    to_city: '',
    to_location: '',
    ticket_price: '',
    from_station: '',
    to_station: '',
    ticket_scan: null
  });

  // Get user from localStorage
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_role');
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          username: payload.sub,
          role: userRole || payload.role || 'guest'
        });
      } catch (error) {
        console.error('Token invalid:', error);
      }
    }
  }, []);

  // Fetch locations data
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${API_BASE}/locations`);
        const data = await response.json();
        
        if (data.success) {
          const states = data.data.map(state => state.name);
          const cities = {};
          const locations = {};
          
          data.data.forEach(state => {
            cities[state.name] = state.cities.map(city => city.name);
            state.cities.forEach(city => {
              locations[`${state.name}-${city.name}`] = city.locations.map(loc => loc.name);
            });
          });
          
          setLocations({ states, cities, locations });
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, []);

  // Fetch travel entries
  useEffect(() => {
    if (user) {
      fetchTravelEntries();
    }
  }, [user]);

  const fetchTravelEntries = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const endpoint = user.role === 'admin' ? '/travel/all' : '/travel/my';
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setTravelEntries(data.data || []);
      } else {
        console.error('Failed to fetch travel entries:', data.message);
        setErrors({ general: data.message || 'Failed to fetch travel entries' });
      }
    } catch (error) {
      console.error('Error fetching travel entries:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset dependent dropdowns
    if (name === 'from_state') {
      setFormData(prev => ({ ...prev, from_city: '', from_location: '' }));
    } else if (name === 'from_city') {
      setFormData(prev => ({ ...prev, from_location: '' }));
    } else if (name === 'to_state') {
      setFormData(prev => ({ ...prev, to_city: '', to_location: '' }));
    } else if (name === 'to_city') {
      setFormData(prev => ({ ...prev, to_location: '' }));
    }

    // Clear errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, ticket_scan: file }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const isPublicTransport = ['Bus', 'Train', 'Flight'].includes(formData.travel_mode);

    if (!isPublicTransport) {
      if (!formData.from_state) newErrors.from_state = 'From state is required';
      if (!formData.from_city) newErrors.from_city = 'From city is required';
      if (!formData.from_location) newErrors.from_location = 'From location is required';
      if (!formData.to_state) newErrors.to_state = 'To state is required';
      if (!formData.to_city) newErrors.to_city = 'To city is required';
      if (!formData.to_location) newErrors.to_location = 'To location is required';
    } else {
      if (!formData.ticket_price || formData.ticket_price <= 0) {
        newErrors.ticket_price = 'Valid ticket price is required';
      }
      if (!formData.from_station) newErrors.from_station = 'From station is required';
      if (!formData.to_station) newErrors.to_station = 'To station is required';
    }

    return newErrors;
  };

  // Submit travel form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem('access_token');
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch(`${API_BASE}/travel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage(data.message || 'Travel entry created successfully!');
        setFormData({
          travel_mode: 'Two Wheeler',
          from_state: '',
          from_city: '',
          from_location: '',
          to_state: '',
          to_city: '',
          to_location: '',
          ticket_price: '',
          from_station: '',
          to_station: '',
          ticket_scan: null
        });
        
        // For admin, switch back to view tab after successful submission
        if (user.role === 'admin') {
          setActiveTab('view');
        } else {
          setShowAddForm(false);
        }
        
        fetchTravelEntries();
        
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrors({ general: data.message || 'Failed to create travel entry' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle admin approval/rejection
  const handleApproval = async (travelId, status, rejectionReason = '') => {
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('status', status);
      if (rejectionReason) {
        formData.append('rejection_reason', rejectionReason);
      }

      const response = await fetch(`${API_BASE}/travel/update-status/${travelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage(`Travel entry ${status.toLowerCase()} successfully!`);
        fetchTravelEntries();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrors({ general: data.message || 'Failed to update status' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    }
  };

  // Generate PDF content using jsPDF (Client-side PDF generation)
  const downloadPDF = () => {
    try {
      // Import jsPDF dynamically
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        
        // Add title
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text('Travel Expense Report', 20, 30);
        
        // Add date
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${currentDate.toLocaleDateString()}`, 20, 45);
        
        // Add summary
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text('Summary:', 20, 65);
        
        doc.setFontSize(11);
        doc.text(`Total Entries: ${filteredEntries.length}`, 30, 75);
        doc.text(`Approved: ${filteredEntries.filter(e => e.status === 'Approved').length}`, 30, 85);
        doc.text(`Pending: ${filteredEntries.filter(e => e.status === 'Pending' || !e.status).length}`, 30, 95);
        doc.text(`Total Amount: ₹${filteredEntries.reduce((sum, e) => sum + (Number(e.calculated_amount) || 0), 0).toFixed(2)}`, 30, 105);
        
        // Add table headers
        let yPosition = 125;
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
        doc.text('ID', 20, yPosition);
        doc.text('Mode', 45, yPosition);
        doc.text('From', 75, yPosition);
        doc.text('To', 120, yPosition);
        doc.text('Amount', 160, yPosition);
        doc.text('Status', 185, yPosition);
        
        // Add line under headers
        doc.line(20, yPosition + 2, 200, yPosition + 2);
        yPosition += 10;
        
        // Add data rows
        filteredEntries.slice(0, 25).forEach((entry, index) => { // Limit to 25 entries to fit on page
          if (yPosition > 270) { // Check if we need a new page
            doc.addPage();
            yPosition = 30;
          }
          
          doc.setFontSize(9);
          doc.text(entry.travel_id || '', 20, yPosition);
          doc.text(entry.travel_mode || '', 45, yPosition);
          
          const fromText = ['Bus', 'Train', 'Flight'].includes(entry.travel_mode) 
            ? (entry.from_station || '').substring(0, 15)
            : `${entry.from_city || ''}`.substring(0, 15);
          doc.text(fromText, 75, yPosition);
          
          const toText = ['Bus', 'Train', 'Flight'].includes(entry.travel_mode)
            ? (entry.to_station || '').substring(0, 15)
            : `${entry.to_city || ''}`.substring(0, 15);
          doc.text(toText, 120, yPosition);
          
          doc.text(`₹${Number(entry.calculated_amount || 0).toFixed(2)}`, 160, yPosition);
          doc.text(entry.status || 'Pending', 185, yPosition);
          
          yPosition += 8;
        });
        
        if (filteredEntries.length > 25) {
          doc.text(`... and ${filteredEntries.length - 25} more entries`, 20, yPosition + 10);
        }
        
        // Save the PDF
        doc.save(`travel-report-${year}-${month.toString().padStart(2, '0')}.pdf`);
        
        setSuccessMessage('PDF report downloaded successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      };
      
      script.onerror = () => {
        setErrors({ general: 'Failed to load PDF library. Please try again.' });
      };
      
      document.head.appendChild(script);
    } catch (error) {
      setErrors({ general: 'Error downloading PDF report' });
    }
  };

  // Handle view ticket - show ticket if exists, or show message if not uploaded
  const handleViewTicket = async (entry) => {
    try {
      const token = localStorage.getItem('access_token');
      
      // First check if the ticket exists by making a HEAD request or checking the response
      const response = await fetch(`${API_BASE}/travel/ticket/${entry.travel_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // If response is successful, it means the ticket image exists
        // Create a blob URL to display the image with proper authorization
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        
        const newWindow = window.open('', '_blank');
        
        // Create a proper image viewer in the new window
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Ticket - ${entry.travel_id}</title>
              <style>
                body {
                  margin: 0;
                  padding: 20px;
                  background-color: #f5f5f5;
                  font-family: Arial, sans-serif;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                }
                .header {
                  background: white;
                  padding: 15px 30px;
                  border-radius: 10px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                  margin-bottom: 20px;
                  text-align: center;
                  width: 100%;
                  max-width: 800px;
                  box-sizing: border-box;
                }
                .header h1 {
                  margin: 0;
                  color: #333;
                  font-size: 24px;
                }
                .header p {
                  margin: 5px 0 0 0;
                  color: #666;
                  font-size: 14px;
                }
                .image-container {
                  background: white;
                  padding: 20px;
                  border-radius: 10px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                  max-width: 90vw;
                  max-height: 80vh;
                  overflow: auto;
                  text-align: center;
                }
                img {
                  max-width: 100%;
                  height: auto;
                  border-radius: 5px;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                }
                .download-btn {
                  background: #3b82f6;
                  color: white;
                  border: none;
                  padding: 10px 20px;
                  border-radius: 6px;
                  cursor: pointer;
                  font-size: 14px;
                  margin-top: 10px;
                  text-decoration: none;
                  display: inline-block;
                }
                .download-btn:hover {
                  background: #2563eb;
                }
                .close-btn {
                  background: #6b7280;
                  color: white;
                  border: none;
                  padding: 10px 20px;
                  border-radius: 6px;
                  cursor: pointer;
                  font-size: 14px;
                  margin-left: 10px;
                  text-decoration: none;
                  display: inline-block;
                }
                .close-btn:hover {
                  background: #4b5563;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>🎫 Travel Ticket</h1>
                <p><strong>Travel ID:</strong> ${entry.travel_id} | <strong>Mode:</strong> ${entry.travel_mode}</p>
                <p><strong>Route:</strong> ${
                  ['Bus', 'Train', 'Flight'].includes(entry.travel_mode) 
                    ? `${entry.from_station || 'N/A'} → ${entry.to_station || 'N/A'}`
                    : `${entry.from_location || 'N/A'}, ${entry.from_city || 'N/A'} → ${entry.to_location || 'N/A'}, ${entry.to_city || 'N/A'}`
                }</p>
                <button onclick="downloadImage()" class="download-btn">
                  📥 Download Ticket
                </button>
                <button onclick="window.close()" class="close-btn">
                  ✕ Close
                </button>
              </div>
              <div class="image-container">
                <img src="${imageUrl}" alt="Travel Ticket" onload="console.log('Image loaded successfully')" onerror="console.error('Failed to load image')" />
              </div>
              <script>
                function downloadImage() {
                  const link = document.createElement('a');
                  link.href = '${imageUrl}';
                  link.download = 'ticket_${entry.travel_id}';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
                
                // Clean up the blob URL when window is closed
                window.addEventListener('beforeunload', function() {
                  URL.revokeObjectURL('${imageUrl}');
                });
              </script>
            </body>
          </html>
        `);
        newWindow.document.close();
        
        // Clean up the blob URL after a delay to ensure the image loads
        setTimeout(() => {
          URL.revokeObjectURL(imageUrl);
        }, 10000);
        
      } else {
        // Handle different error responses
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          
          if (response.status === 404) {
            alert('📷 No ticket scan has been uploaded for this travel entry.');
          } else if (response.status === 403) {
            alert('🔒 You are not authorized to view this ticket.');
          } else if (response.status === 401) {
            alert('🔐 Authentication required. Please log in again.');
            // Optionally redirect to login or refresh token
          } else {
            alert(`❌ Error: ${errorData.message || 'Failed to load ticket'}`);
          }
        } else {
          if (response.status === 401) {
            alert('🔐 Authentication required. Please log in again.');
          } else {
            alert(`❌ Error: Failed to load ticket (Status: ${response.status})`);
          }
        }
      }
    } catch (error) {
      console.error('Error viewing ticket:', error);
      alert('🌐 Network error: Unable to load ticket. Please check your connection and try again.');
    }
  };

  // Filter and search travel entries
  const filteredEntries = travelEntries.filter(entry => {
    const matchesStatus = filterStatus === 'all' || entry.status?.toLowerCase() === filterStatus.toLowerCase();
    const matchesMode = filterMode === 'all' || entry.travel_mode === filterMode;
    const matchesSearch = searchTerm === '' || 
      entry.travel_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.travel_mode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesMode && matchesSearch;
  });

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'text-emerald-700 bg-emerald-100 border-emerald-200';
      case 'rejected': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-amber-700 bg-amber-100 border-amber-200';
    }
  };

  // Get travel mode icon with FontAwesome
  const getTravelModeIcon = (mode) => {
    switch (mode) {
      case 'Two Wheeler':
        return <i className="fas fa-motorcycle text-blue-600"></i>;
      case 'Four Wheeler':
        return <i className="fas fa-car text-blue-600"></i>;
      case 'Bus':
        return <i className="fas fa-bus text-blue-600"></i>;
      case 'Train':
        return <i className="fas fa-train text-blue-600"></i>;
      case 'Flight':
        return <i className="fas fa-plane text-blue-600"></i>;
      default:
        return <i className="fas fa-circle text-blue-600"></i>;
    }
  };

  // Travel mode tabs with SVG icons
  const travelModes = [
    { 
      key: 'all', 
      label: 'All', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
        </svg>
      )
    },
    { 
      key: 'Two Wheeler', 
      label: 'Two Wheeler', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 18c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm0-4c-.6 0-1 .4-1 1s.4 1 1 1 1-.4 1-1-.4-1-1-1zm14 4c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm0-4c-.6 0-1 .4-1 1s.4 1 1 1 1-.4 1-1-.4-1-1-1zM7.8 13H16l-3-6H9.5L8.8 5H6V3h4l1 2h4l4 8h-2.2c-.4-1.8-2-3-3.8-3s-3.4 1.2-3.8 3H7.8c-.4-1.8-2-3-3.8-3s-3.4 1.2-3.8 3H2l2-4h1.8z"/>
        </svg>
      )
    },
    { 
      key: 'Four Wheeler', 
      label: 'Four Wheeler', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      )
    },
    { 
      key: 'Bus', 
      label: 'Bus', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
        </svg>
      )
    },
    { 
      key: 'Train', 
      label: 'Train', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 15.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V5c0-3.5-3.58-4-8-4s-8 .5-8 4v10.5zm8 1.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-6-7h12v3H6V10zm0-5h12v2H6V5z"/>
        </svg>
      )
    },
    { 
      key: 'Flight', 
      label: 'Flight', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      )
    }
  ];

  // Render travel form
  const renderTravelForm = () => (
    <div className="space-y-8">
      {/* Travel Mode Selection */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <label className="block text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <i className="fas fa-route mr-2 text-blue-600"></i>
          Select Travel Mode
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {['Two Wheeler', 'Four Wheeler', 'Bus', 'Train', 'Flight'].map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, travel_mode: mode }))}
              className={`p-4 border-2 rounded-xl text-sm font-medium transition-all duration-300 flex flex-col items-center justify-center space-y-2 hover:scale-105 hover:shadow-lg ${
                formData.travel_mode === mode
                  ? 'border-blue-500 bg-blue-500 text-white shadow-lg transform scale-105'
                  : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <div className="text-2xl">
                {getTravelModeIcon(mode)}
              </div>
              <span className="text-xs font-medium">{mode}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conditional Fields based on Travel Mode */}
      {!['Bus', 'Train', 'Flight'].includes(formData.travel_mode) ? (
        /* Personal Vehicle Form */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* From Location */}
          <div className="bg-green-50 rounded-xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-green-800 flex items-center">
              <i className="fas fa-map-marker-alt mr-2"></i>
              From Location
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <select
                name="from_state"
                value={formData.from_state}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                  errors.from_state ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select State</option>
                {locations.states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.from_state && <p className="text-red-600 text-xs mt-1">{errors.from_state}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <select
                name="from_city"
                value={formData.from_city}
                onChange={handleInputChange}
                disabled={!formData.from_state}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                  errors.from_city ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select City</option>
                {formData.from_state && locations.cities[formData.from_state]?.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {errors.from_city && <p className="text-red-600 text-xs mt-1">{errors.from_city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                name="from_location"
                value={formData.from_location}
                onChange={handleInputChange}
                disabled={!formData.from_city}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                  errors.from_location ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Location</option>
                {formData.from_state && formData.from_city && 
                  locations.locations[`${formData.from_state}-${formData.from_city}`]?.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))
                }
              </select>
              {errors.from_location && <p className="text-red-600 text-xs mt-1">{errors.from_location}</p>}
            </div>
          </div>

          {/* To Location */}
          <div className="bg-red-50 rounded-xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-red-800 flex items-center">
              <i className="fas fa-flag-checkered mr-2"></i>
              To Location
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <select
                name="to_state"
                value={formData.to_state}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                  errors.to_state ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select State</option>
                {locations.states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.to_state && <p className="text-red-600 text-xs mt-1">{errors.to_state}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <select
                name="to_city"
                value={formData.to_city}
                onChange={handleInputChange}
                disabled={!formData.to_state}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                  errors.to_city ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select City</option>
                {formData.to_state && locations.cities[formData.to_state]?.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {errors.to_city && <p className="text-red-600 text-xs mt-1">{errors.to_city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                name="to_location"
                value={formData.to_location}
                onChange={handleInputChange}
                disabled={!formData.to_city}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                  errors.to_location ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Location</option>
                {formData.to_state && formData.to_city && 
                  locations.locations[`${formData.to_state}-${formData.to_city}`]?.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))
                }
              </select>
              {errors.to_location && <p className="text-red-600 text-xs mt-1">{errors.to_location}</p>}
            </div>
          </div>
        </div>
      ) : (
        /* Public Transport Form */
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-6 flex items-center">
            <i className="fas fa-ticket-alt mr-2"></i>
            Travel Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Station</label>
              <input
                type="text"
                name="from_station"
                value={formData.from_station}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                  errors.from_station ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter departure station"
              />
              {errors.from_station && <p className="text-red-600 text-xs mt-1">{errors.from_station}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Station</label>
              <input
                type="text"
                name="to_station"
                value={formData.to_station}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                  errors.to_station ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter arrival station"
              />
              {errors.to_station && <p className="text-red-600 text-xs mt-1">{errors.to_station}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ticket Price (₹)</label>
              <input
                type="number"
                name="ticket_price"
                value={formData.ticket_price}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                  errors.ticket_price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter ticket price"
                min="0"
                step="0.01"
              />
              {errors.ticket_price && <p className="text-red-600 text-xs mt-1">{errors.ticket_price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ticket Scan</label>
              <input
                type="file"
                onChange={handleFileUpload}
                accept="image/*"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
              <p className="text-xs text-gray-500 mt-1">Upload ticket image for verification</p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitLoading}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {submitLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </>
          ) : (
            <>
              <i className="fas fa-plus-circle mr-2"></i>
              Create Travel Entry
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            if (user?.role === 'admin') {
              setActiveTab('view');
            } else {
              setShowAddForm(false);
            }
          }}
          className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-400 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <i className="fas fa-times-circle mr-2"></i>
          Cancel
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="animate-spin h-16 w-16 text-blue-500 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600 font-medium">Loading travel entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center">
              <i className="fas fa-map-marked-alt mr-4 text-blue-600"></i>
              Travel Management
            </h1>
            <p className="text-gray-600 text-lg">
              {user?.role === 'admin' 
                ? 'Manage travel entries, approve submissions, and add your own travel records'
                : 'Track your travel expenses and view approval status'
              }
            </p>
          </div>
        </div>

        {/* Summary Cards - Moved to top */}
        {filteredEntries.length > 0 && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <i className="fas fa-check-circle text-white text-xl"></i>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-bold text-gray-500 truncate uppercase tracking-wider">
                      Approved Entries
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {filteredEntries.filter(e => e.status === 'Approved').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                    <i className="fas fa-clock text-white text-xl"></i>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-bold text-gray-500 truncate uppercase tracking-wider">
                      Pending Entries
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {filteredEntries.filter(e => e.status === 'Pending' || !e.status).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <i className="fas fa-rupee-sign text-white text-xl"></i>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-bold text-gray-500 truncate uppercase tracking-wider">
                      Total Amount
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      ₹{filteredEntries.reduce((sum, e) => sum + (Number(e.calculated_amount) || 0), 0).toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-emerald-50 border-2 border-emerald-200 text-emerald-700 px-6 py-4 rounded-xl flex items-center shadow-lg">
            <i className="fas fa-check-circle mr-3 text-xl"></i>
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center shadow-lg">
            <i className="fas fa-exclamation-triangle mr-3 text-xl"></i>
            <span className="font-medium">{errors.general}</span>
          </div>
        )}

        {/* Admin Tab Navigation */}
        {user?.role === 'admin' && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('view')}
                  className={`flex-1 py-4 px-6 font-semibold text-sm transition-all duration-300 flex items-center justify-center ${
                    activeTab === 'view'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <i className="fas fa-eye mr-2"></i>
                  View & Manage Travel
                </button>
                <button
                  onClick={() => setActiveTab('add')}
                  className={`flex-1 py-4 px-6 font-semibold text-sm transition-all duration-300 flex items-center justify-center ${
                    activeTab === 'add'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add My Travel
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Admin Add Travel Form */}
        {user?.role === 'admin' && activeTab === 'add' && (
          <div className="mb-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <i className="fas fa-user-tie mr-3 text-blue-600"></i>
                Add Your Travel Entry
              </h2>
              <div className="bg-blue-100 border-2 border-blue-300 text-blue-800 px-4 py-2 rounded-full text-sm font-bold flex items-center">
                <i className="fas fa-crown mr-2"></i>
                Auto-Approved
              </div>
            </div>
            <p className="text-gray-600 mb-8 text-lg">
              As an admin, your travel entries will be automatically approved upon submission.
            </p>
            {renderTravelForm()}
          </div>
        )}

        {/* View Travel Section */}
        {(user?.role !== 'admin' || activeTab === 'view') && (
          <>
            {/* Controls */}
            <div className="mb-8 bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                {/* Add New Travel Button (Guest only) */}
                {user?.role !== 'admin' && (
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <i className="fas fa-plus-circle mr-2"></i>
                    Add New Travel
                  </button>
                )}

                {/* Download PDF Button */}
                {user?.role === 'admin' && (
                  <button
                    onClick={downloadPDF}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 flex items-center font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <i className="fas fa-file-pdf mr-2"></i>
                    Download PDF Report
                  </button>
                )}

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:max-w-2xl">
                  <input
                    type="text"
                    placeholder="🔍 Search by ID, mode, or user..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-medium"
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-medium min-w-0 sm:min-w-[140px]"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Travel Mode Filter Tabs */}
            <div className="mb-8">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="flex flex-wrap">
                  {travelModes.map(mode => (
                    <button
                      key={mode.key}
                      onClick={() => setFilterMode(mode.key)}
                      className={`flex-1 min-w-[120px] py-4 px-4 font-semibold text-sm transition-all duration-300 flex items-center justify-center hover:bg-blue-50 ${
                        filterMode === mode.key
                          ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                          : 'text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      <span className="mr-2">{mode.icon}</span>
                      <span className="hidden sm:inline">{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Guest User Add Travel Form */}
            {showAddForm && user?.role !== 'admin' && (
              <div className="mb-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                  <i className="fas fa-plus-circle mr-3 text-green-600"></i>
                  Add New Travel Entry
                </h2>
                {renderTravelForm()}
              </div>
            )}

            {/* Travel Entries List */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
              <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <i className="fas fa-list mr-3 text-blue-600"></i>
                  Travel Entries ({filteredEntries.length})
                </h2>
              </div>

              {filteredEntries.length === 0 ? (
                <div className="p-12 text-center">
                  <i className="fas fa-folder-open text-6xl text-gray-400 mb-6"></i>
                  <p className="text-gray-500 text-xl mb-3 font-semibold">No travel entries found</p>
                  <p className="text-gray-400 text-lg">
                    {user?.role === 'admin' 
                      ? 'No travel entries have been submitted yet.'
                      : 'Start by adding your first travel entry.'
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {/* Desktop/Tablet View */}
                  <div className="hidden lg:block">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-100 to-blue-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <i className="fas fa-info-circle mr-2"></i>Travel Details
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <i className="fas fa-route mr-2"></i>Route/Stations
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <i className="fas fa-rupee-sign mr-2"></i>Amount
                          </th>
                          {user?.role === 'admin' && (
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              <i className="fas fa-user mr-2"></i>User
                            </th>
                          )}
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <i className="fas fa-flag mr-2"></i>Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <i className="fas fa-cogs mr-2"></i>Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredEntries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-blue-50 transition-all duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-lg">
                                  {getTravelModeIcon(entry.travel_mode)}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-bold text-gray-900">
                                    {entry.travel_id}
                                  </div>
                                  <div className="text-sm text-gray-600 font-medium">
                                    {entry.travel_mode}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    <i className="fas fa-calendar-alt mr-1"></i>
                                    {entry.date_created ? new Date(entry.date_created).toLocaleDateString() : 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {['Bus', 'Train', 'Flight'].includes(entry.travel_mode) ? (
                                  <>
                                    <div className="font-semibold text-green-700">
                                      <i className="fas fa-map-marker-alt mr-1"></i>
                                      {entry.from_station || 'N/A'}
                                    </div>
                                    <div className="text-gray-500 text-center my-1">
                                      <i className="fas fa-arrow-down"></i>
                                    </div>
                                    <div className="font-semibold text-red-700">
                                      <i className="fas fa-flag-checkered mr-1"></i>
                                      {entry.to_station || 'N/A'}
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="font-semibold text-green-700">
                                      <i className="fas fa-map-marker-alt mr-1"></i>
                                      {entry.from_location || 'N/A'}, {entry.from_city || 'N/A'}
                                    </div>
                                    <div className="text-gray-500 text-center my-1">
                                      <i className="fas fa-arrow-down"></i>
                                    </div>
                                    <div className="font-semibold text-red-700">
                                      <i className="fas fa-flag-checkered mr-1"></i>
                                      {entry.to_location || 'N/A'}, {entry.to_city || 'N/A'}
                                    </div>
                                    {entry.distance_km && (
                                      <div className="text-xs text-blue-600 mt-1 font-medium">
                                        <i className="fas fa-road mr-1"></i>
                                        {Number(entry.distance_km).toFixed(2)} km
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-lg font-bold text-green-600">
                                ₹{Number(entry.calculated_amount || 0).toFixed(2)}
                              </div>
                              {entry.rate_per_km && (
                                <div className="text-xs text-gray-500">
                                  @ ₹{Number(entry.rate_per_km).toFixed(2)}/km
                                </div>
                              )}
                            </td>
                            {user?.role === 'admin' && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-gray-900">
                                  {entry.username}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center">
                                  <i className="fas fa-user-tag mr-1"></i>
                                  {entry.role}
                                  {entry.role === 'admin' && (
                                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                                      <i className="fas fa-crown mr-1"></i>
                                      Admin
                                    </span>
                                  )}
                                </div>
                              </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap">
                              {/* Hide status for admin entries */}
                              {entry.role === 'admin' ? (
                                <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                  <i className="fas fa-crown mr-1"></i>
                                  Auto-approved
                                </span>
                              ) : (
                                <>
                                  <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(entry.status)}`}>
                                    {entry.status === 'Approved' && <i className="fas fa-check mr-1"></i>}
                                    {entry.status === 'Rejected' && <i className="fas fa-times mr-1"></i>}
                                    {(!entry.status || entry.status === 'Pending') && <i className="fas fa-clock mr-1"></i>}
                                    {entry.status || 'Pending'}
                                  </span>
                                  {entry.status === 'Rejected' && entry.rejection_reason && (
                                    <div className="text-xs text-red-600 mt-1 font-medium">
                                      <i className="fas fa-info-circle mr-1"></i>
                                      {entry.rejection_reason}
                                    </div>
                                  )}
                                </>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                {/* View Ticket button - Show for ALL Bus/Train/Flight entries */}
                                {['Bus', 'Train', 'Flight'].includes(entry.travel_mode) && (
                                  <button
                                    onClick={() => handleViewTicket(entry)}
                                    className="text-blue-600 hover:text-white bg-blue-100 hover:bg-blue-600 px-3 py-2 rounded-lg transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                    title="View Ticket"
                                  >
                                    <i className="fas fa-image"></i>
                                  </button>
                                )}
                                {/* Admin actions - Only for non-admin entries */}
                                {entry.role !== 'admin' && user?.role === 'admin' && entry.status === 'Pending' && (
                                  <>
                                    <button
                                      onClick={() => handleApproval(entry.travel_id, 'Approved')}
                                      className="text-green-600 hover:text-white bg-green-100 hover:bg-green-600 px-3 py-2 rounded-lg transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                      title="Approve"
                                    >
                                      <i className="fas fa-check"></i>
                                    </button>
                                    <button
                                      onClick={() => {
                                        const reason = prompt('Enter rejection reason:');
                                        if (reason) {
                                          handleApproval(entry.travel_id, 'Rejected', reason);
                                        }
                                      }}
                                      className="text-red-600 hover:text-white bg-red-100 hover:bg-red-600 px-3 py-2 rounded-lg transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                      title="Reject"
                                    >
                                      <i className="fas fa-times"></i>
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile/Tablet View */}
                  <div className="lg:hidden">
                    {filteredEntries.map((entry) => (
                      <div key={entry.id} className="p-6 border-b border-gray-200 last:border-b-0 hover:bg-blue-50 transition-all duration-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-4 shadow-lg">
                              {getTravelModeIcon(entry.travel_mode)}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">
                                {entry.travel_id}
                              </div>
                              <div className="text-xs text-gray-500 font-medium">
                                {entry.travel_mode}
                              </div>
                            </div>
                          </div>
                          {/* Hide status for admin entries on mobile */}
                          {entry.role === 'admin' ? (
                            <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                              <i className="fas fa-crown mr-1"></i>
                              Auto
                            </span>
                          ) : (
                            <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(entry.status)}`}>
                              {entry.status === 'Approved' && <i className="fas fa-check mr-1"></i>}
                              {entry.status === 'Rejected' && <i className="fas fa-times mr-1"></i>}
                              {(!entry.status || entry.status === 'Pending') && <i className="fas fa-clock mr-1"></i>}
                              {entry.status || 'Pending'}
                            </span>
                          )}
                        </div>

                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="font-semibold text-gray-700">
                              <i className="fas fa-route mr-1"></i>Route: 
                            </span>
                            {['Bus', 'Train', 'Flight'].includes(entry.travel_mode) ? (
                              <span className="ml-1">{entry.from_station || 'N/A'} → {entry.to_station || 'N/A'}</span>
                            ) : (
                              <span className="ml-1">{entry.from_location || 'N/A'}, {entry.from_city || 'N/A'} → {entry.to_location || 'N/A'}, {entry.to_city || 'N/A'}</span>
                            )}
                          </div>
                          
                          <div>
                            <span className="font-semibold text-gray-700">
                              <i className="fas fa-rupee-sign mr-1"></i>Amount: 
                            </span>
                            <span className="text-green-600 font-bold text-lg ml-1">₹{Number(entry.calculated_amount || 0).toFixed(2)}</span>
                          </div>

                          {user?.role === 'admin' && (
                            <div>
                              <span className="font-semibold text-gray-700">
                                <i className="fas fa-user mr-1"></i>User: 
                              </span>
                              <span className="ml-1">{entry.username} ({entry.role})</span>
                              {entry.role === 'admin' && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                                  <i className="fas fa-crown mr-1"></i>
                                  Admin
                                </span>
                              )}
                            </div>
                          )}

                          <div>
                            <span className="font-semibold text-gray-700">
                              <i className="fas fa-calendar-alt mr-1"></i>Date: 
                            </span>
                            <span className="ml-1">{entry.date_created ? new Date(entry.date_created).toLocaleDateString() : 'N/A'}</span>
                          </div>

                          {entry.status === 'Rejected' && entry.rejection_reason && (
                            <div>
                              <span className="font-semibold text-red-700">
                                <i className="fas fa-info-circle mr-1"></i>Reason: 
                              </span>
                              <span className="text-red-600 ml-1">{entry.rejection_reason}</span>
                            </div>
                          )}
                        </div>

                        {/* Mobile Actions */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {/* View Ticket button - Show for ALL Bus/Train/Flight entries */}
                          {['Bus', 'Train', 'Flight'].includes(entry.travel_mode) && (
                            <button
                              onClick={() => handleViewTicket(entry)}
                              className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-200 transition-all duration-300 flex items-center shadow-md"
                            >
                              <i className="fas fa-image mr-2"></i>
                              View Ticket
                            </button>
                          )}
                          {/* Admin actions - Only for non-admin entries */}
                          {entry.role !== 'admin' && user?.role === 'admin' && entry.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleApproval(entry.travel_id, 'Approved')}
                                className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-200 transition-all duration-300 flex items-center shadow-md"
                              >
                                <i className="fas fa-check mr-2"></i>
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Enter rejection reason:');
                                  if (reason) {
                                    handleApproval(entry.travel_id, 'Rejected', reason);
                                  }
                                }}
                                className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-200 transition-all duration-300 flex items-center shadow-md"
                              >
                                <i className="fas fa-times mr-2"></i>
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Travel;
