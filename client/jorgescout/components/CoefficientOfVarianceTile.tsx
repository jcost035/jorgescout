import React, { useEffect, useState } from 'react';
import { View, Text } from './Themed';
import { getStats } from '@/scripts/scripts.ts';
import {Dimensions, StyleSheet } from 'react-native';

export default function CoefficientofVarianceTile({startDate=null, stats=null}:{startDate: Date|null, stats:any}) {

    const screenWidth = Dimensions.get('screen').width;
    const sideLength = screenWidth / 3;

    const [varianceCoefficient, setVarianceCoefficient] = useState<string>("--");

    useEffect(() => {
        if(stats != null)
        {
            const coefficient = Math.round((stats["standard deviation"] / stats["average"]["average glucose"]) * 100)
    
            setVarianceCoefficient(coefficient.toString());
        }
    }, [stats]);


    return (
        <View style={{width: sideLength, height: sideLength, justifyContent: "center", alignItems: "center"}}>
            <Text>CV</Text>
            <Text style={{fontSize: 40}}>{varianceCoefficient}%</Text>
        </View>
    );
}