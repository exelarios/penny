import { GQL_ENDPOINT } from "@env";
import { useQuery } from "@tanstack/react-query";
import request, { gql } from "graphql-request";
import { Machine } from "@/types";

type UseMachinesQueryRequest = Promise<{
  getMachinesByCode: Machine[]
}>

function useMachineQuery(region: number) {
  console.log("fetching", region);
  if (region === -1) return;
  const getMachinesQuery = async () => {
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

  const query = useQuery<{ getMachinesByCode: Machine[]}, Error, Machine[]>({
    queryKey: ["getMachinesByCode", region],
    queryFn: getMachinesQuery,
    select: (payload) => {
      return payload.getMachinesByCode
    },
    staleTime: 5000
  });

  const { data: machines, ...machinesUtils} = query;

  return {
    machines,
    machinesUtils
  }
}

export default useMachineQuery;