
/**
 * main.js
 */


function vFun(){
    var self = this;

    /* 公共函数 即 默认执行 */

    self.isPhoneNum = function(v){
        //return /^0|^((\+?86 )|(\(\+86 \)))?(13[0-9]|15[012356789]|18[012356789]|14[57])[0-9]{8}$/.test(v);
        return /^1([0-9]){10}$/.test(v);
    }

    // 页面切换
    self.sectionChange = function(n){        // section 页面切换

        if(n == "video"){
            self.videoFun();
        }

        $(".section").removeClass("show transition");
        $("#" + n).addClass('show transition');
    }




}

var _v = new vFun();

