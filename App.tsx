/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {Text, Button, View} from 'react-native';

let currTemp = undefined;

function App() {

  const [updatingDone, setUpdatingState] = useState(false);

  function LoadingView() {
    fetch('http://api.openweathermap.org/data/2.5/weather?lat=57&lon=53&units=metric&lang=ru&APPID=df970160e8498542cb823c972d5a8b35')
      .then((response)=>{
        if (response.ok){
          response.json()
          .then(data=>{
            currTemp = data.main.temp;
            setUpdatingState(true);
          });
        }
      })
      .catch(
        (error) => setUpdatingState(true)
      );
    return (
      <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text>Обновление данных...</Text>
    </View>
    )
  }

  function LoadedView(){
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text>{currTemp === undefined ? 'Ошибка' : currTemp}</Text>
        <Button
          onPress={()=>{
            setUpdatingState(false);
            currTemp = undefined;
          }}
          title="Обновить"
        />
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