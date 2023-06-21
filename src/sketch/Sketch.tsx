import React, { useEffect, useRef } from "react";
import p5 from "p5";
import Tile, { TileSetJSON } from "../model/Tile";
import tileSetJSON from "../assets/json/tiles/platformer-industrial-expansion.json";
import Sketch from "model/Sketch";
import "./sketch.css";

const SKETCH_WIDTH = 10;
const SKETCH_HEIGHT = 10;
const CELL_SIZE = 30;

interface SketchProps {}

const SketchElement: React.FC<SketchProps> = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const sketch = (p: p5) => {
            let tiles: Tile[] = [];
            const tileImages: p5.Image[] = [];
            let sketch: Sketch = new Sketch(SKETCH_WIDTH, SKETCH_HEIGHT);

            // Tiles loading.
            p.preload = () => {
                tiles = Tile.getTilesFromJSON(tileSetJSON as TileSetJSON);

                for (let i = 0; i < tiles.length; i++) {
                    const tileImage = p.loadImage(tiles[i].imagePath);
                    tileImages[i] = tileImage;
                }
            };

            p.setup = () => {
                // Creates sketch canvas.
                const canvas = p.createCanvas(
                    sketch.width * CELL_SIZE,
                    sketch.height * CELL_SIZE
                );
                canvas.parent(
                    canvasRef.current?.parentNode as HTMLCanvasElement
                );

                // Creates cell grid.
                sketch.createGrid(tiles.length);
            };

            p.draw = () => {
                p.background(0);

                // Cell dimension.
                const cellWidth = p.width / sketch.width;
                const cellHeight = p.height / sketch.height;

                // Draws cell grid.
                for (let line = 0; line < sketch.height; line++) {
                    for (let column = 0; column < sketch.width; column++) {
                        let cell = sketch.grid[line * sketch.height + column];

                        if (cell.collapsed) {
                            // Drawn cell.
                            let index = cell.options[0];
                            p.image(
                                tileImages[index],
                                column * cellWidth,
                                line * cellHeight,
                                cellWidth,
                                cellHeight
                            );
                        } else {
                            // Empty cell.
                            p.noFill();
                            p.stroke(51);
                            p.rect(
                                column * cellWidth,
                                line * cellHeight,
                                cellWidth,
                                cellHeight
                            );
                        }
                    }
                }

                // If the grid is filled, generation stops.
                if (sketch.isGridFilled()) {
                    return;
                }

                if (sketch.defineNextTileToDraw(p)) {
                    sketch.createNextGrid(tiles);
                }
            };
        };

        const p5Instance = new p5(sketch);
        return () => {
            p5Instance.remove();
        };
    }, []);

    return <canvas ref={canvasRef}></canvas>;
};

export default SketchElement;
