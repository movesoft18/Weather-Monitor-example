/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, {useState, useRef, useEffect} from 'react';
import {PermissionsAndroid, StyleSheet, Text, Button, View} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import ScreenRow from '../Components/ScreenRow';
import {LoadingView, ErrorView, CalculateLocation} from './MainScreenStates';

const STATE_CALCULATE_LOCATION = 0;
const STATE_LOADING_DATA = 1;
const STATE_DATA_LOADED = 2;
const STATE_DATA_ERROR = 3;

function MainScreen() {

  const [updatingDone, setUpdatingState] = useState(STATE_CALCULATE_LOCATION);
  const currWeather = useRef(undefined);
  const location  = useRef({});

  function windAngleToDirection(angle){
    if (angle < 22.5) return 'Cев';
    if (angle < 67.5) return 'C-В';
    if (angle < 112.5) return 'Вост';
    if (angle < 157.5) return 'Ю-В';
    if (angle < 202.5) return 'Юж';
    if (angle < 247.5) return 'Ю-З';
    if (angle < 292.5) return 'Зап';
    if (angle < 337.5) return 'С-З';
    return 'Сев';
  }

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
          currWeather.current = data;
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

  function loadedView(){
    return (
      <View style = {styles.container}>
        <View style={styles.infoScreen}>
          <ScreenRow param = {'Местоположение:'} value = {currWeather.current.name}/>
          <ScreenRow param = {'Температура:'} value = {currWeather.current.main.temp + ' °C'}/>
          <ScreenRow param = {'По ощущению:'} value = {currWeather.current.main.feels_like + ' °C'}/>
          <ScreenRow param = {'Влажность:'} value = {currWeather.current.main.humidity + ' %'}/>
          <ScreenRow param = {'Небо:'} value = {currWeather.current.weather[0].description}/>
          <ScreenRow param = {'Облачность:'} value = {currWeather.current.clouds.all + ' %'}/>
          <ScreenRow param = {'Давление'} value = {currWeather.current.main.pressure * 0.75 + ' мм. рт. ст.'}/>
          <ScreenRow param = {'Видимость:'} value = {currWeather.current.visibility + ' м.'}/>
          <ScreenRow param = {'Ветер:'} value = {currWeather.current.wind.speed + ' м/сек - ' + windAngleToDirection(currWeather.current.wind.deg)}/>
        </View>
        <View style ={styles.buttonStyle}
          >
          <Button
              onPress={()=>{
                setUpdatingState(STATE_CALCULATE_LOCATION);
                currWeather.current = undefined;
              }}
              title="Обновить"
            />
        </View>
      </View>
    );
  }

  switch (updatingDone) {
    case STATE_CALCULATE_LOCATION:
      return <CalculateLocation/>;
    case STATE_LOADING_DATA:
      return <LoadingView/>;
    case STATE_DATA_LOADED:
      return loadedView();
    case STATE_DATA_ERROR:
      return <ErrorView/>;
  }

}
export default MainScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    flexDirection: 'column',
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
