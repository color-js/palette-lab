# Palette Lab

Toolkit for analyzing color palettes.

## Palette Stats

Given an object literal of palettes → color names → tints → colors, easily calculate any stats you need about about the color components.
Pretty print the results or import them in other scripts for further processing.
The palettes need to all use the same tints and color names ("hues") otherwise results will be meaningless.

### Usage

You can use this as a JS library or as a CLI tool.

#### As a JS library

```js
import { getStats } from "palette-lab";

// Your palette data
import palettes from "./palettes.js";

getStats(palettes);
```

This will print out sample stats to the console (oklch coordinate ranges).
However, to really harness the power of this library, you should provide your own queries.

```js
import { getStats } from "palette-lab";

// Your palette data
import palettes from "./palettes.js";

// Your queries
import queries from "./queries.js";

getStats(palettes, queries);
```

#### As a CLI tool

```sh
pstats 'palettes/*.css' 'queries/*.js'
```

### Palette Queries

Each query consists of the following params to analyze:

- `component`: The color component to analyze (h, c, l). If `getValue()` is provided, this is ignored.
- `getValue`: A function to extract the value to analyze from a color, for more complex analysis than just getting a component
- `by`: The grouping to analyze by (1-2 of 'tint', 'hue', 'palette'). If `getKey()` is provided, this is ignored
- `getKey`: A function to generate a key for each group. If not provided, it is generated based on the 'by' param
- `caption`: The caption to display in the console. If not provided, a default label is generated from test params.
- `filter`: Restrict to specific hues/tints/palettes or exclude them
- `stats`: The stats to calculate for each group (`min`, `max`, `mid`, `extent`, `avg`, `median`, `count`)

When using as a CLI tool, all params can be specified as `--param=value`, except filters which are just included raw in the command.
