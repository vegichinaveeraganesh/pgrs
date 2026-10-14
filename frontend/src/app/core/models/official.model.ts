export interface Official {
  _id?: string;
  name: string;
  role: 'RDO' | 'Tahsildar' | 'VRO';
  phone: string;
  email?: string;
  mandal?: string;
  village?: string;
  assignedVillages?: string[];
  active: boolean;
  totalCount?: number;
  pendingCount?: number;
  resolvedCount?: number;
}

export interface VillageMatrixItem {
  name: string;
  vro: {
    name: string;
    phone: string;
  };
  pending: number;
}

export interface MandalDirectoryItem {
  mandal: string;
  tahsildar: {
    name: string;
    phone: string;
  };
  villages: VillageMatrixItem[];
  total: number;
  pending: number;
  resolved: number;
}

export interface DirectoryResponse {
  division: string;
  mandals: MandalDirectoryItem[];
}
