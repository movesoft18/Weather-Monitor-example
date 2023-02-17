/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import MainScreen from './src/Views/MainScreen';
import Navigate from './src/Components/navigate';
import Map from './src/Views/Map';
import YaMap from 'react-native-yamap';

YaMap.init('1c4260a0-48f9-498a-beb4-394a728a6c7b');
YaMap.setLocale('ru_RU');


function App() {
  return (
    <Navigate/>
  );
}
export default App;
