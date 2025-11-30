export type FeatureStatus = 'todo' | 'doing' | 'done';

export interface Feature {
  id: number;
  title: string;
  description: string | null;
  module: string;
  status: FeatureStatus;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureStats {
  byStatus: Record<FeatureStatus, number>;
  byModule: Record<string, number>;
}

export interface CreateFeatureInput {
  title: string;
  description?: string;
  module?: string;
  status?: FeatureStatus;
  priority?: number;
}

export interface UpdateFeatureInput {
  title?: string;
  description?: string;
  module?: string;
  status?: FeatureStatus;
  priority?: number;
}

export interface ApiError {
  error: string;
}
