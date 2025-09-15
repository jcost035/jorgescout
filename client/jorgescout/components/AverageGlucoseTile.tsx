import React, { useEffect, useState } from 'react';
import { View, Text } from './Themed';
import { getStats } from '@/scripts/scripts.ts';
import {Dimensions, StyleSheet } from 'react-native';

export default function AverageGlucoseTile({startDate=null, stats=null}:{startDate:Date|null, stats:any}) {

    const screenWidth = Dimensions.get('screen').width;
    const sideLength = screenWidth / 3;

    const [avgGlucose, setAvgGlucose] = useState<string>("--");

    useEffect(() => {
        if (stats != null)
        {
            setAvgGlucose(stats["average"]["average glucose"]);
        }
    }, [stats]);


    return (
        <View style={{width: sideLength, height: sideLength, justifyContent: "center", alignItems: "center"}}>
            <Text>Average{"\n"}Glucose</Text>
            <Text style={{fontSize: 40}}>{avgGlucose}</Text>
        </View>
    );
}