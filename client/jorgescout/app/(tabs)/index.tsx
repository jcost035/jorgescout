import { StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import BloodSugarReading from '@/components/BloodSugarReading';
import ScatterPlot from '@/components/ScatterPlot';
import { ScrollView } from 'react-native-reanimated/lib/typescript/Animated';
import DataScroll from '@/components/DataScroll';

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      {/* <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" /> */}
      <BloodSugarReading/>
      <ScatterPlot/>
      <DataScroll/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20
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
