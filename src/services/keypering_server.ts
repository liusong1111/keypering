import Storage from "./storage";
import {getLiveCell, getLiveCellsByLockHash} from "./rpc";
import {formatDate} from "../widgets/timestamp";
import {
  ErrorInvalidToken,
  AuthRequest,
  AuthResponse,
  AddressInfo,
  QueryAddressesRequest,
  QueryAddressesResponse,
  QueryLiveCellsRequest,
  QueryLiveCellsResponse,
  SignSendRequest,
  SignSendResponse,
  LiveCell,
} from "@keypering/specs";
import {History} from "history";
import {camelCaseKey} from "./misc";

export function sendAck(token: any, payload: any) {
  const {__TAURI__} = window as any;
  __TAURI__.invoke({
    cmd: "webSocketResponse",
    token,
    payload: JSON.stringify(payload),
  });
}

export default class KeyperingServer {
  constructor(public history: History, public addresses: AddressInfo[]) {
    this.install();
  }

  install() {
    window.document.addEventListener("ws-event", this.handleWsEvent);
  }

  uninstall() {
    window.document.removeEventListener("ws-event", this.handleWsEvent);
  }

  requestAuth = async (request: AuthRequest): Promise<AuthResponse | void> => {
    const {history} = this;
    history.push("/authorization_request");
  };

  queryAddresses = async (request: QueryAddressesRequest): Promise<QueryAddressesResponse | void> => {
    const {id} = request;
    const {addresses} = this;
    return {
      id,
      jsonrpc: "2.0",
      result: {
        addresses,
      }
    } as QueryAddressesResponse;
  };

  queryLiveCells = async (request: QueryLiveCellsRequest): Promise<QueryLiveCellsResponse | void> => {
    const {id, params} = request;
    const {lockHash, withData} = params;
    let liveCells = await getLiveCellsByLockHash(lockHash, "0x0", "0x32");
    liveCells = camelCaseKey(liveCells) as LiveCell[];
    if (withData) {
      await Promise.all(liveCells.map(async (cell: any) => {
        const cellWithData = await getLiveCell({tx_hash: cell.createdBy.txHash, index: cell.createdBy.index}, true);
        cell.data = camelCaseKey(cellWithData.cell.data);
      }));
    }
    return {
      id,
      jsonrpc: "2.0",
      result: {
        liveCells,
      }
    } as QueryLiveCellsResponse;
  };

  signSend = async (url: string, request: SignSendRequest): Promise<SignSendResponse | void> => {
    const {id, params} = request;
    const {description, tx, lockHash} = params;
    const txMeta = {
      url,
      state: "pending",
      description,
      timestamp: formatDate(new Date().getTime()),
    };
    const storage = Storage.getStorage();
    await storage.addTransaction(id, txMeta, tx);
    this.history.push("/transaction_request");
  };

  handleWsEvent = async (msg: any) => {
    const {history} = this;

    const {detail} = msg;
    const request = JSON.parse(detail.payload);
    const {token: wsToken} = detail;

    const storage = Storage.getStorage();
    await storage.setCurrentRequest({
      payload: request,
      token: wsToken,
    });

    const {id, method, params} = request;
    let response;
    if (method === "auth") {
      response = await this.requestAuth(request as AuthRequest);
    } else {
      const {token} = params;
      const auth = await storage.getAuthorization(token);
      if (!auth) {
        sendAck(wsToken, {
          id,
          jsonrpc: "2.0",
          error: ErrorInvalidToken,
        });
        return;
      }

      if (method === "query_addresses") {
        response = await this.queryAddresses(request as QueryAddressesRequest);
      } else if (method === "query_live_cells") {
        response = await this.queryLiveCells(request as QueryLiveCellsRequest);
      } else if (method === "sign" || method === "sign_send") {
        response = await this.signSend(auth.origin, request as SignSendRequest);
      }

      if (response) {
        sendAck(wsToken, response);
      }
    }
  };


}
