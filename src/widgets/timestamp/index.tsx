import React from "react";
import { format } from "date-fns";
import styles from "./timestamp.module.scss";

export function formatDate(d: string | number | object) {
  if (typeof d === "string") {
    return d;
  }
  const d1 = new Date(d as any);
  return format(d1, "yyyy-MM-dd HH:mm:ss");
}

interface TimestampProps {
  value: string | number | object;
  className?: string;
}

const Timestamp = ({ value, className = "" }: TimestampProps) => {
  return <span className={`${className}`}>{formatDate(value)}</span>;
};

export default Timestamp;
