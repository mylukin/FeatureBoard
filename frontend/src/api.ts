import type { Feature, FeatureStats, CreateFeatureInput, UpdateFeatureInput, ApiError } from './types';

const API_BASE = '/api/features';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error ${response.status}`);
  }
  return response.json();
}

export interface FetchFeaturesParams {
  status?: string;
  module?: string;
}

export async function fetchFeatures(params: FetchFeaturesParams = {}): Promise<Feature[]> {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.set('status', params.status);
  if (params.module) searchParams.set('module', params.module);

  const url = searchParams.toString() ? `${API_BASE}?${searchParams}` : API_BASE;
  const response = await fetch(url);
  return handleResponse<Feature[]>(response);
}

export async function fetchFeature(id: number): Promise<Feature> {
  const response = await fetch(`${API_BASE}/${id}`);
  return handleResponse<Feature>(response);
}

export async function createFeature(data: CreateFeatureInput): Promise<Feature> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Feature>(response);
}

export async function updateFeature(id: number, data: UpdateFeatureInput): Promise<Feature> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Feature>(response);
}

export async function deleteFeature(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error ${response.status}`);
  }
}

export async function fetchStats(): Promise<FeatureStats> {
  const response = await fetch(`${API_BASE}/stats`);
  return handleResponse<FeatureStats>(response);
}
