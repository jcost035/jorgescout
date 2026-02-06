import React, {useState, useEffect} from "react";
import { View, StyleSheet, Dimensions, PanResponder } from "react-native";
import Svg, { Circle, G, Line, Text as SvgText, Rect, TSpan, Path } from "react-native-svg";
import * as d3 from "d3";
import { getAgpData, getHistory } from '@/scripts/scripts.ts';
import { RANGE_FLOOR, RANGE_CEILING, TARGET_GLUCOSE } from '@/constants/BloodSugarThresholds';
import RangePicker from "./RangePicker";


// Define the data structure
interface DataPoint {
  x: Date;
  y: number;
  yLow: number;
  yHigh: number;
  yVeryLow: number;
  yVeryHigh: number;
  yReallySmall: number;
  yReallyBig: number;
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
            try {
                const response = await getAgpData();
                const midLineDataSet:DataPoint[] = [];
        
                let i = 0
                response.map((item:any) => {
                    if(i % 4 == 0) {
                        midLineDataSet.push({
                            x: new Date(item["time"]), 
                            y: item["quartiles"][1], 
                            yLow: item["quartiles"][0], 
                            yHigh: item["quartiles"][2],
                            yVeryLow: item["outliers"][1],
                            yVeryHigh: item["outliers"][17],
                            yReallySmall: item["outliers"][0],
                            yReallyBig: item["outliers"][18]
                        })
                    };
                    i++;
                
                });

                setMidLineData(midLineDataSet);
            }
            catch(error) {
                console.error(`Error: ${error}`)
            }
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
    const yAxisHeight = (yExtent[1] > 250 ? yExtent[1] : DEFAULT_YAXIS);
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

    // Blood sugar range constants imported from BloodSugarThresholds

    const medianCurve = d3.line<DataPoint>()
        .x(d => xScale(new Date(d.x)))
        .y(d => yScale(d.y))
        .curve(d3.curveBasis)(midLineData);

    const quartileArea = d3.area<DataPoint>()
        .x(d => xScale(d.x))
        .y0(d => yScale(d.yLow))
        .y1(d => yScale(d.yHigh));

    const outlierArea = d3.area<DataPoint>()
        .x(d => xScale(d.x))
        .y0(d => yScale(d.yVeryLow))
        .y1(d => yScale(d.yVeryHigh));

    const reallyOutlierArea = d3.area<DataPoint>()
        .x(d => xScale(d.x))
        .y0(d => yScale(d.yReallySmall))
        .y1(d => yScale(d.yReallyBig))

    return (
        <View style={{}}>

            <Svg width={width} height={chartHeight} >
                {/* Chart group */}
                <G translateX={margin.left} translateY={margin.top}>
                    {/* Median, upper/lower quartiles and shading between them */}
                    <Path d={reallyOutlierArea(midLineData)!} fill="steelblue" opacity={0.1} />
                    <Path d={outlierArea(midLineData)!} fill="steelblue" opacity={0.2} />
                    <Path d={quartileArea(midLineData)!} fill="steelblue" opacity={0.5} />
                    <Path d={medianCurve!} strokeWidth="3" stroke="black" fill="none"/>
          
                    
                    {/* X-Axis */}
                    <Line
                        x1={0}
                        y1={chartHeight -25}
                        x2={chartWidth}
                        y2={chartHeight -25}
                        stroke="#e3e3e3"
                    />
                    {/* <Line x1={0} y1={yScale(yAxisHeight)} x2={chartWidth} y2={yScale(yAxisHeight)} stroke="#e3e3e3" /> */}

                    {tickValues.map((tick, index) => {
                        const x = xScale(tick);
                        return (
                        <G key={index} translateX={x} translateY={chartHeight}>
                            <Line x1={0} y1={-25} x2={0} y2={-20} stroke="#e3e3e3" />
                            <SvgText
                            x={0}
                            y={-10}
                            fontSize={10}
                            textAnchor="middle"
                            fill="black"
                            >
                            {d3.timeFormat("%-I %p")(tick)}
                            </SvgText>
                        </G>
                        );
                    })}


                    {/* Y-Axis */}
                    <Line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#e3e3e3" />
                    <Line x1={chartWidth} y1={0} x2={chartWidth} y2={chartHeight} stroke="#e3e3e3" />
                    
                    {/* Floor & ceiling */}
                    <Line x1={0} y1={yScale(RANGE_CEILING)} x2={chartWidth} y2={yScale(RANGE_CEILING)} stroke="orange"/>
                    <SvgText x={chartWidth + 2} y={yScale(RANGE_CEILING) + 4} textAnchor="start" fill="">{RANGE_CEILING}</SvgText>
                    
                    <Line strokeDasharray="6, 4" x1={0} y1={yScale(TARGET_GLUCOSE)} x2={chartWidth} y2={yScale(TARGET_GLUCOSE)} stroke="green"/>
                    {/* <SvgText x={chartWidth + 2} y={yScale(TARGET_GLUCOSE) + 4} textAnchor="start" fill="">{TARGET_GLUCOSE}</SvgText> */}

                    <Line x1={0} y1={yScale(RANGE_FLOOR)} x2={chartWidth} y2={yScale(RANGE_FLOOR)} stroke="red"/>
                    <SvgText x={chartWidth + 3} y={yScale(RANGE_FLOOR) + 4} textAnchor="start" fill="">{RANGE_FLOOR}</SvgText>

                </G>
            </Svg>

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
