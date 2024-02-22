import Select from "react-select";

const SelectInput = ({ error, onChange, value, options, ...props }) => {
  return (
    <Select
      {...props}
      options={options}
      className={`control-form ${error ? "is-invalid" : ""}`}
      components={{
        IndicatorSeparator: () => null,
        NoOptionsMessage: () => (
          <div className="py-1 text-center">لا يوجد خيارات</div>
        ),
      }}
      styles={{
        control: (provided, state) => ({
          ...provided,
          borderRadius: "6px",
          border: `1px solid ${error ? "#EC1C24" : "#bfc9d4"}`,
          padding: "0 5px",
          height: "45.39px",
          fontSize: "14px",
          fontWeight: "500",
          color: "#393A4B",
        }),
      }}
      onChange={(e) => onChange(e.hash)}
      value={options.find((c) => c.hash === value)}
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option.hash}
    />
  );
};

export default SelectInput;
