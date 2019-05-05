import React, { Component } from 'react';
import { Button, Table, Row, Col } from 'antd';
import { observer, inject } from 'mobx-react';

import './index.less';

import { EditableFormRow, EditableCell } from './Rename';
import SendNormalTrans from 'components/SendNormalTrans';
import CopyAndQrcode from 'components/CopyAndQrcode';

const WAN = "m/44'/5718350'/0'/0/";

@inject(stores => ({
  transParams: stores.sendTransParams.transParams,
  addrInfo: stores.wanAddress.addrInfo,
  getAmount: stores.wanAddress.getAmount,
  getAddrList: stores.wanAddress.getAddrList,
  updateName: arr => stores.wanAddress.updateName(arr),
  addAddress: newAddr => stores.wanAddress.addAddress(newAddr),
  changeTitle: newTitle => stores.session.changeTitle(newTitle),
}))

@observer
class WanAccount extends Component {
  state = {
    bool: true,
    isUnlock: false,
  }

  columns = [
    {
      title: 'NAME',
      dataIndex: 'name',
      editable: true
    }, 
    {
      title: 'ADDRESS',
      dataIndex: 'address',
      render: text => <div className="addrText"><p className="address">{text}</p><CopyAndQrcode addr={text}/></div>
    }, 
    {
      title: 'BALANCE',
      dataIndex: 'balance',
      sorter: (a, b) => a.balance - b.balance,
    }, 
    {
      title: 'ACTION',
      dataIndex: 'action',
      render: (text, record) => <div><SendNormalTrans from={record.address} handleSend={this.handleSend}/></div>
    }
  ];

  componentWillMount() {
    this.props.changeTitle('Wallet Detail');
  }

  handleSend = (from) => {
    console.log("from", from)
    let params = this.props.transParams[from];
    console.log(params);
    // let rawTx = {
    //   to: params.to,
    //   value: '0x' + new BigNumber(params.amount).times(BigNumber(10).pow(18)).toString(16),
    //   data: params.data,
    //   chainId: params.chainId,
    //   nonce: '0x' + params.nonce.toString(16),
    //   gasLimit: '0x' + params.gasLimit.toString(16),
    //   gasPrice: '0x' + new BigNumber(params.gasPrice).times(BigNumber(10).pow(9)).toString(16),
    //   Txtype: params.txType
    // };
    // console.log("raw", rawTx)

    // this.props.signTransaction(params.path, rawTx, (signedTx) => {
    //   console.log('signedTx', signedTx)
    //   wand.request('transaction_raw', { raw: signedTx, chainType: 'WAN' }, (err, val) => {
    //     if (err) {
    //       message.warn("Send transaction failed. Please try again");
    //       console.log(err);
    //     } else {
    //       console.log("TxHash:", val);
    //     }
    //   });
    // });

    this.setState({ visible: true });
  }

  creatAccount = () => {
    const { addrInfo, addAddress } = this.props;
    const addrLen = Object.keys(addrInfo).length;
    this.setState({
      bool: false
    });

    if(this.state.bool) {
      wand.request('address_get', { walletID: 1, chainType: 'WAN', start: addrLen, end: addrLen + 1 }, (err, val_address_get) => {
        if (!err) {
          let ret = val_address_get;
          wand.request('account_create', { walletID: 1, path: `${WAN}${addrLen}`, meta: {name: `Account${addrLen+1}`, addr: `0x${val_address_get.addresses[0].address}`}}, (err, val_account_create) => {
            if (!err && val_account_create) {
              let addressInfo = ret.addresses[0];
              addressInfo.start = addressInfo.index;
              addressInfo.address = `0x${addressInfo.address}`;
              addAddress(addressInfo);
              this.setState({
                bool: true
              });
            }
          });
        }
      });
    }
  }

  unlockHD = () => {
    wand.request('wallet_unlock', { pwd: '123' }, (err, val) => {
      if (err) console.log('error printed inside callback: ', err)
      this.setState({
        isUnlock: val
      });
    })
  }

  handleSave = row => {
    this.props.updateName(row);
  }

  render() {
    const { getAmount } = this.props;
    const components = {
      body: {
        cell: EditableCell,
        row: EditableFormRow,
      },
    };

    const columns = this.columns.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });

    return (
      <div className="account">
        <Row className="title">
          <Col span={12} className="col-left">Total: { getAmount }</Col>
          <Col span={12} className="col-right">
            <Button type="primary" shape="round" size="large" onClick={this.unlockHD}>unlockHD</Button>
            <Button className="creatBtn" type="primary" shape="round" size="large" onClick={this.creatAccount}>Create</Button>
          </Col>
        </Row>
        <Row className="mainBody">
          <Col>
            <Table components={components} rowClassName={() => 'editable-row'} className="content-wrap" pagination={false} columns={columns} dataSource={this.props.getAddrList} />
          </Col>
        </Row>
      </div>
    );
  }
}

export default WanAccount;