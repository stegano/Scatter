/**
 * DEMO API
 * http://support.jennifersoft.com:27900/api/transaction/time?domain_id=7000&start_time=1508416235134&end_time=1508416295134
 * */
import * as $ from "jquery";
import { debounce } from "lodash";
import  Scatter, { ScatterOptions } from "../src/index";
import "./index.css";

var scatter = new Scatter({
    canvasWidth: window.innerWidth,
    canvasHeight: window.innerHeight,
});

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
            if (options.axisOptions.yAxis.max + 1e3 > 1e4) {
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
}, 300));