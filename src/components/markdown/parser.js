var Remarkable = require('remarkable');
var pinyin = require('tiny-pinyin')
const Entities = require('html-entities').AllHtmlEntities;

function parse(md, options) {
	console.log("markdown parsing!")
	const entities = new Entities();

	var RemarkableParser = new Remarkable({
		html: true
	});
	if (!options) options = {};
	var tokens = RemarkableParser.parse(md, {});
	var renderList = [];
	var env = [];
	var quickNavData = [];
	var listLevel = 0;
	var orderNum = [0, 0];
	var tmp;

	var getInlineContent = function (inlineToken) {
		var ret = [];
		var env;
		var tokenData = {};

		if (inlineToken.type === 'htmlblock') {
			var videoRegExp = /<video.*?src\s*=\s*['"]*([^\s^'^"]+).*?(poster\s*=\s*['"]*([^\s^'^"]+).*?)?(?:\/\s*>|<\/video>)/g;
			var match;
			var html = inlineToken.content.replace(/\n/g, '');
			while (match = videoRegExp.exec(html)) {
				if (match[1]) {
					var retParam = {
						type: 'video',
						src: match[1]
					};

					if (match[3]) {
						retParam.poster = match[3];
					}

					ret.push(retParam);
				}
			}
		} else {
			inlineToken.children && inlineToken.children.forEach(function (token) {
				if (['text', 'code'].indexOf(token.type) > -1) {
					ret.push({
						type: env || token.type,
						content: token.content,
						data: tokenData,
						selectable: true
					});
					env = '';
					tokenData = {};
				} else if (token.type === 'del_open') {
					env = 'deleted';
				} else if (token.type === 'softbreak') {
				} else if (token.type === 'hardbreak') {
					ret.push({
						type: 'text',
						content: '\n'
					});
				} else if (token.type === 'strong_open') {
					env = 'strong';
				} else if (token.type === 'em_open') {
					env = 'em';
				} else if (token.type === 'link_open') {
					if (options.link) {
						env = 'link';
						tokenData = {
							href: token.href
						};
					}
				} else if (token.type === 'image') {
					var img_alt = ""

					if (token.alt && token.alt.search("&#x") > -1) {
						img_alt = entities.decode(token.alt);
						img_alt = img_alt.replace('\\', '');
					}

					var splits = token.src.split('/')
					var imageKey = splits[splits.length - 1]
					var src = 'gitbook/assets/' + imageKey
					if (options.imageServerEndpoint) {
						src = options.imageServerEndpoint + src
						if (token.src.search('https://') > -1 || token.src.search('data:image/') > -1) {
							src = token.src
						}
						ret.push({
							type: token.type,
							src: src,
							alt: img_alt,
							selectable: true
						});
					}
				}
			});
		}

		return ret;
	};

	var getBlockContent = function (blockToken, index, firstInLi) {

		if (blockToken.type === 'htmlblock') {
			return getInlineContent(blockToken);
		} else if (blockToken.type === 'heading_open') {
			var token_name = tokens[index + 1]["content"]
			if (blockToken.hLevel === 2 && token_name) {
				var token_id = token_name.replace(/^\d+\.\s*/, '');
				token_id = token_id.replace(/\s/g, ''); // replace white space for id only

				token_id = token_id.replace(/[.,\/|\\#!$%\^&\*;:{}=\-_`~()（）？?！，：]/g, "")
				token_name = token_name.replace(/[.,\/|\\#!$%\^&\*;:{}=\-_`~()（）？?！，：]/g, "")

				if (pinyin.isSupported()) {
					token_id = pinyin.convertToPinyin(token_id) // WO
				}

				var quickNavObj = {
					name: token_name,
					id: 'id' + token_id
				}
				quickNavData.push(quickNavObj)

				return {
					type: 'h' + blockToken.hLevel,
					quick_nav_id: quickNavObj.id,
					content: getInlineContent(tokens[index + 1])
				};
			} else {
				return {
					type: 'h' + blockToken.hLevel,
					content: getInlineContent(tokens[index + 1])
				};
			}



		} else if (blockToken.type === 'paragraph_open') {
			// var type = 'p';
			var prefix = '';
			if (env.length) {
				prefix = env.join('_') + '_';
			}

			var content = getInlineContent(tokens[index + 1]);

			// 处理ol前的数字
			if (env[env.length - 1] === 'li' && env[env.length - 2] === 'ol') {
				let prefix = '　';
				if (firstInLi) {
					prefix = orderNum[listLevel - 1] + '. ';
				}
				content.unshift({
					type: 'text',
					content: prefix
				});
			}

			return {
				type: prefix + 'p',
				content: content
			};
		} else if (blockToken.type === 'fence' || blockToken.type === 'code') {
			content = blockToken.content;
			var highlight = false;
			// if (options.highlight && blockToken.params && prism.languages[blockToken.params]) {
			// 	content = prism.tokenize(content, prism.languages[blockToken.params]);
			// 	highlight = true;
			// }

			// flatten nested tokens in html
			if (blockToken.params === 'html') {
				const flattenTokens = (tokensArr, result = [], parentType = '') => {
					if (tokensArr.constructor === Array) {
						tokensArr.forEach(el => {
							if (typeof el === 'object') {
								el.type = parentType + ' wemark_inline_code_' + el.type
								flattenTokens(el.content, result, el.type)
							} else {
								const obj = {}
								obj.type = parentType + ' wemark_inline_code_'
								obj.content = el
								result.push(obj)
							}
						})
						return result
					} else {
						result.push(tokensArr)
						return result
					}
				}
				content = flattenTokens(content)
			}

			return {
				type: 'code',
				highlight: highlight,
				content: content
			};
		} else if (blockToken.type === 'bullet_list_open') {
			env.push('ul');
			listLevel++;
		} else if (blockToken.type === 'ordered_list_open') {
			env.push('ol');
			listLevel++;
		} else if (blockToken.type === 'list_item_open') {
			env.push('li');
			if (env[env.length - 2] === 'ol') {
				orderNum[listLevel - 1]++;
			}
		} else if (blockToken.type === 'list_item_close') {
			env.pop();
		} else if (blockToken.type === 'bullet_list_close') {
			env.pop();
			listLevel--;
		} else if (blockToken.type === 'ordered_list_close') {
			env.pop();
			listLevel--;
			orderNum[listLevel] = 0;
		} else if (blockToken.type === 'blockquote_open') {
			env.push('blockquote');
		} else if (blockToken.type === 'blockquote_close') {
			env.pop();
		} else if (blockToken.type === 'tr_open') {
			tmp = {
				type: 'table_tr',
				content: []
			};
			return tmp;
		} else if (blockToken.type === 'th_open') {
			tmp.content.push({
				type: 'table_th',
				content: getInlineContent(tokens[index + 1]).map(function (inline) { return inline.content; }).join('')
			});
		} else if (blockToken.type === 'td_open') {
			tmp.content.push({
				type: 'table_td',
				content: getInlineContent(tokens[index + 1]).map(function (inline) { return inline.content; }).join('')
			});
		}
	};

	tokens.forEach(function (token, index) {
		var firstInLi = false;
		if (token.type === 'paragraph_open' && tokens[index - 1] && tokens[index - 1].type === 'list_item_open') {
			firstInLi = true;
		}
		var blockContent = getBlockContent(token, index, firstInLi);
		if (!blockContent) return;
		if (!Array.isArray(blockContent)) {
			blockContent = [blockContent];
		}
		blockContent.forEach(function (block) {
			if (Array.isArray(block.content)) {
				block.isArray = true;
			} else {
				block.isArray = false;
			}
			renderList.push(block);
		});
	});
	return { renderList, quickNavData };
}

module.exports = {
	parse: parse
};
