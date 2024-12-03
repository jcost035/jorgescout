import React, { useState, useEffect } from "react";
import { ScrollView, View, Dimensions, Text } from "react-native";
import { CartesianChart, Scatter} from 'victory-native';
import { useFont, LinearGradient, vec } from '@shopify/react-native-skia';
import { getHistory } from '@/scripts/scripts.ts';
import Animated, { useSharedValue, useAnimatedProps, interpolateColor, interpolate } from "react-native-reanimated";

import Roboto from "../assets/fonts/Roboto/Roboto-Regular.ttf";

const data = [
  { x: 1, y: null },
  { x: 2, y: null },
  { x: 3, y: null },
  { x: 4, y: null },
  { x: 5, y: null },  
  { x: 6, y: null },
  { x: 7, y: null },
  { x: 8, y: null },
  { x: 9, y: null },
  { x: 10, y: null }, 
];

export default function ScatterPlot() {
  const [points, setPoints] = useState<Array<object>>(data)  
  const font = useFont(Roboto, 16);
  
  useEffect(() => {
      const fetchData = async () => {
          try {
              const history_data = await getHistory(50);
  
              let temp_points: Array<object> = [];
              let i = 49;
              history_data.history.forEach((reading: { Value: number, Time: string }) => {temp_points.push({x: i, y:reading.Value}); i--;});
              
              setPoints(temp_points);
          }
          catch(error) {
              console.error("Error: ", error);
          }
      };
        
      fetchData();

      const interval = setInterval(fetchData, 300000);

      return () => {clearInterval(interval)};
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  return (
    <View style={{ height: 250, width:350 }}>
        <CartesianChart 
          data={points} 
          xKey="x" 
          yKeys={["y"]} 
          domain={{y: [0, 250], x:[0,51]}} 
          axisOptions={{ font }}
          padding={ 10 }
        >
          {({ points }) => {
            //👇 pass a PointsArray to the Scatter component
            let high_points = points.y.filter((point: {yValue: number}) => point.yValue >= 50);
            let low_points = points.y.filter((point: {yValue: number}) => point.yValue < 70)
            return (
              <>
                <Scatter 
                  points={high_points}
                  shape="circle"
                  style="fill"
                  color="black"
                  radius={2}
                />
                <Scatter 
                  points={low_points}
                  shape="circle"
                  style="fill"
                  color="red"
                  radius={2}
                />
              </>
            )
              
          }}
        </CartesianChart>
      </View>
  );
};


