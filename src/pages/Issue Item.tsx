import { useState, useEffect } from "react";
import "../styles/IssueItem.css";
import { Search, Send, Clock, CheckCircle } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ButtonWithGradient from "../components/ButtonWithGradient";
import Inputtype from "../components/Inputtype";
import Searchbar from "../components/Searchbar";
import Table from "../components/Table";
import PageContainer from "../components/PageContainer";
import Cards from "../components/Cards";
import SectionHeading from "../components/SectionHeading";

interface AvailableItem {
  id: string;
  department: string;
  items: string;
  quantity: number;
  status: string;
  readyTime: string;
  sterilizationId?: string;
  machine?: string;
  process?: string;
}

interface IssueItemProps {
  sidebarCollapsed?: boolean;
  toggleSidebar?: () => void;
}

const defaultAvailableItems: AvailableItem[] = [
  {
    id: "REQ001",
    department: "OR-1",
    items: "Surgery Kit",
    quantity: 2,
    status: "Sterilized",
    readyTime: "14:00",
  },
  {
    id: "REQ002",
    department: "OR-2",
    items: "Instruments",
    quantity: 3,
    status: "Sterilized",
    readyTime: "15:00",
  },
];

const IssueItem: React.FC<IssueItemProps> = ({ sidebarCollapsed = false, toggleSidebar }) => {
  const [issuedItems, setIssuedItems] = useState(() => {
    const savedItems = localStorage.getItem("issuedItems");
    return savedItems
      ? JSON.parse(savedItems)
      : [
          {
            id: "ISS001",
            requestId: "REQ001",
            department: "OR-1",
            items: "Surgery Kit",
            quantity: 2,
            issuedTime: "14:30",
            issuedDate: "2024-06-10",
            status: "Issued",
          },
          {
            id: "ISS002",
            requestId: "REQ002",
            department: "OR-2",
            items: "Instruments",
            quantity: 3,
            issuedTime: "15:15",
            issuedDate: "2024-06-10",
            status: "Issued",
          },
        ];
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [availableItems, setAvailableItems] = useState<AvailableItem[]>(() => {
    const saved = localStorage.getItem("availableItems");
    return saved ? JSON.parse(saved) : defaultAvailableItems;
  });
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [requestIds, setRequestIds] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem("issuedItems", JSON.stringify(issuedItems));
  }, [issuedItems]);

  useEffect(() => {
    localStorage.setItem("availableItems", JSON.stringify(availableItems));
  }, [availableItems]);

  // Sync availableItems with completed sterilization processes
  useEffect(() => {
    const savedProcesses = localStorage.getItem("sterilizationProcesses");
    if (savedProcesses) {
      try {
        const processes = JSON.parse(savedProcesses);
        const completed = processes.filter((p: any) => p.status === "Completed");
        setAvailableItems(prev => {
          // Only add if not already present
          const existingIds = new Set(prev.map(item => item.id));
          const newItems = completed.filter((p: any) => !existingIds.has(p.itemId)).map((p: any) => ({
            id: p.itemId,
            department: p.machine || "",
            items: p.process || "Sterilized Item",
            quantity: 1, // Default, adjust if you have quantity info
            status: "Sterilized",
            readyTime: p.endTime || "",
            sterilizationId: p.id,
            machine: p.machine,
            process: p.process,
          }));
          return [...prev, ...newItems];
        });
      } catch {}
    }
  }, []);

  useEffect(() => {
    const savedRequests = localStorage.getItem("cssd_requests");
    if (savedRequests) {
      try {
        const requests = JSON.parse(savedRequests);
        const filtered = requests.filter((r: any) => r.status === "Requested" || r.status === "In Progress").map((r: any) => r.id);
        setRequestIds(filtered);
      } catch {
        setRequestIds([]);
      }
    }
  }, []);

  const handleIssueItem = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedRequestId || !selectedOutlet) return;
    const itemToIssue = availableItems.find((item) => item.id === selectedRequestId);
    if (!itemToIssue) return;
    const newIssue = {
      id: `ISS${String(issuedItems.length + 1).padStart(3, "0")}`,
      requestId: itemToIssue.id,
      department: selectedOutlet,
      items: itemToIssue.items,
      quantity: itemToIssue.quantity,
      issuedTime: new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
      issuedDate: new Date().toISOString().split("T")[0],
      status: "Issued",
    };
    setIssuedItems([...issuedItems, newIssue]);
    setAvailableItems((prev) => prev.filter((item) => item.id !== selectedRequestId));
    setSelectedRequestId("");
    setSelectedOutlet("");
    // Optionally show a notification here
    // alert(`${newIssue.items} issued to ${selectedOutlet}`);
  };

  const filteredIssuedItems = issuedItems.filter(
    (item: any) =>
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table columns for issued items
  const columns = [
    { key: "id", header: "Issue ID" },
    { key: "requestId", header: "Request ID" },
    { key: "department", header: "Department" },
    { key: "items", header: "Items" },
    { key: "quantity", header: "Qty" },
    { key: "issuedTime", header: "Time" },
    { key: "issuedDate", header: "Date" },
    { key: "status", header: "Status", render: (row: any) => (
      <span className={`status-badge status-${row.status.toLowerCase()}`}>{row.status}</span>
    ) },
  ];

  // Summary values
  const availableCount = availableItems.length;
  const today = new Date().toISOString().split("T")[0];
  const issuedTodayCount = issuedItems.filter((item: any) => item.issuedDate === today).length;
  const totalIssuedCount = issuedItems.length;

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator/>
      <PageContainer>
      <SectionHeading 
          title="Issue Item" 
          subtitle="Issue sterilized items to departments and outlets" 
          className="Issueitem-heading w-100" 
        />
         <div className="grid2 grid-cols-3 md:grid-cols-3 gap-6 mb-6">
          <Cards title="Available" subtitle={availableCount} />
          <Cards title="Issued Today" subtitle={issuedTodayCount} />
          <Cards title="Total Issued" subtitle={totalIssuedCount} />
         </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="issue-card">
            <div className="issue-card-header">
              <Send className="icon"  /> Issue Items
        </div>
            <div className="issue-card-content">
              <form onSubmit={handleIssueItem} className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="requestId">Request ID</label>
                  <select
                    id="requestId"
                    name="requestId"
                    className="form-input"
                    value={selectedRequestId}
                    onChange={(e) => setSelectedRequestId(e.target.value)}
                    required
                  >
                    <option value="">Select sterilized item to issue</option>
                    {Array.from(new Set([...availableItems.map(item => item.id), ...requestIds])).map(id => {
                      const item = availableItems.find(i => i.id === id);
                      return (
                        <option key={id} value={id}>
                          {id}{item ? ` - ${item.items} (${item.quantity})` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="outlet">Department/Outlet</label>
                  <select
                    id="outlet"
                    name="outlet"
                    className="form-input"
                    value={selectedOutlet}
                    onChange={(e) => setSelectedOutlet(e.target.value)}
                    required
                  >
                    <option value="">Select destination</option>
                    <option value="OR-1">Operating Room 1</option>
                    <option value="OR-2">Operating Room 2</option>
                    <option value="ICU">ICU</option>
                  </select>
                </div>
                <div className="form-row">
                  <div>
                    <label className="form-label">Issue Time</label>
                    <input
                      className="form-input"
                      type="text"
                      value={new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="form-label">Issue Date</label>
                    <input
                      className="form-input"
                      type="text"
                      value={new Date().toISOString().split("T")[0]}
                      readOnly
                    />
                  </div>
                </div>
                <ButtonWithGradient type="submit" className="button-gradient w-full" disabled={!selectedRequestId || !selectedOutlet}>
                  Issue Item
                </ButtonWithGradient>
              </form>
            </div>
          </div>
          <div className="issue-card">
            <div className="issue-card-header">
              <CheckCircle className="icon" /> Available Items
            </div>
            <div className="issue-card-content">
              <div className="available-items">
                {availableItems.length === 0 ? (
                  <div>No sterilized items available</div>
                ) : (
                  availableItems.map((item) => (
                    <div className="available-item" key={item.id}>
                    <div>
                        <div className="item-id">{item.id}</div>
                        <div className="item-name">{item.items}</div>
                        <div className="item-details">
                          Qty: {item.quantity} | Ready: {item.readyTime}
                        </div>
                        <div className="item-sterilized">
                          Sterilized: {item.machine} - {item.process}
                        </div>
                      </div>
                      <span className="status-badge status-sterilized">Sterilized</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="issue-table">
          <div className="issue-table-header">
             Issue History
            <div className="search-container">
              <Searchbar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="issue-table-content">
            <Table columns={columns} data={filteredIssuedItems} />
          </div>
        </div>
       
      </PageContainer>
      <Footer />
    </>
  );
};

export default IssueItem;
