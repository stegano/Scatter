# Scatter
[![GitHub issues](https://img.shields.io/github/issues-raw/stegano/scatter.svg)](https://github.com/stegano/scatter)

Scatter is a graphic chart library based on WebGL(using [PixiJS](http://www.pixijs.com/)).

## Examples

Please see the below document for details.

```javascript
var scatter: Scatter = new Scatter({
    canvasWidth: 1280,
    canvasHeight: 800,
    axisOptions: {
        xAxis: {
            min: new Date().getTime(),
            max: new Date().getTime(),
        },
        yAxis: {
            min: 0,
            max: 5000,
        }
    },
    axisLabelOptions: {
        xAxis: {
            fontFamily: "consolas",
            fontSize: 11,
            fill: "white",
        },
        yAxis: {
            fontFamily: "consolas",
            fontSize: 11,
            fill: "white",
        }
    }
});
```

## Document

Create an API document using [Typedoc](http://typedoc.org).

```sh
npm install
npm run doc
```

