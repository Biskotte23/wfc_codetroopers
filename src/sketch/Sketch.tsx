import React, { useEffect, useRef } from "react";
import p5 from "p5";
import Tile, { TileSetJSON } from "../model/Tile";
import Cell from "../model/Cell";
import tileSetJSON from "../assets/json/tiles/platformer-industrial-expansion.json";
import Sketch from "model/Sketch";

const SKETCH_WIDTH = 20;
const SKETCH_HEIGHT = 10;
const TILE_SIZE = 30;

// Retire de arr les options non présentes dans valid.
function checkValid(arr: number[], valid: number[]): void {
    for (let i = arr.length - 1; i >= 0; i--) {
        let element = arr[i];
        if (!valid.includes(element)) {
            arr.splice(i, 1);
        }
    }
}

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
                    sketch.width * TILE_SIZE,
                    sketch.height * TILE_SIZE
                );
                canvas.parent(
                    canvasRef.current?.parentNode as HTMLCanvasElement
                );

                // Creates cell grid.
                sketch.createGrid(tiles.length);
            };

            p.draw = () => {
                p.background(0);

                // Dimensions de la cell.
                const cellWidth = p.width / sketch.width;
                const h = p.height / sketch.height;

                // Affichage de la grille et des tiles déjà dessinées.
                for (let line = 0; line < sketch.height; line++) {
                    for (let column = 0; column < sketch.width; column++) {
                        let cell = sketch.grid[line * sketch.height + column];

                        if (cell.collapsed) {
                            // Tile affichée.

                            // Sélection de la tile parmi les options.
                            // Le passer en random ?
                            let index = cell.options[0];

                            p.image(
                                // tiles[index].imagePath,
                                tileImages[index],
                                column * cellWidth,
                                line * h,
                                cellWidth,
                                h
                            );
                        } else {
                            // Cell vide.
                            p.noFill();
                            p.stroke(51);
                            p.rect(column * cellWidth, line * h, cellWidth, h);
                        }
                    }
                }

                let gridCopy = sketch.grid.slice();
                // Récupération des cells vides.
                gridCopy = gridCopy.filter((a) => !a.collapsed);

                // Si grille remplie.
                if (gridCopy.length === 0) {
                    return;
                }

                // Tri des cells vides par ordre d'options de tile croissant.
                gridCopy.sort((a, b) => {
                    return a.options.length - b.options.length;
                });

                // Nombre d'options de la cell vide avec le moins d'options.
                let len = gridCopy[0].options.length;

                // Nombre de cells avec le même nombre minimal d'options.
                let stopIndex = 0;

                for (let i = 1; i < gridCopy.length; i++) {
                    if (gridCopy[i].options.length > len) {
                        stopIndex = i;
                        break;
                    }
                }

                // Supprime toutes les celles avec un nombre d'options non minimal.
                if (stopIndex > 0) gridCopy.splice(stopIndex);

                // Sélection au hasard de la prochaine cellule à partir de celles ayant un nombre minimal d'options.
                const cell = p.random(gridCopy);
                cell.collapsed = true;

                // Sélection au hasard de la tile de la cell.
                const pick = p.random(cell.options);

                // Si aucune tile n'est disponible, alors on rebuild la grille.
                if (pick === undefined) {
                    sketch.createGrid(tiles.length);
                    return;
                }

                // La cell n'a plus qu'une seule tile, celle sélectionnée.
                cell.options = [pick];

                // Construction de la prochaine grille.
                const nextGrid = [];
                for (let line = 0; line < sketch.height; line++) {
                    for (let column = 0; column < sketch.width; column++) {
                        let index = column + line * sketch.height;

                        if (sketch.grid[index].collapsed) {
                            // Si la cell n'est pas vide, alors on la laisse telle quelle.
                            nextGrid[index] = sketch.grid[index];
                        } else {
                            // Si la cell est vide, alors on lui attribue.

                            // Création d'un tableau avec les index de toutes les tiles.
                            let options = new Array(tiles.length)
                                .fill(0)
                                .map((x, i) => i);

                            // UP.
                            if (line > 0) {
                                let up =
                                    sketch.grid[
                                        column + (line - 1) * sketch.height
                                    ];
                                let validOptions: any[] = [];

                                for (let option of up.options) {
                                    let valid = tiles[option].down;
                                    validOptions = validOptions.concat(valid);
                                }

                                checkValid(options, validOptions);
                            }

                            // RIGHT.
                            if (column < sketch.width - 1) {
                                let right =
                                    sketch.grid[
                                        column + 1 + line * sketch.height
                                    ];
                                let validOptions: any[] = [];
                                for (let option of right.options) {
                                    let valid = tiles[option].left;
                                    validOptions = validOptions.concat(valid);
                                }
                                checkValid(options, validOptions);
                            }

                            // DOWN.
                            if (line < sketch.height - 1) {
                                let down =
                                    sketch.grid[
                                        column + (line + 1) * sketch.height
                                    ];
                                let validOptions: any[] = [];
                                for (let option of down.options) {
                                    let valid = tiles[option].up;
                                    validOptions = validOptions.concat(valid);
                                }
                                checkValid(options, validOptions);
                            }

                            // LEFT.
                            if (column > 0) {
                                let left =
                                    sketch.grid[
                                        column - 1 + line * sketch.height
                                    ];
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

                sketch.grid = nextGrid;
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
