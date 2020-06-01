import React from "react";
import styles from "./timestamp.module.scss";

interface TimestampProps {
  value: string | number;
  className?: string;
}
const Timestamp = ({ value, className = "" }: TimestampProps) => {
  return <span className={`${className}`}>{value}</span>;
};

export default Timestamp;
