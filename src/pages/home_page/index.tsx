import React, { useCallback, useState } from "react";
import {Button, NavBar, Tabs, Drawer, Icon, Flex, WhiteSpace, ActionSheet, WingBlank, Toast} from "antd-mobile";
import { withRouter } from "react-router";
import { Settings as SettingsIcon, Menu as MenuIcon } from "react-feather";
import { addressToScript } from "@keyper/specs";
import BN from "bn.js";
import { ec as EC } from "elliptic";
import Balance from "../../widgets/balance";
import AddressList from "../../widgets/address_list";
import styles from "./home.module.scss";
import TransactionList from "../../widgets/transaction_list";
import AuthorizationList from "../../widgets/authorization_list";
import Sidebar from "../../widgets/sidebar";
import WalletSelector from "../../widgets/wallet_selector";
import { WalletManager } from "../../services/wallet";
import Storage from "../../services/storage";
import { decryptKeystore, encryptKeystore, sendAck, writeTextFile, readTextFile } from "../../services/messaging";
import {getCellsSummary, getLiveCell, getLiveCellsByLockHash} from "../../services/rpc";
import { scriptToHash } from "@nervosnetwork/ckb-sdk-utils";
import {formatDate} from "../../widgets/timestamp";
const tauriApi = require("tauri/api/dialog");
const { open, save } = tauriApi;

const tabNames = [
  { title: "Addresses", key: "Addresses" },
  { title: "Transactions", key: "Transactions" },
  { title: "Authorization", key: "Authorization" },
];

class HomePage extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      drawerOpen: false,
      wallets: [],
      currentWallet: null,
      addresses: [],
      balance: "0x0",
      authorizations: [],
    };
    this.init();
  }

  init = async () => {
    const storage = Storage.getStorage();
    const manager = WalletManager.getInstance();
    const currentWallet = await manager.getCurrentWallet();
    // sth weird...
    await manager.loadWallets();

    const authorizations = await storage.listAuthorization();
    const transactions = await storage.listTransaction();
    const wallets = await manager.getWallets();
    this.setState({
      currentWallet,
      authorizations,
      transactions,
      wallets,
    });
    const { history } = this.props;
    if (!currentWallet) {
      history.push("/welcome");
    }
  };

  async componentDidMount() {
    // this.loadCurrentWalletAddressList();
    // this.loadAuthorizationList();
    const storage = Storage.getStorage();
    const manager = WalletManager.getInstance();
    const currentWalletName = await manager.getCurrentWalletName();
    await this.switchWallet(currentWalletName);
    window.document.addEventListener("ws-event", this.handleWsEvent);
  }

  componentWillUnmount() {
    window.document.removeEventListener("ws-event", this.handleWsEvent);
  }

  handleWsEvent = async (msg: any) => {
    const { addresses } = this.state;
    const storage = Storage.getStorage();
    const { detail } = msg;
    console.log(detail);
    detail.data = JSON.parse(detail.data);
    const { data, token: wsToken } = detail;
    const { id, method, params } = data;
    await storage.setCurrentRequest(detail);
    const { history } = this.props;
    if (method === "auth") {
      history.push("/authorization_request");
    } else {
      const { token } = params;
      const auth = await storage.getAuthorization(token);
      if (!auth) {
        sendAck(wsToken, {
          id,
          jsonrpc: "2.0",
          error: {
            code: 2,
            message: "invalid_token",
          },
        });
        return;
      }

      if (method === "query_addresses") {
        sendAck(wsToken, {
          id,
          jsonrpc: "2.0",
          result: {
            addresses,
          }
        })
      } else if(method === "query_live_cells") {
        const { lockHash } = params;
        const liveCells = await getLiveCellsByLockHash(lockHash, "0x0", "0x32");
        await Promise.all(liveCells.map(async (cell: any) => {
          const cellWithData = await getLiveCell({tx_hash: cell.created_by.tx_hash, index: cell.created_by.index}, true);
          cell.data = cellWithData.cell.data;
        }));
        sendAck(wsToken, {
          id,
          jsonrpc: "2.0",
          result: {
            liveCells,
          }
        });
      }
      else if (method === "query_locks") {
        const manager = WalletManager.getInstance();
        const addresses = await manager.loadCurrentWalletAddressList();
        const locks = addresses.map((addr: any) => addr.hash);
        sendAck(wsToken, {
          id,
          jsonrpc: "2.0",
          result: {
            locks,
          },
        });
      } else if (method === "sign" || method === "signAndSend") {
        console.log("msg:", msg);
        const { meta, tx } = params;
        const txMeta = {
          requestUrl: auth.origin,
          state: "pending",
          metaInfo: meta,
          timestamp: formatDate(new Date().getTime()),
        };
        await storage.addTransaction(id, txMeta, tx);
        history.push("/transaction_request");
      }
    }
  };

  loadCurrentWalletAddressList = async () => {
    const { currentWallet } = this.state;
    if (!currentWallet) {
      return;
    }

    const manager = WalletManager.getInstance();
    const addresses = await manager.loadCurrentWalletAddressList();
    const cellsPromises = addresses.map((address: any) => getLiveCellsByLockHash(scriptToHash(address.meta.script), "0x0", "0x32"));
    const addressCells = await Promise.all(cellsPromises);
    const addressSummary = addressCells.map((cells: any) => getCellsSummary(cells));
    const balance = new BN(0);
    addressCells.forEach((address: any, i) => {
      addresses[i].freeAmount = `0x${addressSummary[i].free.toString(16)}`;
      addresses[i].inUseAmount = `0x${addressSummary[i].inuse.toString(16)}`;
      balance.iadd(addressSummary[i].free);
    });
    this.setState({
      addresses,
      balance: `0x${balance.toString(16)}`,
    });
  };

  loadAuthorizationList = async () => {
    const storage = Storage.getStorage();
    const authorizations = await storage.listAuthorization();
    this.setState({ authorizations });
  };

  handleToggleDrawer = () => {
    const { drawerOpen } = this.state;
    this.setState({
      drawerOpen: !drawerOpen,
    });
  };

  handleCloseDrawer = () => {
    this.setState({
      drawerOpen: false,
      walletSelectorOpen: false,
      transactionRequest: undefined,
    });
  };

  handleImportFromKeystore = async (e: any) => {
    e.preventDefault();
    const { history } = this.props;
    const path = await open({});
    const content = await readTextFile(path);
    console.log(content);
    const store = Storage.getStorage();
    await store.setCurrentRequest(content);
    history.push("/import_keystore");
  };

  handleDrawerOpenChange = () => {
    let { drawerOpen } = this.state;
    drawerOpen = !drawerOpen;
    this.setState({
      drawerOpen,
    });
  };

  handleToggleWalletSelector = () => {
    const { walletSelectorOpen } = this.state;
    this.setState({
      walletSelectorOpen: !walletSelectorOpen,
    });
  };

  handleCloseWallet = () => {
    this.setState({
      walletSelectorOpen: false,
    });
  };

  handleSelectWallet = async (e: any) => {
    console.log(e);
    const walletName = e[0];
    await this.switchWallet(walletName);
    this.setState({
      walletSelectorOpen: false,
    });
  };

  handleOpenSetting = () => {
    const { currentWallet } = this.state;
    const { history } = this.props;
    const BUTTONS = ["Change Wallet Name", "Change Password", "Backup Wallet", "Delete Wallet"];
    ActionSheet.showActionSheetWithOptions(
      {
        options: BUTTONS,
        destructiveButtonIndex: BUTTONS.length - 1,
        message: `${currentWallet.name} Setting`,
      },
      async (buttonIndex) => {
        if (buttonIndex === 0) {
          // console.log("change wallet name");
          history.push("/change_wallet_name");
        } else if (buttonIndex === 1) {
          // console.log("change password");
          history.push("/change_password");
        } else if (buttonIndex === 2) {
          // console.log("backup wallet");
          const path = await save({});
          if(!path) {
            return;
          }
          const store = Storage.getStorage();
          const wallet: any = await store.getCurrentWallet();
          console.log("wallet:", wallet);
          const ks= JSON.stringify(wallet.ks, null, 2);
          await writeTextFile(path, ks);
          Toast.success("Your wallet is exported to " + path);
        } else if (buttonIndex === 3) {
          // console.log("delete wallet");
          history.push("/delete_wallet");
        } else {
          // console.log("should not be here");
        }
      }
    );
  };

  handleRevokeAuthorization = async (authToken: string) => {
    const storage = Storage.getStorage();
    await storage.removeAuthorization(authToken);
    await this.loadAuthorizationList();
  };

  async switchWallet(walletName: string) {
    const manager = WalletManager.getInstance();
    await manager.setCurrentWalletName(walletName);
    const currentWallet = await manager.getCurrentWallet();
    this.setState({
      currentWallet,
    });
    await this.loadCurrentWalletAddressList();
    await this.loadAuthorizationList();
  }

  render() {
    const {
      drawerOpen,
      walletSelectorOpen,
      wallets,
      currentWallet,
      transactionRequest,
      addresses,
      balance,
      transactions,
      authorizations,
    } = this.state;
    if (wallets.length <= 0 || !currentWallet) {
      return null;
    }
    return (
      <Flex direction="column" className={styles.wrap}>
        <div className={styles.header}>
          <NavBar
            className={styles.navbar}
            icon={<MenuIcon color="#fff" />}
            rightContent={<Icon type="ellipsis" onClick={this.handleOpenSetting} />}
            onLeftClick={this.handleToggleDrawer}
          >
            <div onClick={this.handleToggleWalletSelector}>
              {currentWallet.name}
              <Icon type="down" className={styles.downButton} />
            </div>
          </NavBar>
          <div className={styles.summary}>
            <div className={styles.balanceLabel}>Balance</div>
            <Balance value={balance} size="large" />
            <div className={styles.ops}>
              <Button inline type="primary" size="small">
                Send
              </Button>
            </div>
          </div>
        </div>
        {walletSelectorOpen && (
          <WalletSelector wallets={wallets} currentWallet={currentWallet} onSelect={this.handleSelectWallet} onClose={this.handleCloseWallet} />
        )}
        <Drawer
          className={styles.drawer}
          sidebar={<Sidebar onClose={this.handleCloseDrawer} onImportFromKeystore={this.handleImportFromKeystore} />}
          open={drawerOpen}
          onOpenChange={this.handleDrawerOpenChange}
        />
        <Flex.Item className={styles.tabs}>
          <Tabs
            tabs={tabNames}
            onChange={(tab, index) => {
              // console.log("onChange:", tab, index);
            }}
          >
            <WingBlank key="Addresses" className={styles.addresses}>
              <AddressList addresses={addresses} />
            </WingBlank>
            <WingBlank key="Transactions" className={styles.transactions}>
              <TransactionList transactions={transactions} />
            </WingBlank>
            <WingBlank key="Authorization" className={styles.authorizations}>
              <AuthorizationList authorizations={authorizations} onRevoke={this.handleRevokeAuthorization} />
            </WingBlank>
          </Tabs>
        </Flex.Item>
      </Flex>
    );
  }
}

export default withRouter(HomePage);
