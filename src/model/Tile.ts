export interface TileSetJSON {
    folder: string;
    path: string;
    tiles: TileJSON[];
}

interface TileJSON {
    name: string;
    image: string;
    constraints: [string, string, string, string];
}

/**
 * Tile of a cell.
 */
export default class Tile {
    imagePath: string;
    edges: string[];
    up: number[];
    right: number[];
    down: number[];
    left: number[];
    index?: number;

    constructor(imagePath: string, edges: string[], index?: number) {
        this.imagePath = imagePath;
        this.edges = edges;
        this.up = [];
        this.right = [];
        this.down = [];
        this.left = [];

        if (index !== undefined) {
            this.index = index;
        }
    }

    /**
     * Get tiles from JSON file.
     * @param json JSON file content.
     * @returns Tile set.
     */
    static getTilesFromJSON(json: TileSetJSON): Tile[] {
        let tiles: Tile[] = [];

        try {
            const tilesNumber = json.tiles.length;
            const path = json.path;

            for (let i = 0; i < tilesNumber; i++) {
                const tile = json.tiles[i];
                const imagePath = `${path}/${tile.image}`;

                tiles[i] = new Tile(imagePath, tile.constraints);
            }

            // Defines the possible neighbors for each tile.
            for (let i = 0; i < tiles.length; i++) {
                const tile = tiles[i];
                tile.analyze(tiles);
            }
        } catch {
            throw SyntaxError("Syntax error in the tileset JSON file.");
        }

        return tiles;
    }

    /**
     * Select the available neighbors of the tile.
     * @param tiles Tiles to filter.
     */
    analyze(tiles: Tile[]): void {
        for (let i = 0; i < tiles.length; i++) {
            let tile = tiles[i];

            // UP
            if (this.compareEdge(tile.edges[2], this.edges[0])) {
                this.up.push(i);
            }
            // RIGHT
            if (this.compareEdge(tile.edges[3], this.edges[1])) {
                this.right.push(i);
            }
            // DOWN
            if (this.compareEdge(tile.edges[0], this.edges[2])) {
                this.down.push(i);
            }
            // LEFT
            if (this.compareEdge(tile.edges[1], this.edges[3])) {
                this.left.push(i);
            }
        }
    }

    // rotate(num: number): Tile {
    //     const w = this.imagePathwidth;
    //     const h = this.imagePathheight;
    //     const tempCanvas = document.createElement("canvas");
    //     const tempP5 = new p5(() => {}, tempCanvas); // Création d'une instance temporaire de p5

    //     tempP5.createCanvas(w, h);
    //     tempstring(this.imagePath 0, 0);

    //     const halfPi = Math.PI / 2; // Demi-pi

    //     tempP5.push(); // Sauvegarde de l'état de transformation actuel
    //     tempP5.translate(w / 2, h / 2);
    //     tempP5.rotate(halfPi * num);
    //     tempstring(this.imagePath -w / 2, -h / 2);
    //     tempP5.pop(); // Restauration de l'état de transformation sauvegardé

    //     const newimagePath= tempP5.get(); // Récupération de l'image transformée

    //     return new Tile(newimagePath this.rotateEdges(num), this.index);
    // }

    private rotateEdges(num: number): string[] {
        const len = this.edges.length;
        const rotatedEdges: string[] = [];
        for (let i = 0; i < len; i++) {
            rotatedEdges[i] = this.edges[(i - num + len) % len];
        }
        return rotatedEdges;
    }

    private compareEdge(a: string, b: string): boolean {
        return a === b;
    }
}
