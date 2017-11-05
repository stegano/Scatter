import * as numeral from "numeral";
import * as PIXI from "pixi.js";
import { defaults, extend } from "lodash";

interface ScatterOptions {
    canvasWidth?: number;
    canvasHeight?: number;
    target?: HTMLElement;
    maxPoint?: number;
    boxPadding?: number;
    axisOptions?: AxisOptions;
    axisLabelOptions?: AxisLabelOptions;
}

interface AxisOptions {
    xAxis: Axis;
    yAxis: Axis;
}

interface Axis {
    min: number;
    max: number;
    gap: number;
}

interface AxisLabelOptions {
    xAxis: AxisLabel;
    yAxis: AxisLabel;
}

interface AxisLabel {
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

    constructor(scatterOptions: ScatterOptions) {
        const defaultAxis = {
            gap: 10,
            max: 100,
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
                xAxis: defaultAxis,
                yAxis: defaultAxis,
            },
            axisLabelOptions: {
                xAxis: defaultAxisLabel,
                yAxis: defaultAxisLabel,
            },
        });
        // samples
        this.datas = [];
        for (let endTime = 1508416235540, i = 0; i < 2e4; i++) {
            this.datas.push([
                [ endTime + (i * 1000), Math.round(Math.random() * 5000) ],
            ]);
        }

        console.log(`**sample datas`);
        console.dir(this.datas);
        this.initPixi(this.options);
    }

    // 데이터를 리셋.
    public setDatas(datas: any): Scatter {
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
    public setOptions(options: any): Scatter {
        return this;
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


    protected initPixi(options: ScatterOptions): Scatter {
        const { canvasWidth, canvasHeight, target } = options;
        this.app = new PIXI.Application(canvasWidth, canvasHeight);
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
    } {
        this.boxWidth = canvasWidth - boxPadding;
        this.boxHeight = canvasHeight - boxPadding;
        this.boxOffsetX = boxPadding;
        this.boxOffsetY = boxPadding;
        return {
            boxWidth: this.boxWidth,
            boxHeight: this.boxHeight,
        };
    }

    // 박스를 그림.
    protected drawChartBox(options: ScatterOptions): Scatter {
        const { app } = this;
        const { canvasWidth, canvasHeight, boxPadding, axisOptions, axisLabelOptions } = options;
        const { boxWidth, boxHeight } = this.updateBoxSize(canvasWidth, canvasHeight, boxPadding);
        const graphics = new PIXI.Graphics();
        graphics.x = 0;
        graphics.y = 0;
        graphics.lineStyle(1, 0xFFFFFF, 1);
        graphics.moveTo(boxPadding, boxPadding);
        graphics.lineTo(boxPadding, boxHeight);
        graphics.moveTo(boxWidth, boxHeight);
        graphics.lineTo(boxPadding, boxHeight);
        graphics.endFill();
        // yAxisLabels
        const yAxisLabels: any[] = [];
        for (let text: PIXI.Text,
                 length = Math.ceil((axisOptions.yAxis.max - axisOptions.yAxis.min) / axisOptions.yAxis.gap),
                 i = 0; i < length + 1; i++) {
            text = new PIXI.Text(
                numeral(axisOptions.yAxis.min + axisOptions.yAxis.gap * i).format("0,0a"), axisLabelOptions.yAxis);
            text.y = boxHeight - ((boxHeight - boxPadding) / length * i) - 10;
            text.x = 20;
            yAxisLabels.push(text);
        }
        // xAxisLabels
        const xAxisLabels: any[] = [];
        for (let text: PIXI.Text,
                 length = Math.ceil((axisOptions.xAxis.max - axisOptions.xAxis.min) / axisOptions.xAxis.gap),
                 i = 0; i < length + 1; i++) {
            text = new PIXI.Text(
                numeral(axisOptions.xAxis.min + axisOptions.xAxis.gap * i).format("0,0a"), axisLabelOptions.xAxis);
            text.y = boxHeight + 10;
            text.x = boxPadding + ((boxWidth - boxPadding) / length * i);
            xAxisLabels.push(text);
        }
        app.stage.addChild.apply(app.stage, xAxisLabels.concat(yAxisLabels, graphics));
        return this;
    }

    // 화면에 데이터 정보를 그림.
    protected drawParticle(): Scatter {
        const pointer = require("./images/point.png");
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
            // create a new Sprite
            item = PIXI.Sprite.fromImage(pointer);
            item.tint = Math.random() * 0xE8D4CD;
            item.scale.set(.1);
            item.x = Math.random() * (this.boxWidth - this.options.boxPadding) + this.boxOffsetX;
            item.y = Math.random() * (this.boxHeight) - this.boxOffsetY;
            item.tint = Math.random() * 0x808080;
            items.push(item);
        }
        sprites.addChild.apply(sprites, items);
        app.stage.addChild(sprites);
        return this;
    }

    protected transformCoordinate(x: number, y: number): number[] {
        const ret: number[] = [];
        return ret;
    }
}

export default Scatter;
