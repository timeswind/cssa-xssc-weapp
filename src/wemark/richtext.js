exports.getRichTextNodes = function (parsedData) {

	var richTextNodes = [];

	var getNodeName = (function () {
		return function (type, nodeType = 'inline') {
			if (type === 'table_tr') {
				return 'tr';
			} else {
				if (type.indexOf('_') > -1) {
					var typePart = type.split('_');
					if (nodeType === 'inline') {
						return typePart.pop();
					} else {
						return typePart[0];
					}

				}
			}
			return type;
		};
	})();

	var getBlockNode = function (node) {
		var nodeType = node.type;
		var richTextNode = {
			name: getNodeName(nodeType, 'inline'),
			attrs: {
				class: 'wemark_block_' + nodeType,
				selectable: true
			},
			children: []
		};
		if (node.isArray) {
			node.content.forEach((childNode) => {
				if (['text', 'code', 'strong', 'deleted', 'em'].indexOf(childNode.type) > -1) {
					richTextNode.children.push({
						name: 'span',
						attrs: {
							class: 'wemark_inline_' + childNode.type,
							selectable: true
						},
						children: [{
							type: 'text',
							text: childNode.content
						}]
					});
				} else if (node.highlight) {
					if (typeof childNode === 'string') {
						richTextNode.children.push({
							name: 'span',
							attrs: {
								class: 'wemark_inline_code_text',
								selectable: true
							},
							children: [{
								type: 'text',
								text: childNode
							}]
						});
					} else {
						richTextNode.children.push({
							name: 'span',
							attrs: {
								class: 'wemark_inline_code_' + childNode.type,
								selectable: true
							},
							children: [{
								type: 'text',
								text: childNode.content
							}]
						});
					}
				} else if (childNode.type === 'link') {
					richTextNode.children.push({
						name: 'a',
						attrs: {
							class: 'wemark_inline_link',
							href: childNode.data.href,
							selectable: true
						},
						children: [{
							type: 'text',
							text: childNode.content
						}]
					});
				} else if (childNode.type === 'image') {
					richTextNode.children.push({
						name: 'img',
						attrs: {
							mode: 'widthFix',
							class: 'wemark_inline_image',
							src: childNode.src
						}
					});
				} else if (childNode.type === 'table_th') {
					richTextNode.children.push({
						name: 'th',
						attrs: {
							class: 'wemark_inline_table_th',
						},
						children: [{
							type: 'text',
							text: childNode.content
						}]
					});
				} else if (childNode.type === 'table_td') {
					richTextNode.children.push({
						name: 'td',
						attrs: {
							class: 'wemark_inline_table_td',
						},
						children: [{
							type: 'text',
							text: childNode.content
						}]
					});
				}
			});
		} else if (node.type === 'code') {

			richTextNode.children = [{
				name: 'code',
				children: [{
					type: 'text',
					text: node.content
				}]
			}];
		}
		return richTextNode;
	}

	for (var i = 0; i < parsedData.length; i++) {
		var node = parsedData[i];
		if (node.type === 'table_tr') {
			var tableNode = {
				name: 'table',
				attrs: {
					class: 'wemark_block_table'
				},
				children: []
			};
			var tmpNode = node;
			while (tmpNode.type === 'table_tr') {
				tableNode.children.push(getBlockNode(tmpNode));
				tmpNode = parsedData[++i];
			}
			richTextNodes.push(tableNode);
		} else {
			richTextNodes.push(getBlockNode(node));
		}

	}

	return richTextNodes;

}
