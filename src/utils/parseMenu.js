// parseMenu.js
// parse Gitbook Generated SUMMERY.md as json structured menu item

module.exports = function (content) {
    var menuDataProcess = [];

    let SECONDARY_MENU_START = "  ";

    var lines = content.split('\n');
    lines.splice(0, 2);
    lines.pop();
    lines.pop();
    lines.forEach(function (line) {
        var isSecondary = false
        let char2compare = line.substring(0, 2)
        if (char2compare == SECONDARY_MENU_START) {
            isSecondary = true
        }

        var key = line.match(/\(([^)]+)\)/)[1];
        var value = line.match(/\[([^)]+)\]/)[1];
        var menu_item = {};

        menu_item['key'] = key;
        menu_item['value'] = value;
        menu_item['isSecondary'] = isSecondary;
        menuDataProcess.push(menu_item);
    });

    return menuDataProcess
}