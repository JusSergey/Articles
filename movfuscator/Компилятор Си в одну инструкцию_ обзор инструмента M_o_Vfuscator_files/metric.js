(function(window, document) {
    var fab = window.___fabm_ !== undefined ? "___fabm_" : "___fab_";
        window[fab].on(true, function () {
            return detect(1);
        }).on(false, function () {
            return detect(0);
        });
        window[fab].check();

    var newVisitor = false;
    registerSession();




    var ajax = function (options) {
        this.opt = options;
        var browser = navigator.appName;
        if (browser == "Microsoft Internet Explorer") {
            this.http = new ActiveXObject("Microsoft.XMLHTTP");
        } else {
            this.http = new XMLHttpRequest();
        }
        if (this.opt.url) {
            this.request(this.opt.url);
        }
    };
    ajax.prototype = {
        request: function (req) {
            var method = this.opt.method.toUpperCase() || 'GET';
            if (method == 'GET' && this.opt.data) {
                req += (req.indexOf('?') > -1 ? "&" : "?") + toURLParams(this.opt.data);
            }
            this.http.open(method, req);
            var that = this;
            this.http.onreadystatechange = function () {
                that.handleResponse.call(that);
            };
            if (this.opt.returnType == 'json') {
                this.http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            }
            this.http.send((this.opt.data && method == 'POST') ? JSON.stringify(this.opt.data) : null);
        },
        handleResponse: function (arg) {
            if (this.http.readyState == 4) {
                var response = this.http.responseText;
                if (this.opt) {
                    if (this.opt.insertId) {
                        document.getElementById(this.opt.insertId).innerHTML = response;
                    }
                    if (this.opt.el) {
                        el.innerHTML = response;
                    }
                    if (this.opt.success) {
                        this.opt.success(response);
                    }
                }
            }
        }
    };
    ajax.do = function (options) {
        return new ajax(options);
    };


    function detect(blocked) {
        ajax.do({
            url: 'https://adblockmetrics.ru/analyze/'+document.querySelector('script[data-support="adbm"]').getAttribute('data-config')
            , data: {r: document.referrer, d: blocked, v: newVisitor? 1: 0}
            , method: "POST"
            , success: function (responseText) {
                try{
                    var response = JSON.parse(responseText).response;
                    if(response.settings && response.settings.trackGa ) {
                        if (typeof ga !== 'undefined') {
                            ga('send', 'event', 'Blocking Ads', blocked, {'nonInteraction': 1});
                        } else if (typeof _gaq !== 'undefined') {
                            _gaq.push(['_trackEvent', 'Blocking Ads', blocked, undefined, undefined, true]);
                        }
                    }
                    if (response.settings.callback && blocked) {
                        var ifr = document.createElement("iframe");
                        document.body.appendChild(ifr);
                        ifr.contentWindow.eval(response.settings.callback);
                        ifr.remove();
                    }
                } catch(e){}
            }
        });
    }
    function registerSession()
    {
        var pageDepth = parseInt(getCookie('adbm_depth', 0)) + 1;
        if (pageDepth == 1) {
            newVisitor = true;
        }
        setCookie('adbm_depth', pageDepth, {path: '/'});
    }


    function getCookie(name, defaultValue) {
        defaultValue = defaultValue || 0;
        var matches = window.document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : defaultValue;
    }

    function setCookie(name, value, options) {
        options = options || {};
        var expires = options.expires;
        if (typeof expires == "number" && expires) {
            var d = new Date();
            d.setTime(d.getTime() + expires * 1000);
            expires = options.expires = d;
        }
        if (expires && expires.toUTCString) {
            options.expires = expires.toUTCString();
        }
        value = encodeURIComponent(value);
        var updatedCookie = name + "=" + value;
        for (var propName in options) {
            updatedCookie += "; " + propName;
            var propValue = options[propName];
            if (propValue !== true) {
                updatedCookie += "=" + propValue;
            }
        }
        window.document.cookie = updatedCookie;
    }


})(window, document);