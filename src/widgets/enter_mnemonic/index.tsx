import React, { createRef } from "react";
import { Button, Card, TextareaItem, Toast, WhiteSpace } from "antd-mobile";
import styles from "./enter_mnemonic.module.scss";

interface EnterMnemonicProps {
  onBack: any;
  onNext: any;
}

class EnterMnemonic extends React.Component<EnterMnemonicProps, any> {
  private textareaRef = createRef<any>();

  constructor(props: EnterMnemonicProps) {
    super(props);
    this.state = {
      inputMnemonic: "",
    };
  }

  componentDidMount() {
    this.textareaRef.current.focus();
  }

  handleInputMnemonic = (value: any) => {
    this.setState({ inputMnemonic: value });
  };

  handleNext = () => {
    const { onNext } = this.props;
    const { inputMnemonic } = this.state;
    onNext(inputMnemonic);
  };

  render() {
    const { inputMnemonic } = this.state;
    const { onBack } = this.props;
    return (
      <Card className={styles.card}>
        <Card.Header className={styles.cardHeader} title="Enter mnemonic" />
        <Card.Body>
          <TextareaItem
            value={inputMnemonic}
            rows={5}
            ref={this.textareaRef}
            onChange={this.handleInputMnemonic}
            className={styles.inputMnemonic}
          />
        </Card.Body>
        <Card.Footer
          content={
            <div>
              <Button onClick={onBack}>Back</Button>
              <WhiteSpace />
              <Button onClick={this.handleNext} type="primary">
                Next
              </Button>
            </div>
          }
        />
      </Card>
    );
  }
}

export default EnterMnemonic;
