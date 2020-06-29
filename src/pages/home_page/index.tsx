import React, { useCallback, useState } from "react";
import { Button, NavBar, Tabs, Drawer, Icon, Flex, WhiteSpace, ActionSheet, WingBlank } from "antd-mobile";
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
import * as indexer from "../../services/indexer";
import Storage from "../../services/storage";
import { decryptKeystore, encryptKeystore, sendAck } from "../../services/messaging";

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
    await storage.ready;
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
    await storage.ready;
    const manager = WalletManager.getInstance();
    const currentWalletName = await manager.getCurrentWalletName();
    await this.switchWallet(currentWalletName);
    window.document.addEventListener("ws-event", this.handleWsEvent);
  }

  componentWillUnmount() {
    window.document.removeEventListener("ws-event", this.handleWsEvent);
  }

  handleWsEvent = async (msg: any) => {
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

      if (method === "query_locks") {
        const manager = WalletManager.getInstance();
        const addresses = await manager.loadCurrentWalletAddressList();
        // todo: addressToScript normalize
        const locks = addresses.map((addr: any) => addressToScript(addr.address));
        sendAck(wsToken, {
          id,
          jsonrpc: "2.0",
          result: {
            locks,
          },
        });
      } else if (method === "sign" || method === "signAndSend") {
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
    const cellsPromises = addresses.map((address: any) => indexer.getCells(address.script));
    // const cellsPromises = addresses.map((address: any) =>
    //   indexer.getCells(addressToScript("ckt1qjr2r35c0f9vhcdgslx2fjwa9tylevr5qka7mfgmscd33wlhfykyhy3gzjh8k5zkkmyd4k58khyvggc2ks2uzrap8gu"))
    // );
    const addressCells = await Promise.all(cellsPromises);
    const addressSummary = addressCells.map((cells: any) => indexer.getSummary(cells));
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
      (buttonIndex) => {
        if (buttonIndex === 0) {
          // console.log("change wallet name");
          history.push("/change_wallet_name");
        } else if (buttonIndex === 1) {
          // console.log("change password");
          history.push("/change_password");
        } else if (buttonIndex === 2) {
          // console.log("backup wallet");
        } else if (buttonIndex === 3) {
          // console.log("delete wallet");
          history.push("/delete_wallet");
        } else {
          // console.log("should not be here");
        }
      }
    );
  };

  handleTestRequestSigning = () => {};

  handleTestAuthorizationRequest = async () => {
    const { history } = this.props;
    const storage = Storage.getStorage();
    await storage.setCurrentRequest({
      token: 0,
      data: {
        type: "auth",
        origin: "http://demodapp.com",
        description: "it is a demo dApp",
      },
    });
    history.push("/authorization_request");
  };

  handleTestEncryptKeystore = async () => {
    const password = "hello";
    const ec = new EC("secp256k1");
    const keypair = ec.genKeyPair();
    const privateKey = `0x${keypair.getPrivate().toString("hex")}`;
    console.log("before encrypt, privateKey=", privateKey);
    let ks;
    try {
      ks = await encryptKeystore(password, privateKey);
      console.log("response=", JSON.stringify(ks, null, 2));
    } catch (e) {
      console.log("encryptKeystore error=", e);
      return;
    }
    try {
      const dPrivateKey = await decryptKeystore(password, ks);
      console.log("after decrypt, privateKey=", dPrivateKey);
    } catch (e) {
      console.log("decryptKeystore error=", e);
    }
  };

  handleTestDeleteDatabase = async () => {
    const storage = Storage.getStorage();
    await storage.deleteDatabase();
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
      <Flex direction="column">
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
          <WalletSelector wallets={wallets} currentWallet={currentWallet} onSelect={this.handleSelectWallet} />
        )}
        <Drawer
          className={styles.drawer}
          sidebar={<Sidebar onClose={this.handleCloseDrawer} />}
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
        <div className={styles.testRegion}>
          <Button inline size="small" onClick={this.handleTestAuthorizationRequest}>
            Request Auth(test)
          </Button>
          <Button inline size="small" onClick={this.handleTestRequestSigning}>
            Request Signing(test)
          </Button>
          <Button inline size="small" onClick={this.handleTestEncryptKeystore}>
            Test EncryptKeystore
          </Button>
          <Button inline size="small" onClick={this.handleTestDeleteDatabase}>
            Test DeleteDatabase
          </Button>
        </div>
      </Flex>
    );
  }
}

export default withRouter(HomePage);
