import Cell from "./Cell";
import * as p5 from "p5";
import Tile, { TileSetJSON } from "./Tile";

class Sketch {
    width: number;
    height: number;
    grid: Cell[];
    tiles: Tile[];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.grid = [];
        this.tiles = [];
    }

    public loadTilesFormJSON(json: TileSetJSON): void {
        try {
            this.tiles = Tile.getTilesFromJSON(json as TileSetJSON);
        } catch {
            this.tiles = [];
        }
    }

    /**
     * Creates cell grid.
     * @param tilesNumber Number of tiles.
     * @returns Cell grid.
     */
    public createGrid() {
        this.grid = [];

        if (this.tiles.length > 0) {
            for (let i = 0; i < this.getDimension(); i++) {
                this.grid[i] = new Cell(this.tiles.length);
            }
        }
    }

    public isGridFilled(): boolean {
        return this.getEmptyCells().length === 0;
    }

    public getEmptyCells(): Cell[] {
        let gridCopy: Cell[] = this.grid.slice();
        let emptyCells: Cell[] = gridCopy.filter((a) => !a.collapsed);
        return emptyCells;
    }

    public checkValid(arr: number[], valid: number[]): void {
        for (let i = arr.length - 1; i >= 0; i--) {
            let element = arr[i];
            if (!valid.includes(element)) {
                arr.splice(i, 1);
            }
        }
    }

    public defineNextTileToDraw(p: p5): boolean {
        let isNextTileDefined = true;
        let emptyCells: Cell[] = this.getEmptyCells();

        // Sort empty cells in ascending order of number of tile options.
        emptyCells.sort((a, b) => {
            return a.options.length - b.options.length;
        });

        // Number of options in the empty cell with the fewest options.
        let len = emptyCells[0].options.length;

        // Number of cells with the same minimum number of options.
        let stopIndex = 0;

        for (let i = 1; i < emptyCells.length; i++) {
            if (emptyCells[i].options.length > len) {
                stopIndex = i;
                break;
            }
        }

        // Deletes all cells with a non-minimal number of options.
        if (stopIndex > 0) emptyCells.splice(stopIndex);

        // Random selection of the next cell from those with a minimum number of options.
        const cell = p.random(emptyCells);
        cell.collapsed = true;

        // Random selection of the cell tile.
        const pick = p.random(cell.options);

        if (pick === undefined) {
            // If no tile is available, we rebuild the grid.
            this.createGrid();
            isNextTileDefined = false;
        } else {
            // The cell now has only one tile, the selected one.
            cell.options = [pick];
        }

        return isNextTileDefined;
    }

    public createNextGrid() {
        // Construction de la prochaine grille.
        const nextGrid = [];
        for (let line = 0; line < this.height; line++) {
            for (let column = 0; column < this.width; column++) {
                let index = line * this.width + column;

                if (this.grid[index].collapsed) {
                    // Si la cell n'est pas vide, alors on la laisse telle quelle.
                    nextGrid[index] = this.grid[index];
                } else {
                    // Si la cell est vide, alors on lui attribue.

                    // Création d'un tableau avec les index de toutes les tiles.
                    let options = new Array(this.tiles.length)
                        .fill(0)
                        .map((x, i) => i);

                    // UP.
                    if (line > 0) {
                        let up = this.grid[(line - 1) * this.width + column];
                        let validOptions: any[] = [];

                        for (let option of up.options) {
                            let valid = this.tiles[option].down;
                            validOptions = validOptions.concat(valid);
                        }

                        this.checkValid(options, validOptions);
                    }

                    // RIGHT.
                    if (column < this.width - 1) {
                        let right = this.grid[line * this.width + (column + 1)];
                        let validOptions: any[] = [];

                        for (let option of right.options) {
                            let valid = this.tiles[option].left;
                            validOptions = validOptions.concat(valid);
                        }

                        this.checkValid(options, validOptions);
                    }

                    // DOWN.
                    if (line < this.height - 1) {
                        let down = this.grid[(line + 1) * this.width + column];
                        let validOptions: any[] = [];

                        for (let option of down.options) {
                            let valid = this.tiles[option].up;
                            validOptions = validOptions.concat(valid);
                        }

                        this.checkValid(options, validOptions);
                    }

                    // LEFT.
                    if (column > 0) {
                        let left = this.grid[line * this.width + (column - 1)];
                        let validOptions: any[] = [];

                        for (let option of left.options) {
                            let valid = this.tiles[option].right;
                            validOptions = validOptions.concat(valid);
                        }

                        this.checkValid(options, validOptions);
                    }

                    nextGrid[index] = new Cell(options);
                }
            }
        }

        this.grid = nextGrid;
    }

    public getDimension(): number {
        return this.width * this.height;
    }
}

export default Sketch;
