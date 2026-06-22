// Minimal ZIP writer (store method, no compression)
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

function dosDateTime(){
  const d = new Date();
  const time = (d.getSeconds()>>1) | (d.getMinutes()<<5) | (d.getHours()<<11);
  const date = d.getDate() | ((d.getMonth()+1)<<5) | ((d.getFullYear()-1980)<<9);
  return {time, date};
}

function makeZip(files){
  const {time: modTime, date: modDate} = dosDateTime();
  const fileEntries = [];
  let localSize = 0;
  for(const f of files){
    const nameBuf = new TextEncoder().encode(f.name);
    const data = f.data;
    const crc = crc32(data);
    const compressedSize = data.length;
    const uncompressedSize = data.length;
    // Local file header: 30 bytes fixed + file name
    const localHeader = new Uint8Array(30 + nameBuf.length);
    writeUint32LE(localHeader, 0, 0x04034b50);  // signature
    writeUint16LE(localHeader, 4, 20);           // version needed (2.0)
    writeUint16LE(localHeader, 6, 0);            // general purpose bit flag
    writeUint16LE(localHeader, 8, 0);            // compression method (store)
    writeUint16LE(localHeader, 10, modTime);     // last mod file time
    writeUint16LE(localHeader, 12, modDate);     // last mod file date
    writeUint32LE(localHeader, 14, crc);         // crc-32
    writeUint32LE(localHeader, 18, compressedSize);
    writeUint32LE(localHeader, 22, uncompressedSize);
    writeUint16LE(localHeader, 26, nameBuf.length); // file name length
    writeUint16LE(localHeader, 28, 0);              // extra field length
    localHeader.set(nameBuf, 30);

    const localTotal = localHeader.length + data.length;
    fileEntries.push({nameBuf, localHeader, data, crc, compressedSize, uncompressedSize, localOffset: localSize});
    localSize += localTotal;
  }

  // Central directory
  let centralSize = 0;
  for(const e of fileEntries){ centralSize += 46 + e.nameBuf.length; }

  const zipSize = localSize + centralSize + 22;
  const out = new Uint8Array(zipSize);
  let ptr = 0;
  for(const e of fileEntries){ out.set(e.localHeader, ptr); ptr += e.localHeader.length; out.set(e.data, ptr); ptr += e.data.length; }
  const centralStart = ptr;
  for(const e of fileEntries){
    const nameLen = e.nameBuf.length;
    // Central directory file header: 46 bytes fixed + file name
    const cent = new Uint8Array(46 + nameLen);
    writeUint32LE(cent, 0, 0x02014b50);          // signature
    writeUint16LE(cent, 4, 20);                   // version made by (2.0)
    writeUint16LE(cent, 6, 20);                   // version needed (2.0)
    writeUint16LE(cent, 8, 0);                    // general purpose bit flag
    writeUint16LE(cent, 10, 0);                   // compression method (store)
    writeUint16LE(cent, 12, modTime);             // last mod file time
    writeUint16LE(cent, 14, modDate);             // last mod file date
    writeUint32LE(cent, 16, e.crc);               // crc-32
    writeUint32LE(cent, 20, e.compressedSize);    // compressed size
    writeUint32LE(cent, 24, e.uncompressedSize);  // uncompressed size
    writeUint16LE(cent, 28, nameLen);             // file name length
    writeUint16LE(cent, 30, 0);                   // extra field length
    writeUint16LE(cent, 32, 0);                   // file comment length
    writeUint16LE(cent, 34, 0);                   // disk number start
    writeUint16LE(cent, 36, 0);                   // internal file attributes
    writeUint32LE(cent, 38, 0);                   // external file attributes
    writeUint32LE(cent, 42, e.localOffset);       // relative offset of local header
    cent.set(e.nameBuf, 46);
    out.set(cent, ptr); ptr += cent.length;
  }
  // End of central directory record
  const eocd = new Uint8Array(22);
  writeUint32LE(eocd, 0, 0x06054b50);            // signature
  writeUint16LE(eocd, 4, 0);                     // disk number
  writeUint16LE(eocd, 6, 0);                     // disk with central dir
  writeUint16LE(eocd, 8, fileEntries.length);    // entries on this disk
  writeUint16LE(eocd, 10, fileEntries.length);   // total entries
  writeUint32LE(eocd, 12, centralSize);          // central dir size
  writeUint32LE(eocd, 16, centralStart);         // central dir offset
  writeUint16LE(eocd, 20, 0);                    // comment length
  out.set(eocd, ptr);

  return out;
}
