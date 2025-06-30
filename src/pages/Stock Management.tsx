import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Package, Edit, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Header from "./Header";
import Footer from "./Footer";
import initialData from "../../data/stockManagementData.json";
import "./StockManagement.css";

const StockManagement = ({ sidebarCollapsed, toggleSidebar }) => {
  const [stockItems, setStockItems] = useState(() => {
    const savedItems = localStorage.getItem('stockItems');
    return savedItems ? JSON.parse(savedItems) : initialData.stockItems;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);

  useEffect(() => {
    const loadStockItems = () => {
      try {
        const stock = localStorage.getItem('stockItems');
        const parsedStock = stock ? JSON.parse(stock) : [];

        const processes = localStorage.getItem('sterilizationProcesses');
        const parsedProcesses = processes ? JSON.parse(processes) : [];
        const inProgressItems = parsedProcesses.filter(p => p.status === "In Progress").map(p => p.itemId);

        const updatedStock = parsedStock.map(item => ({
          ...item,
          status: inProgressItems.includes(item.id) ? "In Sterilization" : item.status
        }));

        setStockItems(updatedStock);
      } catch (error) {
        console.error('Error loading stock items:', error);
      }
    };

    loadStockItems();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'stockItems' || event.key === 'sterilizationProcesses') {
        loadStockItems();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock": return "status-instock";
      case "Low Stock": return "status-lowstock";
      case "In Sterilization": return "status-sterilization";
      default: return "status-default";
    }
  };

  const handleAddItem = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const newItem = {
      id: `STK${String(stockItems.length + 1).padStart(3, '0')}`,
      name: formData.get('itemName') as string,
      category: formData.get('category') as string,
      quantity: parseInt(formData.get('quantity') as string),
      location: formData.get('location') as string,
      minLevel: parseInt(formData.get('minLevel') as string),
      status: parseInt(formData.get('quantity') as string) > parseInt(formData.get('minLevel') as string) ? "In Stock" : "Low Stock"
    };
    const updatedItems = [...stockItems, newItem];
    setStockItems(updatedItems);
    localStorage.setItem('stockItems', JSON.stringify(updatedItems));
    setShowAddItem(false);
  };

  const handleEditItem = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const updatedItem = {
      ...editingItem,
      name: formData.get('itemName') as string,
      category: formData.get('category') as string,
      quantity: parseInt(formData.get('quantity') as string),
      location: formData.get('location') as string,
      minLevel: parseInt(formData.get('minLevel') as string),
      status: parseInt(formData.get('quantity') as string) > parseInt(formData.get('minLevel') as string) ? "In Stock" : "Low Stock"
    };
    const updatedItems = stockItems.map(item => item.id === editingItem.id ? updatedItem : item);
    setStockItems(updatedItems);
    localStorage.setItem('stockItems', JSON.stringify(updatedItems));
    setShowEditItem(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = stockItems.filter(item => item.id !== itemId);
    setStockItems(updatedItems);
    localStorage.setItem('stockItems', JSON.stringify(updatedItems));
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setShowEditItem(true);
  };

  const filteredItems = stockItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = stockItems.filter(item => item.status === "Low Stock").length;
  const totalItems = stockItems.length;

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className="stock-container">
        {/* Top Section */}
        <div className="stock-heading">
          <h1>Stock Management</h1>
          <p>Manage inventory items and stock levels</p>
        </div>

        {/* Stats Cards */}
        <div className="stock-stats">
          <Card className="card-box">
            <CardHeader><CardTitle className="title-blue"><Package /> Total Items</CardTitle></CardHeader>
            <CardContent>
              <div className="card-count">{totalItems}</div>
              <p>Total items in stock</p>
            </CardContent>
          </Card>

          <Card className="card-box">
            <CardHeader><CardTitle className="title-orange"><Edit /> Low Stock Items</CardTitle></CardHeader>
            <CardContent>
              <div className="card-count">{lowStockCount}</div>
              <p>Items below minimum level</p>
            </CardContent>
          </Card>

          <Card className="card-box">
            <CardHeader><CardTitle className="title-green"><Eye /> Categories</CardTitle></CardHeader>
            <CardContent>
              <div className="card-count">2</div>
              <p>Number of categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Management Table */}
        <Card className="inventory-box">
          <CardHeader className="inventory-header">
            <div className="inventory-header-top">
              <CardTitle className="inventory-title"><Package /> Inventory Management</CardTitle>
              <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
                <DialogTrigger asChild>
                  <Button className="btn-add"><Plus /> Add Item</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add New Item</DialogTitle></DialogHeader>
                  <form onSubmit={handleAddItem} className="form-grid">
                    <Label htmlFor="itemName">Item Name</Label>
                    <Input name="itemName" required />

                    <Label htmlFor="category">Category</Label>
                    <Select name="category" required>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Reusable">Reusable</SelectItem>
                        <SelectItem value="Non-Reusable">Non-Reusable</SelectItem>
                      </SelectContent>
                    </Select>

                    <Label htmlFor="quantity">Quantity</Label>
                    <Input name="quantity" type="number" min="0" required />

                    <Label htmlFor="minLevel">Min Level</Label>
                    <Input name="minLevel" type="number" min="0" required />

                    <Label htmlFor="location">Location</Label>
                    <Input name="location" required />

                    <Button type="submit" className="btn-primary">Add Item</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="search-container">
              <Search className="search-icon" />
              <Input placeholder="Search inventory..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </CardHeader>

          <CardContent className="table-content">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Item ID</th><th>Name</th><th>Category</th><th>Quantity</th><th>Location</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.quantity}</td>
                    <td>{item.location}</td>
                    <td><span className={`status-pill ${getStatusColor(item.status)}`}>{item.status}</span></td>
                    <td>
                      <div className="action-buttons">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}><Edit /> Edit</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)}><Trash2 /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={showEditItem} onOpenChange={setShowEditItem}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Item</DialogTitle></DialogHeader>
            {editingItem && (
              <form onSubmit={handleEditItem} className="form-grid">
                <Label htmlFor="itemName">Item Name</Label>
                <Input name="itemName" defaultValue={editingItem.name} required />

                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue={editingItem.category} required>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Reusable">Reusable</SelectItem>
                    <SelectItem value="Non-Reusable">Non-Reusable</SelectItem>
                  </SelectContent>
                </Select>

                <Label htmlFor="quantity">Quantity</Label>
                <Input name="quantity" type="number" defaultValue={editingItem.quantity} required />

                <Label htmlFor="minLevel">Min Level</Label>
                <Input name="minLevel" type="number" defaultValue={editingItem.minLevel} required />

                <Label htmlFor="location">Location</Label>
                <Input name="location" defaultValue={editingItem.location} required />

                <Button type="submit" className="btn-primary">Update Item</Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </>
  );
};

export default StockManagement;

