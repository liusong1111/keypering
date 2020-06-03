import React from "react";
import styles from "./page.module.scss";

interface PageProps {
  children: any;
  className?: string;
  [key: string]: any;
}

const Page = ({ children, className = "" }: PageProps) => {
  return <div className={`${styles.page} ${className}`}>{children}</div>;
};

export default Page;
