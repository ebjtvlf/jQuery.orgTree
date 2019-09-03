/*
jQuery.kintoneOrgTree
*/
(function($) {
    /*
    DOMツリー構造作成
    */
    function makeOrgSelect(tree, depth, treeParentNext) {
        var ul = document.createElement('ul');
        if(depth === 1) {
            ul.setAttribute('class', 'left_0');//
        }
        var fragment = document.createDocumentFragment();

        for(var i = 0; i < tree.length; i++){
            var li    = document.createElement('li');
            var label = document.createElement('label');
            var input = document.createElement('input');
            input.setAttribute('type', 'checkbox');
            input.setAttribute('class', 'hidden');
            input.setAttribute('name', tree[i].code);
            input.setAttribute('value', tree[i].code);
            var treeNext = !!(tree[i+1]);
            if(1 < depth) {
                var str = "";

                for(var j = 1; j < treeParentNext.length; j++) {
                    if(treeParentNext[j]) {
                        str += "│ ";
                    } else {
                        str += "\u00a0\u00a0\u00a0\u00a0";
                    }
                }
                if(treeNext) {
                    str += "├ ";
                } else {
                    str += "└ ";
                }
                li.appendChild(document.createTextNode(str));//
            }
            label.appendChild(input);
            label.appendChild(document.createTextNode(tree[i].name));
            li.appendChild(label);
            fragment.appendChild(li);
            if(tree[i].children && tree[i].children.length) {
                var tpn = $.extend([], treeParentNext);
                tpn.push(treeNext);
                var _ul = makeOrgSelect(tree[i].children, depth + 1, tpn);
                li.appendChild(_ul);
                fragment.appendChild(li);
            }
        }
        ul.appendChild(fragment);
        return ul;
    }

    /*
    treeDom作成
    */
    var Group = function(code, name) {
        this.code = code;
        this.name = name;
        this.parent = null;
        this.children = [];
        this.addChild = function(child) {
            this.children.push(child);
            child.parent = this;
        }
        this.addChildren = function(childrenArray) {
            for (let i = 0; i < childrenArray.length; i++) {
                this.addChild(childrenArray[i]);
            }
        }
    }

    /*
    ツリー構造オブジェクト作成
    */
    function makeOrgObject(groups) {
        const arrayTmp = groups.map(function(group) {
            return {
                groupInstance : new Group(group.code, group.name),
                parentCode : group.parentCode
            };
        });
        const searchInstanceByParentCode = function(code) {
            const returnArray = [];
            for (let i = 0; i < arrayTmp.length; i++) {
                const instance = arrayTmp[i].groupInstance;
                const parentCode = arrayTmp[i].parentCode;
                if (parentCode === code) {
                    returnArray.push(instance);
                }
             }
             return returnArray;
        }
        const ROOT = new Group(null, 'ROOT');
        for (let i = 0; i < arrayTmp.length; i++) {
            const group = arrayTmp[i].groupInstance;
            const childrenGroups = searchInstanceByParentCode(group.code);
            group.addChildren(childrenGroups);
            if (arrayTmp[i].parentCode === null) {
                ROOT.addChild(group);
            }
        }
        return ROOT.children;
    }

    $.fn.kintoneOrgTree = function(option) {
        if(option.apiResponse.organizations) {
            var orgObject = makeOrgObject(option.apiResponse.organizations);
            var orgTree   = makeOrgSelect(orgObject, 1);
        } else if(option.apiResponse.groups) {
            var orgTree = makeOrgSelect(option.apiResponse.groups, 1);
        }
        this.append(orgTree);

        return this;
    };
})(jQuery);
