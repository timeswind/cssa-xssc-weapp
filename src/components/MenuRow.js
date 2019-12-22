import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
// import './footerinfo.css';
import './MenuRow.css';

export default class MenuRow extends Component {

    onItemClick (index, e) {
        this.props.onItemClick && this.props.onItemClick(index)
    }

    render() {
        const {menuItem, isSecondary, index, isSelected} = this.props
        var className = ""
        if (isSecondary == true) {
            className += "menurow-secondary "
        } else {
            className += "menurow "
        }

        if (isSelected == true) {
            className += "menurow-selected "
        }

        return (
            <View className={className} 
            onClick={this.onItemClick.bind(this, index)}>
                {menuItem.value}
            </View>
        )
    }
}