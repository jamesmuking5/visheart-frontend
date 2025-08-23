// Test file for RLE encoding/decoding functionality
import { rleDecodeToArray, rleEncodeFromArray } from './decode-RLE(test)';

export function testRLEEncoding() {
    console.log("Testing RLE encoding/decoding...");

    // Test 1: Simple case with a few pixels
    const testMask1 = new Uint8Array(100); // 10x10 mask
    testMask1[10] = 1;
    testMask1[11] = 1;
    testMask1[12] = 1;
    testMask1[50] = 1;
    testMask1[51] = 1;

    const encoded1 = rleEncodeFromArray(testMask1);
    console.log("Test 1 - Original mask has pixels at:", Array.from(testMask1).map((val, idx) => val === 1 ? idx : null).filter(idx => idx !== null));
    console.log("Test 1 - Encoded RLE:", encoded1);

    const decoded1 = rleDecodeToArray(encoded1, 10, 10);
    console.log("Test 1 - Decoded mask has pixels at:", Array.from(decoded1).map((val, idx) => val === 1 ? idx : null).filter(idx => idx !== null));
    console.log("Test 1 - Round trip successful:", arraysEqual(testMask1, decoded1));

    // Test 2: Empty mask
    const testMask2 = new Uint8Array(25); // 5x5 mask, all zeros
    const encoded2 = rleEncodeFromArray(testMask2);
    console.log("Test 2 - Empty mask encoded:", encoded2);

    const decoded2 = rleDecodeToArray(encoded2, 5, 5);
    console.log("Test 2 - Empty mask round trip successful:", arraysEqual(testMask2, decoded2));

    // Test 3: Full mask
    const testMask3 = new Uint8Array(25).fill(1); // 5x5 mask, all ones
    const encoded3 = rleEncodeFromArray(testMask3);
    console.log("Test 3 - Full mask encoded:", encoded3);

    const decoded3 = rleDecodeToArray(encoded3, 5, 5);
    console.log("Test 3 - Full mask round trip successful:", arraysEqual(testMask3, decoded3));
}

function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}
