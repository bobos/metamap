/**
 * l9 Map Travel
 * https://github.com/kobkrit/learn-react-native
 * @flow
 */

import React, {Component} from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import Map from './DisplayLatLng';

const { width, height } = Dimensions.get('window');
export default class MetaMap extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Map />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  pos: {
    position: 'absolute',
    bottom: height / 2,
    width: width / 2,
    alignItems: 'stretch',
  },
  bubble: {
    backgroundColor: 'grey',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
});

AppRegistry.registerComponent('MetaMap1', () => MetaMap);
