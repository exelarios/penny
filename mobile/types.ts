export type Coordinate = {
  latitude: number;
  longitude: number;
}

export type Machine = {
  id: number;
  name: string;
  address: string;
  status: string;
  area: number;
  country: string;
  city: string;
  coordinate: Coordinate;
}

export type Device = {
  name: string;
  designs: number;
  deviceType: string;
}

export type MachineDetail = {
  id: number;
  name: string;
  address: string;
  country: string;
  zipCode: string;
  website: string;
  phone: string;
  comments: string;
  area: number;
  city: string;
  status: string;
  devices: Device[];
}

export type MachineGroup = {
  name: string;
  coordinate: Coordinate,
  group: Machine[]
}

export type MachineRegion = {
  area: number;
  name: string;
  coordinate: Coordinate;
}