import { useQuery } from "@tanstack/react-query";
import { request, gql } from "graphql-request";
import { GQL_ENDPOINT } from "@env";
import { MachineRegion } from "@/types";
import { sortAlphabetically } from "@/utils";

type UseLocationQueryRequest = Promise<{
  locations: MachineRegion[]
}>

console.log(GQL_ENDPOINT)

function useRegionQuery() {
  const getRegionQuery = async () => {
    const RegionQuery = gql`
      query LocationsQuery {
        locations {
          name
          url
          area
          coordinate {
            latitude
            longitude 
          }
        }
      }
    `;
    const payload = await request<UseLocationQueryRequest>(GQL_ENDPOINT, RegionQuery);
    return payload;
  }

  const query = useQuery<{ locations: MachineRegion[]}, Error, MachineRegion[]>({
    queryKey: ["locations"],
    queryFn: getRegionQuery,
    select: (payload) => {
      return payload.locations;
    },
    staleTime: 5000,
  });

  const { data: regions, ...regionsUtils } = query;

  return {
    regions: regions?.sort(sortAlphabetically),
    regionsUtils
  };
}

export default useRegionQuery;