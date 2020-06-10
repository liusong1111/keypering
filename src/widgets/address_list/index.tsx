import React from "react";
import { Flex } from "antd-mobile";
import styles from "./address_list.module.scss";
import Balance from "../balance";
import Address from "../address";
import Tag from "../tag";

interface AddressWithAmount {
  address: string;
  type: string;
  freeAmount: string;
  inUseAmount: string;
}

interface AddressListProps {
  addresses: AddressWithAmount[];
}

// enum AddressType {
//   secp256k1 = "secp256k1 blake160",
//   anyoneCanPay = "anyone-can-pay",
//   pwEthereumCompatible = "pw Ethereum compatible",
// }

// const getAddressType = (addr: AddressListProps) => {
//   // if(addr.code_hash === "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8") {
//   //   return "secp256k1_blake160";
//   // } else {
//   //   return "anyone-cay-pay";
//   // }
//   return AddressType.secp256k1;
// };

const AddressList = ({ addresses }: AddressListProps) => {
  const view = addresses.map(({ address, type, freeAmount, inUseAmount }) => (
    <div className={styles.item} key={address}>
      <Tag>{type}</Tag>
      <Address className={styles.address} value={address} />
      <Flex>
        <Flex.Item className={styles.freeContainer}>
          <div className={styles.freeLabel}>Free</div>
          <Balance value={freeAmount} className={styles.balance} />
        </Flex.Item>
        <Flex.Item className={styles.inUseContainer}>
          <div className={styles.inUseLabel}>In Use</div>
          <Balance value={inUseAmount} className={styles.balance} />
        </Flex.Item>
      </Flex>
    </div>
  ));
  return <div>{view}</div>;
};
export default AddressList;
