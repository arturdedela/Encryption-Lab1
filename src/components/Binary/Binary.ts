import { observable, reaction } from "mobx";


export class Binary {
    public static binaryRegexp = /^[01]*$/;

    public static toBinaryString(value: number) {
        return (value >>> 0).toString(2);
    }

    public static toNumber(value: string) {
        // Before a bitwise operation is performed, JavaScript converts numbers to 32 bits signed integers.
        return parseInt(value, 2) << 0;
    }

    @observable private binary: string;
    @observable private integer: number;

    public set value(v: string | number) {
        if (typeof v === "string") {
            this.binary = v;
        } else if (typeof v === "number") {
            this.integer = v;
        } else {
            throw new TypeError();
        }
    }

    constructor(value: string | number = 0) {
        reaction(() => this.integer, integer => {
            this.binary = Binary.toBinaryString(integer);
        });
        // Think how to get rid of redundant reaction.
        // Change binary => Reaction change integer => Reaction change binary (binary doesn't change) => End;
        reaction(() => this.binary, binary => {
            this.integer = Binary.toNumber(binary);
        });

        this.value = value;
    }

    public getBit(i: number) {
        return (this.integer >> i) & 1;
    }

    public enableBit(i: number) {
        this.integer |= (1 << i);

        return this.binary;
    }

    public disableBit(i: number) {
        this.integer &= ~(1 << i);

        return this.binary;
    }

    public swapBits(i: number, j: number) {
        // Check that bits differs, otherwise swap not needed
        if (((this.integer >> i) & 1) !== ((this.integer >> j) & 1)) {
            this.integer ^= (1 << i) | (1 << j);
        }

        return this.binary;
    }

    public resetBits(n: number) {
        this.integer = this.integer >> n << n;

        return this.binary;
    }

    public getOuterBits(msbCnt: number, lsbCnt: number) {
        return this.binary.substr(0, msbCnt) + this.binary.substr(-lsbCnt);
    }

    public getInnerBits(msbCnt: number, lsbCnt: number) {
        return this.binary.substring(msbCnt, this.binary.length - lsbCnt);
    }

    public toString(): string {
        return this.binary;
    }

    public valueOf(): number {
        return this.integer;
    }
}

