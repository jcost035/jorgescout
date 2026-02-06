import React, { PureComponent, useState, useEffect, useRef } from 'react'
import { Svg, G, Rect, Line, Text as SvgText, TSpan } from 'react-native-svg'
import { Dimensions, View } from 'react-native'
import { Text, PanResponder } from 'react-native'
import * as d3 from 'd3'
import { getDailyTimeInRange } from '@/scripts/scripts';
import { TIR_CRITICAL_LOW, TIR_LOW, TIR_FAIR, TIR_GOOD, TIR_COLOR_MAP } from '@/constants/BloodSugarThresholds';
import { test } from 'vitest';
import * as Haptics from 'expo-haptics';

const screenWidth = Dimensions.get('screen').width;
const sideLength = screenWidth / 3;

const GRAPH_MARGIN = 5;

interface SegmentData {
    tir: number,
    day: string,
    color: string,
    date: string
}

const colors = {
    red: "#FF5C5C",
    yellow: "orange",
    lyg: "#99FF99",
    yg: "#66FF66",
    lg: "#33CC33",
    g: "#009900",
    dg: "#006600",
    axis: '#E4E4E4',
    bars: '#15AD13'
}

const getSegmentColor = (tir: number) => {
    if (tir < TIR_CRITICAL_LOW) { return colors.red }
    else if (tir < TIR_LOW) {return colors.yellow }
    else if (tir < TIR_FAIR) { return colors.lg }
    else if (tir < TIR_GOOD) { return colors.g }
    else {return colors.dg}
}

interface SegmentChartProps {
    scrollLock: () => void,
    scrollRelease: () => void
}

export default function segmentChart(props: SegmentChartProps) {
        const [data, setData] = useState<SegmentData[]>(testData);
        const [activeElement, setActiveElement] = useState<string | null>("");

        useEffect(() => {
            const fetchData = async () => {
                try {
                    const response = await getDailyTimeInRange();

                    const tirData:SegmentData[] = [];

                    response.map((item: { timeInRange: number, date: string }, index: number) => {
                        const date = new Date(item.date);
                        const dateString = date.getMonth() + 1 + "/" + date.getDate();

                        tirData.push({ 
                            tir: item.timeInRange, 
                            day: index.toString(), 
                            color: getSegmentColor(item.timeInRange) ,
                            date: dateString
                        });
                    });
                    
                    
                    setData(tirData.reverse());
                }
                catch(error) {
                    console.error(`Error: ${error}`)
                }
            }
            
            fetchData();
        }, [])
        
        
        const graphHeight = sideLength - 2 * GRAPH_MARGIN;
        const graphWidth =screenWidth - 2 * GRAPH_MARGIN;

        const barSpacing = data.length < 30 ? 5 : 2;

        const barWidth = graphWidth / data.length - barSpacing;

        const xDomain = data.map(item => item.date);
        const xRange = [0, graphWidth];
        const x = d3.scalePoint().domain(xDomain).range(xRange).padding(1);

        const xTicks: string[] = [];
        const xTickSpacing = data.length <= 30 ? 4 : 10;
        const xTickStart = data.length <= 30 ? 0 : 5;
        data.map((item, index) => {
            if (index % xTickSpacing == xTickStart) {xTicks.push(item.date)}
            else if (index == (data.length - 1) && index % xTickSpacing == (xTickStart - 1)) {xTicks.push(item.date)}
        });

        const yDomain = [0, 50];
        const yRange = [0, graphHeight];
        const y = d3.scaleLinear().domain(yDomain).range(yRange);

        let nearestDate: string = ""; 

        const updateActiveSegment = (touchX: number) => {
            let minDistance = Infinity;
            data.map(item => {
                const currentDistance = Math.abs(touchX - x(item.date)!);
                if (currentDistance < minDistance) {
                    minDistance = currentDistance;
                    nearestDate = item.date;
                };
            });

            if (nearestDate != activeElement) {Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);};
            setActiveElement(nearestDate!)
        };

        const timeoutRef = useRef<number | null>(null);
        const hasActivated = useRef(false);
        

        const panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: (e, gestureState) => {
                const touchX = gestureState.x0; 

                hasActivated.current = false;

                timeoutRef.current = setTimeout(() => { //stfu linter
                    hasActivated.current = true;
                    let minDistance = Infinity;
                    props.scrollLock();
                    updateActiveSegment(touchX);
                  }, 500);

                
            },
            onPanResponderMove: (e, gestureState) => {
                const touchX = gestureState.moveX;
                const touchY = gestureState.moveY;

                if (Math.abs(touchX) > 10 || Math.abs(touchY) > 10) {
                    clearTimeout(timeoutRef.current);
                  }
          
                  if (hasActivated.current) {
                    updateActiveSegment(touchX);
                  }
            },
            onPanResponderRelease: () => {
                props.scrollRelease();
                setActiveElement("");
                if (timeoutRef.current !== null) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                  }
            }
        });

        return (
            <Svg width={screenWidth} height={sideLength} {...panResponder.panHandlers}>

                <G key={11111} y={graphHeight}>
                    <SvgText x={100} y ={-100} fill={"black"} fontSize={20}>{data.length} day times in range </SvgText>

                    {data.map((item, index) => (
                        <Rect
                            key={index}
                            x={x(item.date)! - (barWidth / 2)}
                            y={item.date == activeElement ? -75 : -60}
                            rx={2.5}
                            width={barWidth}
                            height={item.date == activeElement ? 30 : 15}
                            fill={item.color}
                            opacity={activeElement == "" || item.date == activeElement ? 1 : 0.5}
                        />
                    ))}

                    {
                     activeElement &&
                        (<>
                            <Rect
                                x={x(data.find((item) => activeElement === item.date)!.date)! - 35}
                                y={-105}
                                width={75}
                                height={40}
                                fill={getSegmentColor(data.find((item) => activeElement === item.date)!.tir)}
                                // stroke={getSegmentColor(data.find((item) => activeElement === item.date)!.tir)}
                                strokeWidth={3}
                                rx={3}
                            />
                            <SvgText
                                x={x(data.find((item) => activeElement === item.date)!.date)! - 30}
                                y={-90}
                                fill="white"
                            >
                                <TSpan>{data.find((item) => activeElement === item.date)?.date}</TSpan>
                                <TSpan x={x(data.find((item) => activeElement === item.date)!.date)! - 30} dy={15}>TIR: {data.find((item) => activeElement === item.date)?.tir}%</TSpan>
                            </SvgText>
                        </>)   
                    }
                    
                    <Line
                        x1="10"
                        y1="-25"
                        x2={screenWidth-10}
                        y2="-25"
                        stroke="black"
                        strokeWidth="0.5"
                    />

                    
                    {xTicks.map((tick) => (
                        <Line
                            key={x(tick)}
                            x1={x(tick)}
                            x2={x(tick)}
                            y1={-20}
                            y2={-30}
                            stroke={"black"}
                        />
                    ))}

                    {xTicks.map((tick) => (
                        <SvgText
                            key={x(tick)}
                            x={x(tick)}
                            y={0}
                            fontSize={15}
                            textAnchor="middle"
                            fill="black"
                        >
                            {tick}
                        </SvgText>
                    ))}

                </G>
            </Svg>
        )
        
    }

const n = 10;
const testData = [{ tir: 5, day: "0" , color: "#15AD13", date: "10/31" }];

for (let i = 1; i < n; i++) {
    testData.push(
        { tir: 5, day: i.toString(), color: "#15AD13", date: "11/" + (i + 1).toString() }
    );
}

testData.push({tir: 5, day: "10", color: "yellow", date: "11/11" });

for (let i = 11; i < 30; i++) {
    testData.push(
    { tir: 5, day: i.toString(), color: "#15AD13", date: "11/" + (i + 1).toString() }
    );
}