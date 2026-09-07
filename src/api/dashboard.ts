import { api } from './client';
import {
  CategoryBreakdown,
  DashboardSummaryResponse,
  PriorityBreakdown,
} from '../types';

export async function getDashboardSummaryApi(): Promise<DashboardSummaryResponse> {
  return api.get<DashboardSummaryResponse>('/dashboard/summary');
}

export async function getIncidentsByPriorityApi(): Promise<PriorityBreakdown> {
  return api.get<PriorityBreakdown>('/dashboard/by-priority');
}

export async function getIncidentsByCategoryApi(): Promise<CategoryBreakdown> {
  return api.get<CategoryBreakdown>('/dashboard/by-category');
}
