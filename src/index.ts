import * as numeral from "numeral";
import * as moment from "moment";
import * as PIXI from "pixi.js";
import { defaults, extend, clone } from "lodash";

export interface ScatterOptions {
    canvasWidth?: number;
    canvasHeight?: number;
    target?: HTMLElement;
    maxPoint?: number;
    boxPadding?: number;
    axisOptions?: AxisOptions;
    axisLabelOptions?: AxisLabelOptions;
}

export interface AxisOptions {
    xAxis: Axis;
    yAxis: Axis;
}

export interface Axis {
    min: number;
    max: number;
}

export interface AxisLabelOptions {
    xAxis: AxisLabel;
    yAxis: AxisLabel;
}

export interface AxisLabel {
    fontFamily: string;
    fontSize: number;
    fill: number | string;
}

class Scatter {
    protected options: ScatterOptions;
    protected app: PIXI.Application;

    protected boxWidth: number;
    protected boxHeight: number;

    protected boxOffsetX: number;
    protected boxOffsetY: number;

    protected datas: any;

    constructor(scatterOptions?: ScatterOptions) {
        const defaultAxis = {
            max: 5000,
            min: 0,
        };
        const defaultAxisLabel = {
            fill: "white",
            fontFamily: "consolas",
            fontSize: 11,
        };
        this.options = defaults(scatterOptions, {
            canvasWidth: 1280,
            canvasHeight: 800,
            target: document.body,
            maxPoint: 2e5,
            boxPadding: 50,
            axisOptions: {
                xAxis: clone(defaultAxis),
                yAxis: clone(defaultAxis),
            },
            axisLabelOptions: {
                xAxis: clone(defaultAxisLabel),
                yAxis: clone(defaultAxisLabel),
            },
        });
        // samples
        this.datas = [
            [ 485, 9124 ]
        ];

        this.options.axisOptions.xAxis.min = 1508416235540;

        for (let endTime = 1508416235540, i = 0; i < 1e5; i++) {
            this.datas.push([
                endTime + (i * 1000), Math.round(Math.random() * 5000)
            ]);
            this.options.axisOptions.xAxis.max = endTime + (i * 1000);
        }

        this.initPixi(this.options);
    }

    // 데이터를 리셋.
    public setDatas(datas: any): Scatter {
        this.datas = datas;
        this.rerender();
        return this;
    }

    // 데이터를 추가.
    public addDatas(): Scatter {
        return this;
    }

    // 라벨 옵션을 다시 설정.
    public setLabels(): Scatter {
        return this;
    }

    // 옵션을 다시 설정.
    public setOptions(options: ScatterOptions): Scatter {
        this.options = options;
        return this.rerender();
    }

    // 캔버스 사이즈 영역을 조정.
    public setResize(width: number, height: number): Scatter {
        const { app, options } = this;
        extend(options, {
            canvasWidth: width,
            canvasHeight: height,
        });
        app.renderer.resize(width, height);
        return this.rerender();
    }

    // 캔버스 뷰를 다시 랜더링.
    public rerender(): Scatter {
        return this
            .cleanup()
            .render(this.options);
    }

    // 그려진 객체를 모두 지우고 메모리를 회수.
    public cleanup(): Scatter {
        this.app.stage.children.length = 0;
        return this;
    }

    // 현재 설정된 옵션정보의 복사본을 반환.
    public getOptions(): ScatterOptions {
        return JSON.parse(JSON.stringify(this.options));
    }


    protected initPixi(options: ScatterOptions): Scatter {
        const { canvasWidth, canvasHeight, target } = options;
        this.app = new PIXI.Application(canvasWidth, canvasHeight, {});
        target.appendChild(this.app.view);
        this.render(options);
        return this;
    }

    protected render(options: ScatterOptions): Scatter {
        this
            .drawChartBox(options)
            .drawParticle();
        return this;
    }

    // 박스 크기 정보를 업데이트.
    protected updateBoxSize(canvasWidth: number, canvasHeight: number, boxPadding: number): {
        boxWidth: number,
        boxHeight: number,
        boxOffsetX: number,
        boxOffsetY: number,
    } {
        this.boxWidth = canvasWidth - (boxPadding * 2);
        this.boxHeight = canvasHeight - (boxPadding * 2);
        this.boxOffsetX = boxPadding + this.boxWidth;
        this.boxOffsetY = boxPadding + this.boxHeight;
        return {
            boxWidth: this.boxWidth,
            boxHeight: this.boxHeight,
            boxOffsetX: this.boxOffsetX,
            boxOffsetY: this.boxOffsetY,
        };
    }

    // 박스를 그림.
    protected drawChartBox(options: ScatterOptions): Scatter {
        const { app } = this;
        const { canvasWidth, canvasHeight, boxPadding, axisOptions, axisLabelOptions } = options;
        const { boxWidth, boxHeight, boxOffsetX, boxOffsetY } = this.updateBoxSize(canvasWidth, canvasHeight, boxPadding);
        const xAxisLabelCnt = Math.ceil(canvasWidth / 100);
        const yAxisLabelCnt = Math.ceil(canvasHeight / 50);
        const graphics = new PIXI.Graphics();
        graphics.x = 0;
        graphics.y = 0;
        graphics.lineStyle(1, 0xFFFFFF, 1);
        graphics.moveTo(boxPadding, boxPadding);
        graphics.lineTo(boxPadding, boxOffsetY);
        graphics.lineTo(boxOffsetX, boxOffsetY);
        graphics.endFill();
        // yAxisLabels
        const yAxisLabels: any[] = [];
        for (let text: PIXI.Text,
                 length = yAxisLabelCnt,
                 gap = axisOptions.yAxis.max / length,
                 i = 0; i < length + 1; i++) {
            text = new PIXI.Text(
                numeral(axisOptions.yAxis.min + (gap * i)).format("0,0a"), axisLabelOptions.yAxis);
            text.y = boxOffsetY - (boxHeight / length * i) - 10;
            text.x = 20;
            yAxisLabels.push(text);
        }
        // xAxisLabels
        const xAxisLabels: any[] = [];
        for (let text: PIXI.Text,
                 length = xAxisLabelCnt,
                 gap = axisOptions.xAxis.max / length,
                 i = 0; i < length + 1; i++) {
            text = new PIXI.Text(
                moment(axisOptions.xAxis.min + (gap * i)).format("HH:mm:ss"), axisLabelOptions.xAxis);
            text.y = boxOffsetY + 20;
            text.x = boxPadding + (boxWidth / length * i) - text.width / 2;
            xAxisLabels.push(text);
        }
        app.stage.addChild.apply(app.stage, xAxisLabels.concat(yAxisLabels, graphics));
        return this;
    }

    // 화면에 데이터 정보를 그림.
    protected drawParticle(): Scatter {
        const pointer = require("./images/circle.png");
        const sprites = new PIXI.particles.ParticleContainer(10000, {
            scale: true,
            position: true,
            rotation: true,
            uvs: true,
            alpha: true,
        });
        const items = [];
        const { app, datas } = this;
        for (let item, i = 0; i < datas.length; i++) {
            item = PIXI.Sprite.fromImage(pointer);
            item.tint = Math.random() * 0xE8D4CD;
            [ item.x, item.y ] = this.transformCoordinate.apply(this, datas[ i ]);
            item.anchor.set(.5);
            item.width = 5;
            item.height = 5;
            item.tint = Math.random() * 0x808080;
            items.push(item);
        }
        sprites.addChild.apply(sprites, items);
        app.stage.addChild(sprites);
        return this;
    }

    protected transformCoordinate(xValue: number, yValue: number): number[] {
        const { boxPadding } = this.options;
        const { xAxis, yAxis } = this.options.axisOptions;
        const { boxOffsetX, boxOffsetY, boxWidth, boxHeight } = this;
        var [ x, y ] = [ boxWidth * (xValue / xAxis.max) + boxPadding, boxHeight - (boxHeight) * (yValue / yAxis.max) + boxPadding ];
        x = Math.min(x, boxOffsetX);
        y = Math.max(y, boxOffsetY - boxHeight);
        return [ x, y ]
    }
}

export default Scatter;
