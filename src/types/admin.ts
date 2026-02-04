export interface WorkflowRequest {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  user: { name: string; role: string };
  documents: { id: string; fileName: string }[];
}

export interface Workflow {
  id: string;
  title: string;
  description: string;
  order: number;
  status: string;
  requests: WorkflowRequest[];
}

export interface Quote {
  id: string;
  amount: number;
  currency: string;
  description: string;
  validUntil: string;
  status: string;
}

export interface ApplicationNote {
  id: string;
  content: string;
  createdAt: string;
}

export interface AppDocument {
  id: string;
  fileName: string;
  filePath: string;
  category: string;
  createdAt: string;
}

export interface CompanyRecord {
  id: string;
  companyName: string;
  registrationNumber: string;
  registrationDate: string;
  documents: { id: string; fileName: string; category: string }[];
}

export interface Application {
  id: string;
  companyName: string;
  companyType: string;
  fullName: string;
  email: string;
  phone: string;
  description: string;
  status: string;
  createdAt: string;
  quotes: Quote[];
  workflows: Workflow[];
  documents: AppDocument[];
  notes: ApplicationNote[];
  companyRecord: CompanyRecord | null;
}

export interface ApplicationListItem {
  id: string;
  companyName: string;
  companyType: string;
  fullName: string;
  email: string;
  status: string;
  createdAt: string;
  _count: { documents: number };
}

export interface AdminDocument {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  category: string;
  createdAt: string;
  applicationId: string | null;
  user: { name: string | null; email: string };
  application: { id: string; companyName: string } | null;
}

export interface DocumentStats {
  total: number;
  applicationDoc: number;
  companyDoc: number;
  other: number;
}

export interface AppOption {
  id: string;
  companyName: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  createdAt: string;
  _count: {
    applications: number;
    documents: number;
  };
}

export interface UserStats {
  total: number;
  admins: number;
  clients: number;
}

export type TabId = "overview" | "quotes" | "workflow" | "documents" | "notes" | "company";
