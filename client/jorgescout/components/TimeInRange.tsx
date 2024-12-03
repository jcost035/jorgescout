import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import TimeInRangeChart from './TimeInRangeChart';
import { Pie, PolarChart } from "victory-native";

const screenWidth = Dimensions.get('screen').width;

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

const sideLength = Dimensions.get('window').width / 3

export default function TimeInRange() {
    
    return (
        // <View style={{height: sideLength, width:sideLength, justifyContent: "center", alignItems: "center"}}>
            <PolarChart
            data={data} // 👈 specify your data
            labelKey="label" // 👈 specify data key for labels
            valueKey="value" // 👈 specify data key for values
            colorKey="color" // 👈 specify data key for color
            >
                <Pie.Chart innerRadius="55%" />
            </PolarChart>
        // </View>
      );
}