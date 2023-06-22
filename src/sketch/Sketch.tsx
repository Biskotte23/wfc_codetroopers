import React, { useEffect, useRef } from "react";
import p5 from "p5";
import { TileSetJSON } from "../model/Tile";
import tileSetJSON from "../assets/json/tiles/tiny-town.json";
import Sketch from "model/Sketch";
import "./sketch.css";

const SKETCH_WIDTH = 20;
const SKETCH_HEIGHT = 10;
const CELL_SIZE = 30;

interface SketchProps {}

const SketchElement: React.FC<SketchProps> = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const sketch = (p: p5) => {
            let sketch: Sketch = new Sketch(SKETCH_WIDTH, SKETCH_HEIGHT);
            const tileImages: p5.Image[] = [];

            // Tiles loading.
            p.preload = () => {
                sketch.loadTilesFormJSON(tileSetJSON as TileSetJSON);

                for (let i = 0; i < sketch.tiles.length; i++) {
                    const tileImage = p.loadImage(sketch.tiles[i].imagePath);
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
                sketch.createGrid();
            };

            p.draw = () => {
                p.background(0);

                // Cell dimension.
                const cellWidth = p.width / sketch.width;
                const cellHeight = p.height / sketch.height;

                // Draws cell grid.
                for (let line = 0; line < sketch.height; line++) {
                    for (let column = 0; column < sketch.width; column++) {
                        let cell = sketch.grid[line * sketch.width + column];

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
                    sketch.createNextGrid();
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
