/*! easyJetform - v1.2.1 - 18-12-2016  !*/

(function($){
	$.fn.jetform = function(options){

		var theForm = $(this);

		if(!options.token){
			alert('token is missing');
			return false;
		}

		var errors = {
			sending:"שולח נתונים",
			success:"הפרטים התקבלו בהצלחה",
			fail:"ארעה שגיאה בזמן שליחת הנתונים",
			unique: "ניתן להירשם פעם אחת בלבד",
		}

		// default settings
		var settings = $.extend(true, {
			alertErrors: false,
			submitLoader: false,
			errorAtBottom: false,
			validation: {
				tel: {
					min: 9,
					max: 10
				}
			},
			template: {
				required: "{$field} שדה חובה",
				checkboxRequired: "נא לסמן את {$field}",
				radioRequired:"יש לבחור באחת האופציות של {$field}",
				shortPhone: "{$field} צריך להיות לפחות {$min} ספרות",
				longPhone: "{$field} צריך להיות מקסימום {$max} ספרות",
				inCorrectEmail: "כתובת מייל לא תקינה",
				idNumber: "מספר תעודת הזהות לא תקין"
			},
			beforeSubmit: function(args){
				console.log(errors.sending);
			},
			onSuccess: function(args){
				alert(errors.success);
			},
			onFail: function(error){
				alert(error);
			}
		}, options)

		var args = {
			token: options.token,
			ref: queryString('ref') || '',
            media: queryString('media') || '',
            campaign_source: queryString('utm_source') || "",
            campaign_medium: queryString('utm_medium') || "",
            campaign_term: queryString('utm_term') || "",
            campaign_content: queryString('utm_content') || "",
            campaign_name: queryString('utm_campaign') || "",
            furl: document.location.href
		}

		var errorsArray = [];

		// Set jetPlaceholder
		theForm.find('input, select, textarea').jetPlaceholder();

		// On submit form
		theForm.on('submit', function(e){
			e.preventDefault();
			formReset(theForm);
			errorsArray = [];
			var isValid = true;

			// going through all inputs
			theForm.find('input, select, textarea').each(function(index, element){
				// skip submit
				if($(element).attr('type') == 'submit'){
					return;
				}

				// if empty and not required, skip
				if(!$.trim($(element).val()).length && !$(element).attr('required') ){
					return;
				}

				// if empty and required
				if(!$.trim($(element).val()).length && !!$(element).attr('required')){
					isValid = notValid('required' ,$(element));
					return;
				}

				// phone validation
				if($(element).attr('type') == 'tel'){
					if(!!settings.validation.tel.min){
						if($(element).val().length < settings.validation.tel.min){
							isValid = notValid('shortPhone', $(element));
							return;
						}
					}
					if(!!settings.validation.tel.max){
						if($(element).val().length > settings.validation.tel.max){
							isValid = notValid('longPhone', $(element));
							return;
						}
					}
				}

				// email validation
				var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/igm;
				if($(element).attr('type') == 'email'){
					console.log($(element).val())
					if( !re.test($(element).val()) ){
						isValid = notValid('inCorrectEmail' ,$(element));
						return;
					}
				}

				// ID number validation
				if($(element).data('idnumber') == ""){
					if(!idNumber($(element).val())){
						isValid = notValid('idNumber' ,$(element));
						return;
					}
				}

				// checkbox validation
				if($(element).attr('type') == 'checkbox'){
					if(!!$(element).attr('required') && !$(element).is(':checked')){
						isValid = notValid('checkboxRequired' ,$(element));
						return;
					}
				}

				// radio validation
				if($(element).attr('type') == 'radio'){
					if(!!$(element).attr('required')){
						var rdbName = $(element).attr('name');
						if(!$('input[name="' + rdbName + '"]:checked').val() && !$('input[name="' + rdbName + '"][aria-invalid="true"]').length){
							isValid = notValid('radioRequired' ,$(element));
						} else if(!$('input[name="' + rdbName + '"]:checked').val()){
							$(element).parent().addClass('has-error');
						}
						return;
					}
				}

				// if everything is ok insert to args object by the name attribute
				if($(element).attr('type') == 'checkbox'){
					args[$(element).attr('name')] = $(element).is(':checked')
				} else if($(element).attr('type') == 'radio'){
					args[$(element).attr('name')] = $('input[name="' + $(element).attr('name') + '"]:checked').val()
				} else{
					args[$(element).attr('name')] = $(element).val();
				}
			}) // end input validation

			/*********************************
				If Valid
			**********************************/
			if(isValid){
				// before submiting
				settings.beforeSubmit(args);
				// reset form
				theForm.trigger('reset');
				if(settings.submitLoader){
					$('body').prepend('<div class="jetloader-wrapper"><div class="jetloader">שולח נתונים...</div></div>');
				}
				postCORS('//jetform.interjet.co.il/lead/save', $.param(args), function(response){
					if(settings.submitLoader){
						$('.jetloader-wrapper,.jetloader').remove();
					}
		            if(response.indexOf('success')>-1){
		            	if(typeof dataLayer == 'object'){
							var layer = $.extend(true, {'event':'jetform_submit_success'}, args);
							$.each(['L','R','browser_next_url','campaign_content','campaign_medium','campaign_name','campaign_source','campaign_term','furl','source_referrer','token','use_browser'], function(i,v){
								if(v in layer)
									delete layer[v];
							});
							
							dataLayer.push(layer);
						}
					}
		            if(response.indexOf('success=true') >- 1){
		                settings.onSuccess(args);
		            }
		            else if(response.indexOf('reason=unique') >- 1){
		            	settings.onFail(errors.unique);
		            }  else{
		                settings.onFail(errors.fail);
		            }
		        });
			} else{
				if(!!settings.errorAtBottom && errorsArray != []){
					if(settings.errorAtBottom === true){
						theForm.append('<p class="error-msg">' + errorsArray[0] + '</p>')
					} else {
						$(settings.errorAtBottom).text(errorsArray[0]);
					}
				}
				$('.has-error').find('input, select, textarea')[0].focus();
			}

		}) // end submit
	
		// displaying error(alert/text)
		function notValid(error, element){
			$(element).parent().addClass('has-error');

			$(element).attr('aria-invalid', true);

			// If error at bottom selected, collect the errors
			if(!!settings.errorAtBottom){
				errorsArray.push($(element).data('error') || compileErrorMessage(error, element));
				return false;
			}

			// if alert errors selected
			if(settings.alertErrors){
				alert($(element).data('error') || compileErrorMessage(error, element));
				return false;
			}

			if($(element).attr('type') == 'checkbox' || $(element).attr('type') == 'radio'){
				$(element).parent().append(' <span class="has-error-text">' + ($(element).data('error') || compileErrorMessage(error, element)) + '</span>');
			} else{
				$(element).parent().find('label').append('<span class="has-error-text">' + ($(element).data('error') || compileErrorMessage(error, element)) + '</span>');
			}

			return false;
		}

		// reset form from errors and values
		function formReset(form){
			form.find('input').jetPlaceholder();
			form.find('[aria-invalid="true"]').attr('aria-invalid','false');
			form.find('.has-error').removeClass('has-error');
			form.find('.has-error-text').remove();
			form.find('.error-msg').remove();
		}

		function compileErrorMessage(message, element){
			return (element.attr('type') in settings.validation) ?
				settings.template[message].replace('{$field}', element.data('name') || element.attr('placeholder') || element.parent().find('label').text() || element.parent().text()).replace('{$min}', settings.validation[element.attr('type')].min).replace('{$max}', settings.validation[element.attr('type')].max)
				: settings.template[message].replace('{$field}', element.data('name') || element.attr('placeholder') || element.parent().find('label').text() || element.parent().text());
		}

		// id number verification
		function idNumber(str){
		    var IDnum = String(str);
		    // Validate correct input
		    if ((IDnum.length > 9) || (IDnum.length < 5) || isNaN(IDnum))
		        return false;
		    // The number is too short - add leading 0000
		    if(IDnum.length < 9){
		        while(IDnum.length < 9){
		            IDnum = '0' + IDnum;
		        }
		    }
		    // CHECK THE ID NUMBER
		    var mone = 0, incNum;
		    for (var i=0; i < 9; i++){
		        incNum = Number(IDnum.charAt(i));
		        incNum *= (i%2)+1;
		        if(incNum > 9)
		            incNum -= 9;

		        mone += incNum;
		    }
		    if (mone%10 == 0)
		        return true;
		    else
		        return false;
		}

		// remove errors when typing
		theForm.find('input, textarea').on('keyup',function(){
		    if(!!$(this).val()){
		        $(this).parent().removeClass('has-error');
		        $(this).parent().find('.has-error-text').remove();
		    }
		})
		theForm.find('input[type="radio"],input[type="checkbox"]').on('change',function(){
			if($(this).attr('type') == 'radio'){
				var rdbName = $(this).attr('name');
				$('input[name="' + rdbName + '"]').parent().removeClass('has-error');
				$('input[name="' + rdbName + '"]').next().remove();
			} else if(!!$(this).val()){
		        $(this).parent().removeClass('has-error');
		        $(this).parent().find('.has-error-text').remove();
		    }
		})
		theForm.find('select').on('change',function(){
		    if(!!$(this).val()){
		        $(this).parent().removeClass('has-error');
		        $(this).parent().find('.has-error-text').remove();
		    }
		})

	}; // end jetform

	/*********************************
		Useful functions
	**********************************/
	// postCors function
	(function(k){var q;if(!('__jquery_xdomain__'in k)&&k.browser.msie&&'XDomainRequest'in window&&!(window.XMLHttpRequest&&'withCredentials'in new XMLHttpRequest())&&document.location.href.indexOf("file:///")==-1){k['__jquery_xdomain__']=k.support.cors=true;var B=/^(((([^:\/#\?]+:)?(?:\/\/((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?]+)(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/,C=k.ajaxSettings.xhr,t='XDR_SESSION_COOKIE_NAME'in window?window['XDR_SESSION_COOKIE_NAME']:"jsessionid",u='XDR_COOKIE_HEADERS'in window?window['XDR_COOKIE_HEADERS']:[],D='XDR_HEADERS'in window?window['XDR_HEADERS']:['Content-Type'],n={UNSENT:0,OPENED:1,LOADING:3,DONE:4},l=window['XDR_DEBUG']&&'console'in window,v,w,x=0;function y(c,a){if(typeof c=='string'){c=[c]}var b,d;for(b=0;b<c.length;b++){d=new RegExp('(?:^|; )'+c[b]+'=([^;]*)','i').exec(document.cookie);d=d&&d[1];if(d){a.call(null,c[b],d)}}}function E(c){if(c.length>=5){var a=c.substring(c.length<=20?0:c.length-20),b=a.length-1,d,f,h;if(a.charAt(b)==='~'){for(d=b--;b>=0&&a.charAt(b)!=='~';b--);f=parseInt(a.substring(b+1,d));if(!isNaN(f)&&f>=0&&b>=2&&a.charAt(b)==='~'){for(d=b--;b>=0&&a.charAt(b)!=='~';b--);h=parseInt(a.substring(b+1,d));if(!isNaN(h)&&b>=0&&a.charAt(b)==='~'){d=c.length-f-a.length+b;return[h,c.substring(0,d),c.substr(d,f)]}}}}return[200,c,'']}function z(c){if(typeof(c)==="object"){return c}var a=B.exec(c);return a?{href:a[0]||"",hrefNoHash:a[1]||"",hrefNoSearch:a[2]||"",domain:a[3]||"",protocol:a[4]||"",authority:a[5]||"",username:a[7]||"",password:a[8]||"",host:a[9]||"",hostname:a[10]||"",port:a[11]||"",pathname:a[12]||"",directory:a[13]||"",filename:a[14]||"",search:a[15]||"",hash:a[16]||""}:{}}function F(c){if(c.length==0){return[]}var a=[],b=0,d=0,f,h;do{f=c.indexOf(',',d);a[b]=(a[b]||'')+c.substring(d,f==-1?c.length:f);d=f+1;if(a[b].indexOf('Expires=')==-1||a[b].indexOf(',')!=-1){b++}else{a[b]+=','}}while(f>0);for(b=0;b<a.length;b++){h=a[b].indexOf('Domain=');if(h!=-1){a[b]=a[b].substring(0,h)+a[b].substring(a[b].indexOf(';',h)+1)}}return a}w=z(document.location.href).domain;v=function(){var g=this,i=new XDomainRequest(),p,o=[],A,j,m=x++,r=function(c){g.readyState=c;if(typeof g.onreadystatechange==='function'){}},s=function(c,a){if(!g.responseText){g.responseText=''}if(l){console.log('[XDR-'+m+'] request end with state '+c+' and code '+a+' and data length '+g.responseText.length)}g.status=a;if(!g.responseType){p=p||i.contentType;if(p.match(/\/json/)){g.responseType='json';g.response=g.responseText}else if(p.match(/\/xml/)){g.responseType='document';var b,d=new ActiveXObject('Microsoft.XMLDOM');d.async=false;d.loadXML(g.responseText);g.responseXML=g.response=d;if(k(d).children('error').length!=0){b=k(d).find('error');g.status=parseInt(b.attr('response_code'))}}else{g.responseType='text';g.response=g.responseText}}r(c);i=null;o=null;j=null};i.onprogress=function(){r(n.LOADING)};i.ontimeout=function(){s(n.DONE,408)};i.onerror=function(){s(n.DONE,500)};i.onload=function(){var c,a,b=E(i.responseText||'');if(l){console.log('[XDR-'+x+'] parsing cookies for header '+b[2])}c=F(b[2]);g.responseText=b[1]||'';if(l){console.log('[XDR-'+m+'] raw data:\n'+i.responseText+'\n parsed response: status='+b[0]+', header='+b[2]+', data=\n'+b[1])}for(a=0;a<c.length;a++){if(l){console.log('[XDR-'+m+'] installing cookie '+c[a])}document.cookie=c[a]+";Domain="+document.domain}s(n.DONE,b[0]);if(typeof(q.success)==="function"){q.success(b[1])}b=null};this.readyState=n.UNSENT;this.status=0;this.statusText='';this.responseType='';this.timeout=0;this.withCredentials=false;this.overrideMimeType=function(c){p=c};this.abort=function(){i.abort()};this.setRequestHeader=function(c,a){if(k.inArray(c,D)>=0){o.push({k:c,v:a})}};this.open=function(c,a){j=a;A=c;r(n.OPENED)};this.send=function(d){i.timeout=this.timeout;if(t||u||o.length){var f,h=function(c,a){var b=j.indexOf('?');if(l){console.log('[XDR-'+m+'] added parameter '+c+"="+a+" => "+j)}};for(f=0;f<o.length;f++){h(o[f].k,o[f].v)}y(t,function(c,a){var b=j.indexOf('?');if(b==-1){j+=';'+c+'='+a}else{j=j.substring(0,b)+';'+c+'='+a+j.substring(b)}if(l){console.log('[XDR-'+m+'] added cookie '+j)}});y(u,h);h('_0',''+m)}if(l){console.log('[XDR-'+m+'] opening '+j)}i.open(A,j);if(l){console.log('[XDR-'+m+'] send, timeout='+i.timeout)}i.send(d)};this.getAllResponseHeaders=function(){return''};this.getResponseHeader=function(){return null}};k.ajaxSettings.xhr=function(){var c=z(this.url).domain;q=this;if(c===""||c===w){return C.call(k.ajaxSettings)}else{try{return new v()}catch(e){}}}}})(jQuery);function getCORS(b,d,f,h){try{$.ajax({type:'post',url:b,data:d,success:f})}catch(e){if(jQuery.browser.msie&&window.XDomainRequest){var g=new XDomainRequest();g.open("get",b);g.onload=function(){f(this.responseText,'success')};g.send()}else{try{var i=function(){var c='error';var a='error';if((this.readyState==4)&&(this.status=='200')){c='success';a=this.responseText}f(a,c)};request=new proxy_xmlhttp();request.open('GET',b,true);request.onreadystatechange=i;request.send()}catch(e){}}}}function postCORS(c,a,b,d){try{jQuery.post(c,a,b,d)}catch(e){var f='';for(key in a){f=f+'&'+key+'='+a[key]}if(jQuery.browser.msie&&window.XDomainRequest){var h=new XDomainRequest();h.open("post",c);h.send(f);h.onload=function(){b(h.responseText,'success')}}else{try{request=new proxy_xmlhttp();request.open('POST',c,true);request.setRequestHeader('Content-Type','application/x-www-form-urlencoded');request.send(f)}catch(e){}}}}
	// queryString function
	function queryString(a,b){var c="",d=[],e=[];c=b||decodeURIComponent(window.location.search.substring(1)),c.indexOf("&")==-1?d.push(c):d=c.split("&");for(var f=0;f<d.length;f++)if(e=d[f].split("="),e[0].toLowerCase()==a.toLowerCase())return e[1];return!1}
	// jetPlaceholder
	$.fn.jetPlaceholder=function(){function c(a,b){var c="֑-߿יִ-﷿ﹰ-ﻼ",d=new RegExp("["+c+"]");d.test(b)?$(a).css({"text-align":"right",direction:"rtl"}):$(a).css({"text-align":"left",direction:"ltr"})}function d(a,b){var c=b.charCodeAt(0);c>=1488&&c<=1514||c>=1570&&c<=1747?$(a).css({"text-align":"right",direction:"rtl"}):$(a).css({"text-align":"left",direction:"ltr"})}var a="RegExp"in window,b="test"in RegExp.prototype;return $.each(this,function(e,f){$(f).attr("placeholder")&&(a&&b?c(f,$(f).attr("placeholder").substr(0,1)):d(f,$(f).attr("placeholder").substr(0,1))),$(f).keyup(function(e){$(this).val().length>0?a&&b?c(this,$(this).val().substr(0,1)):d(this,$(this).val().substr(0,1)):$(this).val().length||$(f).attr("placeholder")&&(a&&b?c(this,$(this).attr("placeholder").substr(0,1)):d(this,$(this).attr("placeholder").substr(0,1)))})}),this};
}( jQuery ));

$(document).ready(function(){
	$("input[type='tel']").keydown(function (e) {
		if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 || (e.keyCode == 65 && e.ctrlKey === true) || (e.keyCode >= 35 && e.keyCode <= 39)) { return;
		}
		if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
			e.preventDefault();
		}
	});
})

$(window).load(function(e) {
	(function(s){
		if(!window.history.pushState) return;
		var regex = /(&\?)jet_redirected(=[^&]*)?|^jet_redirected(=[^&]*)?&?|\?jet_redirected(=[^&]*)?&?/;
		if(s.indexOf('jet_redirected') > -1) history.replaceState({}, '', '../' + ((!!s.replace(regex, '').length)? '?' + s.replace(regex, '') : s.replace(regex, '')));
	})(window.location.search);
});