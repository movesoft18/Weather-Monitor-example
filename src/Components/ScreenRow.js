/* eslint-disable prettier/prettier */
import React  from 'react';
import {StyleSheet, View, Text} from 'react-native';

export default function ScreenRow(props){
    return (
      <View style={styles.paramRow}>
        <View style={styles.paramName}>
          <Text style ={styles.textParamStyle}>{props.param}</Text>
        </View>
        <View style={styles.paramValue}>
        <Text style ={styles.textValueStyle}>{props.value}</Text>
        </View>
      </View>
    );
  }

  const styles = StyleSheet.create({

    paramRow: {
      height: '10%',
      flexDirection: 'row',
    },

    paramName: {
      flex: 1,
      justifyContent: 'center',
      paddingRight: 10,
      paddingLeft: 10,
    },

    paramValue: {
      flex: 1,
      justifyContent: 'center',
      paddingRight: 10,
      paddingLeft: 10,
    },

    textValueStyle: {
        fontSize: 18,
        color: 'black',
      },

      textParamStyle: {
        fontSize: 18,
        color: 'gray',
      },

  });
