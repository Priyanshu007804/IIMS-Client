import { api } from './client';
import {
  AuditLog,
  Incident,
  IncidentAssignmentRequest,
  IncidentQueryParams,
  IncidentRequest,
  IncidentUpdateRequest,
  PageIncident,
} from '../types';

export async function getIncidentsApi(params: IncidentQueryParams = {}): Promise<PageIncident> {
  const queryParams: Record<string, any> = {};

  if (params.search && params.search.trim()) {
    queryParams['search'] = params.search.trim();
  }
  if (params.priority) {
    queryParams['priority'] = params.priority;
  }
  if (params.status) {
    queryParams['status'] = params.status;
  }
  if (params.category) {
    queryParams['category'] = params.category;
  }
  if (params.page !== undefined) {
    queryParams['page'] = params.page;
  }
  if (params.size !== undefined) {
    queryParams['size'] = params.size;
  }
  if (params.sort) {
    queryParams['sort'] = params.sort;
  }

  return api.get<PageIncident>('/incidents', { params: queryParams });
}

export async function getIncidentByIdApi(id: string): Promise<Incident> {
  return api.get<Incident>(`/incidents/${id}`);
}

export async function createIncidentApi(data: IncidentRequest): Promise<Incident> {
  return api.post<Incident>('/incidents', data);
}

export async function updateIncidentApi(id: string, data: IncidentUpdateRequest): Promise<Incident> {
  return api.put<Incident>(`/incidents/update/${id}`, data);
}

export async function assignIncidentApi(id: string, engineerEmail: string): Promise<Incident> {
  const payload: IncidentAssignmentRequest = { engineerEmail };
  return api.put<Incident>(`/incidents/assign/${id}`, payload);
}

export async function deleteIncidentApi(id: string): Promise<void> {
  return api.delete<void>(`/incidents/delete/${id}`);
}

export async function getAuditLogsApi(incidentId: string): Promise<AuditLog[]> {
  return api.get<AuditLog[]>(`/incidents/${incidentId}/audit`);
}
