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


const PieChart: React.FC<PieChartProps> = ({ width = screenWidth / 3 - 40, height = screenWidth / 3 - 40, startDate = null  }) => {
  const [data, setData] = useState<PieData[]>(testData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseData = await getStats(startDate);
        console.log(startDate)
        const newData: PieData[] = [
          { label: 'High', value: responseData["time in range"].high },
          { label: 'Low', value: responseData["time in range"].low },
          { label: 'In Range', value: responseData["time in range"]["in-range"]}
        ];

        setData(newData);
      }
      catch(error) {
        console.error(`Error: ${error}`)
      }
    }

    fetchData();

  }, [startDate]);

  const radius = Math.min(width, height) / 2 - 10;
  const colors = scaleOrdinal(colorPalette);

  // Generate pie slices
  const pieGenerator = pie<PieData>()
    .value((d) => d.value)
    .sort(null);

  const arcGenerator = arc<any>()
    .innerRadius(20) // inner radius creates hollow center
    .outerRadius(radius);

  const pieData = pieGenerator(data);

  return (
    <View style={styles.container}>
      <Text style={{fontSize: 15, paddingTop: 5}}>Time in Range</Text>
      <Svg width={width} height={height}>
        <G x={width / 2} y={height / 2}>
          {pieData.map((slice: PieArcDatum<PieData>, index: number) => (
            <G key={index}>
              {/* Render the pie slice */}
              <Path
                d={arcGenerator(slice) as string}
                fill={colors(index.toString()) as string}
              />
              {/* Add text label */}
              {/* <SvgText
                x={arcGenerator.centroid(slice)[0]}
                y={(arcGenerator.centroid(slice)[1])}
                fontSize={8}
                fill="black"
                textAnchor="middle"
              >
                {slice.data.value} %
              </SvgText> */}
            </G>
          ))}
        </G>
      </Svg>
      <View style={{flexDirection: "row", paddingBottom: 1}}>
        <Text style={{color: "red"}}>{getApproximatePercentage(data[1].value)}</Text><Text style={{color: "green"}}>{ getApproximatePercentage(data[2].value) }</Text><Text style={{color: "orange"}}>{ getApproximatePercentage(data[0].value) }</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 1,
    width: sideLength,
    height: sideLength
  },
});

export default PieChart;
