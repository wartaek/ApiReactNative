import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { Image, StyleSheet, Text, View, ScrollView } from "react-native";
// import * as Location from "expo-location";

export default function App() {
  //METEO API
  const [meteo, setMeteo] = useState(null);
  const [prevision, setPrevision] = useState([]);

  const APIKey = "a8fcaa294aa3d1dcd5ae451cd20493ab";

  useEffect(() => {
    //Recupere meteo du jour
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=Lyon&units=metric&lang=fr&appid=${APIKey}`
    )
      .then((response) => response.json())
      .then((json) => {
        setMeteo(json);
      });
    //Recupère méteo pour les 5 prochains jours
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=Lyon&units=metric&lang=fr&appid=${APIKey}`
    )
      .then((response) => response.json())
      .then((json) => {
        setPrevision(json);
      });
  }, []);
  //--------------------LOCALISATION---------------------------//
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS === "android" && !Device.isDevice) {
        setErrorMsg(
          "Oops, this will not work on Snack in an Android Emulator. Try it on your device!"
        );
        return;
      }
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }
  //------------------------CODE-----------------------------//
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Voici la météo actuelle à Lyon</Text>
      {meteo && meteo.weather && meteo.main && (
        <>
          <Text>{meteo.main.temp}</Text>
          <Text>{meteo.weather[0].description}</Text>
          <Image
            source={{
              uri: `https://openweathermap.org/img/w/${meteo.weather[0].icon}.png`,
            }}
            style={styles.icon}
          />
        </>
      )}

      <Text style={styles.text}>
        Prévisions météo à 15h pour les 5 prochains jours
      </Text>
      <Text style={styles.paragraph}>{text}</Text>
      <ScrollView horizontal>
        {/* {prevision.map((item) => (
          <View key={item.dt} style={styles.previsionDay}>
            <Text style={styles.previsionText}>{getDayOfWeek(item.dt)}</Text>
            <Text style={styles.previsionText}>{item.main.temp}°C</Text>
            <Text style={styles.previsionText}>{item.weather[0].description}</Text>
            <Image
              source={{
                uri: `https://openweathermap.org/img/w/${item.weather[0].icon}.png`,
              }}
              style={styles.previsionIcon}
            />
          </View>
        ))} */}
      </ScrollView>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "tan",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "yellow",
    borderRadius: 20,
  },
  icon: {
    width: 100,
    height: 100,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
    marginTop: 10,
  },
  previsionDay: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  previsionText: {
    fontSize: 16,
    marginVertical: 5,
  },
  previsionIcon: {
    width: 50,
    height: 50,
  },
  paragraph: {
    fontSize: 18,
    textAlign: "center",
  },
});

// function getDayOfWeek(timestamp) {
//   const days = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
//   const date = new Date(timestamp * 1000);
//   return days[date.getDay()];
// }
