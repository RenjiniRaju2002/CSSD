// Dashboard.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Activity, Package } from "lucide-react";
// import { page } from "../pages/page";
import PageContainer from "../components/PageContainer";
import "../styles/dashboard.css";
import Cards from '../components/Cards';
import SectionHeading from '../components/SectionHeading';

interface DashboardProps {
  sidebarCollapsed?: boolean;
  toggleSidebar?: () => void;
}
const Dashboard: React.FC<DashboardProps> = ({ sidebarCollapsed = false, toggleSidebar }) => {
  const navigate = useNavigate();
  
  // Mock stats for demonstration - replace with actual data
  const [stats, setStats] = useState({
    activeRequests: 0,
    sterilizationInProgress: 0,
    itemsReady: 0,
    lowStockItems: 0
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Get active requests from localStorage (status 'Requested' or 'In Progress')
    const savedRequests = localStorage.getItem('cssd_requests');
    if (savedRequests) {
      try {
        const requests = JSON.parse(savedRequests);
        const activeCount = requests.filter((r: any) => r.status === 'Requested' || r.status === 'In Progress').length;
        setStats(s => ({ ...s, activeRequests: activeCount }));
      } catch {}
    }
    // Get sterilization in progress count from localStorage
    const savedProcesses = localStorage.getItem('sterilizationProcesses');
    if (savedProcesses) {
      try {
        const processes = JSON.parse(savedProcesses);
        const inProgressCount = processes.filter((p: any) => p.status === 'In Progress').length;
        setStats(s => ({ ...s, sterilizationInProgress: inProgressCount }));
      } catch {}
    }
    // Get available items count from localStorage
    const savedAvailable = localStorage.getItem('availableItems');
    if (savedAvailable) {
      try {
        const available = JSON.parse(savedAvailable);
        setStats(s => ({ ...s, itemsReady: available.length }));
      } catch {}
    }
    // Get low stock count from localStorage
    const savedStock = localStorage.getItem('stockItems');
    if (savedStock) {
      try {
        const stock = JSON.parse(savedStock);
        const lowStockCount = stock.filter((item: any) => item.status === 'Low Stock').length;
        setStats(s => ({ ...s, lowStockItems: lowStockCount }));
      } catch {}
    }
  }, []);

  const handleNewRequest = () => navigate('/request-management');
  const handleStartSterilization = () => navigate('/sterilization-process');

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator />
      
       
      {/* <div className="page-container"> */}
      <PageContainer>
        <SectionHeading title="Dashboard" subtitle="Central Sterile Service Department" className="dashboard-heading" />
        
        <div className="dashboard-summary-cards">
          {[
            { title: 'Active Requests', subtitle: stats.activeRequests?.toString() || '0' },
            { title: 'Sterilization In Progress', subtitle: stats.sterilizationInProgress?.toString() || '0' },
            { title: 'Items Ready', subtitle: stats.itemsReady?.toString() || '0' },
            { title: 'Low Stock Items', subtitle: stats.lowStockItems?.toString() || '0' }
          ].map((card, index) => (
            <Cards key={index} title={card.title} subtitle={card.subtitle} />
          ))}
        </div>

        <div className="dashboard-sections-row">
          <div className="dashboard-section-card recent-activity-card">
            <div className="">
              <h3>Recent Activity</h3>
              <p>Latest CSSD operations</p>
            </div>
            <div className="section-content">
              <div className="activity-list">
                <div className="activity-item-card">
                  <Activity className="icon green" />
                  <div>
                    <p className="activity-title">Sterilization Completed - REQ001</p>
                    <p className="activity-desc">Autoclave cycle finished for surgery kit</p>
                  </div>
                </div>
                <div className="activity-item-card">
                  <Package className="icon blue" />
                  <div>
                    <p className="activity-title">New Request - REQ002</p>
                    <p className="activity-desc">Emergency surgery kit requested from OR-3</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-section-card quick-actions-card">
            <div className="">
              <h3>Quick Actions</h3>
              <p>Common CSSD tasks</p>
            </div>
            <div className="quick-actions-list">
              <button onClick={handleNewRequest} className="quick-action-btn">
                <Package className="icon teal" />
                <span>New Request</span>
              </button>
              <button onClick={handleStartSterilization} className="quick-action-btn">
                <Activity className="icon teal" />
                <span>Start Sterilization</span>
              </button>
            </div>
          </div>
        </div>
      {/* </div> */}
      </PageContainer>
      <Footer />
    </>
  );
};

export default Dashboard;
