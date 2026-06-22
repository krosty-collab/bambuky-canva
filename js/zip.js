// Minimal ZIP writer (store method - no compression)
// files: [{name: 'slide-01.jpg', data: Uint8Array}]
function crc32(buf){
  let table = crc32.table;
  if(!table){ table = crc32.table = new Uint32Array(256); for(let i=0;i<256;i++){ let r=i; for(let j=0;j<8;j++) r = (r & 1) ? (0xEDB88320 ^ (r >>> 1)) : (r >>> 1); table[i]=r; }}
  let crc = 0 ^ (-1);
  for(let i=0;i<buf.length;i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  return (crc ^ (-1)) >>> 0;
}

function writeUint32LE(arr, offset, value){ arr[offset]=value&0xFF; arr[offset+1]=(value>>>8)&0xFF; arr[offset+2]=(value>>>16)&0xFF; arr[offset+3]=(value>>>24)&0xFF; }
function writeUint16LE(arr, offset, value){ arr[offset]=value&0xFF; arr[offset+1]=(value>>>8)&0xFF; }

function makeZip(files){
  const fileEntries = [];
  let localSize = 0;
  for(const f of files){
    const nameBuf = new TextEncoder().encode(f.name);
    const data = f.data;
    const crc = crc32(data);
    const compressedSize = data.length;
    const uncompressedSize = data.length;
    const localHeader = new Uint8Array(30 + nameBuf.length);
    // local file header signature
    writeUint32LE(localHeader,0,0x04034b50);
    writeUint16LE(localHeader,4,20); // version
    writeUint16LE(localHeader,6,0); // flags
    writeUint16LE(localHeader,8,0); // method 0 = store
    writeUint16LE(localHeader,10,0); // mod time
    writeUint16LE(localHeader,12,0); // mod date
    writeUint32LE(localHeader,14,crc);
    writeUint32LE(localHeader,18,compressedSize);
    writeUint32LE(localHeader,22,uncompressedSize);
    writeUint16LE(localHeader,26,nameBuf.length);
    writeUint16LE(localHeader,28,0);
    localHeader.set(nameBuf,30);

    const localTotal = localHeader.length + data.length;
    fileEntries.push({nameBuf, localHeader, data, crc, compressedSize, uncompressedSize, localOffset: localSize});
    localSize += localTotal;
  }

  // central directory
  let centralSize = 0;
  for(const e of fileEntries){ centralSize += 46 + e.nameBuf.length; }

  const zipSize = localSize + centralSize + 22;
  const out = new Uint8Array(zipSize);
  let ptr = 0;
  // write local files
  for(const e of fileEntries){ out.set(e.localHeader, ptr); ptr += e.localHeader.length; out.set(e.data, ptr); ptr += e.data.length; }
  const centralStart = ptr;
  for(const e of fileEntries){
    const nameLen = e.nameBuf.length;
    const cent = new Uint8Array(46 + nameLen);
    writeUint32LE(cent,0,0x02014b50);
    writeUint16LE(cent,4,0); // version made by
    writeUint16LE(cent,6,20); // version needed
    writeUint16LE(cent,8,0);
    writeUint16LE(cent,10,0);
    writeUint16LE(cent,12,0);
    writeUint32LE(cent,14,e.crc);
    writeUint32LE(cent,18,e.compressedSize);
    writeUint32LE(cent,22,e.uncompressedSize);
    writeUint16LE(cent,26,nameLen);
    writeUint16LE(cent,28,0);
    writeUint16LE(cent,30,0);
    writeUint16LE(cent,32,0);
    writeUint16LE(cent,34,0);
    writeUint32LE(cent,36,e.localOffset);
    cent.set(e.nameBuf,46);
    out.set(cent, ptr); ptr += cent.length;
  }
  const centralEnd = ptr;
  // end of central dir
  const eocd = new Uint8Array(22);
  writeUint32LE(eocd,0,0x06054b50);
  writeUint16LE(eocd,4,0);
  writeUint16LE(eocd,6,0);
  writeUint16LE(eocd,8,fileEntries.length);
  writeUint16LE(eocd,10,fileEntries.length);
  writeUint32LE(eocd,12,centralSize);
  writeUint32LE(eocd,16,centralStart);
  writeUint16LE(eocd,20,0);
  out.set(eocd, ptr); ptr += eocd.length;

  return out;
}
