import React, { useEffect, useState } from 'react';
import { View, Text } from './Themed';
import { getStats } from '@/scripts/scripts.ts';
import {Dimensions, StyleSheet } from 'react-native';

interface RangePickerProps {
    setGlobalRange: (range: string) => void;
    ranges: string[];
    units: string;
  }

const RangePicker: React.FC<RangePickerProps> = ({ setGlobalRange, ranges, units }) => {

    //const ranges = ['24', '12', '4'];
    const [currentRange, setCurrentRange] = useState(ranges[ranges.length - 1]);

    useEffect(() => {
        setGlobalRange(currentRange);
    }, [currentRange]);

    return (
        <View style={styles.container}>
            {ranges.map((range) => (
                <Text 
                    key={range}
                    style={[styles.range, currentRange == range ? styles.selected : null]} 
                    onPress={() => setCurrentRange(range)} 
                >
                    <Text>{range}{units}</Text>
                </Text>
            ))}
        </View>
    )

    
}

export default RangePicker;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row", 
        gap: 5, 
        backgroundColor: "#D3D3D3", 
        borderRadius: 5, 
        alignSelf: 'flex-start',
        paddingHorizontal: 5,
        paddingVertical: 2,
        marginVertical: 5
    },
    range: {
        paddingVertical: 3,
        width: 30,
        textAlign: "center"
    },
    selected: {
        backgroundColor: "white",
        borderRadius: 5, 
        justifyContent:"center"
    }
})