import Cell from "./Cell";

class Sketch {
    width: number;
    height: number;
    grid: Cell[];

    constructor(width: number, height: number) {
        console.log("Test");
        this.width = width;
        this.height = height;
        this.grid = [];
    }

    /**
     * Creates cell grid.
     * @param tilesNumber Number of tiles.
     * @returns Cell grid.
     */
    public createGrid(tilesNumber: number) {
        this.grid = [];

        for (let i = 0; i < this.getDimension(); i++) {
            this.grid[i] = new Cell(tilesNumber);
        }
    }

    public checkValid(arr: number[], valid: number[]): void {
        for (let i = arr.length - 1; i >= 0; i--) {
            let element = arr[i];
            if (!valid.includes(element)) {
                arr.splice(i, 1);
            }
        }
    }

    public getDimension(): number {
        return this.width * this.height;
    }
}

export default Sketch;
