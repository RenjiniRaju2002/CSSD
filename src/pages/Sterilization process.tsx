import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Square, Timer, Activity, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "./Header";
import Footer from "./Footer";
import initialData from "../../data/sterilizationProcessData.json";
import "./SterilizationProcess.css";

const SterilizationProcess = ({ sidebarCollapsed, toggleSidebar }) => {
  const [processes, setProcesses] = useState(() => {
    const savedProcesses = localStorage.getItem('sterilizationProcesses');
    try {
      return savedProcesses ? JSON.parse(savedProcesses) : [
        { id: "STE001", machine: "Autoclave-1", process: "Steam Sterilization", itemId: "REQ001", startTime: "10:30", endTime: "", status: "In Progress", duration: 45 },
        { id: "STE002", machine: "Autoclave-2", process: "Chemical Sterilization", itemId: "REQ002", startTime: "09:15", endTime: "10:30", status: "Completed", duration: 75 },
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('sterilizationProcesses', JSON.stringify(processes));
  }, [processes]);

  const [selectedMachine, setSelectedMachine] = useState("");
  const [selectedProcess, setSelectedProcess] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const { toast } = useToast();
  const [machines, setMachines] = useState(initialData.machines);
  const sterilizationMethods = initialData.sterilizationMethods;
  const [availableRequests, setAvailableRequests] = useState([]);

  useEffect(() => {
    const savedRequests = localStorage.getItem('cssdRequests');
    if (savedRequests) {
      const requests = JSON.parse(savedRequests);
      setAvailableRequests(requests.filter(r => r.status === "Completed"));
    }
  }, []);

  const startSterilization = (event) => {
    event.preventDefault();
    const newProcess = {
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
    toast({ title: "Sterilization Started", description: `Process ${newProcess.id} has been initiated.` });
  };

  const completeProcess = (id) => {
    setProcesses(prev => {
      const updated = prev.map(p =>
        p.id === id ? { ...p, status: "Completed", endTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) } : p
      );
      localStorage.setItem('sterilizationProcesses', JSON.stringify(updated));
      return updated;
    });
    toast({ title: "Process Completed", description: `Sterilization process ${id} has been completed.` });
  };

  const pauseProcess = (id) => {
    setProcesses(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, status: "Paused" } : p);
      localStorage.setItem('sterilizationProcesses', JSON.stringify(updated));
      return updated;
    });
  };

  const resumeProcess = (id) => {
    setProcesses(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, status: "In Progress" } : p);
      localStorage.setItem('sterilizationProcesses', JSON.stringify(updated));
      return updated;
    });
  };

  const updateMachineStatus = (id, status) => {
    setMachines(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, status } : m);
      localStorage.setItem('cssdMachines', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className="container">
        <div className="section-header">
          <h1 className="title">Sterilization Process</h1>
          <p className="subtitle">Manage sterilization cycles and monitor progress</p>
        </div>

        <div className="grid-two">
          <Card className="card">
            <CardHeader className="card-padding">
              <CardTitle>Start New Sterilization</CardTitle>
            </CardHeader>
            <CardContent className="card-padding">
              <form onSubmit={startSterilization}>
                <Label>Select Machine</Label>
                <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                  <SelectTrigger className="select-trigger">
                    <SelectValue placeholder="Choose sterilization machine" />
                  </SelectTrigger>
                  <SelectContent>
                    {machines.filter(m => m.status === "Available").map(m => (
                      <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Label>Sterilization Method</Label>
                <Select value={selectedProcess} onValueChange={setSelectedProcess}>
                  <SelectTrigger className="select-trigger">
                    <SelectValue placeholder="Choose sterilization method" />
                  </SelectTrigger>
                  <SelectContent>
                    {sterilizationMethods.map(method => (
                      <SelectItem key={method.id} value={method.name}>{method.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Label>Request ID</Label>
                <Select value={selectedRequestId} onValueChange={setSelectedRequestId}>
                  <SelectTrigger className="select-trigger">
                    <SelectValue placeholder="Select completed request ID" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRequests.map(req => (
                      <SelectItem key={req.id} value={req.id}>{req.id}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button type="submit" className="button-primary">Start Sterilization</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SterilizationProcess;
