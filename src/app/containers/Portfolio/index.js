import React, { Component } from 'react';
import { Table } from 'antd';
import { observer, inject } from 'mobx-react';

import './index.less';

@inject(stores => ({
  portfolioList: stores.portfolio.portfolioList,
  changeTitle: newTitle => stores.session.changeTitle(newTitle),
  updateCoinPrice: () => stores.portfolio.updateCoinPrice()
}))

@observer
class Portfolio extends Component {
  
  columns = [
    {
      title: 'NAME',
      dataIndex: 'name',
      key: 'name',
      render: text => <div><img /><a>{text}</a></div>,
    }, {
      title: 'PRICE',
      dataIndex: 'price',
      key: 'price',
    }, {
      title: 'BALANCE',
      dataIndex: 'balance',
      key: 'balance',
    }, {
      title: 'VALUE',
      dataIndex: 'value',
      key: 'value'
    }, {
      title: 'PORTFOLIO',
      dataIndex: 'portfolio',
      key: 'portfolio',
    }
  ]

  componentWillMount() {
    this.props.changeTitle('Account Information');
  }

  componentDidMount() {
    this.timer = setInterval(() =>{
      this.props.updateCoinPrice();
    }, 5000)
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    return (
        <div>
            <Table columns={this.columns} dataSource={this.props.portfolioList} pagination={false}/>
        </div>
    );
  }
}

export default Portfolio;