/**
 * DEMO API
 * http://support.jennifersoft.com:27900/api/transaction/time?domain_id=7000&start_time=1508416235134&end_time=1508416295134
 * */
import * as $ from "jquery";
import { debounce } from "lodash";
import Scatter from "../src/index";
import "./index.css";
var scatter = new Scatter({});
$(window).on("resize", debounce(() => {
    scatter.setResize(window.innerWidth, 800)
}, 300));