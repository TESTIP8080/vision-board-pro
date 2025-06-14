export interface Task {
  id: number;
  text: string;
  imageUrl: string;
  isDone: boolean;
  rotation: number;
  scale: number;
  createdAt: string; // В формате ISO
  completedAt: string | null; // Дата выполнения или null
} 