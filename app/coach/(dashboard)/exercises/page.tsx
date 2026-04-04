"use client";

import { useEffect, useState } from "react";
import { searchExercises, createCustomExercise } from "@/app/actions/workouts";
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
import { Search, Plus, Dumbbell } from "lucide-react";
import type { Exercise, MuscleGroup, EquipmentType } from "@/lib/types/database";

const muscleGroupLabels: Record<MuscleGroup, string> = {
  chest: "Peito",
  back: "Costas",
  shoulders: "Ombros",
  biceps: "Bíceps",
  triceps: "Tríceps",
  legs: "Pernas",
  glutes: "Glúteos",
  abs: "Abdômen",
  full_body: "Full Body",
};

const equipmentLabels: Record<EquipmentType, string> = {
  barbell: "Barra",
  dumbbell: "Halter",
  machine: "Máquina",
  cable: "Cabo",
  bodyweight: "Peso Corporal",
  resistance_band: "Elástico",
  kettlebell: "Kettlebell",
};

const muscleGroups = Object.entries(muscleGroupLabels) as [MuscleGroup, string][];
const equipmentTypes = Object.entries(equipmentLabels) as [EquipmentType, string][];

export default function ExerciseLibraryPage() {
  const { profile } = useAuth();
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

  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsLoading(true);
      const data = await searchExercises(query, muscleFilter || undefined);
      setExercises(data as Exercise[]);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, muscleFilter]);

  async function handleCreate() {
    if (!profile || !newName.trim()) return;
    setIsCreating(true);
    try {
      await createCustomExercise(
        {
          name: newName.trim(),
          muscle_group: newMuscle,
          equipment: newEquipment,
          instructions: newInstructions || null,
          video_url: newVideoUrl || null,
        },
        profile.id
      );
      setDialogOpen(false);
      setNewName("");
      setNewInstructions("");
      setNewVideoUrl("");
      // Reload
      const data = await searchExercises(query, muscleFilter || undefined);
      setExercises(data as Exercise[]);
    } catch {
      // silent
    }
    setIsCreating(false);
  }

  // Group exercises by muscle_group
  const grouped = exercises.reduce<Record<string, Exercise[]>>((acc, ex) => {
    const key = ex.muscle_group;
    if (!acc[key]) acc[key] = [];
    acc[key].push(ex);
    return acc;
  }, {});

  return (
    <div className="flex-1 p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-content-primary">
          Biblioteca de Exercícios
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="gap-2 rounded-input bg-brand-red text-white hover:bg-brand-red-dark">
                <Plus className="size-4" />
                Criar Exercício
              </Button>
            }
          />
          <DialogContent className="border-line-subtle bg-bg-surface text-content-primary sm:max-w-[440px]">
            <DialogHeader>
              <DialogTitle className="text-content-primary">
                Novo Exercício
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm text-content-secondary">Nome *</label>
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
                    Grupo Muscular
                  </label>
                  <Select
                    value={newMuscle}
                    onValueChange={(v) => setNewMuscle(v as MuscleGroup)}
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
                    onValueChange={(v) => setNewEquipment(v as EquipmentType)}
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
              <div className="space-y-2">
                <label className="text-sm text-content-secondary">
                  Instruções
                </label>
                <Textarea
                  placeholder="Como executar o exercício..."
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  className="min-h-[60px] border-line-default bg-bg-elevated text-content-primary placeholder:text-content-tertiary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-content-secondary">
                  URL do Vídeo
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
                {isCreating ? "Criando..." : "Criar Exercício"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search + Filters */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-content-tertiary" />
          <Input
            placeholder="Buscar exercício..."
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
            Nenhum exercício encontrado.
          </p>
        </div>
      ) : muscleFilter ? (
        // Flat list when filtered
        <div className="space-y-2">
          {exercises.map((ex) => (
            <div
              key={ex.id}
              className="flex items-center gap-4 rounded-card border border-line-subtle bg-bg-surface p-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-content-primary truncate">
                  {ex.name}
                </p>
                <p className="text-[11px] text-content-secondary">
                  {equipmentLabels[ex.equipment] ?? ex.equipment}
                  {ex.is_custom && " · Personalizado"}
                </p>
              </div>
              <Badge className="bg-bg-elevated text-[10px] text-content-secondary">
                {muscleGroupLabels[ex.muscle_group]}
              </Badge>
            </div>
          ))}
        </div>
      ) : (
        // Grouped by muscle
        <div className="space-y-6">
          {Object.entries(grouped).map(([group, exs]) => (
            <div key={group}>
              <h3 className="mb-2 text-sm font-medium text-content-primary">
                {muscleGroupLabels[group as MuscleGroup] ?? group}
              </h3>
              <div className="space-y-2">
                {exs.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center gap-4 rounded-card border border-line-subtle bg-bg-surface p-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-content-primary truncate">
                        {ex.name}
                      </p>
                      <p className="text-[11px] text-content-secondary">
                        {equipmentLabels[ex.equipment] ?? ex.equipment}
                        {ex.is_custom && " · Personalizado"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
