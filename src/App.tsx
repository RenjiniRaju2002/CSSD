import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import SideBar from './components/SideBar.tsx';
// import TopNavBar from './components/TopNavBar.tsx';
// import Dashboard from './pages/Dashboard.tsx';
// import VehicleRegistration from './pages/VehicleRegistration.tsx';
// import VehicleList from './pages/VehicleList.tsx';
// import InsuranceManagement from './pages/InsuranceManagement.tsx';
// import DocumentRepository from './pages/DocumentRepository.tsx';
// import VehicleClaims from './pages/VehicleClaims.tsx';
// import VehicleLocation from './pages/VehicleLocation.tsx';
// import ApiExample from './components/ApiExample.tsx';
// import Driver from './pages/Driver.tsx';
import TopNavBar from './components/TopNavBar';
import SideBar from './components/SideBar';
import Page from './pages/Page.tsx';
import Table from './pages/Table.tsx';

// Define the props interface for components that receive sidebar props
// interface SidebarProps {
//   sidebarCollapsed: boolean;
//   toggleSidebar: () => void;
// }

const App: React.FC = () => {
  // const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // const toggleSidebar = (): void => {
  //   setSidebarCollapsed(!sidebarCollapsed);
  // };

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw',backgroundColor:'#d9e0e7' }}>
        {/* Horizontal Top Nav Bar */}
        <TopNavBar />

        {/* Main content with Sidebar + Page content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* <SideBar collapsed={sidebarCollapsed} /> */}
          <SideBar/>
          <div style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
            <Routes>
              <Route path="/" element={<Page/>} />
              <Route path="/a" element={<Table/>} />
              {/* <Route path="/" element={<page />} /> */}
              {/* <Route path="/dashboard" element={<Dashboard sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
              <Route path="/register-vehicle" element={<VehicleRegistration sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
              <Route path="/vehicle-list" element={<VehicleList sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
              <Route path="/insurance" element={<InsuranceManagement sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
              <Route path="/documents" element={<DocumentRepository sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
              <Route path="/claims" element={<VehicleClaims sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
              <Route path="/location" element={<VehicleLocation sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
              <Route path="/api" element={<ApiExample sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
              <Route path="/driver" element={<Driver sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} /> */}
            </Routes>
          </div>
          
        </div>
       

        {/* Toast Container for notifications */}
        {/* <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        /> */}
      </div>
     
    </Router> 
    
  );
};

export default App; 