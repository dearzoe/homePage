var DOM = (function () { //这个作用域不销毁
    var flag = "getComputedStyle" in window;
    //惰载函数
    function listToArray(likeArray) {
        var arr = [];
        try{
            arr= Array.prototype.slice.call(likeArray);
        }catch (e){
            for(var i =0; i<likeArray.length;i++){
                arr.push(likeArray[i]);
            }
        }
        return arr;
    }
    return {
        listToArray:listToArray,
        jsonParse: function (jsonStr){
            return 'JSON' in window ? JSON.parse(jsonStr) : eval("(" + jsonStr+")");
        },
        /**
         *  获取网页宽高
         * @param attr 属性("clientHeight")
         * @param val  属性值
         * @returns {*}
         */
        win: function (attr,val) {
            if(typeof val=="undefined"){
                return document.documentElement[attr]||document.body[attr]
            }
            document.documentElement[attr]=val;
            document.body[attr]=val;
            //return  attr+val
        },
        /**
         *
         * @param ele 要获取的某个元素的什么值(div)
         * @param attr  要获取的属性("background")
         * @returns {*}
         */
        getCss: function (ele,attr) {
            var val = '';
            var reg = '';
            if(flag){
                val =  getComputedStyle(ele,null)[attr];
            }else{
                if(attr=="opacity"){
                    val =  ele.currentStyle["filter"];
                    reg = /^alpha\(opacity=(\d+(\.\d+)?)\)$/;
                    val = reg.test(val)?reg.exec(val)[1]/100:1;
                }else{
                    val =  ele.currentStyle[attr];
                }
            }
            reg=/^-?\d+(\.\d+)?(px|pt|em|rem|%)?$/;
            return reg.test(val)?parseFloat(val):val;
        },
        /**
         *
         * @param ele 元素
         * @returns {{top: (Number|number), left: (Number|number)}} 返回值有两个top和left
         */
        offset: function (ele) {
            var top = ele.offsetTop;
            var left = ele.offsetLeft;
            var p = ele.offsetParent;
            while (p){
                if(navigator.userAgent.indexOf("MSIE 8.0")===-1){
                    top+= p.clientTop;
                    left+= p.clientLeft;
                }
                top+= p.offsetTop;
                left+= p.offsetLeft;
                p = p.offsetParent;
            }
            return{
                top:top,
                left:left
            }
        },
        /**
         *
         * @param ele 元素
         * @param tagName  元素下的标签
         * @returns {Array}
         */
        children:function(ele,tagName){
            var arr = [];
            if(flag){
                arr = this.listToArray(ele.children);
            }else{
                for(var i =0; i<ele.childNodes.length;i++){
                    var cur = ele.childNodes[i];
                    if(cur.nodeType==1){
                        arr[arr.length] = cur;
                    }
                }
            }
            if(typeof tagName=="string"){
                var newArr = [];
                for(var i =0; i<arr.length;i++){
                    var cur = arr[i];
                    if(cur.nodeName==tagName.toUpperCase()){
                        newArr.push(cur);
                    }
                }
                arr = newArr;
            }
            return arr;
        },
        /**
         *
         * @param ele 要获得的上一元素
         * @returns {*}
         */
        prev: function (ele) {
            if(flag){return ele.previousElementSibling;}
            var p = ele.previousSibling;//先找一次
            while (p&& p.nodeType!=1){
                p = p.previousSibling;
            }
            return p;
        },
        next: function (ele) {
            if(flag){
                return ele.nextElementSibling;
            }
            var p = ele.nextSibling;
            while (p&& p.nodeType!=1){
                p= p.nextSibling;
            }
            return p;
        },
        prevAll: function (ele) {
            var arr = [];
            var p = this.prev(ele);//先往上找一个元素标签
            while (p){
                arr.unshift(p); //到倒过来放
                p = this.prev(p);
            }
            return arr;
        },
        nextAll: function (ele) {
            var arr = [];
            var n = this.next(ele);
            while (n){
                arr.push(n);
                n = this.next(n);
            }
            return arr;
        },
        /*
        * 获取相邻元素 上一个哥哥和下一个弟弟
        * */
        /**
         *
         * @param ele 此元素的上一个和下一个的
         * @returns {Array}
         */
        sibling: function (ele) {
            var arr = [];
            //没有的话会返回null
            this.prev(ele)?arr.push(this.prev(ele)):false;
            this.next(ele)?arr.push(this.next(ele)):false;
            return arr;
        },
        /*
        * 获取兄弟元素 所有的哥哥和所有的弟弟
        * */
        siblings: function (ele) {
            //没有的话返回数组
            return this.prevAll(ele).concat(this.nextAll(ele));
        },
        /*
        * 获得当前元素的索引位置
        * */
        index: function (ele) {
            return this.prevAll(ele).length;
        },
        /*
        * firstChild 第一个儿子节点
        * */
        firstChild: function (container) {
            if(flag){
                return container.firstElementChild;
            }
            //拿到所有儿子节点 看看有没有儿子,如果有儿子取出儿子中的第一个
            return this.children(container).length?this.children(container)[0]:null;
        },
        lastChild: function (container) {
            if(flag){ //是否是高版本浏览器
                return container.lastElementChild;
            }
            return this.children(container).length?this.children(container)[this.children(container).length-1]:null;
        },
        //把某个元素追加到哪个元素里面的末尾
        /**
         *
         * @param ele  要添加的元素
         * @param container 父级元素
         */
        append: function (ele,container) {
           return container.appendChild(ele);
        },
        /**
         *
         * @param ele 我们要插进去的那个元素
         * @param container 把元素放到哪个容器里
         */
        prepend: function (ele,container) {
            var of = this.firstChild(container);
            return container.insertBefore(ele,of);
        },
        /**
         *
         * @param newEle 新的元素插入到oldEle前面
         * @param oldEle 旧的元素
         */
        insertBefore: function (newEle,oldEle) {
            return oldEle.parentNode.insertBefore(newEle,oldEle);
        },

        insertAfter: function (ele,oldEle) {
            var oN = this.next(oldEle);
            return oldEle.parentNode.insertBefore(ele,oN);
        },
        /**
         *
         * @param ele  元素
         * @param name   (className里面是否含有"")   true/false
         * @returns {boolean}
         */
        hasClass:  function (ele,name){
            var reg = new RegExp("(?:^| +)"+name+"(?: +|$)");
            return reg.test(ele.className);
        },
        /**
         *
         * @param ele   元素
         * @param className   (你想添加的className名字,需要加双引号“”)
         */
        addClass:function (ele,className){
            var ary = className.split(/\s+/);
            for(var i=0;i<ary.length;i++){
                var cur =ary[i];
                if(!this.hasClass(ele,cur)){
                    ele.className+=' '+cur;
                }
            }
        },
        /**
         *
         * @param ele   元素
         * @param className   (你想要删除的className名字需要加双引号“”)
         */
        removeClass:function (ele,className){
            if(this.hasClass(ele,className)){
                ele.className=ele.className.replace(className,"");
            }
        },

        /**
         *
         * @param className
         * @param context
         * @returns {*}
         */
        getByClassName:function getElementsByClassName(className,context){
            var context = context||document;
            console.log(flag);
            if(flag){
                return DOM.listToArray(context.getElementsByClassName(className));
            }
            var allTag = context.getElementsByTagName("*");
            var classList = className.replace(/^ +| +$/g,"").split(/\s+/);
            var arr = [];
            for(var i=0;i<allTag.length;i++){
                var cur = allTag[i];
                var f = true;
                for(var j = 0; j<classList.length;j++){
                    var curClassName = classList[j];
                    var reg = new RegExp("(?:^| +)"+curClassName+"(?: +|$)");
                    if(!reg.test(cur.className)){
                        f = false;
                        break;
                    }
                }
                if(f){
                    arr.push(cur);
                }
            }
            return arr;

        },
        /**
         *
         * @param ele  要设置的元素
         * @param attr  CSS属性
         * @param value  属性值
         */
        setCss:function (ele,attr,value){
        if(attr=="opacity"){
            if(window.navigator.userAgent.indexOf('MSIE')>=0){
                ele.style["filter"]='alpha(opacity'+value*100+')';
            }else{
                ele.style.opacity=value;
            }
            return;
        }
        //float 问题
        if(attr=='float'){
            ele.style['cssFloat']=value;
            ele.style['styleFloat']=value;
            return;
        }



        var reg=/^(width|height|left|top|right|bottom|(margin|padding)(Top|Bottom|Left|Right)?)$/
        if(reg.test(attr)){
            if(!isNaN(value)){
                value+="px";
            }
        }

        ele.style[attr]=value;
    },
        setGroupCss: function (ele, obj) {
            //首先保证obj是一个对象
            /*
             if(!Object.prototype.toString.call(obj) == '[object Object]'){
             return;
             }
             */
            //我嫌弃这个有点长
            obj = obj || 0; //如果没传要做处理
            if (obj.toString() != '[object Object]') {
                return;
            }
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    this.setCss(ele, key, obj[key]);
                }
            }
        }
    }
})();