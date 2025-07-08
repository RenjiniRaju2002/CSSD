import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Header from "../components/Header";
// import { useToast } from "@/hooks/use-toast";
import Footer from "../components/Footer";
import "../styles/requestmanagement.css";
import PageContainer from "../components/PageContainer";
import { Plus, Filter, Trash2, Eye, Search, Package } from "lucide-react";
import Table from "../components/Table";
import Searchbar from "../components/Searchbar";
import ButtonWithGradient from "../components/ButtonWithGradient";
import SectionHeading from "../components/SectionHeading";



interface Request {
  id: string;
  department: string;
  items: string;
  quantity: number;
  priority: string;
  status: string;
  date: string;
  time: string;
}

interface RequestManagementProps {
  sidebarCollapsed?: boolean;
  toggleSidebar?: () => void;
}
const  RequestManagement : React.FC< RequestManagementProps > = ({ sidebarCollapsed = false, toggleSidebar }) => {
  const navigate = useNavigate();
  const [showCreateKit, setShowCreateKit] = useState(false);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [itemInput, setItemInput] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [kitSearchTerm, setKitSearchTerm] = useState("");
  const [kitName, setKitName] = useState("");
  const [kitDepartment, setKitDepartment] = useState("");
  const [kitPriority, setKitPriority] = useState("");
  const [kitItemName, setKitItemName] = useState("");
  const [kitItemQuantity, setKitItemQuantity] = useState("");
  const [kitItems, setKitItems] = useState<any[]>([]);
  const [createdKits, setCreatedKits] = useState<any[]>([]);
  const [selectedKit, setSelectedKit] = useState<any>(null);
  const [showKitDetails, setShowKitDetails] = useState(false);

  // Check if form has unsaved data
  const hasUnsavedData = () => {
    return (
      selectedDepartment !== "" ||
      selectedPriority !== "" ||
      selectedDate !== undefined ||
      itemInput !== "" ||
      itemQuantity !== "" ||
      pendingItems.length > 0 ||
      kitName !== "" ||
      kitDepartment !== "" ||
      kitPriority !== "" ||
      kitItemName !== "" ||
      kitItemQuantity !== "" ||
      kitItems.length > 0
    );
  };

  // Add beforeunload event listener
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedData()) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [selectedDepartment, selectedPriority, selectedDate, itemInput, itemQuantity, pendingItems, kitName, kitDepartment, kitPriority, kitItemName, kitItemQuantity, kitItems]);

  // Custom hook to handle navigation warnings
  useEffect(() => {
    const handleNavigation = (e: PopStateEvent) => {
      if (hasUnsavedData()) {
        const confirmed = window.confirm("You have unsaved changes. Are you sure you want to leave this page?");
        if (!confirmed) {
          e.preventDefault();
          window.history.pushState(null, '', window.location.pathname);
        }
      }
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, [selectedDepartment, selectedPriority, selectedDate, itemInput, itemQuantity, pendingItems, kitName, kitDepartment, kitPriority, kitItemName, kitItemQuantity, kitItems]);

  // Function to validate form fields
  const validateFormFields = () => {
    const missingFields = [];
    
    if (!selectedDepartment) missingFields.push("Outlet");
    if (!selectedPriority) missingFields.push("Priority");
    if (!itemInput) missingFields.push("Item/Kit");
    if (!itemQuantity) missingFields.push("Quantity");
    if (!selectedDate) missingFields.push("Required Date");
    
    if (missingFields.length > 0) {
      alert(`Please enter the following required fields: ${missingFields.join(", ")}`);
      return false;
    }
    return true;
  };

  // Function to validate kit form fields
  const validateKitFormFields = () => {
    const missingFields = [];
    
    if (!kitName) missingFields.push("Kit Name");
    if (!kitDepartment) missingFields.push("Outlet");
    if (!kitPriority) missingFields.push("Priority");
    if (!kitItemName) missingFields.push("Item/Kit");
    if (!kitItemQuantity) missingFields.push("Quantity");
    
    if (missingFields.length > 0) {
      alert(`Please enter the following required fields: ${missingFields.join(", ")}`);
      return false;
    }
    return true;
  };

  // Fetch requests from database
  useEffect(() => {
    fetch('http://192.168.50.132:3001/cssd_requests')
      .then(res => res.json())
      .then(data => setRequests(data))
      .catch(() => setRequests([]));
  }, []);

  // Fetch created kits from database
  useEffect(() => {
    fetch('http://192.168.50.132:3001/createdKits')
      .then(res => res.json())
      .then(data => setCreatedKits(data))
      .catch(() => setCreatedKits([]));
  }, []);

  // Save kits to localStorage whenever they change
  // useEffect(() => {
  //   localStorage.setItem('cssd_kits', JSON.stringify(createdKits));
  // }, [createdKits]);

  // Sort requests in ascending order by ID before slicing for pagination
  const sortedRequests = [...requests].sort((a, b) => a.id.localeCompare(b.id));
  const filteredRequests = sortedRequests.filter((req) => {
    const matchesSearch =
      req.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.items?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      req.status?.toLowerCase() === filterStatus.toLowerCase();

    const matchesPriority =
      filterPriority === "all" ||
      req.priority?.toLowerCase() === filterPriority.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const currentRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const addItemToList = () => {
    if (!validateFormFields()) {
      return;
    }
    
    setPendingItems([
      ...pendingItems,
      {
        department: selectedDepartment,
        priority: selectedPriority,
        item: itemInput,
        quantity: itemQuantity,
        date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
      },
    ]);
    setItemInput("");
    setItemQuantity("");
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    // Optionally handle form submission for new request
  };

  // Function to clear form data
  const clearFormData = () => {
    setSelectedDepartment("");
    setSelectedPriority("");
    setItemInput("");
    setItemQuantity("");
    setSelectedDate(undefined);
    setPendingItems([]);
  };

  // Function to clear kit form data
  const clearKitFormData = () => {
    setKitName("");
    setKitDepartment("");
    setKitPriority("");
    setKitItemName("");
    setKitItemQuantity("");
    setKitItems([]);
  };

  const handleSaveRequest = async () => {
    if (!selectedDepartment || !selectedPriority || !selectedDate || pendingItems.length === 0) return;
    const nextId = `REQ${(requests.length + 1).toString().padStart(3, "0")}`;
    const combinedItems = pendingItems.map(item => item.item).join(', ');
    const totalQuantity = pendingItems.reduce((sum, item) => sum + Number(item.quantity), 0);
    const department = pendingItems[0].department;
    const priority = pendingItems[0].priority;
    const date = pendingItems[0].date;
      const newRequest = {
      id: nextId,
      department,
      items: combinedItems,
      quantity: totalQuantity,
      priority,
        status: "Requested",
      date,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    
    // POST to API
    await fetch('http://192.168.50.132:3001/cssd_requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRequest)
    });

    // Fetch updated requests
    const res = await fetch('http://192.168.50.132:3001/cssd_requests');
    const updated = await res.json();
    setRequests(updated);

    // Clear form data after successful save
    clearFormData();
  };

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request);
    setShowRequestDetails(true);
  };

  const handleDeleteRequest = (id: string) => {
    setRequests(requests.filter((req: { id: string }) => req.id !== id));
  };

  const handleCreateKit = (e: React.FormEvent) => {
    e.preventDefault();
      setShowCreateKit(false);
    // Optionally handle kit creation logic
  };

  const handleAddKitItem = () => {
    if (!validateKitFormFields()) {
      return;
    }
    
    setKitItems([
      ...kitItems,
      {
        department: kitDepartment,
        priority: kitPriority,
        item: kitItemName,
        quantity: kitItemQuantity,
      },
    ]);
    setKitItemName("");
    setKitItemQuantity("");
  };

  const handleSaveKit = async () => {
    if (!kitName || !kitDepartment || !kitPriority || kitItems.length === 0) return;
    // Generate a new kit ID
    const newKitId = `KIT${(createdKits.length + 1).toString().padStart(3, "0")}`;
    // Create new kit object
      const newKit = {
        id: newKitId,
      name: kitName,
      department: kitDepartment,
      items: kitItems.map(item => item.item).join(", "),
      quantity: kitItems.reduce((sum, item) => sum + Number(item.quantity), 0),
      priority: kitPriority,
      status: "Active",
      date: format(new Date(), 'yyyy-MM-dd'),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    // POST to API
    await fetch('http://192.168.50.132:3001/createdKits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newKit)
    });
    // Fetch updated kits
    const res = await fetch('http://192.168.50.132:3001/createdKits');
    const updated = await res.json();
    setCreatedKits(updated);
    // Reset form and close modal
    setShowCreateKit(false);
    clearKitFormData();
  };

  const handleViewKit = (kit: any) => {
    setSelectedKit(kit);
    setShowKitDetails(true);
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const updatedRequests = requests.map((req) =>
      req.id === id ? { ...req, status: newStatus } : req
    );
    setRequests(updatedRequests);

    // POST to API
    await fetch(`http://192.168.50.132:3001/cssd_requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
  };

  return (
    <>
    <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator />
    {/* <div className="request-management"> */}
    <PageContainer>
      {/* <div className="page-header">
        <h1 className="page-title">Request Management</h1>
       
      </div> */}
       <SectionHeading title="Request Management" subtitle="Create and manage sterilization requests" className="requestmanagement-heading w-100" />

      {/* Top section: Add Request and Package Kits */}
      <div className="flex gap-4 mb-4" style={{ alignItems: "stretch" }}>
        {/* Add Request Card */}
        <div className="card" style={{ flex: '0 1 50%', minWidth: 0 }}>
          <div className="card-header">
            <h2 className="card-title flex items-center" style={{ fontWeight: 600, fontSize: '1.2rem' }}>
               Add Request
            </h2>
      </div>
          <div className="card-content">
            <form onSubmit={handleSaveRequest}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <div>
                  <label className="form-label">Outlet <span style={{color: 'red'}}>*</span></label>
                  <select 
                    className="form-input"
                    name="department"
                    required
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                  >
                    <option value="">Select department</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Priority <span style={{color: 'red'}}>*</span></label>
                  <select 
                    className="form-input"
                    name="priority"
                    required
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                  >
                    <option value="">Select priority</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="form-label">Item /Kit <span style={{color: 'red'}}>*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Add item name"
                    value={itemInput}
                    onChange={(e) => setItemInput(e.target.value)}
                  />
              </div>
              <div>
                  <label className="form-label">Quantity <span style={{color: 'red'}}>*</span></label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Enter quantity"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(e.target.value)}
                  />
              </div>
                <div>
                  <label className="form-label">Required Date <span style={{color: 'red'}}>*</span></label>
                  <div className="flex items-center">
                    <input
                      type="date"
                      className="form-input"
                      value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                      onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : undefined)}
                      required
                    />
                </div>
              </div>
              </div>
             

        <ButtonWithGradient
        className='button-gradient w-100 mt-2'
       
        text="Fallback text"
        onClick={addItemToList}
        disabled={!itemInput || !itemQuantity}
        
        type="button"
      >
        Add Request
      </ButtonWithGradient>
            </form>
            {pendingItems.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-2" style={{ fontWeight: 600, fontSize: '1.2rem' }}>Requests to be Added</h3>
                <Table
                  columns={[
                    { key: 'department', header: 'Department' },
                    { key: 'priority', header: 'Priority' },
                    { key: 'item', header: 'Item' },
                    { key: 'quantity', header: 'Quantity' },
                    { key: 'date', header: 'Date' }
                  ]}
                  data={pendingItems}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={clearFormData}
                  >
                    Clear All
                  </button>
                  <ButtonWithGradient
                    type="button"
                    className="button-gradient"
                    onClick={handleSaveRequest}
                  >
                    Save Request
                  </ButtonWithGradient>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Package Kits Card */}
        <div className="card" style={{ flex: '0 1 50%', minWidth:0}}>
          <div className="card-header flex items-center justify-between">
            <h2 className="card-title flex items-center" style={{ fontWeight: 600, fontSize: '1.2re m' }}>
               Package Kits
            </h2>
            <ButtonWithGradient 
              className="button-gradient" 
              
              onClick={() => setShowCreateKit(true)}
            >
                    Create Kit
            </ButtonWithGradient>
          </div>
          <div className="card-content">
            <div className="flex justify-end">
              <div className="search ml-auto">
                <Searchbar value={kitSearchTerm} onChange={e => setKitSearchTerm(e.target.value)} />
              </div>
            </div>
            {createdKits.length > 0 ? (
              <Table
                columns={[
                  { key: 'id', header: 'Kit ID' },
                  { key: 'name', header: 'Kit Name' },
                  { key: 'department', header: 'Department' },
                  { key: 'items', header: 'Items' },
                  { key: 'quantity', header: 'Quantity' },
                  { key: 'priority', header: 'Priority' },
                  { key: 'status', header: 'Status' },
                  {
                    key: 'actions',
                    header: 'Actions',
                    render: (kit: any) => (
                      <button
                        onClick={() => handleViewKit(kit)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Eye size={16}/>
                      </button>
                    )
                  }
                ]}
                data={createdKits.filter((kit: any) => 
                  kit.name.toLowerCase().includes(kitSearchTerm.toLowerCase()) ||
                  kit.id.toLowerCase().includes(kitSearchTerm.toLowerCase())
                )}
              />
            ) : (
              <div className="text-center text-gray-500 mt-4">No kits found</div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Previous Requests</h2>
        </div>
        <div className="card-content">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <select
                  className="form-input text-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="requested">Requested</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <select 
                  className="form-input text-sm"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="relative flex-1 max-w-md ml-auto">
                <Searchbar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>

          {/* Table component for previous requests */}
          <Table
            columns={[
              { key: 'id', header: 'Request ID' },
              { key: 'department', header: 'Department' },
              { key: 'items', header: 'Items' },
              { key: 'quantity', header: 'Quantity' },
              { key: 'priority', header: 'Priority' },
              { key: 'status', header: 'Status' },
              { key: 'date', header: 'Date' },
              { key: 'time', header: 'Time' },
        
            ]}
            data={currentRequests}
          />

          {currentRequests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No requests found matching your criteria.
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
          </div>
          </div>
          

      {/* Create Kit Dialog */}
      {showCreateKit && (
        <div className="dialog-overlay">
          <div className="dialog-content" style={{ maxWidth: '600px', width: '90%', boxShadow: 'none' }}>
            <div className="card" style={{ boxShadow: 'none' }}>
              <div className="card-header flex items-center justify-between">
                <h2 className="card-title">Create Package Kit</h2>
                <button 
                  className="text-gray-500 hover:text-gray-700 bg-white rounded-full w-8 h-8 flex items-center justify-center"
                  onClick={() => setShowCreateKit(false)}
                  style={{ border: '1px solid #e5e7eb', boxShadow: 'none' }}
                >
                  ×
                </button>
              </div>
              <div className="card-content">
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="form-group mb-4">
                    <label className="form-label">Kit Name <span style={{color: 'red'}}>*</span></label>
                    <input 
                      type="text" 
                      className="form-input" 
                        value={kitName} 
                      onChange={(e) => setKitName(e.target.value)}
                        placeholder="Enter kit name" 
                        required 
                      style={{ boxShadow: 'none' }}
                      />
                    </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                      <label className="form-label">Outlet <span style={{color: 'red'}}>*</span></label>
                      <select 
                        className="form-input"
                        value={kitDepartment}
                        onChange={(e) => setKitDepartment(e.target.value)}
                        required
                        style={{ boxShadow: 'none' }}
                      >
                        <option value="">Select department</option>
                        <option value="OR-2">OR-2</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Orthopedics">Orthopedics</option>
                      </select>
                      </div>

                      <div>
                      <label className="form-label">Priority <span style={{color: 'red'}}>*</span></label>
                      <select 
                        className="form-input"
                        value={kitPriority}
                        onChange={(e) => setKitPriority(e.target.value)}
                        required
                        style={{ boxShadow: 'none' }}
                      >
                        <option value="">Select priority</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                      </div>
                    </div>

                  <div className="mb-4">
                    <label className="form-label">Item/Kit <span style={{color: 'red'}}>*</span></label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={kitItemName}
                      onChange={(e) => setKitItemName(e.target.value)}
                        placeholder="Add item name" 
                      style={{ boxShadow: 'none' }}
                      />
                    </div>

                  <div className="mb-4">
                    <label className="form-label">Quantity <span style={{color: 'red'}}>*</span></label>
                    <input 
                        type="number" 
                      className="form-input" 
                      value={kitItemQuantity}
                      onChange={(e) => setKitItemQuantity(e.target.value)}
                        placeholder="Enter quantity" 
                      min="1"
                      style={{ boxShadow: 'none' }}
                      />
                    </div>

                  <ButtonWithGradient
                    type="button"
                    className="button-gradient w-100"
                    onClick={handleAddKitItem}
                    disabled={!kitItemName || !kitItemQuantity || !kitDepartment || !kitPriority}
                  >
                      Add Item
                  </ButtonWithGradient>
                  </form>
                  
                {kitItems.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-2" style={{ fontWeight: 600, fontSize: '1.2rem' }}>Kit Items to be Added</h3>
                    <Table
                      columns={[
                        { key: 'department', header: 'Department' },
                        { key: 'priority', header: 'Priority' },
                        { key: 'item', header: 'Item' },
                        { key: 'quantity', header: 'Quantity' }
                      ]}
                      data={kitItems}
                    />
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        type="button"
                        className="btn btn-secondary bg-white"
                        style={{ border: '1px solid #e5e7eb', boxShadow: 'none' }}
                        onClick={clearKitFormData}
                        >
                          Clear All
                      </button>
                      <ButtonWithGradient
                        type="button"
                        className="button-gradient"
                        onClick={handleSaveKit}
                        >
                          Save Kit
                      </ButtonWithGradient>
                      </div>
                    </div>
                  )}
            </div>
                </div>
                        </div>
                      </div>
      )}


      {/* Request Details Dialog */}
      {showRequestDetails && selectedRequest && (
        <div className="dialog-overlay">
          <div className="dialog-content">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Request Details</h2>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowRequestDetails(false)}
                >
                  &times;
                </button>
                      </div>
              <div className="card-content">
            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium text-gray-500">Request ID</h3>
                    <p>{selectedRequest.id}</p>
                    </div>
                <div>
                    <h3 className="text-sm font-medium text-gray-500">Department</h3>
                    <p>{selectedRequest.department}</p>
                  </div>
                <div>
                    <h3 className="text-sm font-medium text-gray-500">Items</h3>
                    <p>{selectedRequest.items}</p>
            </div>
                <div>
                    <h3 className="text-sm font-medium text-gray-500">Quantity</h3>
                    <p>{selectedRequest.quantity}</p>
      </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Priority</h3>
                    <p>{selectedRequest.priority}</p>
            </div>
              <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <p>{selectedRequest.status}</p>
          </div>
                <div>
                    <h3 className="text-sm font-medium text-gray-500">Date</h3>
                    <p>{selectedRequest.date}</p>
          </div>
                <div>
                    <h3 className="text-sm font-medium text-gray-500">Time</h3>
                    <p>{selectedRequest.time}</p>
              </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowRequestDetails(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
                </div>
              </div>
            </div>
          )}

      {/* Kit Details Dialog */}
      {showKitDetails && selectedKit && (
        <div className="dialog-overlay">
          <div className="dialog-content" style={{ maxWidth: '600px', width: '90%', boxShadow: 'none' }}>
            <div className="card" style={{ boxShadow: 'none' }}>
              <div className="card-header flex items-center justify-between">
                <h2 className="card-title">Kit Details</h2>
                <button 
                  className="text-gray-500 hover:text-gray-700 bg-white rounded-full w-8 h-8 flex items-center justify-center"
                  onClick={() => setShowKitDetails(false)}
                  style={{ border: '1px solid #e5e7eb', boxShadow: 'none' }}
                >
                  ×
                </button>
              </div>
              <div className="card-content">
            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium text-gray-500">Kit ID</h3>
                    <p>{selectedKit.id}</p>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-gray-500">Kit Name</h3>
                    <p>{selectedKit.name}</p>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-gray-500">Department</h3>
                    <p>{selectedKit.department}</p>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-gray-500">Items</h3>
                    <p>{selectedKit.items}</p>
                </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Quantity</h3>
                    <p>{selectedKit.quantity}</p>
              </div>
              <div>
                    <h3 className="text-sm font-medium text-gray-500">Priority</h3>
                    <p>{selectedKit.priority}</p>
              </div>
                <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <p>{selectedKit.status}</p>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-gray-500">Date Created</h3>
                    <p>{selectedKit.date}</p>
                </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Time Created</h3>
                    <p>{selectedKit.time}</p>
              </div>
            </div>

                <div className="flex justify-end mt-6">
                  <button 
                    className="btn btn-primary"
                    style={{ background: '#0097a7', color: '#fff', fontWeight: 500 }}
                    onClick={() => setShowKitDetails(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
    {/* </div> */}
    <Footer/>
    </>
  );
};

export default RequestManagement;
