import React, { useEffect, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  getMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  reorderMilestones,
  toggleMilestone,
  updateMilestoneSubtasks,
} from "../services/milestoneService";
import MilestoneItem from "./MilestoneItem";
import MilestoneForm from "./MilestoneForm";
import Timeline from "./Timeline";
import confetti from "canvas-confetti";

const MilestoneTracker = ({
  projectId,
  progress = 0,
  onMilestoneChange,
  onProjectUpdate,
}) => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewMode, setViewMode] = useState("roadmap");
  const [error, setError] = useState("");

  const celebratedRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortMilestones = (list = []) => {
    return [...list].sort((a, b) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;

      if (orderA !== orderB) return orderA - orderB;

      const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;

      if (dateA !== dateB) return dateA - dateB;

      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    });
  };

  const notifyProjectUpdate = (project) => {
    if (project) {
      onProjectUpdate?.(project);
      return;
    }

    onMilestoneChange?.();
  };

  const checkCompletionCelebration = (list) => {
    const total = list.length;
    const completed = list.filter((m) => m.status === "Completed").length;

    if (total > 0 && completed === total && !celebratedRef.current) {
      celebratedRef.current = true;

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    if (total === 0 || completed !== total) {
      celebratedRef.current = false;
    }
  };

  const fetchMilestones = async () => {
    try {
      setError("");

      const { data } = await getMilestones(projectId);
      const sorted = sortMilestones(data.milestones || []);

      setMilestones(sorted);
      checkCompletionCelebration(sorted);
    } catch (err) {
      console.error("Failed to fetch milestones", err);
      setError("Failed to load milestones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!projectId) return;

    setLoading(true);
    fetchMilestones();
  }, [projectId]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = milestones.findIndex((m) => m._id === active.id);
    const newIndex = milestones.findIndex((m) => m._id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(milestones, oldIndex, newIndex);

    setMilestones(newOrder);

    const updates = newOrder.map((m, idx) => ({
      id: m._id,
      order: idx,
    }));

    try {
      setActionLoading(true);

      const { data } = await reorderMilestones(updates);

      await fetchMilestones();
      notifyProjectUpdate(data?.project);
    } catch (err) {
      console.error("Failed to reorder milestones", err);
      setError("Failed to reorder milestones.");
      await fetchMilestones();
      onMilestoneChange?.();
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleComplete = async (milestone) => {
    try {
      setActionLoading(true);

      const { data } = await toggleMilestone(milestone._id);

      await fetchMilestones();
      notifyProjectUpdate(data?.project);
    } catch (err) {
      console.error("Failed to toggle milestone", err);
      alert(err.response?.data?.message || "Failed to update milestone status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSubtasks = async (milestoneId, subtasks) => {
    try {
      setActionLoading(true);

      const { data } = await updateMilestoneSubtasks(milestoneId, subtasks);

      await fetchMilestones();
      notifyProjectUpdate(data?.project);
    } catch (err) {
      console.error("Failed to update subtasks", err);
      alert(err.response?.data?.message || "Failed to update subtasks");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      setActionLoading(true);

      const { data } = await createMilestone({
        ...formData,
        projectId,
        order: milestones.length,
      });

      await fetchMilestones();
      notifyProjectUpdate(data?.project);
      setShowForm(false);
    } catch (err) {
      console.error("Failed to create milestone", err);
      alert(err.response?.data?.message || "Failed to create milestone");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      setActionLoading(true);

      const { data } = await updateMilestone(id, formData);

      await fetchMilestones();
      notifyProjectUpdate(data?.project);
      setEditing(null);
    } catch (err) {
      console.error("Failed to update milestone", err);
      alert(err.response?.data?.message || "Failed to update milestone");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this milestone?")) return;

    try {
      setActionLoading(true);

      const { data } = await deleteMilestone(id);

      await fetchMilestones();
      notifyProjectUpdate(data?.project);
    } catch (err) {
      console.error("Failed to delete milestone", err);
      alert(err.response?.data?.message || "Failed to delete milestone");
    } finally {
      setActionLoading(false);
    }
  };

  const normalizedProgress = Math.min(100, Math.max(0, Math.round(Number(progress || 0))));

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-sm">
        Loading milestones...
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            📋 Research Roadmap
          </h2>
          <p className="text-sm text-slate-500">
            Complete milestones to update project progress automatically.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode("roadmap")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              viewMode === "roadmap"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Roadmap
          </button>

          <button
            type="button"
            onClick={() => setViewMode("checklist")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              viewMode === "checklist"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Checklist
          </button>

          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            disabled={actionLoading}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            + Add Milestone
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="mb-1 flex justify-between text-sm text-slate-600">
          <span>Overall Milestone Progress</span>
          <span>{normalizedProgress}%</span>
        </div>

        <div className="h-2.5 w-full rounded-full bg-slate-100">
          <div
            className={`h-2.5 rounded-full transition-all ${
              normalizedProgress >= 100
                ? "bg-emerald-500"
                : normalizedProgress >= 40
                ? "bg-blue-600"
                : "bg-amber-500"
            }`}
            style={{ width: `${normalizedProgress}%` }}
          />
        </div>
      </div>

      {milestones.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="font-semibold text-slate-700">No milestones yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Add your first milestone to start tracking project progress.
          </p>

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Add Milestone
          </button>
        </div>
      ) : viewMode === "roadmap" ? (
        <Timeline
          milestones={milestones}
          onEdit={(milestone) => {
            setShowForm(false);
            setEditing(milestone);
          }}
          onDelete={handleDelete}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={milestones.map((m) => m._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {milestones.map((milestone) => (
                <MilestoneItem
                  key={milestone._id}
                  milestone={milestone}
                  disabled={actionLoading}
                  onToggleComplete={handleToggleComplete}
                  onEdit={() => {
                    setShowForm(false);
                    setEditing(milestone);
                  }}
                  onDelete={handleDelete}
                  onUpdateSubtasks={handleUpdateSubtasks}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {(showForm || editing) && (
        <MilestoneForm
          initialData={editing}
          onSubmit={
            editing
              ? (formData) => handleUpdate(editing._id, formData)
              : handleCreate
          }
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
};

export default MilestoneTracker;