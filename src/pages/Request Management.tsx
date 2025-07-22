import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Header from "../components/Header";
// import { useToast } from "@/hooks/use-toast";
import Footer from "../components/Footer";
import "../styles/requestmanagement.css";
import PageContainer from "../components/PageContainer";
import { Plus, Filter, Trash2, Search, Package } from "lucide-react";
import Table from "../components/Table";
import Searchbar from "../components/Searchbar";
import ButtonWithGradient from "../components/ButtonWithGradient";
import SectionHeading from "../components/SectionHeading";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import Stepper from '../components/Stepper';
import Input from "../components/Input";
import DropInput from "../components/DropInput";
import DateInput from "../components/DateInput";
import Breadcrumb from "../components/Breadcrumb";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const [requestedBy, setRequestedBy] = useState("");
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
  const [kitRequestedBy, setKitRequestedBy] = useState("");
  const [kitItemName, setKitItemName] = useState("");
  const [kitItemQuantity, setKitItemQuantity] = useState("");
  const [kitItems, setKitItems] = useState<any[]>([]);
  const [createdKits, setCreatedKits] = useState<any[]>([]);
  const [selectedKit, setSelectedKit] = useState<any>(null);
  const [showKitDetails, setShowKitDetails] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Check if form has unsaved data
  const hasUnsavedData = () => {
    return (
      selectedDepartment !== "" ||
      selectedPriority !== "" ||
      selectedDate !== undefined ||
      requestedBy !== "" ||
      itemInput !== "" ||
      itemQuantity !== "" ||
      pendingItems.length > 0 ||
      kitName !== "" ||
      kitDepartment !== "" ||
      kitPriority !== "" ||
      kitRequestedBy !== "" ||
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
  }, [selectedDepartment, selectedPriority, selectedDate, requestedBy, itemInput, itemQuantity, pendingItems, kitName, kitDepartment, kitPriority, kitRequestedBy, kitItemName, kitItemQuantity, kitItems]);

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
  }, [selectedDepartment, selectedPriority, selectedDate, requestedBy, itemInput, itemQuantity, pendingItems, kitName, kitDepartment, kitPriority, kitRequestedBy, kitItemName, kitItemQuantity, kitItems]);

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
    fetch('http://192.168.50.95:3001/cssd_requests')
      .then(res => res.json())
      .then(data => setRequests(data))
      .catch(() => setRequests([]));
  }, []);

  // Fetch created kits from database
  useEffect(() => {
    fetch('http://192.168.50.95:3001/createdKits')
      .then(res => res.json())
      .then(data => setCreatedKits(data))
      .catch(() => setCreatedKits([]));
  }, []);

  // Save kits to localStorage whenever they change
  // useEffect(() => {
  //   localStorage.setItem('cssd_kits', JSON.stringify(createdKits));
  // }, [createdKits]);

  // Sort requests in descending order by ID to show most recent first
  const sortedRequests = [...requests].sort((a, b) => b.id.localeCompare(a.id));
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

    const matchesDateRange =
      (!fromDate || req.date >= fromDate) &&
      (!toDate || req.date <= toDate);

    return matchesSearch && matchesStatus && matchesPriority && matchesDateRange;
  });

  // Handlers
  const addItemToList = () => {
    if (!itemInput || !itemQuantity) {
      window.alert('Please fill in both the Item/Kit and Quantity fields before adding a request.');
      return;
    }
    
      setPendingItems([
        ...pendingItems,
        {
          department: selectedDepartment,
          priority: selectedPriority,
          requestedBy: requestedBy,
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
    setRequestedBy("");
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
    setKitRequestedBy("");
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
    const requestedBy = pendingItems[0].requestedBy;
    const date = pendingItems[0].date;
    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    
    const newRequest = {
      id: nextId,
      department,
      items: combinedItems,
      quantity: totalQuantity,
      priority,
      requestedBy,
      status: "Requested",
      date,
      time: currentTime
    };
    
    // POST to API for cssd_requests
    await fetch('http://192.168.50.95:3001/cssd_requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRequest)
    });

    // Create corresponding entry in receive_items
    const receiveItemId = `REC${(requests.length + 1).toString().padStart(3, "0")}`;
    const newReceiveItem = {
      id: receiveItemId,
      requestId: nextId,
      department,
      items: combinedItems,
      quantity: totalQuantity,
      priority,
      requestedBy,
      status: "Pending",
      date,
      time: currentTime,
      receivedDate: date,
      receivedTime: currentTime
    };

    // POST to API for receive_items
    await fetch('http://192.168.50.95:3001/receive_items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReceiveItem)
    });

    // Fetch updated requests
    const res = await fetch('http://192.168.50.95:3001/cssd_requests');
    const updated = await res.json();
    setRequests(updated);

    // Clear form data after successful save
    clearFormData();
    setCurrentStep(1); // Move to step 2 after successful save
    toast.success('Request created');
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
        requestedBy: kitRequestedBy,
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
    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    
    // Create new kit object
    const newKit = {
      id: newKitId,
      name: kitName,
      department: kitDepartment,
      items: kitItems.map(item => item.item).join(", "),
      quantity: kitItems.reduce((sum, item) => sum + Number(item.quantity), 0),
      priority: kitPriority,
      requestedBy: kitRequestedBy,
      status: "Active",
      date: currentDate,
      time: currentTime
    };
    
    // POST to API for createdKits
    await fetch('http://192.168.50.95:3001/createdKits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newKit)
    });

    // Create corresponding entry in receive_items for kit
    const receiveItemId = `REC${(requests.length + createdKits.length + 1).toString().padStart(3, "0")}`;
    const newReceiveItem = {
      id: receiveItemId,
      requestId: newKitId,
      department: kitDepartment,
      items: kitItems.map(item => item.item).join(", "),
      quantity: kitItems.reduce((sum, item) => sum + Number(item.quantity), 0),
      priority: kitPriority,
      requestedBy: kitRequestedBy,
      status: "Pending",
      date: currentDate,
      time: currentTime,
      receivedDate: currentDate,
      receivedTime: currentTime
    };

    // POST to API for receive_items
    await fetch('http://192.168.50.95:3001/receive_items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReceiveItem)
    });
    
    // Fetch updated kits
    const res = await fetch('http://192.168.50.95:3001/createdKits');
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
    await fetch(`http://192.168.50.95:3001/cssd_requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    // Show toast message when status is updated to 'Completed'
    if (newStatus === 'Completed') {
      toast.success('Sterilization completed successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleAddRequestItem = () => {
    if (!selectedDepartment) {
      alert('Please enter Outlet');
      // departmentRef.current?.focus(); // This line was not in the original file, so it's removed.
      return;
    }
    if (!selectedPriority) {
      alert('Please enter Priority');
      // priorityRef.current?.focus(); // This line was not in the original file, so it's removed.
      return;
    }
    if (!itemInput) {
      alert('Please enter Item/Kit');
      // itemInputRef.current?.focus(); // This line was not in the original file, so it's removed.
      return;
    }
    if (!itemQuantity) {
      alert('Please enter Quantity');
      // itemQuantityRef.current?.focus(); // This line was not in the original file, so it's removed.
      return;
    }
    if (!selectedDate) {
      alert('Please enter Required Date');
      // dateInputRef.current?.focus(); // This line was not in the original file, so it's removed.
      return;
    }
    addItemToList();
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
       {/* <Stepper currentStep={currentStep} steps={stepLabels} /> */}
       <Breadcrumb steps={[{ label: 'Add Request' }, { label: 'Review Request' }]}
       activeStep={currentStep} onStepClick={setCurrentStep}/>

      {/* Step 1: Add Request and Package Kits */}
      {currentStep === 0 && (
        <div className="mb-4">
          <div className="card mb-4">
            {/* Add Request Card content (move all content from the Add Request card here, remove flex/minWidth) */}
            <div className="card-header" >
              <h2 className="card-title flex items-center" style={{ fontWeight: 400, fontSize: '1rem' }}>
                Add Request
              </h2>
            </div>
            <div className="card-content">
              <form onSubmit={handleSaveRequest}>
                <div style={{display:"flex",gap:'10px'}}>
                    <div style={{flex:1}}>
                      {/* <label className="form-label">Outlet <span style={{color: 'red'}}>*</span></label> */}
                      <DropInput
                        label="Outlet"
                        value={selectedDepartment}
                        onChange={e => setSelectedDepartment(e.target.value)}
                        options={[
                          { label: "Select outlet", value: "select outlet" },
                          { label: "Cardiology", value: "Cardiology" },
                          { label: "Neurology", value: "Neurology" },
                          { label: "Orthopedics", value: "Orthopedics" }
                        ]}
                      
                        // width="70%"
                      />
                    </div>
                    <div style={{flex:1}}>
                      {/* <label className="form-label">Priority <span style={{color: 'red'}}>*</span></label> */}
                      <DropInput
                        label="Priority"
                        value={selectedPriority}
                        onChange={e => setSelectedPriority(e.target.value)}
                        options={[
                          { label: "Select priority", value: "" },
                          { label: "High", value: "High" },
                          { label: "Medium", value: "Medium" },
                          { label: "Low", value: "Low" }
                        ]}
                      
                        // width="70%"
                      />
                    </div>
                 
                    <div style={{flex:1}}>
                      <Input
                        label="Item /Kit"
                        type="text"
                        placeholder="Add item name"
                        value={itemInput}
                        onChange={(e) => setItemInput(e.target.value)}
                        required
                        // width={'70%'}
                      />
                    </div>  
                      <div style={{flex:1}}>
                          <Input
                            label="Quantity"
                            type="number"
                            placeholder="Enter quantity"
                            // min={1}
                            value={itemQuantity}
                            onChange={(e) => setItemQuantity(e.target.value)}
                            required
                            // width={'70%'}
                          />
                      </div>
                      <div style={{flex:1}}>
                        {/* <label className="form-label">Required Date <span style={{color: 'red'}}></span></label> */}
                        <DateInput
                          label="Required date"
                          // type="date"
                          // className="form-input"
                          value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                          onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : undefined)}
                          min={new Date().toISOString().split('T')[0]}
                          // required
                          // width={'70%'}
                        />
                      </div>
                </div>
                {/* </div> */}
               

                  <ButtonWithGradient
                  // className='button-gradient w-15 mt-2'
                
                  text="Add Request"
                  onClick={addItemToList}
                  disabled={!itemInput || !itemQuantity}
                  
                  type="button"
                />
              </form>
              {pendingItems.length > 0 && (
                <div className="mt-6">
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
          <div className="card mb-4">
            {/* Package Kits Card content (move all content from the Package Kits card here, remove flex/minWidth) */}
            <div className="card-header flex items-center justify-between">
              <h2 className="card-title flex items-center" style={{ fontWeight: 600, fontSize: '1.2rem' }}>
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
              <div className="flex justify-end" >
                <div className="search ml-auto ">
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
                          {/* <Eye size={16}/> */}
                          <FontAwesomeIcon icon={faEye} style={{ color: '#2196f3', fontSize: 16 }} />
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
          <div className="flex justify-end gap-2 mt-2" style={{justifyContent:'flex-end'}}>
            <div>
              <ButtonWithGradient
                type="button"
                className="button-gradient"
                onClick={() => setCurrentStep(1)}
              >
                Next
              </ButtonWithGradient>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Review & Approve Request Approval Review */}
      {currentStep === 1 && (
        <>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Previous Requests</h2>
            </div>
            <div className="card-content">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2 flex-wrap">
                  {/* Date Range Filters */}
                  <div className="flex flex-col">
                    
                    <DateInput
                      label="From Date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      width="180px"
                      max={toDate || format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                  <div className="flex flex-col">
                    
                    <DateInput
                      label="To Date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      width="180px"
                      min={fromDate}
                      max={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                  
                  <DropInput
                    label="Status"
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    options={[
                      { value: "all", label: "All Status" },
                      { value: "requested", label: "Requested" },
                      { value: "Approved", label: "Approved" }
                    ]}
                  />
                  <DropInput
                    label="Priority"
                    value={filterPriority}
                    onChange={e => setFilterPriority(e.target.value)}
                    options={[
                      { value: "all", label: "All Priorities" },
                      { value: "high", label: "High" },
                      { value: "medium", label: "Medium" },
                      { value: "low", label: "Low" }
                    ]}
                  />
                </div>
                <div className="relative flex-1 max-w-md ml-auto">
                  <Searchbar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
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
                data={filteredRequests}
              />
              {filteredRequests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No requests found matching your criteria.
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-content-end gap-2 mt-2">
            <ButtonWithGradient
              type="button"
              className="button-gradient"
              onClick={() => setCurrentStep(0)}
            >
              Back
            </ButtonWithGradient>
            <ButtonWithGradient
              type="button"
              className={`button-gradient ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => currentStep < 1 && setCurrentStep(1)}
              disabled={currentStep === 1}
            >
              Next
            </ButtonWithGradient>
          </div>
        </>
      )}

      {/* Create Kit Dialog */}
      {showCreateKit && (
        <div className="dialog-overlay">
          <div className="dialog-content" style={{ maxWidth: '800px', width: '80%', minHeight: '600px', boxShadow: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div className="card" style={{ boxShadow: 'none', width: '100%' }}>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Input
                        label="Kit Name"
                        value={kitName} 
                        onChange={e => setKitName(e.target.value)}
                        placeholder="Enter kit name" 
                        required 
                      />
                    </div>
                    <div>
                      <DropInput
                        label="Outlet"
                        value={kitDepartment}
                        onChange={e => setKitDepartment(e.target.value)}
                        options={[
                          { label: "Select outlet", value: "" },
                          { label: "OR-2", value: "OR-2" },
                          { label: "Cardiology", value: "Cardiology" },
                          { label: "Neurology", value: "Neurology" },
                          { label: "Orthopedics", value: "Orthopedics" }
                        ]}
                        width="100%"
                      />
                    </div>
                    <div>
                      <DropInput
                        label="Priority"
                        value={kitPriority}
                        onChange={e => setKitPriority(e.target.value)}
                        options={[
                          { label: "Select priority", value: "" },
                          { label: "High", value: "High" },
                          { label: "Medium", value: "Medium" },
                          { label: "Low", value: "Low" }
                        ]}
                        width="100%"
                      />
                    </div>
                   
                    <div>
                      <Input
                        label="Item/Kit"
                        value={kitItemName}
                        onChange={e => setKitItemName(e.target.value)}
                        placeholder="Add item name" 
                        required
                      />
                    </div>
                    <div>
                      <Input
                        label="Quantity"
                        type="number" 
                        value={kitItemQuantity}
                        onChange={e => setKitItemQuantity(e.target.value)}
                        placeholder="Enter quantity" 
                        required
                      />
                    </div>
                  </div>
                  <ButtonWithGradient
                    type="button"
                    onClick={handleAddKitItem}
                    disabled={!kitItemName || !kitItemQuantity || !kitDepartment || !kitPriority}
                  >
                    Add Item
                  </ButtonWithGradient>
                </form>
                
                {kitItems.length > 0 && (
                  <div className="mt-6">
                   
                    <Table
                      columns={[
                        { key: 'item', header: 'Item' },
                        { key: 'quantity', header: 'Quantity' },
                        { key: 'priority', header: 'Priority' },
                        { key: 'department', header: 'Department' }
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
                        disabled={!kitName || kitItems.length === 0}
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

      {/* Kit Details Dialog */}
      {showKitDetails && selectedKit && (
        <div className="dialog-overlay">
          <div className="dialog-content" style={{ maxWidth: '600px', width: '70%', boxShadow: 'none' }}>
            <div className="card" style={{ border: 'none', boxShadow: 'none' }}>
              <div className="card-header flex items-center justify-between" style={{ 
                borderBottom: '1px solid #f0f0f0', 
                padding: '12px 24px',
                background: '#f9f9f9'
              }}>
                <h2 className="card-title" style={{ 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: '#333', 
                  margin: 0,
                  fontFamily: "'Poppins', sans-serif"
                }}>Kit Details</h2>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowKitDetails(false)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>
              <div className="card-content" style={{ padding: '0 24px 24px' }}>
                <div className="grid grid-cols-2 gap-4 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#5a5a5a', margin: '0 0 4px 0' }}>Kit ID</p>
                    <p style={{ fontSize: '14px', color: '#333', margin: 0, fontWeight: 400 }}>{selectedKit.id}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#5a5a5a', margin: '0 0 4px 0' }}>Kit Name</p>
                    <p style={{ fontSize: '14px', color: '#333', margin: 0, fontWeight: 400 }}>{selectedKit.name}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#5a5a5a', margin: '0 0 4px 0' }}>Department</p>
                    <p style={{ fontSize: '14px', color: '#333', margin: 0, fontWeight: 400 }}>{selectedKit.department}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#5a5a5a', margin: '0 0 4px 0' }}>Priority</p>
                    <p style={{ fontSize: '14px', color: '#333', margin: 0, fontWeight: 400 }}>{selectedKit.priority}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p style={{ fontSize: '12px', color: '#5a5a5a', margin: '0 0 8px 0', fontWeight: 600 }}>Items</p>
                  <Table
                    columns={[
                      { key: 'item', header: 'Item' },
                      { key: 'quantity', header: 'Quantity' }
                    ]}
                    data={selectedKit.items.split(',').map((item: string, index: number) => ({
                      item: item.trim(),
                      quantity: selectedKit.quantity
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
    {/* </div> */}
    <Footer/>
    <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default RequestManagement;
