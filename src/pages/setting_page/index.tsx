import React, {useEffect, useState} from "react";
import { NavBar, Flex, Checkbox, Radio, Icon, List } from "antd-mobile";
import { useHistory } from "react-router";
import Storage from "../../services/storage";

const SettingPage = () => {
  const [setting, setSetting] = useState(null as any);
  const history = useHistory();
  useEffect(() => {
    (async () => {
      const store = Storage.getStorage();
      const setting = await store.getSetting();
      console.log(setting);
      setSetting(setting);
    })();
  }, []);
  const handleChangePlugin = async (pluginName: string, e: any) => {
    setting.plugins[pluginName]  = e.target.checked;
    setSetting(setting);
    console.log("change setting:", setting);
    const store = Storage.getStorage();
    await store.setSetting(setting);
  };
  const handleChangeNet = async (value: string, checked: boolean) => {
    // setting.net = value;
    const newSetting = {...setting, net: value};
    const store = Storage.getStorage();
    await store.setSetting(newSetting);
    setSetting(newSetting);
    console.log("checked: ", checked);
  };
  if(!setting) {
    return null;
  }
  return (
    <div>
      <NavBar mode="dark" icon={<Icon type="left" />} onLeftClick={() => history.goBack()} leftContent="Setting" />
      <Flex>
        <Flex.Item>
          <List renderHeader={() => "Lock plugins"}>
            <List.Item>
              <Checkbox.CheckboxItem defaultChecked={setting.plugins?.secp256k1} onChange={(e: any) => handleChangePlugin("secp256k1", e)}>default secp256k1(system)</Checkbox.CheckboxItem>
            </List.Item>
            <List.Item>
              <Checkbox.CheckboxItem defaultChecked={setting.plugins?.anypay} onChange={(e: any) => handleChangePlugin("anypay", e)}>anyone-can-pay(system)</Checkbox.CheckboxItem>
            </List.Item>
            <List.Item>
              <Checkbox.CheckboxItem defaultChecked={setting.plugins?.pw} onChange={(e: any) => handleChangePlugin("pw", e)}>pw Ethereum compatible</Checkbox.CheckboxItem>
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
              <Radio.RadioItem checked={setting.net === "mainnet"} onChange={(e: any) => handleChangeNet("mainnet", e.target.checked)}>Default mainnet rpc(experimental)</Radio.RadioItem>
              <Radio.RadioItem checked={setting.net === "testnet"} onChange={(e: any) => handleChangeNet("testnet", e.target.checked)}>Default testnet rpc(experimental)</Radio.RadioItem>
              <Radio.RadioItem checked={setting.net === "devnet"} onChange={(e: any) => handleChangeNet("devnet", e.target.checked)}>User defined testnet rpc(experimental)</Radio.RadioItem>
            </List.Item>
          </List>
        </Flex.Item>
      </Flex>
    </div>
  );
};

export default SettingPage;
