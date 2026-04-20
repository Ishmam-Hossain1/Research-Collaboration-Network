import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const MilestoneForm = ({ initialData, onSubmit, onClose }) => {
  const [form, setForm] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    startDate: initialData?.startDate ? new Date(initialData.startDate) : null,
    deadline: initialData?.deadline ? new Date(initialData.deadline) : null,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <h2 className="mb-4 text-xl font-bold">
          {initialData ? 'Edit Milestone' : 'New Milestone'}
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title *"
            required
            className="mb-3 w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            rows="3"
            className="mb-3 w-full rounded-lg border border-gray-300 p-2"
          />

          <div className="mb-3">
            <label className="mb-1 block text-sm text-gray-600">Start Date</label>
            <DatePicker
              selected={form.startDate}
              onChange={(date) => setForm({ ...form, startDate: date })}
              className="w-full rounded-lg border border-gray-300 p-2"
              dateFormat="yyyy-MM-dd"
              placeholderText="Select start date"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm text-gray-600">Deadline</label>
            <DatePicker
              selected={form.deadline}
              onChange={(date) => setForm({ ...form, deadline: date })}
              className="w-full rounded-lg border border-gray-300 p-2"
              dateFormat="yyyy-MM-dd"
              placeholderText="Select deadline"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              {initialData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MilestoneForm;