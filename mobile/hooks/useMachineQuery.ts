import { GQL_ENDPOINT } from "@env";
import { useQuery } from "@tanstack/react-query";
import request, { gql } from "graphql-request";
import { Machine, MachineGroup } from "@/types";
import { useMarkerContext } from "@/context/MarkerContext";

type UseMachinesQueryRequest = Promise<{
  getMachinesByCode: Machine[]
}>

async function getMachinesQuery(region: number) {
  const MachinesQuery = gql`
    query MachineQuery($area: Int!) {
      getMachinesByCode(input: {area: $area}) {
        name
        location
        city
        designs
        updated
        coordinate {
          longitude
          latitude
        }
      }
    }
  `;

  const variables = {
    area: region
  }

  const payload = await request<UseMachinesQueryRequest>(GQL_ENDPOINT, MachinesQuery, variables);
  return payload;
}

export function useMachineQuery() {
  const { currentRegion } = useMarkerContext();
  console.log("@region:", currentRegion?.name);
  const area = currentRegion?.area;
  const query = useQuery<{ getMachinesByCode: Machine[]}, Error, Machine[]>({
    queryKey: ["getMachinesByCode", area],
    queryFn: () => getMachinesQuery(area),
    select: (payload) => {
      return payload.getMachinesByCode
    },
    enabled: !!area,
    staleTime: 5000,
  });

  const { data: machines, ...machinesUtils} = query;

  return {
    machines,
    machinesUtils
  }
}

const machinesBasedOnCity = (machines: Machine[]) => {
  const noCoordinates = [];
  let cities = new Set<string>();

  for (const machine of machines) {
    // If the machine doesn't have any coordinates, we will just ignore them.
    if (machine.coordinate === null) {
      noCoordinates.push(`${machine.name}, ${machine.location}`);
      continue;
    }
    cities.add(machine.city);
  }

  const machineCityNames = Array.from(cities);
  const output: MachineGroup[] = machineCityNames.map((city) => {
    const group: Machine[] = [];
    let latitude = 0;
    let longitude = 0;
    let amountOfMachines = 0;

    for (const machine of machines) {
      if (machine.coordinate === null) continue;

      if (machine.city === city) {
        latitude = latitude + machine.coordinate.latitude;
        longitude = longitude + machine.coordinate.longitude;
        amountOfMachines = amountOfMachines + 1;
        group.push(machine);
      }
    }

    latitude = latitude / amountOfMachines;
    longitude = longitude / amountOfMachines;

    return {
      name: city,
      group: group,
      coordinate: {
        latitude,
        longitude
      },
    }
  })

  // console.log("No coordinates:\n", noCoordinates.join("\n"));

  return output;
};

export function useMachineByCitiesQuery() {
  const { currentRegion } = useMarkerContext();
  const area = currentRegion?.area;

  const query = useQuery<{ getMachinesByCode: Machine[]}, Error, MachineGroup[]>({
    queryKey: ["getMachinesByCode", "cities", area],
    queryFn: () => getMachinesQuery(area),
    select: (payload) => {
      const machines = payload.getMachinesByCode;
      return machinesBasedOnCity(machines);
    },
    enabled: !!area,
    staleTime: 5000,
  });

  const { data: cities, ...citiesUtils} = query;

  return {
    cities,
    citiesUtils
  }
} 