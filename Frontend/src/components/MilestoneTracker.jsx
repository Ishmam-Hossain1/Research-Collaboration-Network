import React, { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  getMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  reorderMilestones,
  toggleMilestone,
  updateMilestoneSubtasks,
} from '../services/milestoneService';
import MilestoneItem from './MilestoneItem';
import MilestoneForm from './MilestoneForm';
import Timeline from './Timeline';
import confetti from 'canvas-confetti';

const MilestoneTracker = ({ projectId, progress = 0, onMilestoneChange }) => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewMode, setViewMode] = useState('roadmap');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchMilestones = async () => {
    try {
      const { data } = await getMilestones(projectId);
      const sorted = [...data.milestones].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      );
      setMilestones(sorted);
      checkCompletionCelebration(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkCompletionCelebration = (list) => {
    const total = list.length;
    const completed = list.filter((m) => m.status === 'Completed').length;
    if (total > 0 && completed === total) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  };

  useEffect(() => {
    if (projectId) fetchMilestones();
  }, [projectId]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = milestones.findIndex((m) => m._id === active.id);
    const newIndex = milestones.findIndex((m) => m._id === over.id);
    const newOrder = arrayMove(milestones, oldIndex, newIndex);

    setMilestones(newOrder);

    const updates = newOrder.map((m, idx) => ({ id: m._id, order: idx }));
    await reorderMilestones(updates);

    fetchMilestones();
    onMilestoneChange?.();
  };

  const handleToggleComplete = async (milestone) => {
    await toggleMilestone(milestone._id);
    await fetchMilestones();
    onMilestoneChange?.();
  };

  const handleUpdateSubtasks = async (milestoneId, subtasks) => {
    await updateMilestoneSubtasks(milestoneId, subtasks);
    await fetchMilestones();
    onMilestoneChange?.();
  };

  const handleCreate = async (data) => {
    await createMilestone({
      ...data,
      projectId,
      order: milestones.length,
    });
    await fetchMilestones();
    setShowForm(false);
    onMilestoneChange?.();
  };

  const handleUpdate = async (id, data) => {
    await updateMilestone(id, data);
    await fetchMilestones();
    setEditing(null);
    onMilestoneChange?.();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this milestone?')) return;
    await deleteMilestone(id);
    await fetchMilestones();
    onMilestoneChange?.();
  };

  if (loading) {
    return <div className="p-4 text-center">Loading milestones...</div>;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">📋 Research Roadmap</h2>
          <p className="text-sm text-slate-500">
            Complete milestones to update project progress automatically.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('roadmap')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              viewMode === 'roadmap'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            Roadmap
          </button>
          <button
            onClick={() => setViewMode('checklist')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              viewMode === 'checklist'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            Checklist
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            + Add Milestone
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-1 flex justify-between text-sm text-slate-600">
          <span>Overall Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-slate-100">
          <div
            className="h-2.5 rounded-full bg-green-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {viewMode === 'roadmap' ? (
        <Timeline
          milestones={milestones}
          onEdit={(milestone) => setEditing(milestone)}
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
                  onToggleComplete={handleToggleComplete}
                  onEdit={() => setEditing(milestone)}
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
          onSubmit={editing ? (data) => handleUpdate(editing._id, data) : handleCreate}
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