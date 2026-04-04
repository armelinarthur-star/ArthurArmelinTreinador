"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ExerciseCard } from "./ExerciseCard";
import type { WorkoutExerciseInput } from "@/app/actions/workouts";

export interface ExerciseWithMeta extends WorkoutExerciseInput {
  name: string;
  muscle_group: string;
}

interface SortableExerciseListProps {
  exercises: ExerciseWithMeta[];
  onChange: (exercises: ExerciseWithMeta[]) => void;
  onFieldChange: (index: number, field: string, value: number | string | null) => void;
  onRemove: (index: number) => void;
}

function SortableItem({
  exercise,
  index,
  onFieldChange,
  onRemove,
}: {
  exercise: ExerciseWithMeta;
  index: number;
  onFieldChange: (index: number, field: string, value: number | string | null) => void;
  onRemove: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.exercise_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ExerciseCard
        exercise={exercise}
        index={index}
        onChange={onFieldChange}
        onRemove={onRemove}
        dragHandleProps={listeners}
      />
    </div>
  );
}

export function SortableExerciseList({
  exercises,
  onChange,
  onFieldChange,
  onRemove,
}: SortableExerciseListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = exercises.findIndex((e) => e.exercise_id === active.id);
      const newIndex = exercises.findIndex((e) => e.exercise_id === over.id);
      const reordered = arrayMove(exercises, oldIndex, newIndex).map(
        (ex, i) => ({ ...ex, order_index: i })
      );
      onChange(reordered);
    }
  }

  if (exercises.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-line-default bg-bg-surface p-8 text-center">
        <p className="text-sm text-content-secondary">
          Nenhum exercício adicionado. Use a busca acima para adicionar.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={exercises.map((e) => e.exercise_id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {exercises.map((ex, i) => (
            <SortableItem
              key={ex.exercise_id}
              exercise={ex}
              index={i}
              onFieldChange={onFieldChange}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
