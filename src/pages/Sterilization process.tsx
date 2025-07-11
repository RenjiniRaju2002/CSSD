import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageContainer from "../components/PageContainer";
import SectionHeading from "../components/SectionHeading";
import Table from "../components/Table";
import Searchbar from "../components/Searchbar";
import ButtonWithGradient from "../components/ButtonWithGradient";
import { Play, Pause, Square, Activity, Plus, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import "../styles/SterilizationProcess.css";
import Cards from "../components/Cards";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import Stepper from '../components/Stepper';

interface SterilizationProcessProps {
  sidebarCollapsed?: boolean;
  toggleSidebar?: () => void;
}

interface SterilizationProcess {
  id: string;
  machine: string;
  process: string;
  itemId: string;
  startTime: string;
  endTime: string;
  status: string;
  duration: number;
}

interface Machine {
  id: string;
  name: string;
  status: string;
}

interface SterilizationMethod {
  id: string;
  name: string;
  duration: number;
}

const SterilizationProcess: React.FC<SterilizationProcessProps> = ({ sidebarCollapsed = false, toggleSidebar }) => {
  const initialData = {
    machines: [
      { id: "M1", name: "Autoclave-1", status: "Available" },
      { id: "M2", name: "Autoclave-2", status: "In Use" },
      { id: "M3", name: "Autoclave-3", status: "Maintenance" },
      { id: "M4", name: "Chemical Sterilizer-1", status: "Available" },
    ],
    sterilizationMethods: [
      { id: "S1", name: "Steam Sterilization", duration: 45 },
      { id: "S2", name: "Chemical Sterilization", duration: 75 },
      { id: "S3", name: "Plasma Sterilization", duration: 60 },
    ],
  };

  const [processes, setProcesses] = useState<SterilizationProcess[]>([]);

  const [selectedMachine, setSelectedMachine] = useState("");
  const [selectedProcess, setSelectedProcess] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [machines, setMachines] = useState<Machine[]>(initialData.machines);
  const sterilizationMethods: SterilizationMethod[] = initialData.sterilizationMethods;
  const [availableRequests, setAvailableRequests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showMachineStatusModal, setShowMachineStatusModal] = useState(false);
  const [eyeHover, setEyeHover] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [lastStartedProcessId, setLastStartedProcessId] = useState<string | null>(null);
  const stepLabels = [
    'Start Sterilization',
    'Active Processes',
    'Available Items'
  ];

  // Fetch sterilization processes from database
  useEffect(() => {
    fetch('http://192.168.50.132:3001/sterilizationProcesses')
      .then(res => res.json())
      .then(data => setProcesses(data))
      .catch(() => setProcesses([]));
  }, []);

  useEffect(() => {
    // Fetch approved requests from database
    fetch('http://192.168.50.132:3001/cssd_requests')
      .then(res => res.json())
      .then(data => {
        const approvedRequests = data.filter((r: any) => r.status === "Approved");
        setAvailableRequests(approvedRequests);
      })
      .catch(() => setAvailableRequests([]));
  }, []);

  // Auto-complete processes when duration is over
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      processes.forEach((process) => {
        if (process.status === "In Progress" && process.startTime && process.duration) {
          // Parse startTime (format: HH:mm)
          const [startHour, startMinute] = process.startTime.split(":").map(Number);
          const startDate = new Date();
          startDate.setHours(startHour, startMinute, 0, 0);
          // Calculate elapsed minutes
          const elapsedMinutes = (now.getTime() - startDate.getTime()) / 60000;
          if (elapsedMinutes >= process.duration) {
            handleStatusChange(process.id, "Completed");
          }
        }
      });
    }, 30000); // check every 30 seconds
    return () => clearInterval(interval);
  }, [processes]);

  // Machine status update handler
  const handleMachineStatusChange = (id: string, newStatus: string) => {
    setMachines(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
  };

  // Process actions
  const handleStatusChange = async (id: string, newStatus: string) => {
    const processToUpdate = processes.find(p => p.id === id);
    if (!processToUpdate) return;

    const updateData: any = { status: newStatus };
    
    // If completing the process, set the end time
    if (newStatus === "Completed" && !processToUpdate.endTime) {
      updateData.endTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    }

    const updatedProcesses = processes.map(p => p.id === id ? { ...p, ...updateData } : p);
    setProcesses(updatedProcesses);

    // Update in database
    await fetch(`http://192.168.50.132:3001/sterilizationProcesses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    // Show alert for pause/resume
    if (newStatus === "Paused") {
      alert("Process paused!");
    } else if (newStatus === "In Progress") {
      alert("Process resumed!");
    }

    // If completing the process, add to available items
    if (newStatus === "Completed") {
      try {
        // Fetch the original request details
        const requestResponse = await fetch(`http://192.168.50.132:3001/cssd_requests/${processToUpdate.itemId}`);
        if (requestResponse.ok) {
          const requestData = await requestResponse.json();
          
          // Create available item
          const availableItem = {
            id: processToUpdate.itemId,
            department: requestData.department || processToUpdate.machine || "",
            items: requestData.items || processToUpdate.process || "Sterilized Item",
            quantity: requestData.quantity || 1,
            status: "Sterilized",
            readyTime: updateData.endTime || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            sterilizationId: processToUpdate.id,
            machine: processToUpdate.machine,
            process: processToUpdate.process,
          };

          // Check if item already exists in available items
          const existingItemsResponse = await fetch('http://192.168.50.132:3001/availableItems');
          const existingItems = await existingItemsResponse.json();
          const existingItem = existingItems.find((item: any) => item.id === processToUpdate.itemId);

          if (!existingItem) {
            // Add to available items database
            const addResponse = await fetch('http://192.168.50.132:3001/availableItems', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(availableItem),
            });
            
            if (addResponse.ok) {
              console.log('Item added to available items:', availableItem);
            } else {
              console.error('Failed to add item to available items');
            }
          } else {
            console.log('Item already exists in available items:', processToUpdate.itemId);
            // Update the existing item with new sterilization info
            const updateResponse = await fetch(`http://192.168.50.132:3001/availableItems/${processToUpdate.itemId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                readyTime: updateData.endTime,
                sterilizationId: processToUpdate.id,
                machine: processToUpdate.machine,
                process: processToUpdate.process,
              }),
            });
            
            if (updateResponse.ok) {
              console.log('Updated existing item with new sterilization info:', processToUpdate.itemId);
            }
          }
        }
      } catch (error) {
        console.error('Error adding item to available items:', error);
      }
    }
  };
  
  const handleResume = (id: string) => handleStatusChange(id, "In Progress");
  const handlePause = (id: string) => handleStatusChange(id, "Paused");
  const handleComplete = (id: string) => handleStatusChange(id, "Completed");

  // Start new process
  const startSterilization = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedMachine) {
      alert('Please select the Machine');
      return;
    }
    if (!selectedProcess) {
      alert('Please select the Sterilization Method');
      return;
    }
    if (!selectedRequestId) {
      alert('Please select the Item/Request ID');
      return;
    }
    
    const newProcess: SterilizationProcess = {
      id: `STE${String(processes.length + 1).padStart(3, '0')}`,
      machine: selectedMachine,
      process: selectedProcess,
      itemId: selectedRequestId,
      startTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      endTime: "",
      status: "In Progress",
      duration: sterilizationMethods.find(method => method.name === selectedProcess)?.duration || 45
    };

    // Save to database
    await fetch('http://192.168.50.132:3001/sterilizationProcesses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProcess)
    });

    // Fetch updated processes
    const res = await fetch('http://192.168.50.132:3001/sterilizationProcesses');
    const updated = await res.json();
    setProcesses(updated);

    setSelectedMachine("");
    setSelectedProcess("");
    setSelectedRequestId("");
  };

  // Summary cards
  const inProgressCount = processes.filter(p => p.status === "In Progress").length;
  const completedTodayCount = processes.filter(p => p.status === "Completed").length;
  const alertCount = machines.filter(m => m.status === "Maintenance").length;

  // Table columns
  const columns = [
    { key: 'id', header: 'Process ID' },
    { key: 'machine', header: 'Machine' },
    { key: 'process', header: 'Method' },
    { key: 'itemId', header: 'Item ID' },
    { key: 'startTime', header: 'Start Time' },
    { key: 'duration', header: 'Duration' },
    {
      key: 'status',
      header: 'Status',
      render: (row: SterilizationProcess) => (
        <select
          className="form-input text-sm"
          value={row.status}
          onChange={e => handleStatusChange(row.id, e.target.value)}
        >
          <option value="In Progress">In Progress</option>
          <option value="Paused">Paused</option>
          <option value="Completed">Completed</option>
        </select>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: SterilizationProcess) => (
        <div className="flex gap-1">
          {row.status === "Paused" && (
            <ButtonWithGradient className="btn-with-gradient btn-sm" onClick={() => handleResume(row.id)} aria-label="Resume">
              <Play size={16} />
            </ButtonWithGradient>
          )}
          {row.status === "In Progress" && (
            <>
              <ButtonWithGradient className="btn-with-gradient btn-sm" onClick={() => handlePause(row.id)} aria-label="Pause">
                <Pause size={16} />
              </ButtonWithGradient>
              <ButtonWithGradient className="btn-with-gradient btn-sm" onClick={() => handleComplete(row.id)} aria-label="Complete">
                <Square size={16} />
              </ButtonWithGradient>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator />
      <PageContainer>
        <SectionHeading 
          title="Sterilization Process" 
          subtitle="Manage sterilization cycles and monitor progress" 
          className="sterilization-heading w-100" 
        />
        <Stepper currentStep={currentStep} steps={stepLabels} />
        <div className="grid2 grid-cols-3 md:grid-cols-3 gap-6 mb-6 mt-3">
          <Cards title="In Progress" subtitle={inProgressCount} />
          <Cards title="Completed Today" subtitle={completedTodayCount} />
          <Cards title="In Maintenance" subtitle={alertCount} />
        </div>
        {/* Step 1: Start Sterilization */}
        {currentStep === 0 && (
          <div className="card mb-4">
            <div className="card-header flex items-center justify-between" style={{ position: 'relative' }}>
              <h2 className="card-title">Start New Sterilization</h2>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <FontAwesomeIcon
                  icon={faEye}
                  style={{ color: '#2196f3', fontSize: 16, cursor: 'pointer' }}
                  onClick={() => setShowMachineStatusModal(true)}
                  onMouseEnter={() => setEyeHover(true)}
                  onMouseLeave={() => setEyeHover(false)}
                />
                {eyeHover && (
                  <div style={{
                    position: 'absolute',
                    bottom: '120%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#222',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}>
                    Machine Status
                  </div>
                )}
              </div>
            </div>
            <div className="card-content">
              <form onSubmit={async (event) => {
                await startSterilization(event);
                if (selectedMachine && selectedProcess && selectedRequestId) {
                  setTimeout(() => {
                    const latest = processes[processes.length];
                    setLastStartedProcessId(latest?.id || null);
                    setCurrentStep(1);
                  }, 300);
                }
              }}>
                <div className="mb-4">
                    <label className="form-label">Select Machine <span style={{color: 'red'}}>*</span></label>
                    <select className="form-input" value={selectedMachine} onChange={e => setSelectedMachine(e.target.value)} required>
                      <option value="">Choose sterilization machine</option>
                      {machines.map(m => (
                        <option key={m.id} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Sterilization Method <span style={{color: 'red'}}>*</span></label>
                    <select className="form-input" value={selectedProcess} onChange={e => setSelectedProcess(e.target.value)} required>
                      <option value="">Choose sterilization method</option>
                      {sterilizationMethods.map(method => (
                        <option key={method.id} value={method.name}>{method.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Item/Request ID <span style={{color: 'red'}}>*</span></label>
                    <div className="flex gap-2">
                      <select className="form-input flex-1" value={selectedRequestId} onChange={e => setSelectedRequestId(e.target.value)} required>
                      <option value="">Select approved request ID</option>
                      {availableRequests.map(req => (
                          <option key={req.id} value={req.id}>
                            {req.id} - {req.department} ({req.items})
                          </option>
                      ))}
                    </select>
                   
                    </div>
                    {availableRequests.length === 0 && (
                      <p className="text-sm text-gray-500 mt-1">No approved requests available. Approve a request in Receive Items first.</p>
                    )}
                  </div>
                  <ButtonWithGradient type="submit" className="button-gradient w-full" disabled={!selectedMachine || !selectedProcess || !selectedRequestId}>
                    Start Sterilization Process
                  </ButtonWithGradient>
                </form>
              </div>
            <div className="flex justify-content-end gap-2 mt-2">
              <ButtonWithGradient type="button" className="button-gradient" disabled>
                Back
              </ButtonWithGradient>
              <ButtonWithGradient type="button" className="button-gradient" onClick={() => setCurrentStep(1)}>
                Next
              </ButtonWithGradient>
            </div>
          </div>
        )}
          {/* Step 2: Active Processes */}
          {currentStep === 1 && (
            <>
              <div className="card mb-4">
                <div className="card-header">
                  <h2 className="card-title">Active Processes</h2>
                </div>
                <div className="card-content">
                  <Table columns={columns} data={processes} />
                </div>
                <div className="flex justify-end gap-2 mt-2"  style={{justifyContent:'flex-end'}}>
                  <ButtonWithGradient type="button" className="button-gradient" onClick={() => setCurrentStep(0)}>
                    Back
                  </ButtonWithGradient>
                  <ButtonWithGradient type="button" className="button-gradient" onClick={() => setCurrentStep(2)}>
                    Next
                  </ButtonWithGradient>
                </div>
              </div>
            </>
          )}
          {/* Step 3: Available Items */}
          {currentStep === 2 && (
            <>
              <div className="card mb-4">
                <div className="card-header">
                  <h2 className="card-title">Available Items</h2>
                </div>
                <div className="card-content">
                  {/* Show all completed sterilization processes as available items */}
                  <Table
                    columns={[
                      { key: 'id', header: 'Process ID' },
                      { key: 'machine', header: 'Machine' },
                      { key: 'process', header: 'Method' },
                      { key: 'itemId', header: 'Item ID' },
                      { key: 'endTime', header: 'End Time' },
                      {
                        key: 'status',
                        header: 'Status',
                        render: () => <span className="status-badge status-sterilized text-center justify-content-center">Sterilized</span>
                      },
                    ]}
                    data={processes.filter(p => p.status === 'Completed')}
                  />
                </div>
                <div className="flex justify-content-end gap-2 mt-2">
                    <ButtonWithGradient type="button" className="button-gradient" onClick={() => setCurrentStep(1)}>
                      Back
                    </ButtonWithGradient>
                    <ButtonWithGradient type="button" className="button-gradient" disabled>
                      Next
                    </ButtonWithGradient>
                </div>
              </div>
            </>
          )}
        {/* Machine Status Modal */}
        {showMachineStatusModal && (
          <div className="dialog-overlay">
            <div className="dialog-content" style={{ maxWidth: '500px', width: '90%' }}>
              <div className="card">
                <div className="card-header flex items-center justify-between">
                  <span className="text-red-600 flex items-center"><AlertCircle className="mr-2" /> Machine Status</span>
                  <button className="text-gray-500 hover:text-gray-700 bg-white rounded-full w-8 h-8 flex items-center justify-center" onClick={() => setShowMachineStatusModal(false)} style={{ border: '1px solid #e5e7eb', boxShadow: 'none' }}>×</button>
                </div>
                <div className="card-content">
                  {machines.map(m => (
                    <div key={m.id} className="flex justify-between items-center mb-3">
                      <span>{m.name}</span>
                      <select className="form-input w-32" value={m.status} onChange={e => handleMachineStatusChange(m.id, e.target.value)}>
                        <option value="Available">Available</option>
                        <option value="In Use">In Use</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
      <Footer />
    </>
  );
};

export default SterilizationProcess;
