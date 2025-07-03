import { useState, useEffect} from "react";
import { useLocation ,useNavigate} from "react-router-dom";
import { format } from "date-fns";
import Header from "../components/Header";
// import { useToast } from "@/hooks/use-toast";
import Footer from "../components/Footer";
import "../styles/receiveitems.css";
import PageContainer from "../components/PageContainer";
import { Search, Eye, CheckCircle, Clock, XCircle } from "lucide-react";
import Table from "../components/Table";
import Searchbar from "../components/Searchbar";
import ButtonWithGradient from "../components/ButtonWithGradient";
import SectionHeading from "../components/SectionHeading";

interface RequestItem {
  id: string;
  department: string;
  items: string;
  quantity: number;
  priority: string;
  status: string;
  date: string;
  time: string;
}

interface ReceiveItemsProps {
  sidebarCollapsed?: boolean;
  toggleSidebar?: () => void;
}

const ReceiveItems: React.FC<ReceiveItemsProps> = ({ sidebarCollapsed = false, toggleSidebar }) => {
  const navigate = useNavigate();
  
  // Initial mock data for received items
  const initialReceivedItems = [
    { id: 1, department: "Department 1", items: "Item 1", quantity: 10, status: "Pending" },
    { id: 2, department: "Department 2", items: "Item 2", quantity: 20, status: "Processing" },
    { id: 3, department: "Department 3", items: "Item 3", quantity: 30, status: "Completed" }
  ];

  const [receivedItems, setReceivedItems] = useState(() => {
    const savedItems = localStorage.getItem("receivedItems");
    try {
      return savedItems ? JSON.parse(savedItems) : initialReceivedItems;
    } catch (error) {
      console.error("Error loading received items:", error);
      return initialReceivedItems;
    }
  });

  const [requestedItems, setRequestedItems] = useState<RequestItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetch('http://192.168.50.132:3001/cssd_requests')
      .then(res => res.json())
      .then(data => setRequestedItems(data))
      .catch(() => setRequestedItems([]));
  }, []);

  // Filter and paginate requests
  const sortedItems = [...requestedItems].sort((a, b) => a.id.localeCompare(b.id));
  const filteredItems = sortedItems.filter((item) => {
    const matchesSearch =
      item.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.items?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      item.status?.toLowerCase() === statusFilter.toLowerCase();

    const matchesPriority =
      priorityFilter === "all" ||
      item.priority?.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleStatusUpdate = (itemId: string, newStatus: string) => {
    fetch(`http://192.168.50.132:3001/cssd_requests/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
      .then(res => res.json())
      .then(() => {
        fetch('http://192.168.50.132:3001/cssd_requests')
          .then(res => res.json())
          .then(data => setRequestedItems(data));
      });
  };

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator/>
      <PageContainer>
        <SectionHeading title="Receive Items" subtitle="Manage received requests and update status" className="receiveitems-heading w-100" />
        
        <div className="card">
          {/* <div className="card-header"> */}
            {/* <h2 className="card-title">Previous Requests</h2> */}
          {/* </div> */}
          <div className="card-content">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <select
                  className="form-input text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="requested">Requested</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  className="form-input text-sm"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
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

            {currentItems.length > 0 ? (
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
                  {
                    key: 'actions',
                    header: 'Actions',
                    render: (item: any) => (
                      <div className="flex gap-2">
                        <select
                          className="form-input text-sm"
                          value={item.status}
                          onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
                        >
                          <option value="Requested">Requested</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    )
                  }
                ]}
                data={currentItems}
              />
            ) : (
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
      </PageContainer>
      <Footer />
    </>
  );
};

export default ReceiveItems;
