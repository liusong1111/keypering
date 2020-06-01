import React from "react";
import styles from "./address.module.scss";

interface AddressProps {
  value: string;
  className?: string;
}

const splitAddress = (value: string): [string, string] => {
  const left = value.slice(0, 7);
  const right = value.slice(value.length - 20, value.length);
  return [left, right];
};

const Address = ({ value, className = "" }: AddressProps) => {
  const [left, right] = splitAddress(value);
  return (
    <span className={`${styles.address} ${className}`}>
      <span className={styles.left}>{left}</span>
      ...
      <span className={styles.right}>{right}</span>
    </span>
  );
};

export default Address;
