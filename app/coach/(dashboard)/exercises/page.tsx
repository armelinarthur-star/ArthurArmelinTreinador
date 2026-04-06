"use client";

import { useEffect, useState, useCallback } from "react";
import {
  searchExercises,
  createCustomExercise,
  updateExercise,
  getExerciseMuscleGroups,
  upsertExerciseMuscleGroups,
} from "@/app/actions/workouts";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Dumbbell, Pencil, X, Check } from "lucide-react";
import type { Exercise, MuscleGroup, EquipmentType } from "@/lib/types/database";

const muscleGroupLabels: Record<MuscleGroup, string> = {
  chest: "Peito",
  back: "Costas",
  shoulders: "Ombros",
  biceps: "Biceps",
  triceps: "Triceps",
  glutes: "Gluteos",
  quadriceps: "Quadriceps",
  hamstrings: "Posteriores",
  calves: "Panturrilha",
  abs: "Abdomen",
  full_body: "Full Body",
};

const equipmentLabels: Record<EquipmentType, string> = {
  barbell: "Barra",
  dumbbell: "Halter",
  machine: "Maquina",
  cable: "Cabo",
  bodyweight: "Peso Corporal",
  resistance_band: "Elastico",
  kettlebell: "Kettlebell",
};

const muscleGroups = Object.entries(muscleGroupLabels) as [MuscleGroup, string][];
const equipmentTypes = Object.entries(equipmentLabels) as [EquipmentType, string][];

const weightOptions = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

interface MuscleGroupEntry {
  muscle_group: MuscleGroup;
  set_weight: number;
}

export default function ExerciseLibraryPage() {
  const { profile } = useAuth();
  const isCoach = profile?.role === "coach";

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | "">("");

  // Create dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newMuscle, setNewMuscle] = useState<MuscleGroup>("chest");
  const [newEquipment, setNewEquipment] = useState<EquipmentType>("barbell");
  const [newInstructions, setNewInstructions] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newMuscleGroups, setNewMuscleGroups] = useState<MuscleGroupEntry[]>([
    { muscle_group: "chest", set_weight: 1.0 },
  ]);

  // Edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editExercise, setEditExercise] = useState<Exercise | null>(null);
  const [editName, setEditName] = useState("");
  const [editMuscle, setEditMuscle] = useState<MuscleGroup>("chest");
  const [editEquipment, setEditEquipment] = useState<EquipmentType>("barbell");
  const [editInstructions, setEditInstructions] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [editMuscleGroups, setEditMuscleGroups] = useState<MuscleGroupEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingMG, setIsLoadingMG] = useState(false);

  const reload = useCallback(async () => {
    setIsLoading(true);
    const data = await searchExercises(query, muscleFilter || undefined);
    setExercises(data as Exercise[]);
    setIsLoading(false);
  }, [query, muscleFilter]);

  useEffect(() => {
    const timer = setTimeout(reload, 300);
    return () => clearTimeout(timer);
  }, [reload]);

  // --- Create ---
  async function handleCreate() {
    if (!profile || !newName.trim()) return;
    setIsCreating(true);
    try {
      const exercise = await createCustomExercise(
        {
          name: newName.trim(),
          muscle_group: newMuscle,
          equipment: newEquipment,
          instructions: newInstructions || null,
          video_url: newVideoUrl || null,
        },
        profile.id
      );
      // Save muscle groups
      if (exercise && newMuscleGroups.length > 0) {
        await upsertExerciseMuscleGroups(
          (exercise as Exercise).id,
          newMuscleGroups
        );
      }
      setDialogOpen(false);
      setNewName("");
      setNewInstructions("");
      setNewVideoUrl("");
      setNewMuscleGroups([{ muscle_group: "chest", set_weight: 1.0 }]);
      reload();
    } catch {
      // silent
    }
    setIsCreating(false);
  }

  // --- Edit ---
  async function openEdit(ex: Exercise) {
    setEditExercise(ex);
    setEditName(ex.name);
    setEditMuscle(ex.muscle_group);
    setEditEquipment(ex.equipment);
    setEditInstructions(ex.instructions ?? "");
    setEditVideoUrl(ex.video_url ?? "");
    setEditDialogOpen(true);
    setIsLoadingMG(true);

    const mgs = await getExerciseMuscleGroups(ex.id);
    if (mgs.length > 0) {
      setEditMuscleGroups(
        mgs.map((m) => ({
          muscle_group: m.muscle_group,
          set_weight: Number(m.set_weight),
        }))
      );
    } else {
      setEditMuscleGroups([
        { muscle_group: ex.muscle_group, set_weight: 1.0 },
      ]);
    }
    setIsLoadingMG(false);
  }

  async function handleSaveEdit() {
    if (!editExercise || !editName.trim()) return;
    setIsSaving(true);
    try {
      await updateExercise(editExercise.id, {
        name: editName.trim(),
        muscle_group: editMuscle,
        equipment: editEquipment,
        instructions: editInstructions || null,
        video_url: editVideoUrl || null,
      });
      await upsertExerciseMuscleGroups(editExercise.id, editMuscleGroups);
      setEditDialogOpen(false);
      reload();
    } catch {
      // silent
    }
    setIsSaving(false);
  }

  // --- Muscle group list helpers ---
  function addMuscleGroup(
    list: MuscleGroupEntry[],
    setter: (v: MuscleGroupEntry[]) => void
  ) {
    // find first group not already in list
    const used = new Set(list.map((m) => m.muscle_group));
    const available = muscleGroups.find(([key]) => !used.has(key));
    if (available) {
      setter([...list, { muscle_group: available[0], set_weight: 1.0 }]);
    }
  }

  function removeMuscleGroup(
    idx: number,
    list: MuscleGroupEntry[],
    setter: (v: MuscleGroupEntry[]) => void
  ) {
    setter(list.filter((_, i) => i !== idx));
  }

  function updateMG(
    idx: number,
    field: "muscle_group" | "set_weight",
    value: string | number,
    list: MuscleGroupEntry[],
    setter: (v: MuscleGroupEntry[]) => void
  ) {
    const next = [...list];
    if (field === "muscle_group") next[idx].muscle_group = value as MuscleGroup;
    else next[idx].set_weight = value as number;
    setter(next);
  }

  // Group exercises by muscle_group
  const grouped = exercises.reduce<Record<string, Exercise[]>>((acc, ex) => {
    const key = ex.muscle_group;
    if (!acc[key]) acc[key] = [];
    acc[key].push(ex);
    return acc;
  }, {});

  // --- Muscle Group Editor sub-component ---
  function MuscleGroupEditor({
    list,
    setter,
    loading,
  }: {
    list: MuscleGroupEntry[];
    setter: (v: MuscleGroupEntry[]) => void;
    loading?: boolean;
  }) {
    if (loading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-10 bg-bg-elevated" />
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-content-secondary">
            Grupos Musculares
          </label>
          <button
            type="button"
            onClick={() => addMuscleGroup(list, setter)}
            disabled={list.length >= muscleGroups.length}
            className="flex items-center gap-1 text-[11px] font-medium text-brand-red hover:text-brand-red-dark disabled:opacity-30"
          >
            <Plus className="size-3" />
            Adicionar
          </button>
        </div>

        {list.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {/* Muscle group select */}
            <Select
              value={entry.muscle_group}
              onValueChange={(v) =>
                updateMG(idx, "muscle_group", v ?? "", list, setter)
              }
            >
              <SelectTrigger className="flex-1 border-line-default bg-bg-elevated text-content-primary text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-line-subtle bg-bg-surface">
                {muscleGroups.map(([key, label]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    className="text-content-primary text-xs hover:bg-bg-elevated"
                  >
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Weight select */}
            <Select
              value={entry.set_weight.toString()}
              onValueChange={(v) =>
                updateMG(idx, "set_weight", parseFloat(v ?? "1"), list, setter)
              }
            >
              <SelectTrigger className="w-[80px] border-line-default bg-bg-elevated text-content-primary text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-line-subtle bg-bg-surface">
                {weightOptions.map((w) => (
                  <SelectItem
                    key={w}
                    value={w.toString()}
                    className="text-content-primary text-xs hover:bg-bg-elevated"
                  >
                    {w === 1 ? "1 serie" : `${w} serie`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Remove */}
            {list.length > 1 && (
              <button
                type="button"
                onClick={() => removeMuscleGroup(idx, list, setter)}
                className="shrink-0 rounded p-1 text-content-tertiary hover:bg-bg-elevated hover:text-state-error"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        ))}

        <p className="text-[10px] text-content-tertiary">
          Defina o peso de cada grupo: 1 = serie completa, 0.5 = meia serie
        </p>
      </div>
    );
  }

  // --- Render Exercise Row ---
  function ExerciseRow({ ex }: { ex: Exercise }) {
    return (
      <div className="flex items-center gap-4 rounded-card border border-line-subtle bg-bg-surface p-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-content-primary">
            {ex.name}
          </p>
          <p className="text-[11px] text-content-secondary">
            {equipmentLabels[ex.equipment] ?? ex.equipment}
            {ex.is_custom && " · Personalizado"}
          </p>
        </div>
        <Badge className="bg-bg-elevated text-[10px] text-content-secondary">
          {muscleGroupLabels[ex.muscle_group] ?? ex.muscle_group}
        </Badge>
        {isCoach && (
          <button
            onClick={() => openEdit(ex)}
            className="shrink-0 rounded-input p-2 text-content-tertiary transition-colors hover:bg-bg-elevated hover:text-content-primary"
          >
            <Pencil className="size-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-content-primary">
          Biblioteca de Exercicios
        </h1>
        {isCoach && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button className="gap-2 rounded-input bg-brand-red text-white hover:bg-brand-red-dark">
                  <Plus className="size-4" />
                  Criar Exercicio
                </Button>
              }
            />
            <DialogContent className="max-h-[90vh] overflow-y-auto border-line-subtle bg-bg-surface text-content-primary sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle className="text-content-primary">
                  Novo Exercicio
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm text-content-secondary">
                    Nome *
                  </label>
                  <Input
                    placeholder="Ex: Rosca Scott"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="border-line-default bg-bg-elevated text-content-primary placeholder:text-content-tertiary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm text-content-secondary">
                      Grupo Principal
                    </label>
                    <Select
                      value={newMuscle}
                      onValueChange={(v) =>
                        setNewMuscle((v ?? "chest") as MuscleGroup)
                      }
                    >
                      <SelectTrigger className="w-full border-line-default bg-bg-elevated text-content-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-line-subtle bg-bg-surface">
                        {muscleGroups.map(([key, label]) => (
                          <SelectItem
                            key={key}
                            value={key}
                            className="text-content-primary hover:bg-bg-elevated"
                          >
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-content-secondary">
                      Equipamento
                    </label>
                    <Select
                      value={newEquipment}
                      onValueChange={(v) =>
                        setNewEquipment((v ?? "barbell") as EquipmentType)
                      }
                    >
                      <SelectTrigger className="w-full border-line-default bg-bg-elevated text-content-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-line-subtle bg-bg-surface">
                        {equipmentTypes.map(([key, label]) => (
                          <SelectItem
                            key={key}
                            value={key}
                            className="text-content-primary hover:bg-bg-elevated"
                          >
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Multi muscle groups */}
                <MuscleGroupEditor
                  list={newMuscleGroups}
                  setter={setNewMuscleGroups}
                />

                <div className="space-y-2">
                  <label className="text-sm text-content-secondary">
                    Instrucoes
                  </label>
                  <Textarea
                    placeholder="Como executar o exercicio..."
                    value={newInstructions}
                    onChange={(e) => setNewInstructions(e.target.value)}
                    className="min-h-[60px] border-line-default bg-bg-elevated text-content-primary placeholder:text-content-tertiary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-content-secondary">
                    URL do Video
                  </label>
                  <Input
                    placeholder="https://..."
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    className="border-line-default bg-bg-elevated text-content-primary placeholder:text-content-tertiary"
                  />
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={isCreating || !newName.trim()}
                  className="h-11 w-full rounded-input bg-brand-red font-semibold text-white hover:bg-brand-red-dark"
                >
                  {isCreating ? "Criando..." : "Criar Exercicio"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search + Filters */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-content-tertiary" />
          <Input
            placeholder="Buscar exercicio..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-line-default bg-bg-elevated pl-9 text-content-primary placeholder:text-content-tertiary"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setMuscleFilter("")}
            className={`rounded-pill px-2.5 py-1 text-[11px] font-medium transition-colors ${
              muscleFilter === ""
                ? "bg-brand-red text-white"
                : "bg-bg-elevated text-content-secondary hover:text-content-primary"
            }`}
          >
            Todos
          </button>
          {muscleGroups.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setMuscleFilter(key)}
              className={`rounded-pill px-2.5 py-1 text-[11px] font-medium transition-colors ${
                muscleFilter === key
                  ? "bg-brand-red text-white"
                  : "bg-bg-elevated text-content-secondary hover:text-content-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Grid */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-card bg-bg-elevated" />
          ))}
        </div>
      ) : exercises.length === 0 ? (
        <div className="rounded-card border border-line-subtle bg-bg-surface py-16 text-center">
          <Dumbbell className="mx-auto mb-3 size-8 text-content-tertiary" />
          <p className="text-sm text-content-secondary">
            Nenhum exercicio encontrado.
          </p>
        </div>
      ) : muscleFilter ? (
        <div className="space-y-2">
          {exercises.map((ex) => (
            <ExerciseRow key={ex.id} ex={ex} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([group, exs]) => (
            <div key={group}>
              <h3 className="mb-2 text-sm font-medium text-content-primary">
                {muscleGroupLabels[group as MuscleGroup] ?? group}
              </h3>
              <div className="space-y-2">
                {exs.map((ex) => (
                  <ExerciseRow key={ex.id} ex={ex} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-line-subtle bg-bg-surface text-content-primary sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-content-primary">
              Editar Exercicio
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm text-content-secondary">Nome *</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="border-line-default bg-bg-elevated text-content-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm text-content-secondary">
                  Grupo Principal
                </label>
                <Select
                  value={editMuscle}
                  onValueChange={(v) =>
                    setEditMuscle((v ?? "chest") as MuscleGroup)
                  }
                >
                  <SelectTrigger className="w-full border-line-default bg-bg-elevated text-content-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-line-subtle bg-bg-surface">
                    {muscleGroups.map(([key, label]) => (
                      <SelectItem
                        key={key}
                        value={key}
                        className="text-content-primary hover:bg-bg-elevated"
                      >
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-content-secondary">
                  Equipamento
                </label>
                <Select
                  value={editEquipment}
                  onValueChange={(v) =>
                    setEditEquipment((v ?? "barbell") as EquipmentType)
                  }
                >
                  <SelectTrigger className="w-full border-line-default bg-bg-elevated text-content-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-line-subtle bg-bg-surface">
                    {equipmentTypes.map(([key, label]) => (
                      <SelectItem
                        key={key}
                        value={key}
                        className="text-content-primary hover:bg-bg-elevated"
                      >
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Multi muscle groups */}
            <MuscleGroupEditor
              list={editMuscleGroups}
              setter={setEditMuscleGroups}
              loading={isLoadingMG}
            />

            <div className="space-y-2">
              <label className="text-sm text-content-secondary">
                Instrucoes
              </label>
              <Textarea
                value={editInstructions}
                onChange={(e) => setEditInstructions(e.target.value)}
                className="min-h-[60px] border-line-default bg-bg-elevated text-content-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-content-secondary">
                URL do Video
              </label>
              <Input
                value={editVideoUrl}
                onChange={(e) => setEditVideoUrl(e.target.value)}
                className="border-line-default bg-bg-elevated text-content-primary"
              />
            </div>
            <Button
              onClick={handleSaveEdit}
              disabled={isSaving || !editName.trim()}
              className="h-11 w-full gap-2 rounded-input bg-brand-red font-semibold text-white hover:bg-brand-red-dark"
            >
              <Check className="size-4" />
              {isSaving ? "Salvando..." : "Salvar Alteracoes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
