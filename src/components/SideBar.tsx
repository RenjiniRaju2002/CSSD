import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";
// import { GraphIcon } from '@primer/octicons-react'
// import { PlusCircleIcon } from '@primer/octicons-react'
// import { ListUnorderedIcon } from '@primer/octicons-react'
// import { ReportIcon } from '@primer/octicons-react'
// import { ShieldCheckIcon } from '@primer/octicons-react'
// import { FileDirectoryIcon } from '@primer/octicons-react'
// import { LocationIcon } from '@primer/octicons-react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
// import logo from '../assets/logo.png';
import sidebarLogo from "../assets/sidebar-logo.jpg";
import '../styles/sidebar.css'

interface SideBarProps {
  collapsed?: boolean;
}

const SideBar: React.FC<SideBarProps> = ({ collapsed = false }) => {
  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-content">
        <div className="sidebar-top">
          <a
            href=""
            className={`sidebar-profile ${collapsed ? "collapsed" : ""}`}
          >
            <img src={sidebarLogo} alt="" />
          </a>
          <div className="sidebar-text">
            <h6 className="sidebar-heading">System Admin</h6>
            <h4 className="sidebar-para">HODO Hospital,</h4>
            <p className="sidebar-para">Kazhakkottam</p>
            <p className="sidebar-para2">System Admin</p>
          </div>
        </div>
        <div className={`searchbar ${collapsed ? "collapsed" : ""}`}>
          <div className="sidebar-date">
            <h6 className="sidebar-date-heading">
              @Anchal {new Intl.DateTimeFormat('en-GB', {
                day:'2-digit',
                month:'2-digit',
                year:'numeric'
              }).format(new Date())}
            </h6>

          </div>
          <input
            type="text"
            className="searchbar"
            placeholder="Search Menu- Ctrl + M"
          />
        </div>
      </div>
      <nav>
        <ul>
          <li className="sidebar-title">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "sidebar-heading2 active" : "sidebar-heading2"
              }
              title="Vehicle Management"
            >
              Vehicle Management
            </NavLink>
          </li>
          <ul className="sidebar-sublist">
            <li>
              <NavLink
                to="/dashboard"
                style={{fontWeight:400,color:"#cccccc"}}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Dashboard" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Dashboard"}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/register-vehicle" style={{fontWeight:400,color:"#cccccc"}}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Vehicle Registration" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Vehicle Registration"}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/vehicle-list" style={{fontWeight:400,color:"#cccccc"}}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Vehicle List" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Vehicle List"}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/insurance" style={{fontWeight:400,color:"#cccccc"}}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Insurance Management" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Insurance Management"}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/documents" style={{fontWeight:400,color:"#cccccc"}}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Document Repository" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Document Repository"}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/claims" style={{fontWeight:400,color:"#cccccc"}}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Claims" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Claims"}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/location" style={{fontWeight:400,color:"#cccccc"}}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Vehicle Location" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Vehicle Location"}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/driver" style={{fontWeight:400,color:"#cccccc"}}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Driver Management" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Driver Management"}
              </NavLink>
            </li>
          </ul>
        </ul>
      </nav>
    </div>
  );
};

export default SideBar;
