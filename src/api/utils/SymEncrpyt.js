
import Buffer from 'buffer';

const blob = new Blob(['hello world']);
console.log(blob); // 👉️ Blob { size: 11, type: '' }



// Buffer.
const buffer = Buffer.Buffer

let string = "hello this is password ";

let data = Array.from(buffer.from(string,'utf-8')) 

console.log("Data ",data)

function toHexString(byteArray) {
    return Array.from(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
  }

  let result = toHexString(data)
  console.log("result ",result)

  const byteSize = str => new Blob([str]).size;

  const result2 = byteSize("Hello World") // output: 11
  console.log("result 2",result2)