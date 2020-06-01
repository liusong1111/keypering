import React from "react";
import { NavBar, Flex, Checkbox, Icon, List } from "antd-mobile";

const SettingPage = () => {
  return (
    <div>
      <NavBar mode="dark" icon={<Icon type="left" />} onLeftClick={() => window.history.back()} leftContent="Setting"></NavBar>
      <Flex>
        <Flex.Item>
          <List renderHeader={() => "Lock plugins"}>
            <List.Item>
              <Checkbox.CheckboxItem defaultChecked>default secp256k1(system)</Checkbox.CheckboxItem>
            </List.Item>
            <List.Item>
              <Checkbox.CheckboxItem defaultChecked>anyone-can-pay(system)</Checkbox.CheckboxItem>
            </List.Item>
            <List.Item>
              <Checkbox.CheckboxItem defaultChecked>pw Ethereum compatible</Checkbox.CheckboxItem>
            </List.Item>
            <List.Item>
              <Checkbox.CheckboxItem>&lt;user defined 1&gt;</Checkbox.CheckboxItem>
            </List.Item>
            <List.Item>
              <Checkbox.CheckboxItem>&lt;user defined 2&gt;</Checkbox.CheckboxItem>
            </List.Item>
          </List>
          <List renderHeader={() => "Rich node RPC"}>
            <List.Item>
              <Checkbox.CheckboxItem>Default mainnet rpc(experimental)</Checkbox.CheckboxItem>
              <Checkbox.CheckboxItem>Default testnet rpc(experimental)</Checkbox.CheckboxItem>
              <Checkbox.CheckboxItem>User defined testnet rpc(experimental)</Checkbox.CheckboxItem>
            </List.Item>
          </List>
        </Flex.Item>
      </Flex>
    </div>
  );
};

export default SettingPage;
