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