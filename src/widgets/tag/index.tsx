import React from "react";
import styles from "./tag.module.scss";

interface TagProps {
  children: any;
  type?: "default" | "primary" | "blank";
  className?: string;
}
const Tag = ({ children, className, type = "default" }: TagProps) => {
  return <span className={`${styles.tag} ${className} ${styles[type]}`}>{children}</span>;
};

export default Tag;
