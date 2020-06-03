import React, { useCallback, useState } from "react";
import { Button, NavBar, Tabs, Drawer, Icon, Flex, WhiteSpace, ActionSheet, WingBlank } from "antd-mobile";
import { withRouter } from "react-router";
import { Settings as SettingsIcon, Menu as MenuIcon } from "react-feather";
import Balance from "../../widgets/balance";
import AddressList from "../../widgets/address_list";
import styles from "./home.module.scss";
import TransactionList from "../../widgets/transaction_list";
import AuthorizationList from "../../widgets/authorization_list";
import Sidebar from "../../widgets/sidebar";
import WalletSelector from "../../widgets/wallet_selector";
import TransactionRequest from "../../widgets/transaction_request";
import CogImg from "../../imgs/cog.svg";

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
      wallets: [
        {
          name: "Wallet1",
        },
        {
          name: "Wallet2",
        },
      ],
      currentWallet: {
        name: "Wallet1",
      },
    };
  }

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

  handleToggleWalletSelector = () => {
    const { walletSelectorOpen } = this.state;
    this.setState({
      walletSelectorOpen: !walletSelectorOpen,
    });
  };

  handleSelectWallet = (e: any) => {
    console.log(e);
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
          console.log("change wallet name");
          history.push("/change_wallet_name");
        } else if (buttonIndex === 1) {
          console.log("change password");
          history.push("/change_password");
        } else if (buttonIndex === 2) {
          console.log("backup wallet");
        } else if (buttonIndex === 3) {
          console.log("delete wallet");
          history.push("/delete_wallet");
        } else {
          console.log("should not be here");
        }
      }
    );
  };

  handleTestRequestSigning = () => {
    this.setState({
      transactionRequest: {
        requestFrom: "https://demoapp.com/abc.html",
        metaInfo: "Send 1000.00 CKB to xxx",
        inputs: [
          {
            address: "ckt1qjr2r35c0f9vhcdgslx2fjwa9tylevr5qka7mfgmscd33wlhfykyhxuy3pat96shpxvvl7vf2e6ae55u6fk564sc527",
            capacity: 123_45000000,
            type: null,
            data: null,
            algorithm: "secp256k1",
          },
          {
            address: "ckt1qjr2r35c0f9vhcdgslx2fjwa9tylevr5qka7mfgmscd33wlhfykyhxuy3pat96shpxvvl7vf2e6ae55u6fk564sc527",
            capacity: 123_45000000,
            type: null,
            data: null,
            algorithm: "secp256k1",
          },
        ],
        outputs: [
          {
            address: "ckt1qjr2r35c0f9vhcdgslx2fjwa9tylevr5qka7mfgmscd33wlhfykyhxuy3pat96shpxvvl7vf2e6ae55u6fk564sc527",
            capacity: 123_45000000,
            type: null,
            data: null,
            algorithm: "secp256k1",
          },
          {
            address: "ckt1qjr2r35c0f9vhcdgslx2fjwa9tylevr5qka7mfgmscd33wlhfykyhxuy3pat96shpxvvl7vf2e6ae55u6fk564sc527",
            capacity: 123_45000000,
            type: null,
            data: null,
            algorithm: "secp256k1",
          },
        ],
      },
    });
  };

  handleTestAuthorizationRequest = () => {
    const { history } = this.props;
    history.push("/authorization_request");
  };

  handleDeclineTransactionRequest = () => {
    this.setState({
      transactionRequest: undefined,
    });
  };

  handleApproveTransactionRequest = () => {
    this.setState({
      transactionRequest: undefined,
    });
  };

  render() {
    const { drawerOpen, walletSelectorOpen, wallets, currentWallet, transactionRequest } = this.state;
    return (
      <Flex direction="column">
        {transactionRequest && (
          <TransactionRequest
            inner={transactionRequest}
            visible
            onDecline={this.handleDeclineTransactionRequest}
            onApprove={this.handleApproveTransactionRequest}
          />
        )}
        <div className={styles.header}>
          <NavBar
            className={styles.navbar}
            icon={<MenuIcon color="#fff" />}
            rightContent={<Icon type="ellipsis" onClick={this.handleOpenSetting} />}
            onLeftClick={this.handleToggleDrawer}
          >
            <div onClick={this.handleToggleWalletSelector}>
              Wallet1 <Icon type="down" className={styles.downButton} />
            </div>
          </NavBar>
          <div className={styles.summary}>
            <div className={styles.balanceLabel}>Balance</div>
            <Balance value={1234_78000000} size="large" />
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
        <Drawer className={styles.drawer} sidebar={<Sidebar onClose={this.handleCloseDrawer} />} open={drawerOpen} />
        <Flex.Item className={styles.tabs}>
          <Tabs
            tabs={tabNames}
            onChange={(tab, index) => {
              console.log("onChange:", tab, index);
            }}
          >
            <WingBlank key="Addresses" className={styles.addresses}>
              <AddressList />
            </WingBlank>
            <WingBlank key="Transactions" className={styles.transactions}>
              <TransactionList />
            </WingBlank>
            <WingBlank key="Authorization" className={styles.authorizations}>
              <AuthorizationList />
            </WingBlank>
          </Tabs>
        </Flex.Item>
        <div className={styles.testRegion}>
          <Button inline size="small" onClick={this.handleTestAuthorizationRequest}>
            Request Addr(test)
          </Button>
          <Button inline size="small" onClick={this.handleTestRequestSigning}>
            Request Signing(test)
          </Button>
        </div>
      </Flex>
    );
  }
}

export default withRouter(HomePage);
