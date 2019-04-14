import { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtSearchBar, AtList, AtListItem } from 'taro-ui'

class ReaderSearchBar extends Component {
    state = {
        searchValue: ''
    }
    searchOnChange(newValue) {
        if (newValue == '') {
            this.props.clearSearchResult()
        }
        this.setState({searchValue: newValue})
    }
    searchOnActionClick() {
        this.props.searchOnActionClick(this.state.searchValue)
    }
    handleSeachResultClick(sectionKey, e) {
        e.stopPropagation();
        this.props.handleSeachResultClick(sectionKey)
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.searchResults !== nextProps.searchResults) {
            return true
        }
        if (this.state.searchValue !== nextState.searchValue) {
            return true
        }

        return false
    }
    render() {
        const { searchResults } = this.props;
        const { searchValue } = this.state;
        const searchResultRender = (
            <AtList>
                {searchResults.map((result) =>
                    <AtListItem title={result.title} onClick={this.handleSeachResultClick.bind(this, result.key)} arrow='right' key={result.key} />
                )}
            </AtList>
        )
        return (
            <View className="reader-search-bar">
                <AtSearchBar
                    actionName='搜一下'
                    value={searchValue}
                    onChange={this.searchOnChange.bind(this)}
                    onActionClick={this.searchOnActionClick.bind(this)}
                />
                {searchResultRender}
            </View>
        )
    }
}

ReaderSearchBar.defaultProps = {
    searchResults: []
}

export default ReaderSearchBar 