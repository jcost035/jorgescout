import React from 'react';
import { View, Dimensions } from 'react-native';
import { Pie, PolarChart } from "victory-native";

const screenWidth = Dimensions.get('screen').width;

export default function TimeInRangeChart() {
    
    const data = [
        {
            value: 86,
            color: "green",
            label: `in range`,
        },
        {
            value: 9,
            color: "yellow",
            label: `in range`,
        },
        {
            value: 5,
            color: "red",
            label: `in range`,
        },
    ]

    return (
      <>
        <PolarChart
          data={data} // 👈 specify your data
          labelKey="label" // 👈 specify data key for labels
          valueKey="value" // 👈 specify data key for values
          colorKey="color" // 👈 specify data key for color
          >
          <Pie.Chart innerRadius="55%" />
        </PolarChart>
      </>
      );
}