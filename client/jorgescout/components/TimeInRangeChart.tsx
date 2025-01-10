import React, {useEffect, useState} from 'react';
import { Text, View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, G, Text as SvgText } from 'react-native-svg';
import { pie, arc, PieArcDatum } from 'd3-shape';
import { scaleOrdinal } from 'd3-scale';
import { getStats } from '@/scripts/scripts';
import { test } from 'vitest';

const screenWidth = Dimensions.get('screen').width;
const sideLength = screenWidth / 3;

// Define the data type for pie chart segments
interface PieData {
  label: string;
  value: number;
}

// Props for the PieChart component
interface PieChartProps {
  width?: number;
  height?: number;
  startDate?: Date;
}

const testData: PieData[] = [
  { label: '--', value: 0 },
  { label: '--', value: 0 },
  { label: '--', value: 0 },
];

const colorPalette = [
  'orange', 'red', 'green', '#d62728', '#9467bd',
  '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
];

const getApproximatePercentage = (tir: number) => {
  return (tir < 1) ? "<1% " : tir + "% "
}


const PieChart: React.FC<PieChartProps> = ({ width = screenWidth / 3, height = screenWidth / 3, startDate = null  }) => {
  const [data, setData] = useState<PieData[]>(testData);

  useEffect(() => {
    const fetchData = async () => {
      const responseData = await getStats(startDate);

      const newData: PieData[] = [
        { label: 'High', value: responseData["time in range"].high },
        { label: 'Low', value: responseData["time in range"].low },
        { label: 'In Range', value: responseData["time in range"]["in-range"]}
      ];

      setData(newData);
    }

    fetchData();

  }, [startDate]);

  const styles = StyleSheet.create({
    container: {
      justifyContent: 'flex-start',
      alignItems: 'center',
      padding: 1,
      width: width,
      height: height
    },
  });
  const chartWidth = width * 0.4;
  const chartHeight = height * 0.4;
  const radius = Math.min(chartWidth, chartHeight) / 2 - 10;
  const colors = scaleOrdinal(colorPalette);

  // Generate pie slices
  const pieGenerator = pie<PieData>()
    .value((d) => d.value)
    .sort(null);

  const arcGenerator = arc<any>()
    .innerRadius(chartHeight * 0.55) // inner radius creates hollow center
    .outerRadius(radius);

  const pieData = pieGenerator(data);

  return (
    <View style={styles.container}>
      <Text style={{fontSize: 12, paddingTop: 5}}>Time in Range</Text>
      <Svg width={width * 0.6} height={height * 0.6}>
        <G x={width * 0.3} y={height * 0.3 }>
          {pieData.map((slice: PieArcDatum<PieData>, index: number) => (
            <G key={index}>
              {/* Render the pie slice */}
              <Path
                d={arcGenerator(slice) as string}
                fill={colors(index.toString()) as string}
              />
            </G>
          ))}
        </G>
      </Svg>
      <View style={{flexDirection: "row", paddingBottom: 1}}>
        <Text style={{color: "red", fontSize: 12}}>{getApproximatePercentage(data[1].value)}</Text><Text style={{color: "green", fontSize: 12}}>{ getApproximatePercentage(data[2].value) }</Text><Text style={{color: "orange", fontSize: 12}}>{ getApproximatePercentage(data[0].value) }</Text>
      </View>
    </View>
  );
};



export default PieChart;
