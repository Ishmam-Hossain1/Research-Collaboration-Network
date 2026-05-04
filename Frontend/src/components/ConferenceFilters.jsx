const fields = [
  "All",
  "Artificial Intelligence",
  "Data Science",
  "Cybersecurity",
  "Software Engineering",
  "Bioinformatics",
  "Machine Learning",
];

const ConferenceFilters = ({ search, setSearch, field, setField }) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conferences by title, field, location..."
          className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />

        <select
          value={field}
          onChange={(e) => setField(e.target.value)}
          className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          {fields.map((item) => (
            <option key={item} value={item === "All" ? "" : item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ConferenceFilters;
