import { IEncryptionAlgorithm } from "./IEncryptionAlgorithm";

export enum DesMode {
    ECB,
    CBC,
    CFB,
    OFB
}

interface IDesOptions {
    desMode: DesMode;
}

type DesModeFunc = (block: bigint, encrypt: boolean) => bigint;

export class DES implements IEncryptionAlgorithm {
    public key: string;
    public onProgress: (ready: number, total: number) => void;

    private readonly blockSizeBytes = 8; // 64 bit / 8 bit = 8 bytes
    private readonly generatedKeyLength = 24;

    private readonly spfunction1 = [0x1010400, 0, 0x10000, 0x1010404, 0x1010004, 0x10404, 0x4, 0x10000, 0x400, 0x1010400, 0x1010404, 0x400, 0x1000404, 0x1010004, 0x1000000, 0x4, 0x404, 0x1000400, 0x1000400, 0x10400, 0x10400, 0x1010000, 0x1010000, 0x1000404, 0x10004, 0x1000004, 0x1000004, 0x10004, 0, 0x404, 0x10404, 0x1000000, 0x10000, 0x1010404, 0x4, 0x1010000, 0x1010400, 0x1000000, 0x1000000, 0x400, 0x1010004, 0x10000, 0x10400, 0x1000004, 0x400, 0x4, 0x1000404, 0x10404, 0x1010404, 0x10004, 0x1010000, 0x1000404, 0x1000004, 0x404, 0x10404, 0x1010400, 0x404, 0x1000400, 0x1000400, 0, 0x10004, 0x10400, 0, 0x1010004];
    private readonly spfunction2 = [-0x7fef7fe0, -0x7fff8000, 0x8000, 0x108020, 0x100000, 0x20, -0x7fefffe0, -0x7fff7fe0, -0x7fffffe0, -0x7fef7fe0, -0x7fef8000, -0x80000000, -0x7fff8000, 0x100000, 0x20, -0x7fefffe0, 0x108000, 0x100020, -0x7fff7fe0, 0, -0x80000000, 0x8000, 0x108020, -0x7ff00000, 0x100020, -0x7fffffe0, 0, 0x108000, 0x8020, -0x7fef8000, -0x7ff00000, 0x8020, 0, 0x108020, -0x7fefffe0, 0x100000, -0x7fff7fe0, -0x7ff00000, -0x7fef8000, 0x8000, -0x7ff00000, -0x7fff8000, 0x20, -0x7fef7fe0, 0x108020, 0x20, 0x8000, -0x80000000, 0x8020, -0x7fef8000, 0x100000, -0x7fffffe0, 0x100020, -0x7fff7fe0, -0x7fffffe0, 0x100020, 0x108000, 0, -0x7fff8000, 0x8020, -0x80000000, -0x7fefffe0, -0x7fef7fe0, 0x108000];
    private readonly spfunction3 = [0x208, 0x8020200, 0, 0x8020008, 0x8000200, 0, 0x20208, 0x8000200, 0x20008, 0x8000008, 0x8000008, 0x20000, 0x8020208, 0x20008, 0x8020000, 0x208, 0x8000000, 0x8, 0x8020200, 0x200, 0x20200, 0x8020000, 0x8020008, 0x20208, 0x8000208, 0x20200, 0x20000, 0x8000208, 0x8, 0x8020208, 0x200, 0x8000000, 0x8020200, 0x8000000, 0x20008, 0x208, 0x20000, 0x8020200, 0x8000200, 0, 0x200, 0x20008, 0x8020208, 0x8000200, 0x8000008, 0x200, 0, 0x8020008, 0x8000208, 0x20000, 0x8000000, 0x8020208, 0x8, 0x20208, 0x20200, 0x8000008, 0x8020000, 0x8000208, 0x208, 0x8020000, 0x20208, 0x8, 0x8020008, 0x20200];
    private readonly spfunction4 = [0x802001, 0x2081, 0x2081, 0x80, 0x802080, 0x800081, 0x800001, 0x2001, 0, 0x802000, 0x802000, 0x802081, 0x81, 0, 0x800080, 0x800001, 0x1, 0x2000, 0x800000, 0x802001, 0x80, 0x800000, 0x2001, 0x2080, 0x800081, 0x1, 0x2080, 0x800080, 0x2000, 0x802080, 0x802081, 0x81, 0x800080, 0x800001, 0x802000, 0x802081, 0x81, 0, 0, 0x802000, 0x2080, 0x800080, 0x800081, 0x1, 0x802001, 0x2081, 0x2081, 0x80, 0x802081, 0x81, 0x1, 0x2000, 0x800001, 0x2001, 0x802080, 0x800081, 0x2001, 0x2080, 0x800000, 0x802001, 0x80, 0x800000, 0x2000, 0x802080];
    private readonly spfunction5 = [0x100, 0x2080100, 0x2080000, 0x42000100, 0x80000, 0x100, 0x40000000, 0x2080000, 0x40080100, 0x80000, 0x2000100, 0x40080100, 0x42000100, 0x42080000, 0x80100, 0x40000000, 0x2000000, 0x40080000, 0x40080000, 0, 0x40000100, 0x42080100, 0x42080100, 0x2000100, 0x42080000, 0x40000100, 0, 0x42000000, 0x2080100, 0x2000000, 0x42000000, 0x80100, 0x80000, 0x42000100, 0x100, 0x2000000, 0x40000000, 0x2080000, 0x42000100, 0x40080100, 0x2000100, 0x40000000, 0x42080000, 0x2080100, 0x40080100, 0x100, 0x2000000, 0x42080000, 0x42080100, 0x80100, 0x42000000, 0x42080100, 0x2080000, 0, 0x40080000, 0x42000000, 0x80100, 0x2000100, 0x40000100, 0x80000, 0, 0x40080000, 0x2080100, 0x40000100];
    private readonly spfunction6 = [0x20000010, 0x20400000, 0x4000, 0x20404010, 0x20400000, 0x10, 0x20404010, 0x400000, 0x20004000, 0x404010, 0x400000, 0x20000010, 0x400010, 0x20004000, 0x20000000, 0x4010, 0, 0x400010, 0x20004010, 0x4000, 0x404000, 0x20004010, 0x10, 0x20400010, 0x20400010, 0, 0x404010, 0x20404000, 0x4010, 0x404000, 0x20404000, 0x20000000, 0x20004000, 0x10, 0x20400010, 0x404000, 0x20404010, 0x400000, 0x4010, 0x20000010, 0x400000, 0x20004000, 0x20000000, 0x4010, 0x20000010, 0x20404010, 0x404000, 0x20400000, 0x404010, 0x20404000, 0, 0x20400010, 0x10, 0x4000, 0x20400000, 0x404010, 0x4000, 0x400010, 0x20004010, 0, 0x20404000, 0x20000000, 0x400010, 0x20004010];
    private readonly spfunction7 = [0x200000, 0x4200002, 0x4000802, 0, 0x800, 0x4000802, 0x200802, 0x4200800, 0x4200802, 0x200000, 0, 0x4000002, 0x2, 0x4000000, 0x4200002, 0x802, 0x4000800, 0x200802, 0x200002, 0x4000800, 0x4000002, 0x4200000, 0x4200800, 0x200002, 0x4200000, 0x800, 0x802, 0x4200802, 0x200800, 0x2, 0x4000000, 0x200800, 0x4000000, 0x200800, 0x200000, 0x4000802, 0x4000802, 0x4200002, 0x4200002, 0x2, 0x200002, 0x4000000, 0x4000800, 0x200000, 0x4200800, 0x802, 0x200802, 0x4200800, 0x802, 0x4000002, 0x4200802, 0x4200000, 0x200800, 0, 0x2, 0x4200802, 0, 0x200802, 0x4200000, 0x800, 0x4000002, 0x4000800, 0x800, 0x200002];
    private readonly spfunction8 = [0x10001040, 0x1000, 0x40000, 0x10041040, 0x10000000, 0x10001040, 0x40, 0x10000000, 0x40040, 0x10040000, 0x10041040, 0x41000, 0x10041000, 0x41040, 0x1000, 0x40, 0x10040000, 0x10000040, 0x10001000, 0x1040, 0x41000, 0x40040, 0x10040040, 0x10041000, 0x1040, 0, 0, 0x10040040, 0x10000040, 0x10001000, 0x41040, 0x40000, 0x41040, 0x40000, 0x10041000, 0x1000, 0x40, 0x10040040, 0x1000, 0x41040, 0x10001000, 0x40, 0x10000040, 0x10040000, 0x10040040, 0x10000000, 0x40000, 0x10001040, 0, 0x10041040, 0x40040, 0x10000040, 0x10040000, 0x10001000, 0x10001040, 0, 0x10041040, 0x41000, 0x41000, 0x1040, 0x1040, 0x40040, 0x10000000, 0x10041000];

    private keys: number[];
    private iterations: number;
    private looping: number[];
    private readonly iv = BigInt(0xEB2B1E8F);
    private prevBlock: bigint;

    private modes: DesModeFunc[] = [
        this.ecb.bind(this),
        this.cbc.bind(this),
        this.cfb.bind(this),
        this.ofb.bind(this)
    ];

    public encrypt(data: ArrayBuffer, options: IDesOptions): ArrayBuffer {
        return this.des(this.key, data, true, options.desMode);
    }

    public decrypt(data: ArrayBuffer, options: IDesOptions): ArrayBuffer {
        return this.des(this.key, data, false, options.desMode);
    }

    public generateKey(): string {
        let key = "";
        while (key.length < this.generatedKeyLength) {
            key += Math.random().toString(16).substring(2);
        }

        return key.substring(0, this.generatedKeyLength);
    }

    public isValidKey(key: string): boolean {
        return key.length === 8 || key.length === 24;
    }

    public setEncryptKey(key: string): void {
        this.key = key;
    }

    private padBuffer(b: ArrayBuffer) {
        const paddedSize = b.byteLength + this.blockSizeBytes - (b.byteLength % this.blockSizeBytes);
        const newBuf = new ArrayBuffer(paddedSize);
        new Uint8Array(newBuf).set(new Uint8Array(b));

        return newBuf;
    }

    private des(key: string, message: ArrayBuffer, encrypt: boolean, mode: DesMode = DesMode.ECB) {
        // create the 16 or 48 subkeys we will need
        this.keys = this.createKeys(key);

        // set up the loops for single and triple des
        this.iterations = this.keys.length === 32 ? 3 : 9; // single or triple des
        if (this.iterations === 3) {
            this.looping = encrypt ? [0, 32, 2] : [30, -2, -2];
        } else {
            this.looping = encrypt ? [0, 32, 2, 62, 30, -2, 64, 96, 2] : [94, 62, -2, 32, 64, 2, 30, -2, -2];
        }

        const plainText = this.padBuffer(message);
        const plainView = new DataView(plainText);
        const cipherText = new ArrayBuffer(plainText.byteLength);
        const cipherView = new DataView(cipherText);
        this.prevBlock = this.iv;

        for (let i = 0; i < plainText.byteLength; i += this.blockSizeBytes) {
            const plainBlock = plainView.getBigUint64(i);
            const encodedBlock = this.modes[mode](plainBlock, encrypt);

            cipherView.setBigUint64(i, encodedBlock);

            if (this.onProgress) {
                this.onProgress(i, plainText.byteLength);
            }
        }

        return cipherText;
    }

    private ecb(block: bigint, encrypt: boolean) {
        return this.encodeBlock(block);
    }

    private cbc(block: bigint, encrypt: boolean) {
        if (encrypt) {
            return this.prevBlock = this.encodeBlock(block ^ this.prevBlock);
        }

        const decrypted = this.encodeBlock(block) ^ this.prevBlock;
        this.prevBlock = block;

        return decrypted;
    }


    private cfb(block: bigint, encrypt: boolean) {
        if (encrypt) {
            return this.prevBlock = this.encodeBlock(block ^ this.prevBlock);
        }

        const decrypted = this.encodeBlock(block) ^ this.prevBlock;
        this.prevBlock = block;

        return decrypted;
    }

    private ofb(block: bigint, encrypt: boolean) {
        if (encrypt) {
            return this.prevBlock = this.encodeBlock(block ^ this.prevBlock);
        }

        const decrypted = this.encodeBlock(block) ^ this.prevBlock;
        this.prevBlock = block;

        return decrypted;
    }

    private encodeBlock(block: bigint): bigint {
        const v = new DataView(new ArrayBuffer(this.blockSizeBytes));
        v.setBigUint64(0, block);
        let left = v.getUint32(0);
        let right = v.getUint32(4);

        let temp;

        // first each 64 bit chunk of the message must be permuted according to IP
        temp = ((left >>> 4) ^ right) & 0x0f0f0f0f; right ^= temp; left ^= (temp << 4);
        temp = ((left >>> 16) ^ right) & 0x0000ffff; right ^= temp; left ^= (temp << 16);
        temp = ((right >>> 2) ^ left) & 0x33333333; left ^= temp; right ^= (temp << 2);
        temp = ((right >>> 8) ^ left) & 0x00ff00ff; left ^= temp; right ^= (temp << 8);
        temp = ((left >>> 1) ^ right) & 0x55555555; right ^= temp; left ^= (temp << 1);

        left = ((left << 1) | (left >>> 31));
        right = ((right << 1) | (right >>> 31));

        // do this either 1 or 3 times for each chunk of the message
        for (let j = 0; j < this.iterations; j += 3) {
            const endloop = this.looping[j + 1];
            const loopinc = this.looping[j + 2];
            // now go through and perform the encryption or decryption
            for (let i = this.looping[j]; i !== endloop; i += loopinc) { // for efficiency
                const right1 = right ^ this.keys[i];
                const right2 = ((right >>> 4) | (right << 28)) ^ this.keys[i + 1];
                // the result is attained by passing these bytes through the S selection functions
                temp = left;
                left = right;
                right = temp ^ (this.spfunction2[(right1 >>> 24) & 0x3f] | this.spfunction4[(right1 >>> 16) & 0x3f]
                    | this.spfunction6[(right1 >>>  8) & 0x3f] | this.spfunction8[right1 & 0x3f]
                    | this.spfunction1[(right2 >>> 24) & 0x3f] | this.spfunction3[(right2 >>> 16) & 0x3f]
                    | this.spfunction5[(right2 >>>  8) & 0x3f] | this.spfunction7[right2 & 0x3f]);
            }
            temp = left; left = right; right = temp; // unreverse left and right
        } // for either 1 or 3 iterations

        // move then each one bit to the right
        left = ((left >>> 1) | (left << 31));
        right = ((right >>> 1) | (right << 31));

        // now perform IP-1, which is IP in the opposite direction
        temp = ((left >>> 1) ^ right) & 0x55555555; right ^= temp; left ^= (temp << 1);
        temp = ((right >>> 8) ^ left) & 0x00ff00ff; left ^= temp; right ^= (temp << 8);
        temp = ((right >>> 2) ^ left) & 0x33333333; left ^= temp; right ^= (temp << 2);
        temp = ((left >>> 16) ^ right) & 0x0000ffff; right ^= temp; left ^= (temp << 16);
        temp = ((left >>> 4) ^ right) & 0x0f0f0f0f; right ^= temp; left ^= (temp << 4);

        v.setUint32(0, left);
        v.setUint32(4, right);

        return v.getBigUint64(0);
    }

    // this takes as input a 64 bit key (even though only 56 bits are used)
    // as an array of 2 integers, and returns 16 48 bit keys
    private createKeys(key: string) {
        // declaring this locally speeds things up a bit
        const pc2bytes0  = [0, 0x4, 0x20000000, 0x20000004, 0x10000, 0x10004, 0x20010000, 0x20010004, 0x200, 0x204, 0x20000200, 0x20000204, 0x10200, 0x10204, 0x20010200, 0x20010204];
        const pc2bytes1  = [0, 0x1, 0x100000, 0x100001, 0x4000000, 0x4000001, 0x4100000, 0x4100001, 0x100, 0x101, 0x100100, 0x100101, 0x4000100, 0x4000101, 0x4100100, 0x4100101];
        const pc2bytes2  = [0, 0x8, 0x800, 0x808, 0x1000000, 0x1000008, 0x1000800, 0x1000808, 0, 0x8, 0x800, 0x808, 0x1000000, 0x1000008, 0x1000800, 0x1000808];
        const pc2bytes3  = [0, 0x200000, 0x8000000, 0x8200000, 0x2000, 0x202000, 0x8002000, 0x8202000, 0x20000, 0x220000, 0x8020000, 0x8220000, 0x22000, 0x222000, 0x8022000, 0x8222000];
        const pc2bytes4  = [0, 0x40000, 0x10, 0x40010, 0, 0x40000, 0x10, 0x40010, 0x1000, 0x41000, 0x1010, 0x41010, 0x1000, 0x41000, 0x1010, 0x41010];
        const pc2bytes5  = [0, 0x400, 0x20, 0x420, 0, 0x400, 0x20, 0x420, 0x2000000, 0x2000400, 0x2000020, 0x2000420, 0x2000000, 0x2000400, 0x2000020, 0x2000420];
        const pc2bytes6  = [0, 0x10000000, 0x80000, 0x10080000, 0x2, 0x10000002, 0x80002, 0x10080002, 0, 0x10000000, 0x80000, 0x10080000, 0x2, 0x10000002, 0x80002, 0x10080002];
        const pc2bytes7  = [0, 0x10000, 0x800, 0x10800, 0x20000000, 0x20010000, 0x20000800, 0x20010800, 0x20000, 0x30000, 0x20800, 0x30800, 0x20020000, 0x20030000, 0x20020800, 0x20030800];
        const pc2bytes8  = [0, 0x40000, 0, 0x40000, 0x2, 0x40002, 0x2, 0x40002, 0x2000000, 0x2040000, 0x2000000, 0x2040000, 0x2000002, 0x2040002, 0x2000002, 0x2040002];
        const pc2bytes9  = [0, 0x10000000, 0x8, 0x10000008, 0, 0x10000000, 0x8, 0x10000008, 0x400, 0x10000400, 0x408, 0x10000408, 0x400, 0x10000400, 0x408, 0x10000408];
        const pc2bytes10 = [0, 0x20, 0, 0x20, 0x100000, 0x100020, 0x100000, 0x100020, 0x2000, 0x2020, 0x2000, 0x2020, 0x102000, 0x102020, 0x102000, 0x102020];
        const pc2bytes11 = [0, 0x1000000, 0x200, 0x1000200, 0x200000, 0x1200000, 0x200200, 0x1200200, 0x4000000, 0x5000000, 0x4000200, 0x5000200, 0x4200000, 0x5200000, 0x4200200, 0x5200200];
        const pc2bytes12 = [0, 0x1000, 0x8000000, 0x8001000, 0x80000, 0x81000, 0x8080000, 0x8081000, 0x10, 0x1010, 0x8000010, 0x8001010, 0x80010, 0x81010, 0x8080010, 0x8081010];
        const pc2bytes13 = [0, 0x4, 0x100, 0x104, 0, 0x4, 0x100, 0x104, 0x1, 0x5, 0x101, 0x105, 0x1, 0x5, 0x101, 0x105];

        // how many iterations (1 for des, 3 for triple des)
        const iterations = key.length > 8 ? 3 : 1; // changed by Paul 16/6/2007 to use Triple DES for 9+ byte keys
        // stores the return keys
        const keys = new Array (32 * iterations);
        // now define the left shifts which need to be done
        const shifts = [0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0];
        // other variables
        let lefttemp, righttemp, m = 0, n = 0, temp;

        for (let j = 0; j < iterations; j++) { // either 1 or 3 iterations
            let left = (key.charCodeAt(m++) << 24) | (key.charCodeAt(m++) << 16) | (key.charCodeAt(m++) << 8) | key.charCodeAt(m++);
            let right = (key.charCodeAt(m++) << 24) | (key.charCodeAt(m++) << 16) | (key.charCodeAt(m++) << 8) | key.charCodeAt(m++);

            temp = ((left >>> 4) ^ right) & 0x0f0f0f0f; right ^= temp; left ^= (temp << 4);
            temp = ((right >>> -16) ^ left) & 0x0000ffff; left ^= temp; right ^= (temp << -16);
            temp = ((left >>> 2) ^ right) & 0x33333333; right ^= temp; left ^= (temp << 2);
            temp = ((right >>> -16) ^ left) & 0x0000ffff; left ^= temp; right ^= (temp << -16);
            temp = ((left >>> 1) ^ right) & 0x55555555; right ^= temp; left ^= (temp << 1);
            temp = ((right >>> 8) ^ left) & 0x00ff00ff; left ^= temp; right ^= (temp << 8);
            temp = ((left >>> 1) ^ right) & 0x55555555; right ^= temp; left ^= (temp << 1);

            // the right side needs to be shifted and to get the last four bits of the left side
            temp = (left << 8) | ((right >>> 20) & 0x000000f0);
            // left needs to be put upside down
            left = (right << 24) | ((right << 8) & 0xff0000) | ((right >>> 8) & 0xff00) | ((right >>> 24) & 0xf0);
            right = temp;

            // now go through and perform these shifts on the left and right keys
            for (const shift of shifts) {
                // shift the keys either one or two bits to the left
                if (shift) {
                    left = (left << 2) | (left >>> 26);
                    right = (right << 2) | (right >>> 26);
                }
                else {
                    left = (left << 1) | (left >>> 27);
                    right = (right << 1) | (right >>> 27);
                }
                left &= -0xf;
                right &= -0xf;

                // now apply PC-2, in such a way that E is easier when encrypting or decrypting
                // this conversion will look like PC-2 except only the last 6 bits of each byte are used
                // rather than 48 consecutive bits and the order of lines will be according to
                // how the S selection functions will be applied: S2, S4, S6, S8, S1, S3, S5, S7
                lefttemp = pc2bytes0[left >>> 28] | pc2bytes1[(left >>> 24) & 0xf]
                    | pc2bytes2[(left >>> 20) & 0xf] | pc2bytes3[(left >>> 16) & 0xf]
                    | pc2bytes4[(left >>> 12) & 0xf] | pc2bytes5[(left >>> 8) & 0xf]
                    | pc2bytes6[(left >>> 4) & 0xf];
                righttemp = pc2bytes7[right >>> 28] | pc2bytes8[(right >>> 24) & 0xf]
                    | pc2bytes9[(right >>> 20) & 0xf] | pc2bytes10[(right >>> 16) & 0xf]
                    | pc2bytes11[(right >>> 12) & 0xf] | pc2bytes12[(right >>> 8) & 0xf]
                    | pc2bytes13[(right >>> 4) & 0xf];
                temp = ((righttemp >>> 16) ^ lefttemp) & 0x0000ffff;
                keys[n++] = lefttemp ^ temp;
                keys[n++] = righttemp ^ (temp << 16);
            }
        }

        return keys;
    }
}