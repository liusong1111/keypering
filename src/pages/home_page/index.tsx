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
import { decryptKeystore, encryptKeystore, writeTextFile, readTextFile } from "../../services/messaging";
import KeyperingServer, { sendAck } from "../../services/keypering_server";
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
      keyperingServer: null,
    };
    this.init();
  }

  init = async () => {
    const storage = Storage.getStorage();
    const manager = WalletManager.getInstance();
    const currentWallet = await manager.getCurrentWallet();
    const currentWalletName = await manager.getCurrentWalletName();
    // sth weird...
    await manager.loadWallets();

    const authorizations = await storage.listAuthorizationByWalletName(currentWalletName);
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
    const { history } = this.props;
    const storage = Storage.getStorage();
    const manager = WalletManager.getInstance();
    const currentWalletName = await manager.getCurrentWalletName();
    if(currentWalletName) {
      await this.switchWallet(currentWalletName);
      const { addresses } = this.state;
      this.setState({
        keyperingServer: new KeyperingServer(history, addresses)
      });
    }
  }

  componentWillUnmount() {
    const { keyperingServer } = this.state;
    if(keyperingServer) {
      keyperingServer.uninstall();
    }
  }

  loadCurrentWalletAddressList = async () => {
    const { currentWallet } = this.state;
    if (!currentWallet) {
      return;
    }
    const manager = WalletManager.getInstance();
    const addresses = await manager.loadCurrentWalletAddressListWithCells();
    console.log("addresses", addresses);
    const balance = new BN(0);
    addresses.forEach((address: any, i) => {
      balance.iadd(new BN(address.freeAmount.replace("0x", ""), 16));
    });
    this.setState({
      addresses,
      balance: `0x${balance.toString(16)}`,
    });
  };

  loadAuthorizationList = async () => {
    const storage = Storage.getStorage();
    const manager = WalletManager.getInstance();
    const walletName = await manager.getCurrentWalletName();
    const authorizations = await storage.listAuthorizationByWalletName(walletName);
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
    const { addresses, keyperingServer } = this.state;
    if (keyperingServer) {
      keyperingServer.addresses = addresses;
      console.log("set(1) keyperingServer address=", addresses);
    }
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

  handleGotoTransferCapacityPage = () => {
    const { history } = this.props;
    history.push("/transfer_capacity");
  };

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
              <Button inline type="primary" size="small" onClick={this.handleGotoTransferCapacityPage}>
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
