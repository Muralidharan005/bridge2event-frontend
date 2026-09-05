import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import "./CustomDropdown.css";

export default function CustomDropdown({
  value,
  onChange,
  options = [],
  label,
  icon: Icon,
  placeholder = "Select an option",
  className = "",
  dropdownAlign = "left", // "left" or "right"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Normalize options: can be array of strings or { value, label, icon }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "object" && opt !== null) {
      return opt;
    }
    return { value: opt, label: opt === "ALL" ? "All" : opt };
  });

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value).toLowerCase() === String(value).toLowerCase()
  );

  const displayLabel = selectedOption
    ? selectedOption.label
    : placeholder;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div
      className={`modern-dropdown-root ${className} ${isOpen ? "is-open" : ""}`}
      ref={dropdownRef}
    >
      <button
        type="button"
        className="modern-dropdown-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="dropdown-trigger-left">
          {Icon && <Icon size={15} className="dropdown-icon" />}
          {label && <span className="dropdown-label">{label}</span>}
          <span className="dropdown-value">{displayLabel}</span>
        </span>
        <ChevronDown
          size={16}
          className={`dropdown-chevron ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className={`modern-dropdown-menu align-${dropdownAlign}`}
          role="listbox"
        >
          <div className="modern-dropdown-scroll">
            {normalizedOptions.map((opt) => {
              const isSelected =
                String(opt.value).toLowerCase() ===
                String(value).toLowerCase();

              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  className={`modern-dropdown-item ${
                    isSelected ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(opt.value)}
                >
                  <div className="item-label-group">
                    {opt.icon && (
                      <span className="item-icon">{opt.icon}</span>
                    )}
                    <span className="item-text">{opt.label}</span>
                  </div>
                  {isSelected && (
                    <Check size={15} className="item-check-icon" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
