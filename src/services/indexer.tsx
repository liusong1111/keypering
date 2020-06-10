import { Script } from "@keyper/specs";
import BN from "bn.js";

export async function getCells(script: Script) {
  const payload = {
    id: 2,
    jsonrpc: "2.0",
    method: "get_cells",
    params: [
      {
        script: {
          code_hash: script.codeHash,
          hash_type: script.hashType,
          args: script.args,
        },
        script_type: "lock",
      },
      "asc",
      "0x2710",
    ],
  };
  const body = JSON.stringify(payload, null, "  ");
  // todo: move into conf
  const url = "https://prototype.ckbapp.dev/testnet/indexer";
  try {
    const response = await fetch(url, {
      method: "POST",
      body,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      mode: "cors",
    });
    const res: any = await response.json();
    console.log("get_cells response:", res);
    return res.result.objects;
  } catch (e) {
    console.log("error:", e);
    throw e;
  }
}

export function groupCells(cells: any[]) {
  const emptyCells = [];
  const filledCells = [];
  for (const cell of cells) {
    if (cell.output_data === "0x") {
      emptyCells.push(cell);
    } else {
      filledCells.push(cell);
    }
  }
  return {
    emptyCells,
    filledCells,
  };
}

export function getSummary(cells: any[]) {
  const capacity = new BN(0);
  const inuse = new BN(0);
  const free = new BN(0);
  for (const cell of cells) {
    const cellCapacity = new BN(cell.output.capacity.slice(2), 16);
    capacity.iadd(cellCapacity);
    if (cell.output_data === "0x") {
      free.iadd(cellCapacity);
    } else {
      inuse.iadd(cellCapacity);
    }
  }
  return {
    inuse,
    capacity,
    free,
  };
}
