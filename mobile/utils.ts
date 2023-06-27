import { MachineRegion } from "@/types";

export const sortAlphabetically = (a: MachineRegion, b: MachineRegion) => {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}