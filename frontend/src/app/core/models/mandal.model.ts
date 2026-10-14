export interface Mandal {
  _id?: string;
  name: string;
  code?: string;
  district?: string;
  division?: string;
  tahsildarName?: string;
  tahsildarPhone?: string;
}

export interface Village {
  _id?: string;
  name: string;
  mandal: string;
  mandalId?: string;
  vroName?: string;
  vroPhone?: string;
}
