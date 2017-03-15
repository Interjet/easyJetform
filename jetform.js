(function($){
    
    function Jetform(item, options) {
        this.options = $.extend({
            token: false,
            errorSelector: false,
            autoValidate: false,
            autoSend: false,
            resetErrorEvent: false,
            autoAlign: true,
            url: '//jetform.interjet.co.il/lead/save',
            template: {
                required: "{$field} שדה חובה",
                min_length: "{$field} חייב להיות באורך של {$value} תווים לפחות",
                max_length: "{$field} חייב להיות לא יותר מ-{$value} תווים",
                exact_length: "{$field} חייב להיות באורך של {$value} תווים",
                valid_email: "{$field} אינו מכיל כתובת דואל תקינה",
                valid_id_number: "מספר תעודת הזהות לא תקין",
                valid_url: "{$field} אינו מכיל כתובת תקינה",
                integer: "{$field} מכיל תווים לא מספריים",
                alpha: "{$field} מכיל תווים אשר אינם אותיות",
                response: {
                    sending: "שולח נתונים",
                    success: "הפרטים התקבלו בהצלחה",
                    fail: "ארעה שגיאה בזמן שליחת הנתונים",
                    unique: "ניתן להירשם פעם אחת בלבד",
                }
            },
            beforeSubmit: function(args){},
            onSuccess: function(args){},
            onError: function(args){},
            onFail: function(args){},
        }, options);

        this.form = $(item);
        
        this.fields = this.form.find('input, select, textarea');
        
        this.args = {
            token: options.token,
            ref: Jetform.Utils.queryString('ref') || '',
            media: Jetform.Utils.queryString('media') || '',
            campaign_source: Jetform.Utils.queryString('utm_source') || "",
            campaign_medium: Jetform.Utils.queryString('utm_medium') || "",
            campaign_term: Jetform.Utils.queryString('utm_term') || "",
            campaign_content: Jetform.Utils.queryString('utm_content') || "",
            campaign_name: Jetform.Utils.queryString('utm_campaign') || "",
            furl: document.location.href
        };

        this.errors = [];

        this.init();
    };

    Jetform.prototype = {
        showAllErrors: false,
        init: function() {
            // Determine the type of error presentation
            this.showAllErrors = !!this.options.errorSelector && $(this.options.errorSelector).length > 1;

            // Add attributes to the base element
            this.form.attr('novalidate', true);

            // Auto validate
            if(this.options.autoValidate) {
                this.validate();
            }

            // Auto send
            if(this.options.autoSend) {
                this.options.beforeSubmit.call(this, this.args);
                this.send();
            }

            // Auto Placeholders
            if(this.options.autoAlign) {
                this.inputTextFix();
            }

            // Submit event handler
            this.form.on('submit', $.proxy(function(event){
                event.preventDefault();

                // Get the fields (In case they where manipulated since the instance was created)
                this.fields = this.form.find('input, select, textarea');

                this.reset();
                this.validate();

                if(!!this.options.resetErrorEvent) {
                    this.fields.on(this.options.resetErrorEvent, $.proxy(function(event){
                        this.resetFieldError($(event.target));
                    }, this));
                }

                if(!this.errors.length){
                    this.options.beforeSubmit.call(this, this.args);
                    this.send();
                } else {
                    this.displayErrors();
                    this.options.onError.call(this, this.errors);
                }
            }, this));

        },
        validate: function() {
            var matches = [];

            // Validate the inputs using our validation engine
            this.fields.each($.proxy(function(index, field){
                if(!!$(field).data('validate')) {
                    $($(field).data('validate').split('|')).each($.proxy(function(i, rule){

                        // Skip inputs which are not required and contain no value
                        if($.inArray('required', $(field).data('validate').split('|')) < 0 && !$(field).val().length) {
                            return;
                        }

                        matches = rule.match(/\[(.*?)\]/);
                        if(!!matches) {
                            if(!Jetform.Utils.validations[rule.split('[')[0]].call(this, $(field), matches[1])) {
                                this.errors.push({
                                    field: $(field),
                                    rule: rule.split('[')[0],
                                    value: matches[1],
                                    message: this.compileError($(field), rule.split('[')[0], matches[1])
                                });
                            }
                        } else {
                            if(!Jetform.Utils.validations[rule.split('[')[0]].call(this, $(field))) {
                                this.errors.push({
                                    field: $(field),
                                    rule: rule.split('[')[0],
                                    value: null,
                                    message: this.compileError($(field), rule.split('[')[0])
                                });
                            }
                        }
                    }, this));
                }
            }, this));
        },
        reset: function(){
            this.errors = [];

            this.form.find('[aria-invalid="true"]').attr('aria-invalid','false');

            if(!!this.options.errorSelector) {
                $(this.options.errorSelector).text('');
            }
        },
        resetFieldError: function(field){
            if(!!this.options.errorSelector) {
                field.closest('div').find(this.options.errorSelector).text('').hide();
                field.attr('aria-invalid', true);
            } else {
                $(this.options.errorSelector).text('').hide();
            }

        },
        collectInputData: function(){
            this.fields.each($.proxy(function(index, field){
                if($(field).attr('type') == 'checkbox'){
                    this.args[$(field).attr('name')] = $(field).is(':checked')
                } else if($(field).attr('type') == 'radio'){
                    this.args[$(field).attr('name')] = $('input[name="' + $(field).attr('name') + '"]:checked').val()
                } else{
                    this.args[$(field).attr('name')] = $(field).val();
                }
            }, this));
        },
        send: function() {
            // Call the event handler
            this.options.beforeSubmit.call(this, this.args);

            // Collect the input data
            this.collectInputData();

            // Reset the form
            this.form.trigger('reset');

            // Send the data using CORS
            Jetform.Utils.postCORS('//jetform.interjet.co.il/lead/save', $.param(this.args), $.proxy(function(response){
                if(response.indexOf('success')>-1){
                    if(typeof dataLayer == 'object'){
                        var layer = $.extend(true, {'event':'jetform_submit_success'}, this.args);
                        $.each(['L','R','browser_next_url','campaign_content','campaign_medium','campaign_name','campaign_source','campaign_term','furl','source_referrer','token','use_browser'], function(i,v){
                            if(v in layer)
                                delete layer[v];
                        });
                        
                        dataLayer.push(layer);
                    }

                    this.options.onSuccess.call(this, this.args);
                } else if(response.indexOf('reason=unique') >- 1){
                    this.options.onFail.call(this, this.options.template.response.unique);
                } else{
                    this.options.onFail.call(this, this.options.template.response.fail);
                }
            }, this));
        },
        displayErrors: function(){
            var displayedFields = [];

            // Display all the errors
            $.each(this.errors, $.proxy(function(index, error){
                if($.inArray(error.field.attr('id'), displayedFields) < 0) {
                    if(this.showAllErrors) {
                        if(!!this.options.errorSelector) {
                            error.field.closest('div').find(this.options.errorSelector).text(error.message).show();
                            error.field.attr('aria-invalid', true);
                        } else {
                            alert(error.message);
                        }

                        error.field.trigger('error', error);
                    } else {
                        if(!!this.options.errorSelector) {
                            $(this.options.errorSelector).text(error.message).show();
                        } else {
                            alert(error.message);
                        }

                        error.field.trigger('error', error);

                        return false;
                    }

                    displayedFields.push(error.field.attr('id'));
                }
            }, this));

            // Focus the first field
            this.errors[0].field.focus();
        },
        compileError: function(element, rule, value){
            var error = this.options.template[rule].replace('{$field}', element.data('name') || element.attr('placeholder') || element.parent().find('label').text() || element.parent().text());
            error = (!!value) ? error.replace('{$value}', value) : error;
            return error;
        },
        inputTextFix: function(){
            var isRegExpSupported = ('RegExp' in window),
                isTestRegExpSupported = ('test' in RegExp.prototype);
            
            $.each(this.fields, function(index, element) {
                if (!!$(element).attr('placeholder')) {
                    if (!!isRegExpSupported && !!isTestRegExpSupported)
                        _setStyleDirectionRegExp(element, $(element).attr('placeholder').substr(0, 1));
                    else
                        _setStyleDirectionCharCode(element, $(element).attr('placeholder').substr(0, 1));
                }
                $(element).keyup(function(e) {
                    if ($(this).val().length > 0) {
                        if (!!isRegExpSupported && !!isTestRegExpSupported)
                            _setStyleDirectionRegExp(this, $(this).val().substr(0, 1));
                        else
                            _setStyleDirectionCharCode(this, $(this).val().substr(0, 1));
                    } else if (!$(this).val().length) {
                        if (!!$(element).attr('placeholder')) {
                            if (!!isRegExpSupported && !!isTestRegExpSupported)
                                _setStyleDirectionRegExp(this, $(this).attr('placeholder').substr(0, 1));
                            else
                                _setStyleDirectionCharCode(this, $(this).attr('placeholder').substr(0, 1));
                        }
                    }
                });
            });

            function _setStyleDirectionRegExp(element, char) {
                var rtl = '\u0591-\u07FF\uFB1D-\uFDFF\uFE70-\uFEFC',
                rx = new RegExp('[' + rtl + ']');
                if (rx.test(char))
                    $(element).css({
                        'text-align': 'right',
                        'direction': 'rtl'
                    });
                else
                    $(element).css({
                        'text-align': 'left',
                        'direction': 'ltr'
                    });
            }

            function _setStyleDirectionCharCode(element, char) {
                var CharCode = char.charCodeAt(0);
                if ((CharCode >= 1488 && CharCode <= 1514) || (CharCode >= 1570 && CharCode <= 1747))
                    $(element).css({
                        'text-align': 'right',
                        'direction': 'rtl'
                    });
                else
                    $(element).css({
                        'text-align': 'left',
                        'direction': 'ltr'
                    });
            }
            return this;
        }
    };

    Jetform.Utils = {
        queryString: function(a, b) {
            var c = "",
                d = [],
                e = [];
            c = b || decodeURIComponent(window.location.hash.length ? window.location.search.substring(1) + window.location.hash : window.location.search.substring(1)), c.indexOf("&") == -1 ? d.push(c) : d = c.split("&");
            for (var f = 0; f < d.length; f++)
                if (e = d[f].split("="), e[0].toLowerCase() == a.toLowerCase()) return e[1];
            return !1
        },
        validations: {
            min_length: function(string, value){
                return value <= string.val().length;
            },
            max_length: function(string, value){
                return value >= string.val().length;
            },
            exact_length: function(string, value){
                return value == string.val().length;
            },
            required: function(string){
                if(string.attr('type') == 'checkbox'){
                    return string.is(':checked')
                } else if(string.attr('type') == 'radio'){
                    return this.form.find('input[name="' + string.attr('name') + '"]:checked').length > 0
                } else{
                    return !!string.val().length;
                }
            },
            integer: function(string){
                var re = /^\d+$/;
                return re.test(string.val());
            },
            valid_email: function(string){
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/igm;
                return re.test(string.val());
            },
            valid_url: function(string, easy){
                var re = (!!easy)? /^(?:(ftp|http|https):\/\/)?(?:[\w-]+\.)+[a-z]{2,6}$/ : /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
                return re.test(string.val());
            },
            valid_id_number: function(string){
                string = (typeof string !== 'string')? string.val() : string;
                if ((string.length > 9) || (string.length < 5) || isNaN(string))
                    return false;

                if(string.length < 9){
                    while(string.length < 9){
                        string = '0' + string;
                    }
                }

                var mone = 0, incNum;
                for (var i = 0; i < 9; i++){
                    incNum = Number(string.charAt(i));
                    incNum *= (i % 2) + 1;
                    if(incNum > 9)
                        incNum -= 9;

                    mone += incNum;
                }
                
                return mone % 10 == 0;
            },
            alpha: function(string){
                var re = /^((?![0-9\~\!\@\#\$\%\^\&\*\(\)\_\+\=\-\[\]\{\}\;\:\"\\\/\<\>\?]).)+$/g;
                return re.test(string.val());
            }
        },
        postCORS: function(c, a, b, d) {
            try {
                jQuery.post(c, a, b, d)
            } catch (e) {
                var f = '';
                for (key in a) {
                    f = f + '&' + key + '=' + a[key]
                }
                if (jQuery.browser.msie && window.XDomainRequest) {
                    var h = new XDomainRequest();
                    h.open("post", c);
                    h.send(f);
                    h.onload = function() {
                        b(h.responseText, 'success')
                    }
                } else {
                    try {
                        request = new proxy_xmlhttp();
                        request.open('POST', c, true);
                        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                        request.send(f)
                    } catch (e) {}
                }
            }
        },
        getCORS: function(b, d, f, h) {
            try {
                $.ajax({
                    type: 'post',
                    url: b,
                    data: d,
                    success: f
                })
            } catch (e) {
                if (jQuery.browser.msie && window.XDomainRequest) {
                    var g = new XDomainRequest();
                    g.open("get", b);
                    g.onload = function() {
                        f(this.responseText, 'success')
                    };
                    g.send()
                } else {
                    try {
                        var i = function() {
                            var c = 'error';
                            var a = 'error';
                            if ((this.readyState == 4) && (this.status == '200')) {
                                c = 'success';
                                a = this.responseText
                            }
                            f(a, c)
                        };
                        request = new proxy_xmlhttp();
                        request.open('GET', b, true);
                        request.onreadystatechange = i;
                        request.send()
                    } catch (e) {}
                }
            }
        }
    };

    // Browser
    !function(a){"function"==typeof define&&define.amd?define(["jquery"],function(b){return a(b)}):"object"==typeof module&&"object"==typeof module.exports?module.exports=a(require("jquery")):a(window.jQuery)}(function(a){"use strict";function b(a){void 0===a&&(a=window.navigator.userAgent),a=a.toLowerCase();var b=/(edge)\/([\w.]+)/.exec(a)||/(opr)[\/]([\w.]+)/.exec(a)||/(chrome)[ \/]([\w.]+)/.exec(a)||/(iemobile)[\/]([\w.]+)/.exec(a)||/(version)(applewebkit)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec(a)||/(webkit)[ \/]([\w.]+).*(version)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec(a)||/(webkit)[ \/]([\w.]+)/.exec(a)||/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(a)||/(msie) ([\w.]+)/.exec(a)||a.indexOf("trident")>=0&&/(rv)(?::| )([\w.]+)/.exec(a)||a.indexOf("compatible")<0&&/(mozilla)(?:.*? rv:([\w.]+)|)/.exec(a)||[],c=/(ipad)/.exec(a)||/(ipod)/.exec(a)||/(windows phone)/.exec(a)||/(iphone)/.exec(a)||/(kindle)/.exec(a)||/(silk)/.exec(a)||/(android)/.exec(a)||/(win)/.exec(a)||/(mac)/.exec(a)||/(linux)/.exec(a)||/(cros)/.exec(a)||/(playbook)/.exec(a)||/(bb)/.exec(a)||/(blackberry)/.exec(a)||[],d={},e={browser:b[5]||b[3]||b[1]||"",version:b[2]||b[4]||"0",versionNumber:b[4]||b[2]||"0",platform:c[0]||""};if(e.browser&&(d[e.browser]=!0,d.version=e.version,d.versionNumber=parseInt(e.versionNumber,10)),e.platform&&(d[e.platform]=!0),(d.android||d.bb||d.blackberry||d.ipad||d.iphone||d.ipod||d.kindle||d.playbook||d.silk||d["windows phone"])&&(d.mobile=!0),(d.cros||d.mac||d.linux||d.win)&&(d.desktop=!0),(d.chrome||d.opr||d.safari)&&(d.webkit=!0),d.rv||d.iemobile){var f="msie";e.browser=f,d[f]=!0}if(d.edge){delete d.edge;var g="msedge";e.browser=g,d[g]=!0}if(d.safari&&d.blackberry){var h="blackberry";e.browser=h,d[h]=!0}if(d.safari&&d.playbook){var i="playbook";e.browser=i,d[i]=!0}if(d.bb){var j="blackberry";e.browser=j,d[j]=!0}if(d.opr){var k="opera";e.browser=k,d[k]=!0}if(d.safari&&d.android){var l="android";e.browser=l,d[l]=!0}if(d.safari&&d.kindle){var m="kindle";e.browser=m,d[m]=!0}if(d.safari&&d.silk){var n="silk";e.browser=n,d[n]=!0}return d.name=e.browser,d.platform=e.platform,d}return window.jQBrowser=b(window.navigator.userAgent),window.jQBrowser.uaMatch=b,a&&(a.browser=window.jQBrowser),window.jQBrowser});

    // CORS
    !function(e){function n(e,n){"string"==typeof e&&(e=[e]);var t,o;for(t=0;t<e.length;t++)o=new RegExp("(?:^|; )"+e[t]+"=([^;]*)","i").exec(document.cookie),o=o&&o[1],o&&n.call(null,e[t],o)}function t(e){if(e.length>=5){var n,t,o,s=e.substring(e.length<=20?0:e.length-20),i=s.length-1;if("~"===s.charAt(i)){for(n=i--;i>=0&&"~"!==s.charAt(i);i--);if(t=parseInt(s.substring(i+1,n)),!isNaN(t)&&t>=0&&i>=2&&"~"===s.charAt(i)){for(n=i--;i>=0&&"~"!==s.charAt(i);i--);if(o=parseInt(s.substring(i+1,n)),!isNaN(o)&&i>=0&&"~"===s.charAt(i))return n=e.length-t-s.length+i,[o,e.substring(0,n),e.substr(n,t)]}}}return[200,e,""]}function o(e){if("object"==typeof e)return e;var n=u.exec(e);return n?{href:n[0]||"",hrefNoHash:n[1]||"",hrefNoSearch:n[2]||"",domain:n[3]||"",protocol:n[4]||"",authority:n[5]||"",username:n[7]||"",password:n[8]||"",host:n[9]||"",hostname:n[10]||"",port:n[11]||"",pathname:n[12]||"",directory:n[13]||"",filename:n[14]||"",search:n[15]||"",hash:n[16]||""}:{}}function s(e){if(0==e.length)return[];var n,t,o=[],s=0,i=0;do n=e.indexOf(",",i),o[s]=(o[s]||"")+e.substring(i,-1==n?e.length:n),i=n+1,-1==o[s].indexOf("Expires=")||-1!=o[s].indexOf(",")?s++:o[s]+=",";while(n>0);for(s=0;s<o.length;s++)t=o[s].indexOf("Domain="),-1!=t&&(o[s]=o[s].substring(0,t)+o[s].substring(o[s].indexOf(";",t)+1));return o}var i;if(!("__jquery_xdomain__"in e)&&e.browser.msie&&"XDomainRequest"in window&&!(window.XMLHttpRequest&&"withCredentials"in new XMLHttpRequest)&&-1==document.location.href.indexOf("file:///")){e.__jquery_xdomain__=e.support.cors=!0;var r,a,u=/^(((([^:\/#\?]+:)?(?:\/\/((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?]+)(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/,c=e.ajaxSettings.xhr,l="XDR_SESSION_COOKIE_NAME"in window?window.XDR_SESSION_COOKIE_NAME:"jsessionid",d="XDR_COOKIE_HEADERS"in window?window.XDR_COOKIE_HEADERS:[],h="XDR_HEADERS"in window?window.XDR_HEADERS:["Content-Type"],f={UNSENT:0,OPENED:1,LOADING:3,DONE:4},p=window.XDR_DEBUG&&"console"in window,g=0;a=o(document.location.href).domain,r=function(){var o,r,a,u=this,c=new XDomainRequest,D=[],m=g++,w=function(e){u.readyState=e,"function"==typeof u.onreadystatechange},x=function(n,t){if(u.responseText||(u.responseText=""),p&&console.log("[XDR-"+m+"] request end with state "+n+" and code "+t+" and data length "+u.responseText.length),u.status=t,!u.responseType)if(o=o||c.contentType,o.match(/\/json/))u.responseType="json",u.response=u.responseText;else if(o.match(/\/xml/)){u.responseType="document";var s,i=new ActiveXObject("Microsoft.XMLDOM");i.async=!1,i.loadXML(u.responseText),u.responseXML=u.response=i,0!=e(i).children("error").length&&(s=e(i).find("error"),u.status=parseInt(s.attr("response_code")))}else u.responseType="text",u.response=u.responseText;w(n),c=null,D=null,a=null};c.onprogress=function(){w(f.LOADING)},c.ontimeout=function(){x(f.DONE,408)},c.onerror=function(){x(f.DONE,500)},c.onload=function(){var e,n,o=t(c.responseText||"");for(p&&console.log("[XDR-"+g+"] parsing cookies for header "+o[2]),e=s(o[2]),u.responseText=o[1]||"",p&&console.log("[XDR-"+m+"] raw data:\n"+c.responseText+"\n parsed response: status="+o[0]+", header="+o[2]+", data=\n"+o[1]),n=0;n<e.length;n++)p&&console.log("[XDR-"+m+"] installing cookie "+e[n]),document.cookie=e[n]+";Domain="+document.domain;x(f.DONE,o[0]),"function"==typeof i.success&&i.success(o[1]),o=null},this.readyState=f.UNSENT,this.status=0,this.statusText="",this.responseType="",this.timeout=0,this.withCredentials=!1,this.overrideMimeType=function(e){o=e},this.abort=function(){c.abort()},this.setRequestHeader=function(n,t){e.inArray(n,h)>=0&&D.push({k:n,v:t})},this.open=function(e,n){a=n,r=e,w(f.OPENED)},this.send=function(e){if(c.timeout=this.timeout,l||d||D.length){var t,o=function(e,n){a.indexOf("?");p&&console.log("[XDR-"+m+"] added parameter "+e+"="+n+" => "+a)};for(t=0;t<D.length;t++)o(D[t].k,D[t].v);n(l,function(e,n){var t=a.indexOf("?");-1==t?a+=";"+e+"="+n:a=a.substring(0,t)+";"+e+"="+n+a.substring(t),p&&console.log("[XDR-"+m+"] added cookie "+a)}),n(d,o),o("_0",""+m)}p&&console.log("[XDR-"+m+"] opening "+a),c.open(r,a),p&&console.log("[XDR-"+m+"] send, timeout="+c.timeout),c.send(e)},this.getAllResponseHeaders=function(){return""},this.getResponseHeader=function(){return null}},e.ajaxSettings.xhr=function(){var n=o(this.url).domain;if(i=this,""===n||n===a)return c.call(e.ajaxSettings);try{return new r}catch(t){}}}}(jQuery);

    // jQuery plugin interface
    $.fn.jetform = function(opt) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function() {
            var item = $(this), instance = item.data('easyjetform');
            if(!instance) {
                item.data('easyjetform', new Jetform(this, opt));
            } else {
                if(typeof opt === 'string') {
                    instance[opt].apply(instance, args);
                }
            }
        });
    }

}(jQuery));