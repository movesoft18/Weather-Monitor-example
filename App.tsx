/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, {useState, useRef, useEffect} from 'react';
import {PermissionsAndroid, StyleSheet, Text, Button, View} from 'react-native';
import Geolocation from 'react-native-geolocation-service';

const STATE_CALCULATE_LOCATION = 0;
const STATE_LOADING_DATA = 1;
const STATE_DATA_LOADED = 2;
const STATE_DATA_ERROR = 3;

function App() {

  const [updatingDone, setUpdatingState] = useState(STATE_CALCULATE_LOCATION);
  const currTemp = useRef(undefined);
  const location:any  = useRef({});

  async function requestLocationPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Получение прав на определение местоположения',
          message: 'Вы разрешаете данному приложению определять ваше местоположение?',
          buttonNeutral: 'Спросить позже',
          buttonNegative: 'Запретить',
          buttonPositive: 'Разрешить',
        },
      );
      console.log('Права - ', granted);
      if (granted === 'granted') {
        console.log('Права получены');
        return true;
      } else {
        console.log('Доступ запрещен');
        return false;
      }
    } catch (err) {
      return false;
    }
  }

  function getLocation () {
    const result = requestLocationPermission();
    result.then(res => {
      console.log('Результат:', res);
      if (res) {
        Geolocation.getCurrentPosition(
          position => {
            console.log(position);
            location.current = position;
            setUpdatingState(STATE_LOADING_DATA);
          },
          error => {
            console.log(error.code, error.message);
            location.current = undefined;
            setUpdatingState(STATE_DATA_ERROR);
          },
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
      }
    });
    console.log(location);
  };

  async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 10000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  }

  function loadingData(){
    fetchWithTimeout(`http://api.openweathermap.org/data/2.5/weather?lat=${location.current.coords.latitude}&lon=${location.current.coords.longitude}&units=metric&lang=ru&APPID=df970160e8498542cb823c972d5a8b35`)
    .then((response)=>{
      if (response.ok){
        response.json()
        .then(data=>{
          currTemp.current = data.main.temp;
          setUpdatingState(STATE_DATA_LOADED);
        });
      }
    })
    .catch(
      (error) => setUpdatingState(STATE_DATA_ERROR)
    );
  }

  useEffect(()=> {
    if (updatingDone === STATE_CALCULATE_LOCATION) {
      getLocation();
    } else if (updatingDone === STATE_LOADING_DATA) {
      loadingData();
    }
  },[updatingDone]);

  function LoadingView() {
    return (
      <View
      style={styles.awaitLoading}>
      <Text>Обновление данных...</Text>
    </View>
    );
  }

  function calculateLocation() {
    return (
      <View
      style={styles.awaitLoading}>
      <Text>Определение вашего местоположения...</Text>
    </View>
    );
  }

  function errorView() {
    return (
      <View
      style={styles.awaitLoading}>
      <Text>Ошибка...</Text>
    </View>
    );
  }

  function LoadedView(){
    return (
      <View style = {styles.container}>
        <View
          style={styles.infoScreen}>
          <Text style ={styles.textStyle}>{currTemp.current === undefined ? 'Ошибка' : currTemp.current + ' °C'}</Text>
        </View>
        <View
          style ={styles.buttonStyle}
          >
          <Button
              onPress={()=>{
                setUpdatingState(STATE_CALCULATE_LOCATION);
                currTemp.current = undefined;
              }}
              title="Обновить"
            />
        </View>
      </View>
    );
  }


  switch (updatingDone) {
    case STATE_CALCULATE_LOCATION:
      return calculateLocation();
    case STATE_LOADING_DATA:
      return LoadingView();
    case STATE_DATA_LOADED:
      return LoadedView();
    case STATE_DATA_ERROR:
      return errorView();
  }

}
export default App;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    flexDirection: 'column',
  },

  awaitLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoScreen: {
    flex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonStyle: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  textStyle: {
    fontSize: 24,
  },
});
