import p5 from "p5";

function reverseString(s: string): string {
    let arr = s.split("");
    arr = arr.reverse();
    return arr.join("");
}

function compareEdge(a: string, b: string): boolean {
    return a === reverseString(b);
}

class Tile {
    img: p5.Image;
    edges: string[];
    up: number[];
    right: number[];
    down: number[];
    left: number[];
    index?: number;

    constructor(img: p5.Image, edges: string[], i?: number) {
        this.img = img;
        this.edges = edges;
        this.up = [];
        this.right = [];
        this.down = [];
        this.left = [];

        if (i !== undefined) {
            this.index = i;
        }
    }

    analyze(tiles: Tile[]): void {
        for (let i = 0; i < tiles.length; i++) {
            let tile = tiles[i];

            // Tile 5 can't match itself
            if (tile.index === 5 && this.index === 5) continue;

            // UP
            if (compareEdge(tile.edges[2], this.edges[0])) {
                this.up.push(i);
            }
            // RIGHT
            if (compareEdge(tile.edges[3], this.edges[1])) {
                this.right.push(i);
            }
            // DOWN
            if (compareEdge(tile.edges[0], this.edges[2])) {
                this.down.push(i);
            }
            // LEFT
            if (compareEdge(tile.edges[1], this.edges[3])) {
                this.left.push(i);
            }
        }
    }

    rotate(num: number): Tile {
        const w = this.img.width;
        const h = this.img.height;
        const tempCanvas = document.createElement("canvas");
        const tempP5 = new p5(() => {}, tempCanvas); // Création d'une instance temporaire de p5

        tempP5.createCanvas(w, h);
        tempP5.image(this.img, 0, 0);

        const halfPi = Math.PI / 2; // Demi-pi

        tempP5.push(); // Sauvegarde de l'état de transformation actuel
        tempP5.translate(w / 2, h / 2);
        tempP5.rotate(halfPi * num);
        tempP5.image(this.img, -w / 2, -h / 2);
        tempP5.pop(); // Restauration de l'état de transformation sauvegardé

        const newImg = tempP5.get(); // Récupération de l'image transformée

        return new Tile(newImg, this.rotateEdges(num), this.index);
    }

    private rotateEdges(num: number): string[] {
        const len = this.edges.length;
        const rotatedEdges: string[] = [];
        for (let i = 0; i < len; i++) {
            rotatedEdges[i] = this.edges[(i - num + len) % len];
        }
        return rotatedEdges;
    }
}

export default Tile;
