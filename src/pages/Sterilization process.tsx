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

  const [processes, setProcesses] = useState<SterilizationProcess[]>(() => {
    const savedProcesses = localStorage.getItem('sterilizationProcesses');
    try {
      return savedProcesses ? JSON.parse(savedProcesses) : [
        { id: "STE001", machine: "Autoclave-1", process: "Steam Sterilization", itemId: "REQ001", startTime: "10:30", endTime: "", status: "Paused", duration: 45 },
        { id: "STE002", machine: "Autoclave-2", process: "Chemical Sterilization", itemId: "REQ002", startTime: "09:15", endTime: "", status: "Completed", duration: 75 },
        { id: "STE003", machine: "Chemical Sterilizer-1", process: "Plasma Sterilization", itemId: "REQ002", startTime: "16:32", endTime: "", status: "In Progress", duration: 60 },
        { id: "STE004", machine: "Chemical Sterilizer-1", process: "Chemical Sterilization", itemId: "REQ002", startTime: "17:51", endTime: "", status: "Completed", duration: 75 },
        { id: "STE005", machine: "Chemical Sterilizer-1", process: "Chemical Sterilization", itemId: "REQ006", startTime: "14:28", endTime: "", status: "Completed", duration: 75 },
      ];
    } catch {
      return [];
    }
  });

  const [selectedMachine, setSelectedMachine] = useState("");
  const [selectedProcess, setSelectedProcess] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [machines, setMachines] = useState<Machine[]>(initialData.machines);
  const sterilizationMethods: SterilizationMethod[] = initialData.sterilizationMethods;
  const [availableRequests, setAvailableRequests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    localStorage.setItem('sterilizationProcesses', JSON.stringify(processes));
  }, [processes]);

  useEffect(() => {
    const savedRequests = localStorage.getItem('cssd_requests');
    if (savedRequests) {
      try {
        const requests = JSON.parse(savedRequests);
        setAvailableRequests(requests.filter((r: any) => r.status === "Completed"));
      } catch (error) {
        setAvailableRequests([]);
      }
    }
  }, []);

  // Machine status update handler
  const handleMachineStatusChange = (id: string, newStatus: string) => {
    setMachines(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
  };

  // Process actions
  const handleStatusChange = (id: string, newStatus: string) => {
    setProcesses(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };
  const handleResume = (id: string) => handleStatusChange(id, "In Progress");
  const handlePause = (id: string) => handleStatusChange(id, "Paused");
  const handleComplete = (id: string) => handleStatusChange(id, "Completed");

  // Start new process
  const startSterilization = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedMachine || !selectedProcess || !selectedRequestId) return;
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
    setProcesses([...processes, newProcess]);
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
                  <label className="form-label">Select Machine</label>
                  <select className="form-input" value={selectedMachine} onChange={e => setSelectedMachine(e.target.value)} required>
                    <option value="">Choose sterilization machine</option>
                    {machines.map(m => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="form-label">Sterilization Method</label>
                  <select className="form-input" value={selectedProcess} onChange={e => setSelectedProcess(e.target.value)} required>
                    <option value="">Choose sterilization method</option>
                    {sterilizationMethods.map(method => (
                      <option key={method.id} value={method.name}>{method.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="form-label">Item/Request ID</label>
                  <select className="form-input" value={selectedRequestId} onChange={e => setSelectedRequestId(e.target.value)} required>
                    <option value="">Select completed request ID</option>
                    {availableRequests.map(req => (
                      <option key={req.id} value={req.id}>{req.id}</option>
                    ))}
                  </select>
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
          <div className="card-header flex items-center">
            <Activity className="mr-2 text-blue-600" /> Active Processes
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
