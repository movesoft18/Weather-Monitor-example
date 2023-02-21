/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import Navigate from './src/Components/navigate';
import YaMap from 'react-native-yamap';

YaMap.init('Your API Key');
YaMap.setLocale('ru_RU');


function App() {
  return (
    <Navigate/>
  );
}
export default App;
