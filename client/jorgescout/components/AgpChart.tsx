import React, {useState, useEffect} from "react";
import { View, StyleSheet, Dimensions, PanResponder } from "react-native";
import Svg, { Circle, G, Line, Text as SvgText, Rect, TSpan, Path } from "react-native-svg";
import * as d3 from "d3";
import { getAgpData, getHistory } from '@/scripts/scripts.ts';
import RangePicker from "./RangePicker";


// Define the data structure
interface DataPoint {
  x: Date;
  y: number;
  yLow: number;
  yHigh: number
}

const DEFAULT_YAXIS = 250;
const FIVE_MINUTES = 5*60000;
const FOUR_HOURS = 4 * 60 * 60 * 1000;
const FOUR_HOURS_MINS = 240;

type ScatterPlotProps = {
    graphHeight?: number; // Optional prop
  };

export default function AgpChart({graphHeight = 250}) {
    
    const [midLineData, setMidLineData] = useState<DataPoint[]>([]);
    const [scatterPlotRange, setScatterPlotRange] = useState(FOUR_HOURS_MINS);

    useEffect(() => {
        const fetchData = async () => {
            const response = await getAgpData();
            const midLineDataSet:DataPoint[] = [];
            
            //const firstTime = new Date(response.history[response.history.length - 1].TimeString);
            // const startTime = new Date(new Date().getTime() - FOUR_HOURS);
            //history_data.push({x:startTime, y: -1000});

            response.map((item:any) => midLineDataSet.push({
                x: new Date(item["time"]), 
                y: item["quartiles"][1], 
                yLow: item["quartiles"][0], 
                yHigh: item["quartiles"][2]
            }));
            
            // const lastTime = new Date(response.history[0].TimeString);
            // const endTime = new Date(lastTime.getTime() + FIVE_MINUTES);
            //history_data.push({x:endTime, y: -1000});

            setMidLineData(midLineDataSet);
        }

        fetchData();
        
        const interval = setInterval(fetchData, FIVE_MINUTES);

        return () => {clearInterval(interval)};

    }, [scatterPlotRange]);

    

    // Dimensions and margins
    const width = 375;
    const height = graphHeight;
    const margin = { top: 5, right: 25, bottom: 20, left: 10 };

    // Chart dimensions
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Define scales
    const xExtent = d3.extent(midLineData, (d) => d.x) as [Date, Date];
    const xDomain: [Date, Date] = [xExtent[0], xExtent[1]];

    const xScale = d3
        .scaleTime()
        .domain(xDomain)
        .range([0, chartWidth]);

    const yExtent = d3.extent(midLineData, (d) => d.y) as [number, number];
    const yAxisHeight = yExtent[1] > 250 ? yExtent[1] : DEFAULT_YAXIS;
    const yScale = d3
        .scaleLinear()
        .domain([0, yAxisHeight])
        .range([chartHeight, 0]);

    // Generate ticks
    const [tickValues, setTickValues] = useState<Date[]>([]);
    useEffect(() => {
        const spacing = 4
        setTickValues(d3.timeHour.every(spacing)!.range(xDomain[0], xDomain[1]));
    }, [midLineData])

    const RANGE_FLOOR = 70
    const RANGE_CEILING = 180

    const medianCurve = d3.line<DataPoint>()
    .x(d => xScale(new Date(d.x)))
    .y(d => yScale(d.y))
    .curve(d3.curveBasis)(midLineData);

    const lowerQuartileCurve = d3.line<DataPoint>()
    .x(d => xScale(new Date(d.x)))
    .y(d => yScale(d.yLow))
    .curve(d3.curveBasis)(midLineData);

    const upperQuartileCurve = d3.line<DataPoint>()
    .x(d => xScale(new Date(d.x)))
    .y(d => yScale(d.yHigh))
    .curve(d3.curveBasis)(midLineData);

    const area = d3.area<DataPoint>()
    .x(d => xScale(d.x))
    .y0(d => yScale(d.yLow))
    .y1(d => yScale(d.yHigh));

    const [activePoint, setActivePoint] = useState<Date | null>(null);

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (e, gestureState) => {
            const touchX = gestureState.x0 - margin.left; 

            
            let shortestDistance = Infinity;
            let closestPoint = null;
            midLineData.map((item) => {
                if (Math.abs(xScale(item.x) - touchX) < shortestDistance) {
                    shortestDistance = Math.abs(xScale(item.x) - touchX);
                    closestPoint = item.x;
                }
            });
            setActivePoint(closestPoint);
        },
        onPanResponderMove: (e, gestureState) => {
            const touchX = gestureState.moveX - margin.left;

            let shortestDistance = Infinity;
            let closestPoint = null;
            midLineData.map((item) => {
                if (Math.abs(xScale(item.x) - touchX) < shortestDistance) {
                    shortestDistance = Math.abs(xScale(item.x) - touchX);
                    closestPoint = item.x;
                }
            });
            setActivePoint(closestPoint);
        },
        onPanResponderRelease: () => {
            setActivePoint(null);
        }
    });

    return (
        <View style={{}}>

            <Svg width={width} height={height} {...panResponder.panHandlers}>
                {/* Chart group */}
                <G translateX={margin.left} translateY={margin.top}>
                    {/* Median, upper/lower quartiles and shading between them */}
                    <Path d={medianCurve!} strokeWidth="3" stroke="black" fill="none"/>
                    <Path d={upperQuartileCurve!} strokeWidth="2" stroke="blue" fill="none"/>
                    <Path d={lowerQuartileCurve!} strokeWidth="2" stroke="blue" fill="none"/>
                    <Path d={area(midLineData)!} fill="steelblue" opacity={0.5} />
                    
                    {/* X-Axis */}
                    <Line
                        x1={0}
                        y1={chartHeight}
                        x2={chartWidth}
                        y2={chartHeight}
                        stroke="#e3e3e3"
                    />
                    <Line x1={0} y1={yScale(yAxisHeight)} x2={chartWidth} y2={yScale(yAxisHeight)} stroke="#e3e3e3" />

                    {tickValues.map((tick, index) => {
                        const x = xScale(tick);
                        return (
                        <G key={index} translateX={x} translateY={chartHeight}>
                            {/* <Line x1={0} y1={0} x2={0} y2={-1 * chartHeight} stroke="#e3e3e3" /> */}
                            <SvgText
                            x={0}
                            y={15}
                            fontSize={10}
                            textAnchor="middle"
                            fill="black"
                            >
                            {d3.timeFormat("%-I %p")(tick)}
                            </SvgText>
                        </G>
                        );
                    })}

                    {/* Floor & ceiling */}
                    <Line x1={0} y1={yScale(RANGE_CEILING)} x2={chartWidth} y2={yScale(RANGE_CEILING)} stroke="orange"/>
                    <Line x1={0} y1={yScale(RANGE_FLOOR)} x2={chartWidth} y2={yScale(RANGE_FLOOR)} stroke="red"/>

                    {/* Y-Axis */}
                    <Line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#e3e3e3" />
                    <Line x1={chartWidth} y1={0} x2={chartWidth} y2={chartHeight} stroke="#e3e3e3" />
                    {yScale.ticks(3).map((tick, index) => {
                        const y = yScale(tick);
                        return (
                        <G key={index} translateX={-5} translateY={y}>
                            <Line x1={5} y1={0} x2={chartWidth + 5} y2={0} stroke="#e3e3e3" />
                            <SvgText
                            x={chartWidth + 10}
                            y={4}
                            fontSize={10}
                            textAnchor="start"
                            fill="black"
                            >
                            {tick}
                            </SvgText>
                        </G>
                        );
                    })}

                    {/* Point highlighting on touch */}
                    <Line x1={activePoint != null ? xScale(activePoint!) : 0} y1={0} x2={activePoint != null ? xScale(activePoint!) : 0} y2={chartHeight} stroke="#e3e3e3" />
                    <Rect 
                        x={activePoint != null ? xScale(midLineData.find((item) => activePoint === item.x)!.x) : -1000} 
                        y={-20}
                        height={50} 
                        width={100} 
                        fill={activePoint != null ? "black" : "none"}
                    />
                    <SvgText
                        x={activePoint != null ? xScale(midLineData.find((item) => activePoint === item.x)!.x) : 0}
                        y={5}
                        fill="white"
                        fontSize={20}
                    >
                        <TSpan>{midLineData.find((item) => activePoint === item.x)?.y.toString()}</TSpan>
                        {/* <TSpan x={x(data.find((item) => activeElement === item.date)!.date)! - 30} dy={15}>TIR: {data.find((item) => activeElement === item.date)?.tir}%</TSpan> */}
                    </SvgText>

                    
                </G>
            </Svg>

            <View style={styles.horizontalSeparator}></View>

        </View>
    );
};




const styles = StyleSheet.create(
    {
        horizontalSeparator: {
            backgroundColor: "#dfdfdf",
            height: 0.5,
            width: Dimensions.get('screen').width,
        },
        verticalSeparator: {
            backgroundColor: "#dfdfdf",
            width: 1,
            height: '100%',
        }
    }
)
