//! Minimal "qt-faststart" implementation in pure Rust.
//!
//! Many downloaded course videos (e.g. from Google Drive) are progressive MP4s
//! whose `moov` atom (the index/metadata) sits at the END of the file. Android's
//! System WebView `<video>` element cannot demux these reliably: it keeps
//! re-reading the trailing `moov` and never starts playback
//! (MEDIA_ERR_SRC_NOT_SUPPORTED with readyState=0).
//!
//! This module rewrites such a file so the `moov` comes right after `ftyp`
//! (before `mdat`), which is what `ffmpeg -movflags +faststart` produces. The
//! chunk offset tables (`stco`/`co64`) inside `moov` are patched by the size of
//! the relocated `moov` atom, since all media data shifts down by that amount.
//!
//! It streams `mdat` through a 1 MB buffer (only the small `moov` is held in
//! memory), so it is safe on low-memory mobile devices.

use std::fs::File;
use std::io::{Read, Seek, SeekFrom, Write};
use std::path::Path;

struct Atom {
    kind: [u8; 4],
    offset: u64,
    header_len: u64,
    size: u64, // total size including header
}

/// Ensures the MP4 at `path` is "faststart" (moov before mdat), rewriting it in
/// place if needed.
///
/// Returns:
/// - `Ok(true)`  if the file was rewritten,
/// - `Ok(false)` if no change was needed (already faststart or not applicable),
/// - `Err(_)`    on a problem (caller should fall back to the original file).
pub fn ensure_faststart(path: &Path) -> Result<bool, String> {
    let mut file = File::open(path).map_err(|e| e.to_string())?;
    let file_size = file.metadata().map_err(|e| e.to_string())?.len();

    let atoms = read_top_level_atoms(&mut file, file_size)?;

    let moov = match atoms.iter().find(|a| &a.kind == b"moov") {
        Some(m) => m,
        None => return Ok(false), // no moov: not something we can/should touch
    };
    let mdat = match atoms.iter().find(|a| &a.kind == b"mdat") {
        Some(d) => d,
        None => return Ok(false),
    };

    if moov.offset < mdat.offset {
        return Ok(false); // already faststart
    }

    let moov_size = moov.size;
    // Safety cap: a well-formed moov is small (KBs/low MBs). Bail if absurd.
    if moov_size > 64 * 1024 * 1024 {
        return Err(format!("moov muito grande ({} bytes)", moov_size));
    }

    // Load the moov atom into memory and patch its chunk-offset tables.
    let mut moov_buf = vec![0u8; moov_size as usize];
    file.seek(SeekFrom::Start(moov.offset))
        .map_err(|e| e.to_string())?;
    file.read_exact(&mut moov_buf).map_err(|e| e.to_string())?;

    let moov_len = moov_buf.len();
    patch_region(&mut moov_buf, moov.header_len as usize, moov_len, moov_size)?;

    // Write [ftyp?][moov][everything else except ftyp & moov, original order].
    let tmp = path.with_extension("faststart.tmp");
    {
        let mut out = File::create(&tmp).map_err(|e| e.to_string())?;

        if let Some(ftyp) = atoms.iter().find(|a| &a.kind == b"ftyp") {
            copy_range(&mut file, &mut out, ftyp.offset, ftyp.size)?;
        }

        out.write_all(&moov_buf).map_err(|e| e.to_string())?;

        for a in &atoms {
            if &a.kind == b"ftyp" || &a.kind == b"moov" {
                continue;
            }
            copy_range(&mut file, &mut out, a.offset, a.size)?;
        }

        out.flush().map_err(|e| e.to_string())?;
    }

    std::fs::rename(&tmp, path).map_err(|e| e.to_string())?;
    Ok(true)
}

fn read_top_level_atoms(file: &mut File, file_size: u64) -> Result<Vec<Atom>, String> {
    let mut atoms = Vec::new();
    let mut pos: u64 = 0;

    while pos + 8 <= file_size {
        file.seek(SeekFrom::Start(pos)).map_err(|e| e.to_string())?;
        let mut hdr = [0u8; 8];
        file.read_exact(&mut hdr).map_err(|e| e.to_string())?;

        let size32 = u32::from_be_bytes([hdr[0], hdr[1], hdr[2], hdr[3]]) as u64;
        let kind = [hdr[4], hdr[5], hdr[6], hdr[7]];

        let (size, header_len) = if size32 == 1 {
            let mut ext = [0u8; 8];
            file.read_exact(&mut ext).map_err(|e| e.to_string())?;
            (u64::from_be_bytes(ext), 16u64)
        } else if size32 == 0 {
            (file_size - pos, 8u64)
        } else {
            (size32, 8u64)
        };

        if size < header_len || pos + size > file_size {
            break; // malformed/truncated: stop scanning
        }

        atoms.push(Atom {
            kind,
            offset: pos,
            header_len,
            size,
        });
        pos += size;
    }

    Ok(atoms)
}

/// Recursively walks container atoms within `buf[pos..end]`, patching every
/// `stco`/`co64` offset by `add`.
fn patch_region(buf: &mut [u8], mut pos: usize, end: usize, add: u64) -> Result<(), String> {
    while pos + 8 <= end {
        let size32 = u32::from_be_bytes([buf[pos], buf[pos + 1], buf[pos + 2], buf[pos + 3]]) as u64;
        let kind = [buf[pos + 4], buf[pos + 5], buf[pos + 6], buf[pos + 7]];

        let (size, header_len) = if size32 == 1 {
            if pos + 16 > end {
                break;
            }
            let mut ext = [0u8; 8];
            ext.copy_from_slice(&buf[pos + 8..pos + 16]);
            (u64::from_be_bytes(ext), 16usize)
        } else if size32 == 0 {
            ((end - pos) as u64, 8usize)
        } else {
            (size32, 8usize)
        };

        let atom_end = pos + size as usize;
        if size < header_len as u64 || atom_end > end {
            break;
        }

        match &kind {
            b"moov" | b"trak" | b"mdia" | b"minf" | b"stbl" | b"edts" => {
                patch_region(buf, pos + header_len, atom_end, add)?;
            }
            b"stco" => {
                let data = pos + header_len;
                if data + 8 <= atom_end {
                    let count = u32::from_be_bytes([
                        buf[data + 4],
                        buf[data + 5],
                        buf[data + 6],
                        buf[data + 7],
                    ]) as usize;
                    let mut e = data + 8;
                    for _ in 0..count {
                        if e + 4 > atom_end {
                            break;
                        }
                        let off = u32::from_be_bytes([buf[e], buf[e + 1], buf[e + 2], buf[e + 3]])
                            as u64;
                        let new = off + add;
                        if new > u32::MAX as u64 {
                            return Err("offset stco excede 32 bits (precisaria co64)".into());
                        }
                        buf[e..e + 4].copy_from_slice(&(new as u32).to_be_bytes());
                        e += 4;
                    }
                }
            }
            b"co64" => {
                let data = pos + header_len;
                if data + 8 <= atom_end {
                    let count = u32::from_be_bytes([
                        buf[data + 4],
                        buf[data + 5],
                        buf[data + 6],
                        buf[data + 7],
                    ]) as usize;
                    let mut e = data + 8;
                    for _ in 0..count {
                        if e + 8 > atom_end {
                            break;
                        }
                        let mut b8 = [0u8; 8];
                        b8.copy_from_slice(&buf[e..e + 8]);
                        let off = u64::from_be_bytes(b8);
                        buf[e..e + 8].copy_from_slice(&(off + add).to_be_bytes());
                        e += 8;
                    }
                }
            }
            b"cmov" => {
                return Err("moov comprimido (cmov) não suportado".into());
            }
            _ => {}
        }

        pos = atom_end;
    }

    Ok(())
}

fn copy_range(input: &mut File, out: &mut File, offset: u64, size: u64) -> Result<(), String> {
    input
        .seek(SeekFrom::Start(offset))
        .map_err(|e| e.to_string())?;
    let mut remaining = size;
    let mut buf = vec![0u8; 1024 * 1024];
    while remaining > 0 {
        let n = std::cmp::min(remaining, buf.len() as u64) as usize;
        input.read_exact(&mut buf[..n]).map_err(|e| e.to_string())?;
        out.write_all(&buf[..n]).map_err(|e| e.to_string())?;
        remaining -= n as u64;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write as _;

    fn atom(kind: &[u8; 4], payload: &[u8]) -> Vec<u8> {
        let size = (8 + payload.len()) as u32;
        let mut v = Vec::with_capacity(size as usize);
        v.extend_from_slice(&size.to_be_bytes());
        v.extend_from_slice(kind);
        v.extend_from_slice(payload);
        v
    }

    /// Builds a minimal MP4 with layout [ftyp][mdat][moov], where moov contains
    /// trak>mdia>minf>stbl>stco with a single chunk offset.
    fn build_moov_at_end(chunk_offset: u32) -> Vec<u8> {
        let ftyp = atom(b"ftyp", &[0u8; 8]);
        let mdat = atom(b"mdat", &[0u8; 100]);

        // stco: version+flags(4) + entry_count(4)=1 + one 4-byte offset
        let mut stco_payload = Vec::new();
        stco_payload.extend_from_slice(&0u32.to_be_bytes()); // version+flags
        stco_payload.extend_from_slice(&1u32.to_be_bytes()); // entry_count
        stco_payload.extend_from_slice(&chunk_offset.to_be_bytes());
        let stco = atom(b"stco", &stco_payload);
        let stbl = atom(b"stbl", &stco);
        let minf = atom(b"minf", &stbl);
        let mdia = atom(b"mdia", &minf);
        let trak = atom(b"trak", &mdia);
        let moov = atom(b"moov", &trak);

        let mut file = Vec::new();
        file.extend_from_slice(&ftyp);
        file.extend_from_slice(&mdat);
        file.extend_from_slice(&moov);
        file
    }

    fn find_top_level(data: &[u8]) -> Vec<([u8; 4], usize, usize)> {
        let mut out = Vec::new();
        let mut pos = 0usize;
        while pos + 8 <= data.len() {
            let size = u32::from_be_bytes([data[pos], data[pos + 1], data[pos + 2], data[pos + 3]])
                as usize;
            let kind = [data[pos + 4], data[pos + 5], data[pos + 6], data[pos + 7]];
            out.push((kind, pos, size));
            if size == 0 {
                break;
            }
            pos += size;
        }
        out
    }

    #[test]
    fn moves_moov_to_front_and_patches_stco() {
        // chunk offset points into mdat payload: ftyp(16) + mdat header(8) = 24
        let original = build_moov_at_end(24);
        let moov_size = {
            let atoms = find_top_level(&original);
            atoms.iter().find(|(k, _, _)| k == b"moov").unwrap().2
        };

        let tmp = std::env::temp_dir().join("ckourse_faststart_test.mp4");
        {
            let mut f = File::create(&tmp).unwrap();
            f.write_all(&original).unwrap();
        }

        let changed = ensure_faststart(&tmp).unwrap();
        assert!(changed, "should have rewritten the file");

        let out = std::fs::read(&tmp).unwrap();
        let atoms = find_top_level(&out);

        // Order must now be ftyp, moov, mdat
        assert_eq!(&atoms[0].0, b"ftyp");
        assert_eq!(&atoms[1].0, b"moov");
        assert_eq!(&atoms[2].0, b"mdat");

        // Find the stco entry in the new file and check it was incremented by moov_size.
        let moov_start = atoms[1].1;
        let moov_end = moov_start + atoms[1].2;
        let mut idx = None;
        let mut i = moov_start;
        while i + 8 <= moov_end {
            if &out[i + 4..i + 8] == b"stco" {
                idx = Some(i);
                break;
            }
            i += 1;
        }
        let stco_at = idx.expect("stco not found");
        // payload: header(8) + version/flags(4) + count(4) => entry at +16
        let entry_pos = stco_at + 16;
        let new_offset =
            u32::from_be_bytes([out[entry_pos], out[entry_pos + 1], out[entry_pos + 2], out[entry_pos + 3]]);
        assert_eq!(new_offset, 24 + moov_size as u32);

        // Second run must be a no-op (already faststart).
        let changed_again = ensure_faststart(&tmp).unwrap();
        assert!(!changed_again, "second run should be a no-op");

        let _ = std::fs::remove_file(&tmp);
    }
}
