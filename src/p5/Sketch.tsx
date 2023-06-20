import React, { useEffect, useRef } from "react";
import p5 from "p5";
import Tile from "./Tile";
import Cell from "./Cell";

const DIM = 25;

function removeDuplicatedTiles(tiles: Tile[]): Tile[] {
    const uniqueTilesMap: { [key: string]: Tile } = {};
    for (const tile of tiles) {
        const key = tile.edges.join(","); // ex: "ABB,BCB,BBA,AAA"
        uniqueTilesMap[key] = tile;
    }
    return Object.values(uniqueTilesMap);
}

function createGrid(tiles: Tile[]): Cell[] {
    const grid: Cell[] = [];
    for (let i = 0; i < DIM * DIM; i++) {
        grid[i] = new Cell(tiles.length);
    }
    return grid;
}

function checkValid(arr: number[], valid: number[]): void {
    for (let i = arr.length - 1; i >= 0; i--) {
        let element = arr[i];
        if (!valid.includes(element)) {
            arr.splice(i, 1);
        }
    }
}

interface SketchProps {}

const Sketch: React.FC<SketchProps> = () => {
    // const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const sketch = (p: p5) => {
            let tiles: Tile[] = [];
            const tileImages: p5.Image[] = [];
            let grid: Cell[] = [];

            p.preload = () => {
                const path = "tiles/circuit-coding-train";
                for (let i = 0; i < 13; i++) {
                    const imagePath = `${path}/${i}.png`;
                    const tileImage = p.loadImage(imagePath);
                    tileImages[i] = tileImage;
                }
            };

            p.setup = () => {
                const canvas = p.createCanvas(400, 400);
                canvas.parent(
                    canvasRef.current?.parentNode as HTMLCanvasElement
                );

                tiles[0] = new Tile(tileImages[0], [
                    "AAA",
                    "AAA",
                    "AAA",
                    "AAA",
                ]);
                tiles[1] = new Tile(tileImages[1], [
                    "BBB",
                    "BBB",
                    "BBB",
                    "BBB",
                ]);
                tiles[2] = new Tile(tileImages[2], [
                    "BBB",
                    "BCB",
                    "BBB",
                    "BBB",
                ]);
                tiles[3] = new Tile(tileImages[3], [
                    "BBB",
                    "BDB",
                    "BBB",
                    "BDB",
                ]);
                tiles[4] = new Tile(tileImages[4], [
                    "ABB",
                    "BCB",
                    "BBA",
                    "AAA",
                ]);
                tiles[5] = new Tile(tileImages[5], [
                    "ABB",
                    "BBB",
                    "BBB",
                    "BBA",
                ]);
                tiles[6] = new Tile(tileImages[6], [
                    "BBB",
                    "BCB",
                    "BBB",
                    "BCB",
                ]);
                tiles[7] = new Tile(tileImages[7], [
                    "BDB",
                    "BCB",
                    "BDB",
                    "BCB",
                ]);
                tiles[8] = new Tile(tileImages[8], [
                    "BDB",
                    "BBB",
                    "BCB",
                    "BBB",
                ]);
                tiles[9] = new Tile(tileImages[9], [
                    "BCB",
                    "BCB",
                    "BBB",
                    "BCB",
                ]);
                tiles[10] = new Tile(tileImages[10], [
                    "BCB",
                    "BCB",
                    "BCB",
                    "BCB",
                ]);
                tiles[11] = new Tile(tileImages[11], [
                    "BCB",
                    "BCB",
                    "BBB",
                    "BBB",
                ]);
                tiles[12] = new Tile(tileImages[12], [
                    "BBB",
                    "BCB",
                    "BBB",
                    "BCB",
                ]);

                for (let i = 0; i < 12; i++) {
                    tiles[i].index = i;
                }

                const initialTileCount = tiles.length;
                for (let i = 0; i < initialTileCount; i++) {
                    let tempTiles: Tile[] = [];
                    for (let j = 0; j < 4; j++) {
                        tempTiles.push(tiles[i].rotate(j));
                    }
                    tempTiles = removeDuplicatedTiles(tempTiles);
                    tiles = tiles.concat(tempTiles);
                }
                console.log(tiles.length);

                for (let i = 0; i < tiles.length; i++) {
                    const tile = tiles[i];
                    tile.analyze(tiles);
                }

                startOver();
            };

            function startOver() {
                grid = createGrid(tiles);
            }

            p.mousePressed = () => {
                p.redraw();
            };

            p.draw = () => {
                p.background(0);

                const w = p.width / DIM;
                const h = p.height / DIM;
                for (let j = 0; j < DIM; j++) {
                    for (let i = 0; i < DIM; i++) {
                        let cell = grid[i + j * DIM];
                        if (cell.collapsed) {
                            let index = cell.options[0];
                            p.image(tiles[index].img, i * w, j * h, w, h);
                        } else {
                            p.noFill();
                            p.stroke(51);
                            p.rect(i * w, j * h, w, h);
                        }
                    }
                }

                let gridCopy = grid.slice();
                gridCopy = gridCopy.filter((a) => !a.collapsed);

                if (gridCopy.length === 0) {
                    return;
                }

                gridCopy.sort((a, b) => {
                    return a.options.length - b.options.length;
                });

                let len = gridCopy[0].options.length;
                let stopIndex = 0;
                for (let i = 1; i < gridCopy.length; i++) {
                    if (gridCopy[i].options.length > len) {
                        stopIndex = i;
                        break;
                    }
                }

                if (stopIndex > 0) gridCopy.splice(stopIndex);
                const cell = p.random(gridCopy);
                cell.collapsed = true;
                const pick = p.random(cell.options);
                if (pick === undefined) {
                    startOver();
                    return;
                }
                cell.options = [pick];

                const nextGrid = [];
                for (let j = 0; j < DIM; j++) {
                    for (let i = 0; i < DIM; i++) {
                        let index = i + j * DIM;
                        if (grid[index].collapsed) {
                            nextGrid[index] = grid[index];
                        } else {
                            let options = new Array(tiles.length)
                                .fill(0)
                                .map((x, i) => i);

                            if (j > 0) {
                                let up = grid[i + (j - 1) * DIM];
                                let validOptions: any[] = [];
                                for (let option of up.options) {
                                    let valid = tiles[option].down;
                                    validOptions = validOptions.concat(valid);
                                }
                                checkValid(options, validOptions);
                            }

                            if (i < DIM - 1) {
                                let right = grid[i + 1 + j * DIM];
                                let validOptions: any[] = [];
                                for (let option of right.options) {
                                    let valid = tiles[option].left;
                                    validOptions = validOptions.concat(valid);
                                }
                                checkValid(options, validOptions);
                            }

                            if (j < DIM - 1) {
                                let down = grid[i + (j + 1) * DIM];
                                let validOptions: any[] = [];
                                for (let option of down.options) {
                                    let valid = tiles[option].up;
                                    validOptions = validOptions.concat(valid);
                                }
                                checkValid(options, validOptions);
                            }

                            if (i > 0) {
                                let left = grid[i - 1 + j * DIM];
                                let validOptions: any[] = [];
                                for (let option of left.options) {
                                    let valid = tiles[option].right;
                                    validOptions = validOptions.concat(valid);
                                }
                                checkValid(options, validOptions);
                            }

                            nextGrid[index] = new Cell(options);
                        }
                    }
                }

                grid = nextGrid;
            };
        };

        const p5Instance = new p5(sketch);
        return () => {
            p5Instance.remove();
        };
    }, []);

    return <canvas ref={canvasRef}></canvas>;
};

export default Sketch;
