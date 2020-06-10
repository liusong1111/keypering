import React from "react";
import styles from "./balance.module.scss";
import BN from "bn.js";

interface BalanceProps {
  value: number | string;
  className?: string;
  size?: string;
}

function formatCkb(_value: number | string) {
  let value: BN;
  if (typeof _value === "string") {
    if (_value.startsWith("0x")) {
      // value = parseInt(_value, 16);
      value = new BN(_value.slice(2), 16);
    } else {
      throw new Error(`format error: ${_value}`);
    }
  } else if (typeof _value === "number") {
    // value = _value;
    value = new BN(_value);
  } else {
    throw new Error(`format error: ${_value}`);
  }

  const m = value.div(new BN(100000000)).toNumber();
  // const m = Math.floor(value / 100000000);
  // const n = value % 100000000;
  const n = value.mod(new BN(100000000)).toNumber();
  const f = Intl.NumberFormat();
  const mf = f.format(m);
  const nf = n.toString().padStart(8, "0");
  return {
    m,
    n,
    mf,
    nf,
  };
}

const SizeClassDict = {
  normal: styles.normal,
  large: styles.large,
  small: styles.small,
} as { [key: string]: any };

const Balance = ({ value, className = "", size = "normal" }: BalanceProps) => {
  const { mf, nf } = formatCkb(value);
  const sizeClass = SizeClassDict[size];

  return (
    <span className={`${styles.balance} ${className} ${sizeClass}`}>
      <span className={styles.m}>{mf}</span>
.
      <span className={styles.n}>{nf}</span>
    </span>
  );
};

export default Balance;
