import React, {useState, useEffect} from "react";
import { View } from "react-native";
import Svg, { Circle, G, Line, Text } from "react-native-svg";
import * as d3 from "d3";
import { getHistory } from '@/scripts/scripts.ts';


// Define the data structure
interface DataPoint {
  x: Date;
  y: number;
}

const CHART_HEIGHT = 250;

const ScatterPlot = () => {

    const [data, setData] = useState<DataPoint[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await getHistory(50);

            const history_data:DataPoint[] = [];
            response.history.map((item:{ TimeString: string, Value: number}) => history_data.push({x: new Date(item.TimeString), y: item.Value}));

            console.log(history_data)
            console.log("hi")

            setData(history_data);

        }

        fetchData();
        
        const interval = setInterval(fetchData, 300000);

    }, []);

    // Dimensions and margins
    const width = 350;
    const height = 250;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };

    // Chart dimensions
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Define scales
    const xExtent = d3.extent(data, (d) => d.x) as [Date, Date];
    console.log(xExtent)
    const xDomain: [Date, Date] = [
        xExtent[0],
        xExtent[1],
    ];
    const xScale = d3
        .scaleTime()
        .domain(xDomain)
        .range([0, chartWidth]);

    const yExtent = d3.extent(data, (d) => d.y) as [number, number];
    const yScale = d3
        .scaleLinear()
        .domain([0, CHART_HEIGHT])
        .range([chartHeight, 0]);

    // Generate ticks
    const tickValues = d3.timeHour.every(1).range(xDomain[0], xDomain[1]);

    return (
        <View>
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
                    const x = xScale(tick)!;
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

                {/* Y-Axis */}
                <Line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#e3e3e3" />
                <Line x1={chartWidth} y1={0} x2={chartWidth} y2={chartHeight} stroke="#e3e3e3" />
                {yScale.ticks(5).map((tick, index) => {
                    const y = yScale(tick)!;
                    return (
                    <G key={index} translateX={-5} translateY={y}>
                        <Line x1={5} y1={0} x2={chartWidth + 5} y2={0} stroke="#e3e3e3" />
                        <Text
                        x={-10}
                        y={4}
                        fontSize={10}
                        textAnchor="end"
                        fill="black"
                        >
                        {tick}
                        </Text>
                    </G>
                    );
                })}

                {/* Data points */}
                {data.map((point, index) => {
                    const cx = xScale(point.x)!;
                    const cy = yScale(point.y)!;
                    return (
                    <Circle
                        key={index}
                        cx={cx}
                        cy={cy}
                        r={2}
                        fill="black"
                    />
                    );
                })}
            </G>
        </Svg>
        </View>
    );
    };

    export default function App() {
    const exampleData: DataPoint[] = [
        { x: new Date("2024-12-04T08:56:00"), y: 10 },
        { x: new Date("2024-12-04T09:01:00"), y: 15 },
        { x: new Date("2024-12-04T09:45:00"), y: 20 },
        { x: new Date("2024-12-04T10:10:00"), y: 25 },
        { x: new Date("2024-12-04T10:56:00"), y: 30 },
        { x: new Date("2024-12-04T09:47:00"), y: 20 },
        { x: new Date("2024-12-04T10:15:00"), y: 25 },
        { x: new Date("2024-12-04T12:12:00"), y: 30 },
    ];

    return <ScatterPlot />;
}
