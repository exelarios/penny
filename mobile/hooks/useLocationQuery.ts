import { useQuery } from "@tanstack/react-query";
import { request, gql } from "graphql-request";
import { GQL_ENDPOINT } from "@env";

type Coordinate = {
  latitude: number;
  longitude: number;
}

type Location = {
  area: number;
  name: string;
  coordinate: Coordinate;
}

type UseLocationQueryRequest = Promise<{
  locations: Location[]
}>

const URL = "http://localhost:8080/query"

function useLocationQuery() {
  const getLocationsQuery = async () => {
    const LocationsQuery = gql`
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
    const payload = await request<UseLocationQueryRequest>("https://e237-71-80-163-194.ngrok-free.app/query", LocationsQuery);
    return payload;
  }

  const query = useQuery<{ locations: Location[]}, Error, Location[]>({
    queryKey: ["locations"],
    queryFn: getLocationsQuery,
    select: (payload) => {
      return payload.locations;
    }
  });

  return query;
}

export default useLocationQuery;