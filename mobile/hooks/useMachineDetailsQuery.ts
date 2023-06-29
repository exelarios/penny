import request, { gql } from "graphql-request";
import { Machine, MachineDetail } from "@/types";
import { GQL_ENDPOINT } from "@env";
import { useMarkerContext } from "@/context/MarkerContext";
import { useQuery } from "@tanstack/react-query";

type UseMachineDetailsQueryResponse = {
  GetMachineById: MachineDetail
}

type UseMachineDetailsQueryRequest = Promise<UseMachineDetailsQueryResponse>;

async function getMachineQuery(id: number) {
  const MachineQuery = gql`
    query GetMachine($id: Int!) {
      GetMachineById(input: {id: $id}) {
        id
        name
        address
        status
        country
        zipCode
        website
        phone
        comments
        area
        city
        status
        devices {
          name
          designs
          deviceType
        }
      }
    }
  `;

  const vairables = {
    id: id
  }
  
  const payload = await request<UseMachineDetailsQueryRequest>(GQL_ENDPOINT, MachineQuery, vairables);
  return payload;
}

export function UseMachineDetailsQuery() {
  const { currentMachine } = useMarkerContext();
  const id = currentMachine.id;
  const query = useQuery<UseMachineDetailsQueryResponse, Error, MachineDetail>({
    queryKey: ["GetMachineById", id],
    queryFn: () => getMachineQuery(id),
    select: (payload) => {
      return payload.GetMachineById
    },
    enabled: !!id,
    staleTime: 5000
  });

  const { data: machine, ...machineUtils } = query;

  return {
    machine,
    machineUtils
  }
}