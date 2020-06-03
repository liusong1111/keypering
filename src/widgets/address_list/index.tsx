import React from "react";
import styles from "./address_list.module.scss";
import { Flex } from "antd-mobile";
import Balance from "../balance";
import Address from "../address";
import Tag from "../tag";

interface AddressListProps {

}

enum AddressType {
  secp256k1 = "secp256k1 blake160",
  anyoneCanPay = "anyone-can-pay",
  pwEthereumCompatible = "pw Ethereum compatible",
}

const getAddressType = (addr: AddressListProps) => {
  // if(addr.code_hash === "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8") {
  //   return "secp256k1_blake160";
  // } else {
  //   return "anyone-cay-pay";
  // }
    return AddressType.secp256k1;
};

const AddressList = (props: AddressListProps) => {
  return (
    <div className={styles.item}>
      <Tag>{getAddressType(props)}</Tag>
      <Address className={styles.address} value={"ckt1qyqd5eyygtdmwdr7ge736zw6z0ju6wsw7rssu8fcve"}></Address>
      <Flex>
        <Flex.Item className={styles.freeContainer}>
          <div className={styles.freeLabel}>Free</div>
          <Balance value={0x1234567899999} className={styles.balance} />
        </Flex.Item>
        <Flex.Item className={styles.inUseContainer}>
          <div className={styles.inUseLabel}>In Use</div>
          <Balance value={0x1234a1b2cccc} className={styles.balance} />
        </Flex.Item>
      </Flex>
    </div>
  );
};
export default AddressList;
