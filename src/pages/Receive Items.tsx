import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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


const ReceiveItems = ({ sidebarCollapsed, toggleSidebar }) => {
  const navigate = useNavigate();
  const [receivedItems, setReceivedItems] = useState(() => {
    const savedItems = localStorage.getItem("receivedItems");
    try {
      return savedItems ? JSON.parse(savedItems) : initialData.receivedItems;
    } catch (error) {
      console.error("Error loading received items:", error);
      return initialData.receivedItems;
    }
  });

  const [requestedItems, setRequestedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const savedRequests = localStorage.getItem("cssdRequests");
    if (savedRequests) {
      const requests = JSON.parse(savedRequests);
      setRequestedItems(requests);
    }
  }, []);

  const filteredItems = requestedItems.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.items.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      item.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className="receive-container">
        <div className="receive-header">
          <h1>Receive Items</h1>
          <p>Manage received requests and update status</p>
        </div>

        <div className="filter-section">
          <div className="search-input">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by Request ID, Department, or Items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <table className="request-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Department</th>
              <th>Items</th>
              <th>Quantity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.department}</td>
                <td>{item.items}</td>
                <td>{item.quantity}</td>
                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredItems.length === 0 && (
          <div className="empty-text">No requested items found</div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ReceiveItems;
