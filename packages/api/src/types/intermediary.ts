export type BusyState = boolean | undefined;

export type PodResponse = {
  sucess: boolean,
  message: any
}

export interface FetchResponseInterface { data: PodResponse, errors: any }
