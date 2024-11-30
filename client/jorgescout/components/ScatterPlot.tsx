import React, { useState } from "react";
import { ScrollView, View, Dimensions, Text } from "react-native";
import { CartesianChart, Scatter } from 'victory-native';
import { useFont } from '@shopify/react-native-skia';

import Roboto from "../assets/fonts/Roboto/Roboto-Regular.ttf";

//type PointsArray = {x: number; y: number}[];

// const [data, setData] = useState(() =>
//   Array.from({ length: 50 }, (_, i) => ({
//     x: i + 1,
//     y: Math.random() * 100,
//   }))
// );

//const data = [{x: 50, y: 1}, {x: 50, y: 2}, {x: 50, y: 3}]


const ScatterPlot = (): JSX.Element => {
  const font = useFont(Roboto, 16);
  const data = [
    { x: 1, y: 120 },
    { x: 2, y: 122 },
    { x: 3, y: 128 },
    { x: 4, y: 132 },
    { x: 5, y: 145 },  
    { x: 6, y: 154 },
    { x: 7, y: 162 },
    { x: 8, y: 169 },
    { x: 9, y: 175 },
    { x: 10, y: 187 }, 
  ];
  return (
    <View style={{ height: 250, width:350 }}>
       
        <CartesianChart 
          data={data} 
          xKey="x" 
          yKeys={["y"]} 
          domain={{y: [0, 300], x:[0,11]}} 
          axisOptions={{ font }}
          padding={ 20 }
        >
          {({ points }) => (
            //👇 pass a PointsArray to the Scatter component
            <Scatter
              points={points.y}
              shape="circle"
              radius={5}
              style="fill"
              color="red"
            />
          )}
        </CartesianChart>
      </View>
  );
};

export default ScatterPlot;
