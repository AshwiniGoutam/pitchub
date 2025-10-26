import { useState, useRef, useEffect } from "react";

export default function ConnectionFilterDropdown({ onChange }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("All Connections");
  const dropdownRef = useRef(null);

  const options = ["All Connections", "Email", "Via Event"];

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 border-emerald-300 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-md font-medium"
      >
        {selected}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-md z-50">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => {
                setSelected(option);
                setOpen(false);
                if (onChange) onChange(option);
              }}
              className={`px-4 py-2 cursor-pointer hover:bg-emerald-50 ${
                selected === option ? "bg-emerald-100 text-emerald-700 font-medium" : ""
              }`}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
