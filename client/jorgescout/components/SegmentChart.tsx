import React, { PureComponent, useState, useEffect } from 'react'
import { Svg, G, Rect, Line, Text, TSpan } from 'react-native-svg'
import { Dimensions } from 'react-native'
import { Text as ReactText, PanResponder } from 'react-native'
import * as d3 from 'd3'
import { getDailyTimeInRange } from '@/scripts/scripts';
import { test } from 'vitest';

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
    if (tir < 70) { return colors.red }
    else if (tir < 80) {return colors.yellow }
    else if (tir < 85) { return colors.lg }
    else if (tir < 90) { return colors.g }
    else {return colors.dg}
}

export default function segmentChart() {
        const [data, setData] = useState<SegmentData[]>(testData);
        const [activeElement, setActiveElement] = useState<string | null>("");

        useEffect(() => {
            const fetchData = async () => {
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


        const updateActiveSegment = (touchX: number) => {
            let minDistance = Infinity;
            let nearestDate; 
            data.map(item => {
                const currentDistance = Math.abs(touchX - x(item.date)!);
                if (currentDistance < minDistance) {
                    minDistance = currentDistance;
                    nearestDate = item.date;
                };
            }); // Find the closest bar index
            console.log(nearestDate)
            setActiveElement(nearestDate!)
        }

        const panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: (e, gestureState) => {
                const touchX = gestureState.x0; // Get the X-coordinate of the touch
                let minDistance = Infinity;
                updateActiveSegment(touchX);
                //setHighlightedIndex(nearestIndex);
            },
            onPanResponderMove: (e, gestureState) => {
                const touchX = gestureState.moveX; // Get the X-coordinate of the touch
                updateActiveSegment(touchX);
            },
            onPanResponderRelease: () => {
                setActiveElement("");
            }
        });

        return (
            <Svg width={screenWidth} height={sideLength} {...panResponder.panHandlers}>
                {/* <ReactText style={{alignSelf: "center", fontSize: 20}}>{data.length} day times in range </ReactText> */}

                <G key={11111} y={graphHeight}>
                    {data.map((item, index) => (
                        <Rect
                            key={index}
                            x={x(item.date)! - (barWidth / 2)}
                            y={item.date == activeElement ? -75 : -60}
                            rx={2.5}
                            width={barWidth}
                            height={item.date == activeElement ? 30 : 15}
                            fill={activeElement == "" ? item.color : item.date == activeElement ? item.color : "gray"}
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
                            <Text
                                x={x(data.find((item) => activeElement === item.date)!.date)! - 30}
                                y={-90}
                                fill="white"
                            >
                                <TSpan>Date: {data.find((item) => activeElement === item.date)?.date}</TSpan>
                                <TSpan x={x(data.find((item) => activeElement === item.date)!.date)! - 30} dy={15}>TIR: {data.find((item) => activeElement === item.date)?.tir}%</TSpan>
                            </Text>
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
                        <Text
                            key={x(tick)}
                            x={x(tick)}
                            y={0}
                            fontSize={15}
                            textAnchor="middle"
                            fill="black"
                        >
                            {tick}
                        </Text>
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