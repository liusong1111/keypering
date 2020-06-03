import React from "react";
import styles from "./tag.module.scss";

interface TagProps {
  children: any;
  className?: string;
}
const Tag = ({ children, className }: TagProps) => {
  return <span className={`${styles.tag} ${className}`}>{children}</span>;
};

export default Tag;
