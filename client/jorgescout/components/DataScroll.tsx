import React, {useEffect, useState} from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { getReading } from '@/scripts/scripts.ts';
import { Text, View } from './Themed';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import A1cTile from '@/components/A1cTile';
import TimeInRangeChart from '@/components/TimeInRangeChart';
import SegmentChart from '@/components/SegmentChart';
import AverageGlucoseTile from './AverageGlucoseTile';
import StandardDeviationTile from './StandardDeviationTile';
import CoefficientofVarianceTile from './CoefficientOfVarianceTile';
import ConfidenceIntervalTile from './ConfidenceIntervalTile';
import RangePicker from './RangePicker';
import AgpChart from './AgpChart'


export default function DataScroll() {
    
    
    const windowWidth = Dimensions.get('screen').width;
    const sideLength = windowWidth / 3;
    
    const [scrollEnabled, setScrollEnabled] = useState(true);

    var tenYearsAgo = new Date(new Date().getTime() - (60000 * 60 * 24 * 365 * 10));
    const [startDate, setStartDate] = useState(tenYearsAgo);

    const setRange = (range: string) => {
        const rangeStart = new Date(new Date().getTime() - (60000 * 60 * 24 * Number(range)))
        setStartDate(rangeStart);
    }

    return (
        <GestureHandlerRootView>
            <ScrollView scrollEnabled={scrollEnabled}>
                <View style={{flexDirection: "row", justifyContent: "flex-end", paddingRight: 10}}>
                    <RangePicker setGlobalRange={setRange} ranges={['90','30','1']} units='d' />
                </View>
                <View style={{ width: windowWidth, flexDirection: "column"}}>
                    <View style={styles.horizontalSeparator} />
                    <View style={{ flexDirection: "row"}}>
                        <A1cTile/>
                        <View style={styles.verticalSeparator} />
                        <TimeInRangeChart/>
                        <View style={styles.verticalSeparator} />
                        <AverageGlucoseTile/>
                    </View>
                    <View style={styles.horizontalSeparator} />
                    <View style={{ flexDirection: "row"}}>
                        <SegmentChart scrollLock={() => {setScrollEnabled(false)}} scrollRelease={() => { setScrollEnabled(true)}}/>
                    </View>
                    <View style={styles.horizontalSeparator} />
                    <View style={{ flexDirection: "row"}}>
                        <AgpChart graphHeight={sideLength}/>
                    </View>
                    <View style={styles.horizontalSeparator} />
                    <View style={{ flexDirection: "row"}}>
                        <StandardDeviationTile/>
                        <View style={styles.verticalSeparator} />
                        <ConfidenceIntervalTile/>
                        <View style={styles.verticalSeparator} />
                        <CoefficientofVarianceTile/>
                    </View>
                    <View style={styles.horizontalSeparator} />
                    
                </View>
            </ScrollView>
        </GestureHandlerRootView>
    );
    
}

const styles = StyleSheet.create(
    {
        horizontalSeparator: {
            backgroundColor: "#dfdfdf",
            height: 1,
            width: '100%',
        },
        verticalSeparator: {
            backgroundColor: "#dfdfdf",
            width: 1,
            height: '100%',
        }
    }
)