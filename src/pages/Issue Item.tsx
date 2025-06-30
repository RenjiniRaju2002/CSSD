import { useState, useEffect } from "react";
import "../styles/IssueItem.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Send, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "./Header";
import Footer from "./Footer";
import initialData from "../../data/issueItemData.json";

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

const IssueItem = ({ sidebarCollapsed, toggleSidebar }) => {
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
  const { toast } = useToast();
  const [availableItems, setAvailableItems] = useState<AvailableItem[]>(
    initialData.availableItems
  );

  useEffect(() => {
    localStorage.setItem("issuedItems", JSON.stringify(issuedItems));
  }, [issuedItems]);

  const handleIssueItem = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const requestId = formData.get("requestId") as string;
    const outlet = formData.get("outlet") as string;

    const itemToIssue = availableItems.find((item) => item.id === requestId);
    if (!itemToIssue) return;

    const newIssue = {
      id: `ISS${String(issuedItems.length + 1).padStart(3, "0")}`,
      requestId: itemToIssue.id,
      department: outlet,
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
    setAvailableItems((prev) => prev.filter((item) => item.id !== requestId));

    toast({
      title: "Item Issued Successfully",
      description: `${newIssue.items} issued to ${outlet}`,
    });

    (event.target as HTMLFormElement).reset();
  };

  const filteredIssuedItems = issuedItems.filter(
    (item) =>
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className="issue-container">
        <div className="issue-header">
          <h1>Issue Item</h1>
          <p>Issue sterilized items to departments and outlets</p>
        </div>

        <div className="issue-main-grid">
          <Card className="issue-card">
            <CardHeader>
              <CardTitle>
                <Send /> Issue Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleIssueItem} className="form-grid">
                <div>
                  <Label htmlFor="requestId">Request ID</Label>
                  <Select name="requestId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sterilized item to issue" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableItems.length === 0 ? (
                        <SelectItem value="" disabled>
                          No sterilized items available
                        </SelectItem>
                      ) : (
                        availableItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.id} - {item.items} ({item.quantity})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="outlet">Department/Outlet</Label>
                  <Select name="outlet" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OR-1">Operating Room 1</SelectItem>
                      <SelectItem value="OR-2">Operating Room 2</SelectItem>
                      <SelectItem value="ICU">ICU</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="form-time">
                  <div>
                    <Label>Time</Label>
                    <Input
                      type="time"
                      readOnly
                      defaultValue={new Date().toLocaleTimeString("en-US", {
                        hour12: false,
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    />
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      readOnly
                      defaultValue={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                <Button type="submit">Issue Item</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="issue-card">
            <CardHeader>
              <CardTitle>
                <CheckCircle /> Available Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="available-items">
                {availableItems.map((item) => (
                  <div key={item.id} className="available-item">
                    <div>
                      <h4>{item.id}</h4>
                      <p>{item.items}</p>
                      <p>Qty: {item.quantity}</p>
                    </div>
                    <span>{item.status}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="issue-table">
          <CardHeader>
            <CardTitle>
              <Clock /> Issue History
            </CardTitle>
            <div className="search-container">
              <Search className="search-icon" />
              <Input
                placeholder="Search issued items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <table>
              <thead>
                <tr>
                  <th>Issue ID</th>
                  <th>Request ID</th>
                  <th>Department</th>
                  <th>Items</th>
                  <th>Qty</th>
                  <th>Time</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssuedItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.requestId}</td>
                    <td>{item.department}</td>
                    <td>{item.items}</td>
                    <td>{item.quantity}</td>
                    <td>{item.issuedTime}</td>
                    <td>{item.issuedDate}</td>
                    <td>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
};

export default IssueItem;
