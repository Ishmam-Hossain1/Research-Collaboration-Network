import React from 'react';
import { format } from 'date-fns';
import { Edit2, Trash2, CheckCircle, Clock, PlayCircle } from 'lucide-react';

const statusConfig = {
  Pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  'In Progress': { icon: PlayCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
  Completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
};

const Timeline = ({ milestones, onEdit, onDelete }) => {
  const sorted = [...milestones].sort((a, b) => {
    if ((a.order ?? 0) !== (b.order ?? 0)) {
      return (a.order ?? 0) - (b.order ?? 0);
    }

    const aDate = a.startDate ? new Date(a.startDate).getTime() : 0;
    const bDate = b.startDate ? new Date(b.startDate).getTime() : 0;
    return aDate - bDate;
  });

  return (
    <div className="relative mt-8">
      <div className="absolute left-5 h-full w-0.5 bg-gray-300 md:left-1/2 md:-translate-x-1/2" />

      <div className="space-y-10">
        {sorted.map((milestone, idx) => {
          const StatusIcon = statusConfig[milestone.status]?.icon || Clock;
          const statusStyle = statusConfig[milestone.status] || statusConfig.Pending;

          return (
            <div
              key={milestone._id}
              className="relative flex flex-col items-start md:flex-row md:justify-between"
            >
              <div className="absolute left-2 z-10 h-6 w-6 rounded-full border-4 border-blue-500 bg-white shadow md:left-1/2 md:-translate-x-1/2" />

              <div
                className={`ml-12 md:ml-0 md:w-5/12 ${
                  idx % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:order-last md:pl-8'
                }`}
              >
                <div className="rounded-xl border-l-4 border-blue-500 bg-white p-5 shadow-md transition hover:shadow-lg">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {milestone.title}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(milestone)}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(milestone._id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-gray-600">
                    {milestone.description || 'No description'}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                    {milestone.startDate && (
                      <span>📅 Start: {format(new Date(milestone.startDate), 'dd MMM yyyy')}</span>
                    )}
                    {milestone.deadline && (
                      <span>⏰ Deadline: {format(new Date(milestone.deadline), 'dd MMM yyyy')}</span>
                    )}
                  </div>

                  <div
                    className={`mt-3 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusStyle.bg} ${statusStyle.color}`}
                  >
                    <StatusIcon size={14} />
                    <span>{milestone.status}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
