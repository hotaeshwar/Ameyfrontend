import { useState, useEffect } from 'react';

const Travel = () => {
  const [travels, setTravels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [locations, setLocations] = useState([]);
  const [ticketFile, setTicketFile] = useState(null);
  const [activeTab, setActiveTab] = useState('history'); // 'history' or 'add'
  const [formData, setFormData] = useState({
    distance_km: '',
    travel_mode: 'Two Wheeler',
    state: '',
    city: '',
    location: '',
    ticket_price: '',
    from_station: '',
    to_station: ''
  });

  useEffect(() => {
    fetchTravels();
    fetchStates();
    // Add FontAwesome script dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js';
    script.crossOrigin = 'anonymous';
    document.body.appendChild(script);
    
    // Check if we're on mobile to set default tab
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setActiveTab('history');
      }
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.body.removeChild(script);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const fetchTravels = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://api.ameyaaccountsonline.info/travel/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch travel records');
      }

      const data = await response.json();
      setTravels(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error('Error fetching travels:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    try {
      const response = await fetch('https://api.ameyaaccountsonline.info/locations/states');
      if (!response.ok) {
        throw new Error('Failed to fetch states');
      }
      const data = await response.json();
      setStates(Array.isArray(data) ? data : data.data || data.states || []);
    } catch (err) {
      console.error('Error fetching states:', err);
      setError(err.message);
    }
  };

  const fetchCities = async (state) => {
    try {
      const response = await fetch(`https://api.ameyaaccountsonline.info/locations/cities/${encodeURIComponent(state)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cities');
      }
      const data = await response.json();
      setCities(Array.isArray(data) ? data : data.data || data.cities || []);
    } catch (err) {
      console.error('Error fetching cities:', err);
      setError(err.message);
    }
  };

  const fetchLocations = async (state, city) => {
    try {
      const response = await fetch(
        `https://api.ameyaaccountsonline.info/locations/locations/${encodeURIComponent(state)}/${encodeURIComponent(city)}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      const data = await response.json();
      setLocations(Array.isArray(data) ? data : data.data || data.locations || []);
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError(err.message);
    }
  };

  const handleFileChange = (e) => {
    setTicketFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const isPublicTransport = ['Bus', 'Train', 'Flight'].includes(formData.travel_mode);
      
      // Validation for public transport
      if (isPublicTransport) {
        if (!formData.ticket_price || parseFloat(formData.ticket_price) <= 0) {
          throw new Error('Ticket price is required for public transport');
        }
        if (!formData.from_station || !formData.to_station) {
          throw new Error('From and to stations are required for public transport');
        }
      } else {
        // Validation for personal vehicles
        if (!formData.distance_km || parseFloat(formData.distance_km) <= 0) {
          throw new Error('Distance is required for personal vehicle travel');
        }
        if (!formData.state || !formData.city || !formData.location) {
          throw new Error('State, city, and location are required for personal vehicle travel');
        }
      }

      // Prepare the request body
      const requestBody = {
        distance_km: isPublicTransport ? null : parseFloat(formData.distance_km),
        travel_mode: formData.travel_mode,
        state: isPublicTransport ? '' : formData.state,
        city: isPublicTransport ? '' : formData.city,
        location: isPublicTransport ? '' : formData.location,
        ticket_price: isPublicTransport ? parseFloat(formData.ticket_price) : null,
        from_station: isPublicTransport ? formData.from_station : '',
        to_station: isPublicTransport ? formData.to_station : ''
      };

      // Create FormData for file upload
      const formDataToSend = new FormData();
      Object.entries(requestBody).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value);
        }
      });
      
      if (ticketFile) {
        formDataToSend.append('ticket_scan', ticketFile);
      }

      const response = await fetch('https://api.ameyaaccountsonline.info/travel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Failed to add travel record');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Reset form
      setFormData({
        distance_km: '',
        travel_mode: 'Two Wheeler',
        state: '',
        city: '',
        location: '',
        ticket_price: '',
        from_station: '',
        to_station: ''
      });
      setTicketFile(null);
      
      // Refresh travel list
      await fetchTravels();
      
      // Show success message
      alert('Travel record added successfully!');
      
      // Switch to history tab on mobile
      if (window.innerWidth < 768) {
        setActiveTab('history');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'state') {
      fetchCities(value);
      setFormData(prev => ({
        ...prev,
        city: '',
        location: ''
      }));
      setCities([]);
      setLocations([]);
    }

    if (name === 'city' && formData.state) {
      fetchLocations(formData.state, value);
      setFormData(prev => ({
        ...prev,
        location: ''
      }));
    }
  };
  
  const viewTicket = async (travelId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://api.ameyaaccountsonline.info/ticket/${travelId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch ticket');
      }
  
      // Check if response is an image
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('image')) {
        // Convert the image to a blob URL
        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        
        // Open the image in a new tab
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Travel Ticket</title>
                <style>
                  body { 
                    margin: 0; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    height: 100vh; 
                    background-color: #f3f4f6;
                  }
                  img { 
                    max-width: 90%; 
                    max-height: 90%; 
                    object-fit: contain; 
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
                  }
                </style>
              </head>
              <body>
                <img src="${imageUrl}" />
              </body>
            </html>
          `);
          newWindow.document.close();
        }
      } else {
        // Handle case where response is not an image (fallback)
        const data = await response.json();
        if (data.ticket_scan) {
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            newWindow.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Travel Ticket</title>
                  <style>
                    body { 
                      margin: 0; 
                      display: flex; 
                      justify-content: center; 
                      align-items: center; 
                      height: 100vh; 
                      background-color: #f3f4f6;
                    }
                    img { 
                      max-width: 90%; 
                      max-height: 90%; 
                      object-fit: contain; 
                      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
                    }
                  </style>
                </head>
                <body>
                  <img src="data:image/jpeg;base64,${data.ticket_scan}" />
                </body>
              </html>
            `);
            newWindow.document.close();
          }
        } else {
          alert('No ticket available for this travel record');
        }
      }
    } catch (err) {
      console.error('Error viewing ticket:', err);
      setError(err.message);
    }
  };

  // Get the icon for the travel mode
  const getTravelModeIcon = (mode) => {
    switch (mode) {
      case 'Two Wheeler':
        return <i className="fas fa-motorcycle text-purple-600"></i>;
      case 'Four Wheeler':
        return <i className="fas fa-car text-purple-600"></i>;
      case 'Bus':
        return <i className="fas fa-bus text-purple-600"></i>;
      case 'Train':
        return <i className="fas fa-train text-purple-600"></i>;
      case 'Flight':
        return <i className="fas fa-plane text-purple-600"></i>;
      default:
        return <i className="fas fa-road text-purple-600"></i>;
    }
  };

  // Calculate total amount
  const calculateTotalAmount = () => {
    return travels.reduce((total, travel) => total + (travel.calculated_amount || 0), 0).toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24">
            <div className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center">
              <i className="fas fa-route text-purple-600 text-4xl animate-pulse"></i>
            </div>
            <svg className="animate-spin w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="50" cy="50" r="45" stroke="#8b5cf6" strokeWidth="10" fill="none" />
              <circle className="opacity-75" cx="50" cy="50" r="45" stroke="#8b5cf6" strokeWidth="10" fill="none" strokeDasharray="283" strokeDashoffset="200" />
            </svg>
          </div>
          <p className="mt-4 text-purple-600 font-semibold text-xl">Loading travel records...</p>
        </div>
      </div>
    );
  }

  const isPublicTransport = ['Bus', 'Train', 'Flight'].includes(formData.travel_mode);

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 min-h-screen pb-24">
      {/* Animated Shapes - Visual Enhancement */}
      <div className="fixed top-0 right-0 -z-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="fixed top-60 right-80 -z-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="fixed bottom-0 left-20 -z-10 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      {/* Header */}
      <div className="relative mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 pb-2 inline-block">
          Travel Management
        </h2>
        <div className="h-1 w-20 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-full"></div>
        <p className="mt-2 text-gray-600">Track, manage, and report your business travels</p>
      </div>
      
      {/* Error Alert */}
      {error && (
        <div className="p-4 mb-6 text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-lg shadow-md flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-white bg-opacity-20 rounded-full p-2 mr-3">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <div>
              <h3 className="font-semibold">Error Alert</h3>
              <p>{error}</p>
            </div>
          </div>
          <button 
            onClick={() => setError('')}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
      
      {/* Summary Cards - Floating at the top on desktop, bottom on mobile */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-xl p-5 border-l-4 border-purple-500 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{travels.length}</p>
            </div>
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
              <i className="fas fa-clipboard-list text-white text-xl"></i>
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-purple-500">
            <i className="fas fa-info-circle mr-1"></i>
            <span>All time records</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-xl p-5 border-l-4 border-green-500 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {travels.filter(t => t.status === 'Approved').length}
              </p>
            </div>
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-lg">
              <i className="fas fa-check-circle text-white text-xl"></i>
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-green-500">
            <i className="fas fa-chart-line mr-1"></i>
            <span>Verified expenses</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-xl p-5 border-l-4 border-yellow-500 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {travels.filter(t => !t.status || t.status === 'Pending').length}
              </p>
            </div>
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg">
              <i className="fas fa-clock text-white text-xl"></i>
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-yellow-500">
            <i className="fas fa-exclamation-triangle mr-1"></i>
            <span>Awaiting approval</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-xl p-5 border-l-4 border-blue-500 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{calculateTotalAmount()}
              </p>
            </div>
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <i className="fas fa-rupee-sign text-white text-xl"></i>
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-blue-500">
            <i className="fas fa-wallet mr-1"></i>
            <span>Total claimed expenses</span>
          </div>
        </div>
      </div>
      
      {/* Mobile Tab Navigation */}
      <div className="md:hidden mb-6 flex bg-white rounded-full p-1 shadow-md">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-4 rounded-full flex items-center justify-center ${
            activeTab === 'history' 
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' 
              : 'text-gray-600'
          }`}
        >
          <i className={`fas fa-history ${activeTab === 'history' ? 'mr-2' : ''}`}></i>
          {activeTab === 'history' && <span>History</span>}
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`flex-1 py-2 px-4 rounded-full flex items-center justify-center ${
            activeTab === 'add' 
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' 
              : 'text-gray-600'
          }`}
        >
          <i className={`fas fa-plus-circle ${activeTab === 'add' ? 'mr-2' : ''}`}></i>
          {activeTab === 'add' && <span>Add New</span>}
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Add New Travel Record Form */}
        <div className={`order-1 lg:order-2 ${activeTab === 'add' ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-indigo-100 transform transition-all hover:shadow-2xl relative">
            <div className="p-5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center">
                <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3">
                  <i className="fas fa-plus-circle"></i>
                </div>
                Add New Travel
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="bg-indigo-50 p-4 rounded-xl">
                <label htmlFor="travel_mode" className="block text-sm font-medium text-indigo-800 mb-2 flex items-center">
                  <i className="fas fa-exchange-alt mr-2 text-indigo-600"></i> Travel Mode
                </label>
                <div className="relative">
                  <select
                    id="travel_mode"
                    name="travel_mode"
                    value={formData.travel_mode}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-10 py-3 border-2 border-indigo-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none bg-white"
                  >
                    <option value="Two Wheeler">Two Wheeler</option>
                    <option value="Four Wheeler">Four Wheeler</option>
                    <option value="Bus">Bus</option>
                    <option value="Train">Train</option>
                    <option value="Flight">Flight</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {getTravelModeIcon(formData.travel_mode)}
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <i className="fas fa-chevron-down text-indigo-400"></i>
                  </div>
                </div>
              </div>

              {/* Personal Vehicle Fields */}
              {!isPublicTransport && (
                <div className="space-y-5 bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-3 flex items-center">
                    <i className="fas fa-car-side mr-2"></i> Vehicle Details
                  </h4>
                  
                  <div>
                    <label htmlFor="distance_km" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <i className="fas fa-ruler mr-2 text-blue-600"></i> Distance (km)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="distance_km"
                        name="distance_km"
                        value={formData.distance_km}
                        onChange={handleChange}
                        required={!isPublicTransport}
                        min="0"
                        step="0.01"
                        className="w-full pl-10 pr-3 py-3 border-2 border-blue-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Enter distance in kilometers"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-road text-blue-500"></i>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <i className="fas fa-map mr-2 text-blue-600"></i> State
                      </label>
                      <div className="relative">
                        <select
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          required={!isPublicTransport}
                          className="w-full pl-10 pr-8 py-3 border-2 border-blue-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
                        >
                          <option value="">Select State</option>
                          {Array.isArray(states) && states.map((state, index) => (
                            <option key={index} value={state}>{state}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fas fa-flag text-blue-500"></i>
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <i className="fas fa-chevron-down text-blue-400"></i>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-1">
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <i className="fas fa-city mr-2 text-blue-600"></i> City
                      </label>
                      <div className="relative">
                        <select
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required={!isPublicTransport}
                          disabled={!formData.state}
                          className={`w-full pl-10 pr-8 py-3 border-2 border-blue-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none ${
                            !formData.state ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                          }`}
                        >
                          <option value="">Select City</option>
                          {Array.isArray(cities) && cities.map((city, index) => (
                            <option key={index} value={city}>{city}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fas fa-building text-blue-500"></i>
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <i className="fas fa-chevron-down text-blue-400"></i>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-1">
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <i className="fas fa-map-marker-alt mr-2 text-blue-600"></i> Location
                      </label>
                      <div className="relative">
                        <select
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          required={!isPublicTransport}
                          disabled={!formData.city}
                          className={`w-full pl-10 pr-8 py-3 border-2 border-blue-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none ${
                            !formData.city ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                          }`}
                        >
                          <option value="">Select Location</option>
                          {Array.isArray(locations) && locations.map((location, index) => (
                            <option key={index} value={location}>{location}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fas fa-map-pin text-blue-500"></i>
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <i className="fas fa-chevron-down text-blue-400"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Public Transport Fields */}
              {isPublicTransport && (
                <div className="space-y-5 bg-purple-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-purple-800 border-b border-purple-200 pb-2 mb-3 flex items-center">
                    <i className={`fas fa-${formData.travel_mode === 'Flight' ? 'plane' : formData.travel_mode === 'Train' ? 'train' : 'bus'} mr-2`}></i> 
                    {formData.travel_mode} Details
                  </h4>
                  
                  <div>
                    <label htmlFor="ticket_price" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <i className="fas fa-tag mr-2 text-purple-600"></i> Ticket Price (₹)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="ticket_price"
                        name="ticket_price"
                        value={formData.ticket_price}
                        onChange={handleChange}
                        required={isPublicTransport}
                        min="0"
                        step="0.01"
                        className="w-full pl-10 pr-3 py-3 border-2 border-purple-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        placeholder="Enter ticket price"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-rupee-sign text-purple-500"></i>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="from_station" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <i className="fas fa-sign-out-alt mr-2 text-purple-600"></i> From Station
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="from_station"
                          name="from_station"
                          value={formData.from_station}
                          onChange={handleChange}
                          required={isPublicTransport}
                          className="w-full pl-10 pr-3 py-3 border-2 border-purple-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                          placeholder="Enter origin station"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fas fa-map-marker text-purple-500"></i>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="to_station" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <i className="fas fa-sign-in-alt mr-2 text-purple-600"></i> To Station
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="to_station"
                          name="to_station"
                          value={formData.to_station}
                          onChange={handleChange}
                          required={isPublicTransport}
                          className="w-full pl-10 pr-3 py-3 border-2 border-purple-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                          placeholder="Enter destination station"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fas fa-map-marker-alt text-purple-500"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Ticket Upload Section */}
              <div className="pt-4 border-t border-gray-200">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
                  <label htmlFor="ticket_scan" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <i className="fas fa-receipt mr-2 text-indigo-600"></i> Upload Ticket (Optional)
                  </label>
                  <div className="relative mt-1 flex items-center">
                    <input
                      type="file"
                      id="ticket_scan"
                      name="ticket_scan"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <label
                      htmlFor="ticket_scan"
                      className="w-full px-4 py-4 flex flex-col items-center justify-center border-2 border-dashed border-indigo-300 rounded-xl cursor-pointer bg-white hover:bg-indigo-50 transition-all duration-300"
                    >
                      {ticketFile ? (
                        <>
                          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                            <i className="fas fa-check text-green-600 text-xl"></i>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{ticketFile.name}</span>
                          <span className="text-xs text-gray-500 mt-1">
                            {(ticketFile.size / 1024).toFixed(1)} KB
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                            <i className="fas fa-upload text-indigo-600 text-xl"></i>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            Drag and drop or click to upload
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            PNG, JPG, JPEG up to 10MB
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 rounded-xl shadow-lg text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:-translate-y-1 font-semibold text-lg"
              >
                <div className="flex items-center space-x-2">
                  <i className="fas fa-paper-plane"></i>
                  <span>Submit Travel Record</span>
                </div>
              </button>
            </form>
          </div>
        </div>

        {/* Travel History Section */}
        <div className={`lg:col-span-2 order-2 lg:order-1 ${activeTab === 'history' ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-indigo-100 transform transition-all hover:shadow-2xl">
            <div className="p-5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center">
                <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3">
                  <i className="fas fa-history"></i>
                </div>
                Travel History
              </h3>
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm flex items-center">
                <i className="fas fa-list-alt mr-1"></i>
                <span>{travels.length} Records</span>
              </div>
            </div>
            
            {/* Desktop/Tablet Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                      <div className="flex items-center">
                        <i className="fas fa-hashtag mr-1"></i> ID
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                      <div className="flex items-center">
                        <i className="fas fa-route mr-1"></i> Mode
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                      <div className="flex items-center">
                        <i className="fas fa-route mr-1"></i> Route/Location
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                      <div className="flex items-center">
                        <i className="fas fa-rupee-sign mr-1"></i> Amount
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                      <div className="flex items-center">
                        <i className="fas fa-check-circle mr-1"></i> Status
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                      <div className="flex items-center">
                        <i className="fas fa-cog mr-1"></i> Actions
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(travels) && travels.length > 0 ? (
                    travels.map((travel) => (
                      <tr key={travel.travel_id} className="hover:bg-indigo-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                            #{travel.travel_id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-purple-100 rounded-full p-2 mr-2">
                              {getTravelModeIcon(travel.travel_mode)}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{travel.travel_mode}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {travel.from_station && travel.to_station ? (
                            <div className="flex items-center space-x-1">
                              <span>{travel.from_station}</span>
                              <i className="fas fa-arrow-right text-xs text-indigo-400 mx-1"></i>
                              <span>{travel.to_station}</span>
                            </div>
                          ) : (
                            <span>{travel.location || '-'}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm font-medium text-gray-900">
                            <i className="fas fa-rupee-sign mr-1 text-green-500"></i>
                            {travel.calculated_amount?.toFixed(2) || '0.00'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            travel.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                            travel.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            <i className={`mr-1 ${
                              travel.status === 'Approved' ? 'fas fa-check-circle text-green-600' : 
                              travel.status === 'Rejected' ? 'fas fa-times-circle text-red-600' : 'fas fa-clock text-yellow-600'
                            }`}></i>
                            {travel.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {(travel.ticket_price || travel.ticket_scan) && (
                            <button 
                              onClick={() => viewTicket(travel.travel_id)}
                              className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-1 px-3 rounded-full flex items-center transition-colors"
                            >
                              <i className="fas fa-ticket-alt mr-1"></i>
                              <span>View</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <div className="rounded-full bg-indigo-100 p-4 mb-4">
                            <i className="fas fa-route text-4xl text-indigo-400"></i>
                          </div>
                          <p className="text-lg font-medium text-gray-600">No travel records found</p>
                          <p className="text-sm mt-1 text-gray-500">Add your first travel record to get started!</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Card View */}
            <div className="md:hidden">
              {Array.isArray(travels) && travels.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {travels.map((travel) => (
                    <div key={travel.travel_id} className="p-4 hover:bg-indigo-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                          #{travel.travel_id}
                        </span>
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          travel.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                          travel.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          <i className={`mr-1 ${
                            travel.status === 'Approved' ? 'fas fa-check-circle' : 
                            travel.status === 'Rejected' ? 'fas fa-times-circle' : 'fas fa-clock'
                          }`}></i>
                          {travel.status || 'Pending'}
                        </span>
                      </div>
                      
                      <div className="flex items-center mb-2">
                        <div className="bg-purple-100 rounded-full p-2 mr-2">
                          {getTravelModeIcon(travel.travel_mode)}
                        </div>
                        <span className="font-medium">{travel.travel_mode}</span>
                      </div>
                      
                      {travel.from_station && travel.to_station ? (
                        <div className="flex items-center text-sm text-gray-600 mb-2 bg-blue-50 p-2 rounded-lg">
                          <i className="fas fa-map-marker-alt text-blue-500 mr-1"></i>
                          <span>{travel.from_station}</span>
                          <i className="fas fa-arrow-right text-xs text-indigo-400 mx-1"></i>
                          <span>{travel.to_station}</span>
                        </div>
                      ) : travel.location ? (
                        <div className="flex items-center text-sm text-gray-600 mb-2 bg-blue-50 p-2 rounded-lg">
                          <i className="fas fa-map-pin text-blue-500 mr-1"></i>
                          <span>{travel.location}</span>
                        </div>
                      ) : null}
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center text-green-700 font-medium bg-green-50 px-3 py-1 rounded-lg">
                          <i className="fas fa-rupee-sign mr-1"></i>
                          <span>{travel.calculated_amount?.toFixed(2) || '0.00'}</span>
                        </div>
                        
                        {(travel.ticket_price || travel.ticket_scan) && (
                          <button 
                            onClick={() => viewTicket(travel.travel_id)}
                            className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-1 px-3 rounded-lg flex items-center transition-colors"
                          >
                            <i className="fas fa-ticket-alt mr-1"></i>
                            <span>View Ticket</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <div className="rounded-full bg-indigo-100 p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                    <i className="fas fa-route text-3xl text-indigo-400"></i>
                  </div>
                  <p className="text-lg font-medium text-gray-600">No travel records found</p>
                  <p className="text-sm mt-1 text-gray-500">Add your first travel record to get started!</p>
                  <button 
                    onClick={() => setActiveTab('add')}
                    className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-lg flex items-center mx-auto"
                  >
                    <i className="fas fa-plus-circle mr-2"></i>
                    <span>Add New Travel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile Summary Cards */}
          <div className="mt-6 md:hidden grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Total Records</p>
                  <p className="text-lg font-bold text-gray-900">{travels.length}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-md">
                  <i className="fas fa-clipboard-list text-white"></i>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Approved</p>
                  <p className="text-lg font-bold text-gray-900">
                    {travels.filter(t => t.status === 'Approved').length}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-md">
                  <i className="fas fa-check-circle text-white"></i>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="text-lg font-bold text-gray-900">
                    {travels.filter(t => !t.status || t.status === 'Pending').length}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-md">
                  <i className="fas fa-clock text-white"></i>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Total Amount</p>
                  <p className="text-lg font-bold text-gray-900">
                    ₹{calculateTotalAmount()}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                  <i className="fas fa-rupee-sign text-white"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Add Button - Floating */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setActiveTab('add')}
          className={`p-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all ${
            activeTab === 'add' ? 'hidden' : 'flex'
          }`}
        >
          <i className="fas fa-plus text-xl"></i>
        </button>
      </div>
    </div>
  );
};

export default Travel;