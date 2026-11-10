## Per-diagram-type (median over diagrams)

| type | n | mermaid.js first/warm ms | merman first/warm ms | mmdr first/warm ms | merman textSim / areaRatio | mmdr textSim / areaRatio |
|---|---|---|---|---|---|---|
| C4Context | 2 | 263.7 / 79.5 | 121.9 / 8.8 | 45.7 / 1.2 | 1.00 / 0.98 | 0.89 / 0.79 |
| C4Container | 2 | 151.3 / 128.2 | 10.0 / 9.6 | 1.9 / 1.8 | 1.00 / 1.02 | 0.91 / 0.75 |
| C4Component | 1 | 129.8 / 127.3 | 8.3 / 8.9 | 1.4 / 1.8 | 1.00 / 0.97 | 0.91 / 0.69 |
| classDiagram | 4 | 173.5 / 159.0 | 24.3 / 12.3 | 6.7 / 2.0 | 1.00 / 0.87 | 0.94 / 1.09 |
| erDiagram | 4 | 100.7 / 116.3 | 33.1 / 28.4 | 24.0 / 23.7 | 1.00 / 0.68 | 0.90 / 0.65 |
| graph | 13 | 38.0 / 33.6 | 8.7 / 7.9 | 9.1 / 7.3 | 1.00 / 0.86 | 1.00 / 1.04 |
| gantt | 2 | 32.8 / 8.6 | 9.8 / 4.1 | 1.0 / 0.7 | 1.00 / 0.63 | 0.83 / 0.75 |
| gitGraph | 6 | 59.5 / 55.8 | 4.6 / 4.1 | 0.8 / 0.6 | 0.29 / 0.99 | 0.25 / 0.75 |
| journey | 6 | 27.8 / 25.7 | 6.8 / 6.4 | 0.8 / 1.0 | 1.00 / 1.00 | 1.00 / 1.35 |
| mindmap | 7 | 209.0 / 194.3 | 27.5 / 23.0 | 1.3 / 1.3 | 1.00 / 0.98 | 1.00 / 1.60 |
| pie | 10 | 5.3 / 5.3 | 1.3 / 1.3 | 0.3 / 0.3 | 1.00 / 0.99 | 1.00 / 0.65 |
| sequenceDiagram | 7 | 29.2 / 21.6 | 5.4 / 3.8 | 2.1 / 1.7 | 1.00 / 1.04 | 1.00 / 0.99 |
| stateDiagram | 5 | 121.9 / 136.8 | 10.3 / 8.8 | 32.0 / 39.5 | 1.00 / 1.18 | 1.00 / 0.61 |
| timeline | 6 | 20.7 / 17.7 | 3.3 / 3.3 | 0.3 / 0.3 | 1.00 / 0.98 | 0.56 / 0.28 |
| flowchart | 1 | 37.0 / 33.3 | 6.8 / 6.1 | 0.5 / 0.4 | 1.00 / 0.81 | 0.67 / 1.78 |
| architecture-beta | 3 | 45.4 / 33.4 | 3.2 / 2.1 | 0.2 / 0.1 | 1.00 / 1.00 | 1.00 / 0.56 |

## Totals (79 diagrams)

| engine | init ms | first-render total ms | warm total ms | errors | median textSim vs mermaid.js | median areaRatio | median aspectRatio |
|---|---|---|---|---|---|---|---|
| mermaidjs | 11 | 5815 | 4882 | 0 | 1.00 | 1.00 | 1.00 |
| merman | 119 | 1130 | 662 | 0 | 1.00 | 0.98 | 0.98 |
| mmdr | 23 | 653 | 549 | 0 | 1.00 | 0.79 | 1.01 |

## Largest differences (textSim < 0.6 or area/aspect off by >2x vs mermaid.js)

| diagram | type | engine | textSim | areaRatio | aspectRatio |
|---|---|---|---|---|---|
| examples_c4-2 | C4Container | mmdr | 0.91 | 0.75 | 2.40  |
| examples_c4-3 | C4Component | mmdr | 0.91 | 0.69 | 2.55  |
| examples_class-2 | classDiagram | mmdr | 0.94 | 0.90 | 2.57  |
| examples_flowcharts-7 | graph | mmdr | 0.45 | 1.03 | 1.22  |
| examples_git-1 | gitGraph | merman | 0.17 | 0.97 | 0.98  |
| examples_git-1 | gitGraph | mmdr | 0.17 | 0.84 | 0.88  |
| examples_git-2 | gitGraph | merman | 0.24 | 0.98 | 0.99  |
| examples_git-2 | gitGraph | mmdr | 0.24 | 0.78 | 0.97  |
| examples_git-3 | gitGraph | merman | 0.31 | 0.99 | 1.00  |
| examples_git-3 | gitGraph | mmdr | 0.31 | 0.73 | 1.01  |
| examples_git-4 | gitGraph | merman | 0.25 | 0.99 | 1.00  |
| examples_git-4 | gitGraph | mmdr | 0.25 | 0.75 | 0.99  |
| examples_git-5 | gitGraph | merman | 0.32 | 1.00 | 1.00  |
| examples_git-5 | gitGraph | mmdr | 0.32 | 0.73 | 1.02  |
| examples_git-6 | gitGraph | merman | 0.29 | 0.97 | 0.98  |
| examples_git-6 | gitGraph | mmdr | 0.12 | 0.71 | 1.04  |
| examples_state-2 | stateDiagram | mmdr | 1.00 | 0.81 | 0.49  |
| examples_state-3 | stateDiagram | mmdr | 1.00 | 0.35 | 1.17  |
| examples_state-5 | stateDiagram | mmdr | 1.00 | 0.29 | 0.77  |
| examples_timeline-1 | timeline | mmdr | 0.51 | 0.27 | 1.63  |
| examples_timeline-2 | timeline | mmdr | 0.49 | 0.24 | 1.68  |
| examples_timeline-3 | timeline | mmdr | 0.61 | 0.28 | 1.55  |
| examples_timeline-4 | timeline | mmdr | 0.56 | 0.28 | 1.59  |
| examples_timeline-5 | timeline | mmdr | 0.52 | 0.28 | 1.70  |
| examples_timeline-6 | timeline | mmdr | 0.68 | 0.29 | 1.61  |
| test-icons-1 | architecture-beta | mmdr | 1.00 | 0.56 | 2.98  |
| test-icons-2 | architecture-beta | mmdr | 1.00 | 0.63 | 4.42  |
