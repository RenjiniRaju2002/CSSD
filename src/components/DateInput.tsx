import React from 'react';
import '../styles/form.css';

interface DateInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  width?: string | number;
}

const DateInput: React.FC<DateInputProps> = ({ label, value, onChange, width }) => (
  <div className="dateinput-container">
    <label className="dateinput-label">{label}</label>
    <input
      className="dateinput-box"
      type="date"
      value={value}
      onChange={onChange}
      style={width ? { width } : {}}
    />
  </div>
);

export default DateInput; 