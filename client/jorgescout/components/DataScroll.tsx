import React, {useEffect, useState} from 'react';
import { StyleSheet, Dimensions, Switch } from 'react-native';
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
import { getStats } from '@/scripts/scripts.ts';
import Sortable from "react-native-sortables";
import Animated, { useAnimatedRef } from 'react-native-reanimated';

export default function DataScroll() {
    const scrollableRef = useAnimatedRef<Animated.ScrollView>();
    
    const windowWidth = Dimensions.get('screen').width;
    const sideLength = windowWidth / 3;
    
    const [scrollEnabled, setScrollEnabled] = useState(true);

    var tenYearsAgo = new Date(new Date().getTime() - (60000 * 60 * 24 * 365 * 10));
    const [startDate, setStartDate] = useState(tenYearsAgo);

    const setRange = (range: string) => {
        const rangeStart = new Date(new Date().getTime() - (60000 * 60 * 24 * Number(range)))
        setStartDate(rangeStart);
    }

    
    const keep = console.log.bind(console);

    const isSpam = (args: unknown[]) => {
    try {
        const s = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
        return s.startsWith('??? ') && /{.*"x":\s*[\d.-]+.*"y":\s*[\d.-]+.*}/.test(s);
    } catch (e) {
        return false;
    }
    };

    console.log = (...args: any[]) => {
    if (isSpam(args)) return;   
    keep(...args);
    };

    const [stats, setStats] = useState();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const stats = await getStats(startDate);
                setStats(stats);
            }
            catch(error) {
                console.error(`Error: ${error}`);
            }
        }

        fetchData();
    }, [startDate]);

    const [moveableTiles, setMoveableTiles] = useState(false);

    return (
        <GestureHandlerRootView>
            <Animated.ScrollView scrollEnabled={scrollEnabled} ref={scrollableRef}>
                <View style={{flexDirection: "row", justifyContent: "space-between", paddingRight: 10}}>
                    <Switch value={moveableTiles} onValueChange={setMoveableTiles} style={{paddingTop: 3}} />
                    <RangePicker setGlobalRange={setRange} ranges={['90','30','1']} units='d' defaultRange='30' />
                </View>
                <View style={{ width: windowWidth, flexDirection: "column"}}>
                    <View style={styles.horizontalSeparator} />
                    <Sortable.Flex scrollableRef={scrollableRef} sortEnabled={moveableTiles} strategy='insert'>
                        <A1cTile startDate={startDate} stats={stats}/>
                        <TimeInRangeChart startDate={startDate} stats={stats}/>
                        <AverageGlucoseTile startDate={startDate} stats={stats}/>
                        <View style={{ flexDirection: "row"}}>
                            <SegmentChart scrollLock={() => {setScrollEnabled(false)}} scrollRelease={() => { setScrollEnabled(true)}}/>
                        </View>
                        <View style={{ flexDirection: "column", alignItems: "center"}}>
                            <Text style={{fontSize: 18, padding: 2}}>Ambulatory Glucose Profile</Text>
                            <AgpChart graphHeight={sideLength}/>
                        </View>
                        <StandardDeviationTile startDate={startDate} stats={stats}/>
                        <ConfidenceIntervalTile startDate={startDate} stats={stats}/>
                        <CoefficientofVarianceTile startDate={startDate} stats={stats}/>
                    </Sortable.Flex>
                    <View style={{ flexDirection: "row"}}>
                        <View style={styles.verticalSeparator} />
                        <View style={styles.verticalSeparator} />
                    </View>
                    <View style={styles.horizontalSeparator} />
                </View>
            </Animated.ScrollView>
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