import * as $ from "jquery";
import { debounce } from "lodash";
import  Scatter, { ScatterData, ScatterOptions } from "../src/index";
import "./index.css";

interface TransactionData {
    txid: string;
    responseTime: number;
    endTime: string;
}

var scatter: Scatter = new Scatter({
    canvasWidth: window.innerWidth,
    canvasHeight: window.innerHeight,
    axisOptions: {
        xAxis: {
            min: new Date().getTime(),
            max: new Date().getTime(),
        },
        yAxis: {
            min: 0,
            max: 5000,
        }
    }
});

var keySet: any = {};
var dataSet: ScatterData[] = [];
var offsetDateTime: number = new Date().getTime();

// 윈도우 리사이징 이벤트.
$(window).on("resize", debounce(() => {
    scatter.setResize(window.innerWidth, window.innerHeight);
}, 300));

// 윈도우 리사이징 이벤트.
$(window).on("keydown", debounce((e) => {
    var options: ScatterOptions = scatter.getOptions();
    switch (e.keyCode) {
        case 38:
            // ArrowUp
            if (options.axisOptions.yAxis.max + 1e3 <= 5e3) {
                options.axisOptions.yAxis.max += 1e3;
            }
            break;
        case 40:
            // ArrowDown
            if (options.axisOptions.yAxis.max - 1e3 > 0) {
                options.axisOptions.yAxis.max -= 1e3;
            }
            break;
    }
    scatter.setOptions(options, true);
}, 300));

// 서버에서 데이터를 가져옴.
var startTime = offsetDateTime - 6e3;
var endTime = offsetDateTime;
var maxDataCount = 2e6;
var direction = "history";

setInterval(() => {
    $.ajax({
        url: `http://support.jennifersoft.com:27900/api/transaction/time?domain_id=7000&start_time=${startTime}&end_time=${endTime}`
    }).then((resData: {TransactionData: TransactionData[]}) => {
        var options: ScatterOptions = scatter.getOptions();
        var minXAxis = options.axisOptions.xAxis.min;
        var newData: ScatterData[] = [];
        for (let endTime, tData, i = 0; i < resData.TransactionData.length; i++) {
            tData = resData.TransactionData[ i ];
            // 기존 데이터와 중복되지 않는 데이터를 담음.
            if (!keySet[ tData.txid ]) {
                if (maxDataCount < dataSet.length) {
                    if (direction === "current") {
                        // 새로 추가될 데이터 공간 생성.
                        dataSet.shift();
                    } else if (direction === "history") {
                        // 데이상 데이터를 담지 않음.
                        break;
                    }
                }
                keySet[ tData.txid ] = true;
                endTime = parseInt(tData.endTime, 10);
                dataSet.push([ endTime, tData.responseTime ]);
                newData.push([ endTime, tData.responseTime ]);
                minXAxis = Math.min(minXAxis, endTime);
            }
        }

        // 축의 최대, 최소 값을 변경.
        options.axisOptions.xAxis.min = minXAxis;
        options.axisOptions.xAxis.max = new Date().getTime();
        scatter.setOptions(options);
        scatter.addData(newData);

        if (dataSet.length < maxDataCount) {
            // maxDataCount 만큼 데이터가 채워져 있지 않으면 과거 데이터를 가져옴.
            endTime = startTime;
            startTime -= 6e4;
        } else {
            // 데이터가 maxDataCount 만큼 채워져 있는 경우 현재 시점까지 데이터를 가져옴.
            var currDateTime: number = new Date().getTime();
            endTime = currDateTime;
            startTime = currDateTime - 6e4;
            direction = "current";
        }
        console.log(`length: ${dataSet.length}`);
    });
}, 1000);
