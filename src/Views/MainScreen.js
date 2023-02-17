/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, {useState, useRef, useEffect} from 'react';
import {PermissionsAndroid, StyleSheet, Text, Button, View, } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import ScreenRow from '../Components/ScreenRow';
import SelectPositionBar from '../Components/selectposition';
import {LoadingView, ErrorView, CalculateLocation, LoadingFromStorageView} from './MainScreenStates';
import {storage} from '../store/storage';

export const STATE_LOADING_FROM_STORAGE = 0;
export const STATE_CALCULATE_LOCATION = 1;
export const STATE_LOADING_DATA = 2;
export const STATE_DATA_LOADED = 3;
export const STATE_DATA_ERROR = 4;
export const STATE_DATA_EMPTY = 5;


function MainScreen({navigation, route}) {

  const [useCurrentPosition, setUseCurrentPosition] = useState(true);

  const [dataState, setUpdatingState] = useState({
    state: STATE_LOADING_FROM_STORAGE,
    currWeather: null,
    position: {
      lat: 50,
      lon: 50,
    },
  });
  //const currWeather = useRef(undefined);
  //const location  = useRef({});

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
            setUpdatingState({...dataState, state: STATE_LOADING_DATA, position: {lat: position.coords.latitude, lon: position.coords.longitude}});
          },
          error => {
            console.log(error.code, error.message);
            setUpdatingState({...dataState, state: STATE_DATA_ERROR});
          },
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
      }
    });
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

  async function loadingFromStorage(){
    if (!useCurrentPosition){
      try {
        let ret = await storage.load({key: 'mapPosition', id: '1'});
        console.log(ret);
        setUpdatingState({state: STATE_LOADING_DATA, currWeather: null, position: ret});
      } catch (err) {
        console.warn(err.message);
        setUpdatingState({...dataState, state: STATE_DATA_EMPTY});
      }
    } else {
      setUpdatingState({...dataState, state: STATE_CALCULATE_LOCATION});
    }
  }

  function loadingData(pos){
    fetchWithTimeout(`http://api.openweathermap.org/data/2.5/weather?lat=${pos.lat}&lon=${pos.lon}&units=metric&lang=ru&APPID=df970160e8498542cb823c972d5a8b35`)
    .then((response)=>{
      if (response.ok){
        response.json()
        .then(data=>{
          setUpdatingState({...dataState, state: STATE_DATA_LOADED, currWeather: data});
        });
      }
    })
    .catch(
      (error) => setUpdatingState({...dataState, state: STATE_DATA_ERROR, currWeather: null})
    );
  }

  useEffect(()=>{
    if (route.params?.position !== undefined)
    {
      // записать новые координаты в хранилище
      storage.save({
        key: 'mapPosition',
        id: '1',
        data: route.params?.position,
      });
      setUpdatingState({...dataState, state: STATE_LOADING_FROM_STORAGE});
      route.params.position = undefined;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[route.params?.position]);

  useEffect(()=> {
    if (dataState.state === STATE_LOADING_FROM_STORAGE){
      loadingFromStorage();
    } else if (dataState.state === STATE_CALCULATE_LOCATION){
      getLocation();
    } else if (dataState.state === STATE_LOADING_DATA){
      loadingData(dataState.position);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[dataState]);

    function emptyDataView(){
      return (
        <View style = {styles.container}>
          <SelectPositionBar
            navigation = {navigation}
            position = {dataState.position}
            useCurrentPos = {useCurrentPosition}
            setCurrentPosHandler = {setUseCurrentPosition}
          />
          <View
            style={styles.infoScreen}>
            <Text style ={styles.textValueStyle}>Не определена позиция. Используйте свое местоположение или выберите точку на карте</Text>
         </View>
          <View
            style ={styles.buttonStyle}
            >
            <Button
                onPress={()=>{
                  setUpdatingState({state: STATE_CALCULATE_LOCATION, currWeather: null});
                  //currWeather = undefined;
                }}
                title="Обновить"
              />
          </View>
        </View>
      );
    }


  function loadedView(){
    let currWeather = dataState.currWeather;
    return (
      <View style = {styles.container}>
        <SelectPositionBar
          navigation = {navigation}
          position = {dataState.position}
          useCurrentPos = {useCurrentPosition}
          setCurrentPosHandler = {setUseCurrentPosition}
        />
        <View style={styles.infoScreen}>
          <ScreenRow param = {'Местоположение:'} value = {currWeather.name}/>
          <ScreenRow param = {'Температура:'} value = {currWeather.main.temp + ' °C'}/>
          <ScreenRow param = {'По ощущению:'} value = {currWeather.main.feels_like + ' °C'}/>
          <ScreenRow param = {'Влажность:'} value = {currWeather.main.humidity + ' %'}/>
          <ScreenRow param = {'Небо:'} value = {currWeather.weather[0].description}/>
          <ScreenRow param = {'Облачность:'} value = {currWeather.clouds.all + ' %'}/>
          <ScreenRow param = {'Давление'} value = {currWeather.main.pressure * 0.75 + ' мм. рт. ст.'}/>
          <ScreenRow param = {'Видимость:'} value = {currWeather.visibility + ' м.'}/>
          <ScreenRow param = {'Ветер:'} value = {currWeather.wind.speed + ' м/сек - ' + windAngleToDirection(currWeather.wind.deg)}/>
        </View>
        <View style ={styles.buttonStyle}
          >
          <Button
              onPress={()=>{
                setUpdatingState({...dataState, state: STATE_LOADING_FROM_STORAGE});
              }}
              title="Обновить"
            />
        </View>
      </View>
    );
  }

  switch (dataState.state) {
    case STATE_LOADING_FROM_STORAGE:
      return <LoadingFromStorageView/>;
    case STATE_CALCULATE_LOCATION:
      return <CalculateLocation/>;
    case STATE_LOADING_DATA:
      return <LoadingView/>;
    case STATE_DATA_LOADED:
      return loadedView();
    case STATE_DATA_EMPTY:
      return emptyDataView();
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
