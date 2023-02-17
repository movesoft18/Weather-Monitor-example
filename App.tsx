/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import MainScreen from './src/Views/MainScreen';
import Navigate from './src/Components/navigate';
import Map from './src/Views/Map';
import YaMap from 'react-native-yamap';

YaMap.init('Your API Key');
YaMap.setLocale('ru_RU');


function App() {
  return (
    <Navigate/>
  );
}
export default App;
