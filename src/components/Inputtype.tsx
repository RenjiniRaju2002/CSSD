import React from 'react';
import '../styles/input.css';

interface Option {
  label: string;
  value: string;
}

interface FormInputTypeProps {
  label: string;
  name: string;
  id?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
}

const FormInputType: React.FC<FormInputTypeProps> = ({ label, name, id = name, value, onChange, options }) => {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <select id={id} name={name} className="custom-select" value={value} onChange={onChange}>
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};

export default FormInputType;