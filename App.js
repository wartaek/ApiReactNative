import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";

export default function App() {
  //--------------------LOCALISATION---------------------------//
  const [errorMsg, setErrorMsg] = useState(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        setLatitude(String(location.coords.latitude));
        setLongitude(String(location.coords.longitude));
      } catch (error) {
        setErrorMsg("Failed to fetch location");
      }
    })();
  }, []);

  //-------------------------METEO API-------------------------//
  const [meteo, setMeteo] = useState(null);
  const [prevision, setPrevision] = useState([]);

  const APIKey = "a8fcaa294aa3d1dcd5ae451cd20493ab";

  const filtreTexte = (txt, requete) => {
    //console.log(requete);
    const newTxt = txt.toString();
    //console.log(newTxt);
    const texteMinuscule = newTxt.toLowerCase();
    const requeteMinuscule = requete.toLowerCase();
    //console.log(requeteMinuscule);
  
    if (texteMinuscule.includes(requeteMinuscule)) {
      return true;
    } else {
      return false;
    }
  };
  

  useEffect(() => {
    if (latitude && longitude) {
      //Recupere meteo du jour
      try {
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=fr&appid=${APIKey}`
        )
          .then((response) => response.json())
          .then((json) => {
            if (json.weather && json.main) {
              setMeteo(json);
            }
          });
        //Recupère méteo pour les 5 prochains jours
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&lang=fr&appid=${APIKey}`
        )
          .then((response) => response.json())
          .then((json) => {
            // console.log("coucou");
            const filteredPrevisions = [];
            for (let index = 0; index < json.list.length; index++) {
              // console.log("coucou");
              //console.log(time.dt);
              let timestamp = json.list[index].dt;
              let date = new Date(timestamp * 1000);
              //console.log(date);
              let result = filtreTexte(date, "14:00:00")
               if (result == true) {
                //console.log(date);
                //   console.log(json.list[index]);
                filteredPrevisions.push(json.list[index]);
               }
            }
            setPrevision(filteredPrevisions);
            // console.log(filtreTexte(fruits, "T15")); // ['banane', 'mangue'];
          });
      } catch (error) {
        console.error("Echec fetch :", error);
      }
    }
  }, [latitude, longitude]);

  function getJour(timestamp) {
    const jours = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const date = new Date(timestamp * 1000);
    //const date = new Date(timestamp);
    //console.log(date);
    //console.log(date.getDay());
    return jours[date.getDay()];
  }

  //------------------------CODE-----------------------------//
  return (
    <View style={styles.background}>
      <Image
        source={{
          uri: "https://files.smashing.media/articles/ai-technology-transform-design/11-glass-reflection-cgi.gif",
        }}
        style={styles.backgroundImage}
      ></Image>
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.accueil}>
            {meteo && meteo.weather && meteo.main ? (
              <>
                <Text style={styles.text}>
                  Voici la météo actuelle à {meteo.name}
                </Text>
                <Text style={styles.gras}>{meteo.weather[0].description}</Text>
                <Image
                  source={{
                    uri: `https://openweathermap.org/img/w/${meteo.weather[0].icon}.png`,
                  }}
                  style={styles.icon}
                />
                <Text style={styles.grasTemp}>{meteo.main.temp}</Text>
              </>
            ) : (
              <ActivityIndicator size="large" color="#0000ff" />
            )}
          </View>

          <Text style={styles.text}>
            Prévisions météo à 14h pour les 5 prochains jours
          </Text>

          {errorMsg ? (
            <Text style={styles.paragraph}>{errorMsg}</Text>
          ) : (
            <ScrollView horizontal>
              {prevision.map((item) => (
                <View key={item.dt} style={styles.previsionDay}>
                  <Text style={styles.previsionText}>{getJour(item.dt)}</Text>
                  <Text style={styles.previsionText}>{item.main.temp}°C</Text>
                  <Text style={styles.previsionText}>
                    {item.weather[0].description}
                  </Text>
                  <Image
                    source={{
                      uri: `https://openweathermap.org/img/w/${item.weather[0].icon}.png`,
                    }}
                    style={styles.previsionIcon}
                  />
                </View>
              ))}
            </ScrollView>
          )}

          <StatusBar style="auto" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  accueil: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "beige",
    borderColor: "grey",
    borderRadius: 150,
    borderWidth: 2,
    width: 300,
    height: 300,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  icon: {
    width: 100,
    height: 100,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "brown",
    marginTop: 10,
  },
  gras: {
    fontSize: 15,
    fontWeight: "bold",
  },
  grasTemp: {
    fontSize: 26,
    fontWeight: "bold",
  },
  previsionDay: {
    alignItems: "center",
    marginHorizontal: 10,
    backgroundColor: "beige",
    width: 100,
    height: 170,
    borderColor: "grey",
    borderRadius: 5,
    borderWidth: 2,
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
