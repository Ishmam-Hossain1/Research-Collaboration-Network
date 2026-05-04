import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CheckCircle,
  Circle,
  Edit2,
  Trash2,
  Calendar,
  GripVertical,
  Plus,
  Clock3,
} from "lucide-react";

const MilestoneItem = ({
  milestone,
  onToggleComplete,
  onEdit,
  onDelete,
  onUpdateSubtasks,
  disabled = false,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: milestone._id,
      disabled,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [newSubtask, setNewSubtask] = useState("");

  const isCompleted = milestone.status === "Completed";
  const isInProgress = milestone.status === "In Progress";

  const isOverdue =
    milestone.deadline &&
    !isCompleted &&
    new Date(milestone.deadline).getTime() < Date.now();

  const handleSubtaskToggle = async (subIndex) => {
    if (disabled) return;

    const newSubtasks = [...(milestone.subtasks || [])];

    if (!newSubtasks[subIndex]) return;

    newSubtasks[subIndex] = {
      ...newSubtasks[subIndex],
      completed: !newSubtasks[subIndex].completed,
    };

    await onUpdateSubtasks(milestone._id, newSubtasks);
  };

  const addSubtask = async () => {
    if (disabled) return;

    const title = newSubtask.trim();
    if (!title) return;

    const newSubtasks = [
      ...(milestone.subtasks || []),
      {
        title,
        completed: false,
      },
    ];

    await onUpdateSubtasks(milestone._id, newSubtasks);
    setNewSubtask("");
  };

  const completedSubtasks =
    milestone.subtasks?.filter((task) => task.completed).length || 0;

  const totalSubtasks = milestone.subtasks?.length || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border bg-white p-4 shadow-sm transition ${
        disabled ? "opacity-70" : "hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className={`mt-1 ${
            disabled ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing"
          }`}
        >
          <GripVertical size={18} className="text-gray-400" />
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onToggleComplete(milestone)}
          className="mt-0.5 disabled:cursor-not-allowed"
          title={isCompleted ? "Mark as pending" : "Mark as completed"}
        >
          {isCompleted ? (
            <CheckCircle className="text-green-500" size={22} />
          ) : (
            <Circle className="text-gray-400" size={22} />
          )}
        </button>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className={`font-medium ${
                    isCompleted ? "text-gray-400 line-through" : "text-slate-800"
                  }`}
                >
                  {milestone.title}
                </h3>

                {milestone.isDefault ? (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    Default
                  </span>
                ) : null}

                {isCompleted ? (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    Completed
                  </span>
                ) : isInProgress ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    In Progress
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    Pending
                  </span>
                )}

                {isOverdue ? (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    Overdue
                  </span>
                ) : null}
              </div>

              {milestone.description ? (
                <p className="mt-1 text-sm text-gray-500">
                  {milestone.description}
                </p>
              ) : null}

              {milestone.deadline ? (
                <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                  <Calendar size={12} />
                  Due: {new Date(milestone.deadline).toLocaleDateString()}
                </div>
              ) : null}

              {totalSubtasks > 0 ? (
                <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  <Clock3 size={12} />
                  {completedSubtasks}/{totalSubtasks} subtasks completed
                </div>
              ) : null}
            </div>

            <div className="flex gap-1">
              <button
                type="button"
                disabled={disabled}
                onClick={onEdit}
                className="text-gray-500 transition hover:text-blue-600 disabled:cursor-not-allowed"
                title="Edit milestone"
              >
                <Edit2 size={16} />
              </button>

              <button
                type="button"
                disabled={disabled}
                onClick={() => onDelete(milestone._id)}
                className="text-gray-500 transition hover:text-red-600 disabled:cursor-not-allowed"
                title="Delete milestone"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {milestone.subtasks?.length > 0 && (
            <div className="mt-3 border-l-2 border-gray-200 pl-4">
              {milestone.subtasks.map((st, idx) => (
                <div key={idx} className="mb-1 flex items-center gap-2 text-sm">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSubtaskToggle(idx)}
                    className="disabled:cursor-not-allowed"
                  >
                    {st.completed ? (
                      <CheckCircle size={14} className="text-green-500" />
                    ) : (
                      <Circle size={14} className="text-gray-400" />
                    )}
                  </button>

                  <span
                    className={
                      st.completed ? "text-gray-400 line-through" : "text-slate-700"
                    }
                  >
                    {st.title}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <input
              value={newSubtask}
              disabled={disabled}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSubtask();
                }
              }}
              placeholder="Add subtask"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />

            <button
              type="button"
              disabled={disabled}
              onClick={addSubtask}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={14} />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneItem;
