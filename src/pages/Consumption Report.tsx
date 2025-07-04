import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Download, BarChart3, Plus, BarChart2, TrendingUp, ClipboardList } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid, ResponsiveContainer } from "recharts";
import ButtonWithGradient from "../components/ButtonWithGradient";
import "../styles/consumptionreport.css";
import Cards from "../components/Cards";
import Table from "../components/Table";
import SectionHeading from "../components/SectionHeading";
import PageContainer from "../components/PageContainer";

interface ConsumptionReportsProps {
  sidebarCollapsed?: boolean;
  toggleSidebar?: () => void;
}

const ConsumptionReports: React.FC<ConsumptionReportsProps> = ({ sidebarCollapsed = false, toggleSidebar }) => {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [reportGenerated, setReportGenerated] = useState(true); // Set true for demo
  const [showAddModal, setShowAddModal] = useState(false);

  const lineChartData = [
    { week: "Week 8", count: 10 },
    { week: "Week 18", count: 0 },
    { week: "Week 29", count: 0 },
    { week: "Week 40", count: 0 },
    { week: "Week 56", count: 5 },
  ];

  const barChartData = [
    { department: "OR-1", count: 9 },
    { department: "OR-2", count: 7 },
  ];

  const summaryStats = [
    { title: "Total Consumption", value: 18, description: "Items consumed", icon: <BarChart2 size={20} color="#0ea5e9" />, color: "#0ea5e9" },
    { title: "Average per Surgery", value: 4.5, description: "Items per procedure", icon: <TrendingUp size={20} color="#22c55e" />, color: "#22c55e" },
    { title: "Total Surgeries", value: 4, description: "Procedures tracked", icon: <ClipboardList size={20} color="#a78bfa" />, color: "#a78bfa" },
  ];

  const [tableData, setTableData] = useState<any[]>([]);

  const [form, setForm] = useState({
    id: "",
    type: "",
    dept: "",
    date: "",
    before: "",
    after: "",
    used: "",
    items: "",
  });

  // Fetch consumption records from database
  useEffect(() => {
    fetch('http://192.168.50.132:3001/consumptionRecords')
      .then(res => res.json())
      .then(data => setTableData(data))
      .catch(() => setTableData([]));
  }, []);

  const tableColumns = [
    { key: "id", header: "Surgery ID" },
    { key: "type", header: "Surgery Type" },
    { key: "dept", header: "Department" },
    { key: "date", header: "Date" },
    { key: "before", header: "Before Count" },
    { key: "after", header: "After Count" },
    { key: "used", header: "Consumed", render: (row: any) => <span className="text-red">{row.used}</span> },
    { key: "items", header: "Items Used" },
  ];

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator />
      <PageContainer>
      <SectionHeading 
          title="Consumption Reports" 
          subtitle="Generate and analyze item consumption reports" 
          className="" 
        />

        {/* Report Filters */}
        <div className="report-card">
          <div className="report-card-header">
            <BarChart3 className="icon" /> Report Filters
        </div>
          <div className="report-card-body">
            <div className="filter-section">
              <div className="filter-group">
                <label className="form-label">From Date</label>
                <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </div>
              <div className="filter-group">
                <label className="form-label">To Date</label>
                <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>
              <div className="filter-group">
                <label className="form-label">Department</label>
                <select className="form-input" value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)}>
                  <option value="all">All Departments</option>
                  <option value="OR-1">OR-1</option>
                  <option value="OR-2">OR-2</option>
                </select>
              </div>
              <div className="filter-button-wrapper">
                <ButtonWithGradient onClick={() => setReportGenerated(true)}>Generate Report</ButtonWithGradient>
              </div>
            </div>
            <div className="export-buttons">
              <button className="export-btn-flat" disabled={!reportGenerated}><span>PDF</span></button>
              <button className="export-btn-flat" disabled={!reportGenerated}><span>Excel</span></button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="card-grid dashboard-summary-cards">
          {summaryStats.map(stat => (
            <Cards key={stat.title} title={stat.title} subtitle={stat.value} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="chart-grid">
          <div className="chart-box">
            <h4>Weekly Consumption Trend</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineChartData}>
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-box">
            <h4>Outlet-wise Consumption</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barChartData}>
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#a78bfa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Consumption Table */}
        <div className="table-box">
          <div className="table-header">
            <h3>Surgery Item Consumption Details</h3>
            <ButtonWithGradient onClick={() => setShowAddModal(true)}><Plus /> Add Consumption Record</ButtonWithGradient>
          </div>
          <Table columns={tableColumns} data={tableData} />
        </div>
       </PageContainer>
      {showAddModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowAddModal(false)} />
          <div className="shortcuts-modal">
            <div className="modal-header">
              <h2>Add Consumption Record</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <form onSubmit={async e => {
              e.preventDefault();
              if (!form.id) {
                alert('Please enter the Surgery ID');
                return;
              }
              if (!form.type) {
                alert('Please enter the Surgery Type');
                return;
              }
              if (!form.dept) {
                alert('Please enter the Department');
                return;
              }
              if (!form.date) {
                alert('Please enter the Date');
                return;
              }
              if (!form.before) {
                alert('Please enter the Before Count');
                return;
              }
              if (!form.after) {
                alert('Please enter the After Count');
                return;
              }
              if (!form.used) {
                alert('Please enter the Consumed count');
                return;
              }
              if (!form.items) {
                alert('Please enter the Items Used');
                return;
              }
              
              const newRecord = {
                ...form,
                before: Number(form.before),
                after: Number(form.after),
                used: Number(form.used),
              };

              // Save to database
              await fetch('http://192.168.50.132:3001/consumptionRecords', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRecord)
              });

              // Fetch updated records
              const res = await fetch('http://192.168.50.132:3001/consumptionRecords');
              const updated = await res.json();
              setTableData(updated);

              setForm({ id: "", type: "", dept: "", date: "", before: "", after: "", used: "", items: "" });
              setShowAddModal(false);
            }}>
              <div style={{ marginBottom: 16 }}>
                <label>Surgery ID <span style={{color: 'red'}}>*</span></label>
                <input className="form-input" type="text" required value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Surgery Type <span style={{color: 'red'}}>*</span></label>
                <input className="form-input" type="text" required value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Department <span style={{color: 'red'}}>*</span></label>
                <input className="form-input" type="text" required value={form.dept} onChange={e => setForm({ ...form, dept: e.target.value })} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Date <span style={{color: 'red'}}>*</span></label>
                <input className="form-input" type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Before Count <span style={{color: 'red'}}>*</span></label>
                <input className="form-input" type="number" required value={form.before} onChange={e => setForm({ ...form, before: e.target.value })} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>After Count <span style={{color: 'red'}}>*</span></label>
                <input className="form-input" type="number" required value={form.after} onChange={e => setForm({ ...form, after: e.target.value })} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Consumed <span style={{color: 'red'}}>*</span></label>
                <input className="form-input" type="number" required value={form.used} onChange={e => setForm({ ...form, used: e.target.value })} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Items Used <span style={{color: 'red'}}>*</span></label>
                <input className="form-input" type="text" required value={form.items} onChange={e => setForm({ ...form, items: e.target.value })} />
              </div>
              <ButtonWithGradient type="submit">Add Record</ButtonWithGradient>
            </form>
          </div>
        </>
      )}
      <Footer />
    </>
  );
};

export default ConsumptionReports;
