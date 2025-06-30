import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Header from "./Header";
import Footer from "./Footer";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Download, BarChart3 } from "lucide-react";
import "../styles/ConsumptionReports.css";

const ConsumptionReports = ({ sidebarCollapsed, toggleSidebar }) => {
  const [dateFrom, setDateFrom] = useState();
  const [dateTo, setDateTo] = useState();
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [reportGenerated, setReportGenerated] = useState(false);
  const { toast } = useToast();

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />

      <div className="report-container">
        <div className="report-header">
          <h1 className="report-title">Consumption Reports</h1>
          <p className="report-subtitle">Generate and analyze item consumption reports</p>
        </div>

        <Card className="report-card">
          <CardHeader className="report-card-header">
            <CardTitle className="report-card-title">
              <BarChart3 className="icon" />
              Report Filters
            </CardTitle>
          </CardHeader>

          <CardContent className="report-card-body">
            <div className="filter-section">
              <div className="filter-group">
                <Label>From Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="calendar-button">
                      <CalendarIcon className="calendar-icon" />
                      {dateFrom ? format(dateFrom, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="calendar-content">
                    <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="filter-group">
                <Label>To Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="calendar-button">
                      <CalendarIcon className="calendar-icon" />
                      {dateTo ? format(dateTo, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="calendar-content">
                    <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="filter-group">
                <Label>Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="select-trigger">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="OR-1">OR-1</SelectItem>
                    <SelectItem value="OR-2">OR-2</SelectItem>
                    <SelectItem value="OR-3">OR-3</SelectItem>
                    <SelectItem value="ICU">ICU</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="filter-button-wrapper">
                <button onClick={() => setReportGenerated(true)} className="primary-button">
                  Generate Report
                </button>
              </div>
            </div>

            <div className="export-buttons">
              <button className="export-button" onClick={() => {}} disabled={!reportGenerated}>
                <Download className="icon" /> Export PDF
              </button>
              <button className="export-button" onClick={() => {}} disabled={!reportGenerated}>
                <Download className="icon" /> Export Excel
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </>
  );
};

export default ConsumptionReports;
