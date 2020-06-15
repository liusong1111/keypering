import React from "react";
import { Button } from "antd-mobile";
import styles from "./authorization.module.scss";
import Timestamp from "../timestamp";

interface AuthorizationProps {
  origin: string;
  token: string;
  timestamp: string | number | Date;
  onRevoke: any;
  [key: string]: any;
}

const Authorization = ({ origin, token, timestamp, onRevoke }: AuthorizationProps) => {
  return (
    <div>
      <div className={styles.applicationContainer}>
        <span className={styles.applicationLabel}>Application: </span>
        <a className={styles.link} href={origin} target="_blank">
          {origin}
        </a>
      </div>
      <div className={styles.container}>
        <Timestamp className={styles.timestamp} value={timestamp} />
        <Button inline size="small" onClick={() => onRevoke(token)} className={styles.revokeButton}>
          Revoke
        </Button>
      </div>
    </div>
  );
};

export default Authorization;
