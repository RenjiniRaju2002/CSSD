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

  // Fetch sterilization processes from database
  useEffect(() => {
    fetch('http://192.168.50.132:3001/sterilizationProcesses')
      .then(res => res.json())
      .then(data => setProcesses(data))
      .catch(() => setProcesses([]));
  }, []);

  useEffect(() => {
    // Fetch completed requests from database
    fetch('http://192.168.50.132:3001/cssd_requests')
      .then(res => res.json())
      .then(data => {
        const completedRequests = data.filter((r: any) => r.status === "Completed");
        console.log('Completed requests for sterilization:', completedRequests);
        setAvailableRequests(completedRequests);
      })
      .catch(() => setAvailableRequests([]));
  }, []);

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
        <div className="grid2 grid-cols-3 md:grid-cols-3 gap-6 mb-6 mt-3">
          <Cards title="In Progress" subtitle={inProgressCount} />
          <Cards title="Completed Today" subtitle={completedTodayCount} />
          <Cards title="Alerts" subtitle={alertCount} />
        </div>
        {/* Top grid: Start New Sterilization & Machine Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Start New Sterilization */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Start New Sterilization</h2>
            </div>
            <div className="card-content">
              <form onSubmit={startSterilization}>
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
                    <option value="">Select completed request ID</option>
                    {availableRequests.map(req => (
                        <option key={req.id} value={req.id}>
                          {req.id} - {req.department} ({req.items})
                        </option>
                    ))}
                  </select>
                    <ButtonWithGradient 
                      type="button" 
                      className="button-gradient px-3"
                      onClick={() => {
                        fetch('http://192.168.50.132:3001/cssd_requests')
                          .then(res => res.json())
                          .then(data => {
                            const completedRequests = data.filter((r: any) => r.status === "Completed");
                            setAvailableRequests(completedRequests);
                          });
                      }}
                    >
                      Refresh
                    </ButtonWithGradient>
                  </div>
                  {availableRequests.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">No completed requests available. Complete a request in Receive Items first.</p>
                  )}
                </div>
                <ButtonWithGradient type="submit" className="button-gradient w-full" disabled={!selectedMachine || !selectedProcess || !selectedRequestId}>
                  Start Sterilization Process
                </ButtonWithGradient>
              </form>
            </div>
          </div>
          {/* Machine Status */}
          <div className="card">
            <div className="card-header flex items-center text-red-600">
              <AlertCircle className="mr-2" /> Machine Status
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
        {/* Active Processes Table */}
        <div className="card mb-6 mt-2">
          <div className="card-header">
            <h2 className="card-title">Active Processes</h2>
          </div>
          <div className="card-content">
            <Table columns={columns} data={processes} />
          </div>
        </div>
      </PageContainer>
      <Footer />
    </>
  );
};

export default SterilizationProcess;
