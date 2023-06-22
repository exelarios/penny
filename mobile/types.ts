export type Coordinate = {
  latitude: number;
  longitude: number;
}

export type Machine = {
  name: string
  location: string
  city: string
  designs: string
  coordinate: Coordinate
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