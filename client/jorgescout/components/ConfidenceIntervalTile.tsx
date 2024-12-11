import React, { useEffect, useState } from 'react';
import { View, Text } from './Themed';
import { getStats } from '@/scripts/scripts.ts';
import {Dimensions, StyleSheet } from 'react-native';

const screenWidth = Dimensions.get('screen').width
const sideLength = screenWidth / 3

export default function ConfidenceIntervalTile() {
    const [data, setData] = useState<string[]>(["--", "--"]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await getStats();

            const ciFloor = response["average"]["average glucose"] - response["standard deviation"];
            const ciCeiling = response["average"]["average glucose"] + response["standard deviation"];
            setData([ciFloor.toString(), ciCeiling.toString()]);
        }

        fetchData();

    }, [])

    return (
        <View style={{width: sideLength, height: sideLength,  alignItems: "center"}}>
            <Text style={{textAlign: "center", marginTop: 20}}>Confidence{"\n"} Interval</Text>
            <Text style={{fontSize: 35}}>{data[0]}<Text style={{color:"#d3d3d3"}}>|</Text>{data[1]}</Text>
        </View>
    )
    

}
