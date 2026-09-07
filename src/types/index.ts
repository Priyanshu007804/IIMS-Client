/**
 * Types and interfaces for Intelligent Incident & Service Management Platform (IIMS)
 * Aligned with OpenAPI schemas from Spring Boot backend
 */

export type IncidentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type IncidentCategory =
  | 'PAYMENT'
  | 'NETWORK'
  | 'DATABASE'
  | 'SECURITY'
  | 'APPLICATION'
  | 'HARDWARE'
  | 'OTHER';

export type UserRole = 'ADMIN' | 'ENGINEER' | 'USER';

export interface User {
  id?: string;
  email: string;
  role: UserRole;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  category: IncidentCategory;
  reportedBy: string | null;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentRequest {
  title: string;
  description: string;
  priority: IncidentPriority;
  category: IncidentCategory;
}

export interface IncidentUpdateRequest {
  title?: string;
  description?: string;
  priority?: IncidentPriority;
  status?: IncidentStatus;
  category?: IncidentCategory;
}

export interface IncidentAssignmentRequest {
  engineerEmail: string;
}

export interface AuditLog {
  id: string;
  incidentId: string;
  action: string;
  performedBy: string;
  details: string;
  timestamp: string;
}

export interface DashboardSummaryResponse {
  totalIncidents: number;
  openIncidents: number;
  inProgressIncidents: number;
  resolvedIncidents: number;
  closedIncidents: number;
  criticalIncidents: number;
}

export type PriorityBreakdown = Record<IncidentPriority | string, number>;
export type CategoryBreakdown = Record<IncidentCategory | string, number>;

export interface PageableObject {
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  unpaged: boolean;
  sort?: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
}

export interface PageIncident {
  content: Incident[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  pageable?: PageableObject;
}

export interface IncidentQueryParams {
  search?: string;
  priority?: IncidentPriority | '';
  status?: IncidentStatus | '';
  category?: IncidentCategory | '';
  page?: number;
  size?: number;
  sort?: string;
}

export interface ApiErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
}
