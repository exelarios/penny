import { Text, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import MapView, { Marker } from "react-native-maps";

function Explore() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}>
        <Marker
          coordinate={{latitude: 1, longitude: 0}}>
          <View style={styles.marker}>
            <Text style={styles.text}>nico nico ni</Text>
          </View>
        </Marker>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
    ...StyleSheet.absoluteFillObject,
  },
  marker: {
    backgroundColor: "red",
    width: "100%",
    height: "100%"
  },
  text: {
    fontSize: 50,
    color: "green"
  }
});

export default Explore;