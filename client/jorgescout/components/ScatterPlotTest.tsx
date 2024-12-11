import React, {useState, useEffect} from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Circle, G, Line, Text } from "react-native-svg";
import * as d3 from "d3";
import { getHistory } from '@/scripts/scripts.ts';
import RangePicker from "./RangePicker";


// Define the data structure
interface DataPoint {
  x: Date;
  y: number;
}

const DEFAULT_YAXIS = 250;
const FIVE_MINUTES = 5*60000;
const FOUR_HOURS = 4 * 60 * 60 * 1000;
const FOUR_HOURS_MINS = 240;

export default function ScatterPlot() {
    
    const [data, setData] = useState<DataPoint[]>([]);
    const [scatterPlotRange, setScatterPlotRange] = useState(FOUR_HOURS_MINS);

    useEffect(() => {
        const fetchData = async () => {
            const response = await getHistory(scatterPlotRange);
            const history_data:DataPoint[] = [];
            
            //const firstTime = new Date(response.history[response.history.length - 1].TimeString);
            const startTime = new Date(new Date().getTime() - FOUR_HOURS);
            history_data.push({x:startTime, y: -1000});
            
            response.history.map((item:{ TimeString: string, Value: number}) => history_data.push({x: new Date(item.TimeString), y: item.Value}));
            
            const lastTime = new Date(response.history[0].TimeString);
            const endTime = new Date(lastTime.getTime() + FIVE_MINUTES);
            history_data.push({x:endTime, y: -1000});

            setData(history_data);
        }

        fetchData();
        
        const interval = setInterval(fetchData, FIVE_MINUTES);

        return () => {clearInterval(interval)};

    }, [scatterPlotRange]);

    // Dimensions and margins
    const width = 375;
    const height = 250;
    const margin = { top: 20, right: 40, bottom: 40, left: 20 };

    // Chart dimensions
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Define scales
    const xExtent = d3.extent(data, (d) => d.x) as [Date, Date];
    const xDomain: [Date, Date] = [
        xExtent[0],
        xExtent[1],
    ];
    const xScale = d3
        .scaleTime()
        .domain(xDomain)
        .range([0, chartWidth]);

    const yExtent = d3.extent(data, (d) => d.y) as [number, number];
    const yAxisHeight = yExtent[1] > 250 ? yExtent[1] : DEFAULT_YAXIS;
    const yScale = d3
        .scaleLinear()
        .domain([0, yAxisHeight])
        .range([chartHeight, 0]);

    // let tickValues:Date[] = []
    const [tickValues, setTickValues] = useState<Date[]>([]);
    useEffect(() => {
        // Generate ticks
        const spacing = scatterPlotRange > FOUR_HOURS_MINS ? 4 : 1
        setTickValues(d3.timeHour.every(spacing)!.range(xDomain[0], xDomain[1]));
        console.log(tickValues)
    }, [data])

    const RANGE_FLOOR = 70
    const RANGE_CEILING = 180


    const setPlotRange = (rangeString:string) => {
        setScatterPlotRange(Number(rangeString) * 60);
    }

    return (
        <View style={{}}>

            <View style={{flexDirection: "row", justifyContent: "flex-end", paddingBottom: 5, paddingRight: 10}}>
                <RangePicker setGlobalRange={setPlotRange} ranges={['24','12','4']} />
            </View>

            <Svg width={width} height={height}>
                {/* Chart group */}
                <G translateX={margin.left} translateY={margin.top}>
                    {/* X-Axis */}
                    <Line
                        x1={0}
                        y1={chartHeight}
                        x2={chartWidth}
                        y2={chartHeight}
                        stroke="#e3e3e3"
                    />
                    {tickValues.map((tick, index) => {
                        const x = xScale(tick);
                        return (
                        <G key={index} translateX={x} translateY={chartHeight}>
                            <Line x1={0} y1={0} x2={0} y2={-1 * chartHeight} stroke="#e3e3e3" />
                            <Text
                            x={0}
                            y={15}
                            fontSize={10}
                            textAnchor="middle"
                            fill="black"
                            >
                            {d3.timeFormat("%-I %p")(tick)}
                            </Text>
                        </G>
                        );
                    })}

                    <Line x1={0} y1={yScale(RANGE_CEILING)} x2={chartWidth} y2={yScale(RANGE_CEILING)} stroke="orange"/>
                    <Line x1={0} y1={yScale(RANGE_FLOOR)} x2={chartWidth} y2={yScale(RANGE_FLOOR)} stroke="red"/>

                    {/* Y-Axis */}
                    <Line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#e3e3e3" />
                    <Line x1={chartWidth} y1={0} x2={chartWidth} y2={chartHeight} stroke="#e3e3e3" />
                    {yScale.ticks(5).map((tick, index) => {
                        const y = yScale(tick);
                        return (
                        <G key={index} translateX={-5} translateY={y}>
                            <Line x1={5} y1={0} x2={chartWidth + 5} y2={0} stroke="#e3e3e3" />
                            <Text
                            x={chartWidth + 10}
                            y={4}
                            fontSize={10}
                            textAnchor="start"
                            fill="black"
                            >
                            {tick}
                            </Text>
                        </G>
                        );
                    })}

                    {/* Data points */}
                    {data.map((point, index) => {
                        const cx = xScale(point.x);
                        const cy = yScale(point.y);
                        return (
                        <Circle
                            key={index}
                            cx={cx}
                            cy={cy}
                            r={point.y < 0 ? 0 : 2.1}
                            fill={point.y < 70 ? "red" : point.y > 180 ? "#FF8C00" : "black" }
                        />
                        );
                    })}
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
