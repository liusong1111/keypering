import React, {useCallback, useEffect, useState} from "react";
import {useHistory} from "react-router";
import {Button, Icon, InputItem, List, NavBar, Picker, Toast} from "antd-mobile";
import commonStyles from "../../widgets/common.module.scss";
import {WalletManager} from "../../services/wallet";
import Address from "../../widgets/address";
import Balance from "../../widgets/balance";
import styles from "./transfer_capacity.module.scss";
import {formatDate} from "../../widgets/timestamp";
import Storage from "../../services/storage";
import {scriptToHash} from "@nervosnetwork/ckb-sdk-utils";
import {addressToScript} from "@keyper/specs";

const TransferCapacityPage = (props: any) => {
  const history = useHistory();
  const [amount, setAmount] = useState(0);
  const [receiverAddress, setReceiverAddress] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [addressPickerData, setAddressPickerData] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const handleConfirm = useCallback(async () => {
    console.log("receiverAddress=", receiverAddress);
    console.log("senderAddress=", senderAddress);
    console.log("amount=", amount);
    const addr = addresses.find((addr: any) => addr.address === senderAddress) as any;
    const liveCells = addr.liveCells as any[];
    console.log("liveCells=", liveCells);
    const manager = WalletManager.getInstance();
    const tx = manager.buildTransferTransaction(senderAddress, receiverAddress, amount*100000000, liveCells);
    if (!tx) {
      Toast.fail("not enough capacity");
      return;
    }
    const txMeta = {
      url: "direct_send",
      state: "pending",
      description: `transfer ${amount} CKB to ${receiverAddress}`,
      timestamp: formatDate(new Date().getTime()),
    };
    const storage = Storage.getStorage();
    const id = new Date().getTime().toString();
    const request = {
      id,
      payload: {
        id,
        method: "sign_send",
        jsonrpc: "2.0",
        params: {
          description: txMeta.description,
          token: "xx",
          tx,
          lockHash: scriptToHash(addressToScript(senderAddress)),
        }
      }
    }
    await storage.setCurrentRequest(request);
    await storage.addTransaction(id, txMeta, tx);
    history.push("/transaction_request");
  }, [receiverAddress, senderAddress, amount, addresses]);
  useEffect(() => {
    (async () => {
      const manager = WalletManager.getInstance();
      const addresses = await manager.loadCurrentWalletAddressListWithCells();
      setAddresses(addresses as any);
      const pickerData = addresses.map((addr) => {
        return {
          label: (<div style={{width: "100%", display: "flex"}}>
            <Address value={addr.address} className={styles.address}/>
            <div>Free: <Balance value={addr.freeAmount}/> CKB</div>
          </div>),
          value: addr.address,
          freeAmount: addr.freeAmount,
        };
      });
      setAddressPickerData(pickerData as any);
      if (pickerData.length > 0) {
        const firstData = (pickerData as any)[0];
        setSenderAddress(firstData.value);
      }
    })();
  }, []);

  let pickerFreeAmount = null;
  const pickerData = addressPickerData.find((addr: any) => addr.value === senderAddress) as any;
  if (pickerData) {
    pickerFreeAmount = pickerData.freeAmount;
  }
  return <div>
    <NavBar icon={<Icon type="left"/>} onLeftClick={() => history.goBack()}>
      Send CKBytes
    </NavBar>
    <div className={styles.body}>
      <div>
        <Picker title="Transfer from address"
                cols={1}
                data={addressPickerData}
          // value={[pickerValue]}
                onOk={(value) => {
                  console.log(value);
                  setSenderAddress(value[0])
                }} extra="select">
          <List.Item arrow="horizontal">
            <div className={styles.transferFrom}>Transfer from:</div>
            <Address value={senderAddress}/>
            <div><span className={styles.free}>Free: </span><Balance value={pickerFreeAmount || 0}/> CKB</div>
          </List.Item>
        </Picker>
      </div>
      <div className={styles.label}>
        Amount:
      </div>
      <InputItem type="number" value={String(amount)} onChange={(v) => setAmount(parseInt(v))} extra="CKB"/>
      <div className={styles.label}>
        Send to:
      </div>
      <InputItem type="text" value={receiverAddress} onChange={(v) => setReceiverAddress(v)}/>
      <div className={commonStyles.ops}>
        <Button size="small" className={commonStyles.cancelButton} onClick={() => history.goBack()}>Cancel</Button>
        <Button size="small" type="primary" className={commonStyles.primaryButton}
                onClick={handleConfirm}>Confirm</Button>
      </div>
    </div>
  </div>
};

export default TransferCapacityPage;
