/* eslint-disable prettier/prettier */
import React  from 'react';
import {StyleSheet, View, Text, ActivityIndicator} from 'react-native';

export function LoadingView() {
    return (
      <View
      style={styles.awaitLoading}>
      <ActivityIndicator size="large" />
      <Text>Обновление данных...</Text>
    </View>
    );
  }

  export function CalculateLocation() {
    return (
      <View
      style={styles.awaitLoading}>
      <ActivityIndicator size="large" />
      <Text>Определение вашего местоположения...</Text>
    </View>
    );
  }

  export function ErrorView() {
    return (
      <View
      style={styles.awaitLoading}>
      <ActivityIndicator size="large" />
      <Text>Ошибка...</Text>
    </View>
    );
  }

  const styles = StyleSheet.create({
    awaitLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },

  });
