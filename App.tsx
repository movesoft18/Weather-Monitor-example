/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, {useState, useRef, useEffect} from 'react';
import {StyleSheet, Text, Button, View} from 'react-native';


function App() {

  const [updatingDone, setUpdatingState] = useState(false);
  const currTemp = useRef(undefined);

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

  useEffect(()=> {
    fetchWithTimeout('http://api.openweathermap.org/data/2.5/weather?lat=57&lon=53&units=metric&lang=ru&APPID=df970160e8498542cb823c972d5a8b35')
      .then((response)=>{
        if (response.ok){
          response.json()
          .then(data=>{
            currTemp.current = data.main.temp;
            setUpdatingState(true);
          });
        }
      })
      .catch(
        (error) => setUpdatingState(true)
      );
  },[updatingDone]);

  function LoadingView() {
    return (
      <View
      style={styles.awaitLoading}>
      <Text>Обновление данных...</Text>
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
                setUpdatingState(false);
                currTemp.current = undefined;
              }}
              title="Обновить"
            />
        </View>
      </View>
    );
  }


  if (!updatingDone) {
    return LoadingView();
  }
  else {
    return LoadedView();
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
