import { StyleSheet } from 'react-native';

import ScatterPlot from '@/components/ScatterPlot';
import { Text, View } from '@/components/Themed';
import { CartesianChart, Scatter } from 'victory-native';


export default function TabTwoScreen() {
  const data = [{x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}]
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab Two</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <ScatterPlot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
