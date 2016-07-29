webpackJsonp([21],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	/**
	 * 会员中心公共部分 
	 */
	var ConfirmBox = __webpack_require__(15);
	var Selection = __webpack_require__(53);
	var templatable = __webpack_require__(10);
	var formPaginger = __webpack_require__(64);
	var loading = __webpack_require__(18);

	// 侧边折叠菜单
	__webpack_require__(52)();

	var Validator = __webpack_require__(47);
	var MobileCode = __webpack_require__(50);


	// 异步验证手机号是否已被注册
	Validator.addRule('asyncmobile', function(option, commit){
	    var val = option.element.val();
	    if(PPG.reg.mobile.test(val)){
	        $.post('/Passport/VerifyAccount', {strAccount: val}, function(res){
	            if(res.Succeeded){
	                commit(false, '该用手机号码已被注册');
	            }else{
	                commit(true, '');
	            }
	        });
	    }
	});
	Validator.addRule('mobileAndAsync', Validator.getRule('mobile').and('asyncmobile'), '请输入正确的手机号码');

	// 短信验证码规则
	Validator.addRule('mobilecode', PPG.reg.mobilecode, '{{display}}6位数字');

	// 添加密码规则
	Validator.addRule('password', /^[a-zA-Z0-9]{6,20}$/, '{{display}}由6-20个字母(区分大小写)或数字组成');

	var AccountValidator = Validator.extend({
	    attrs: {
	        showMessage: function(message, element){
	            message = '<i class="iconfont">&#xe62e;</i><span class="ui-form-explain-text">' + message + '</span>';
	            
	            this.getExplain(element)
	                .html(message);

	            this.getItem(element).addClass(this.get('itemErrorClass'));
	        }
	    }
	});

	function showMessage(message, hold, hideCallback){
	    ConfirmBox.show(message, hideCallback ? hideCallback : null, {
	        title: '提示',
	        onShow: function(){
	            if(!hold){
	                var that = this;
	                setTimeout(function(){
	                    that.hide();
	                }, 2000);                           
	            }
	        }
	    });
	}

	// debugger

	// if(typeof resultMessage !== 'undefined' && resultMessage.length){
	//     showMessage(resultMessage, true);
	// }

	var account = {
		baseInfo: function(){
	        if(typeof resultMessage !== 'undefined' && resultMessage.length){
	            showMessage(resultMessage, true);
	        }

			// 基本信息表单验证
			var validator = new AccountValidator({
				element: '#J_form_account',
				failSilently: true,
	            onFormValidated: function(err, results, form) {
	                if(!err){
	                    loading.show();
	                }
	            }                
			});

			validator
				// 真实姓名
				.addItem({
					element: '#username',
					required: true,
					rule: 'minlength{"min":2} maxlength{"max":16}',
					display: '真实姓名'
				})
	            // 经营地址
	            .addItem({
	                element: '#operate_address',
	                required: true,
	                rule: 'minlength{"min":2} maxlength{"max":80}',
	                display: '经营地址'
	            })
	            // 品牌产品
	            .addItem({
	                element: '#operate_product',
	                required: true,
	                rule: 'minlength{"min":1} maxlength{"max":300}',
	                display: '品牌或产品'
	            });

	        // 上传
	        function createUploader(triggerId){
	            var $target = $('#' + triggerId);

	            var option = {
	                runtimes: 'html5,flash,html4',    //上传模式,依次退化
	                browse_button: triggerId,       //上传选择的点选按钮，**必需**
	                uptoken_url: '/Member/GetUpToken',            //Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
	                // uptoken : '', //若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成
	                unique_names: true, // 默认 false，key为文件名。若开启该选项，SDK为自动生成上传成功后的key（文件名）。
	                // save_key: true,   // 默认 false。若在服务端生成uptoken的上传策略中指定了 `sava_key`，则开启，SDK会忽略对key的处理
	                domain: PPG.IMAGESERVER,   //bucket 域名，下载资源时用到，**必需**
	                get_new_uptoken: false,  //设置上传文件的时候是否每次都重新获取新的token
	                // container: 'J_upload_wrap',           //上传区域DOM ID，默认是browser_button的父元素，
	                max_file_size: '100mb',           //最大文件体积限制
	                // flash_swf_url: 'http://120.76.41.193:8001/dist/js/plugins/qiniu/plupload/Moxie.swf',  //引入flash,相对路径
	                flash_swf_url: '/Resource/Moxie.swf',
	                max_retries: 3,                   //上传失败最大重试次数
	                // dragdrop: true,                   //开启可拖曳上传
	                // drop_element: 'J_upload_wrap',        //拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
	                chunk_size: '4mb',                //分块上传时，每片的体积
	                auto_start: true,                 //选择文件后自动上传，若关闭需要自己绑定事件触发上传
	                multi_selection: false, // 是否允许多选
	                // log_level: 5, 调试信息
	                filters: {
	                    max_file_size: '1mb',
	                    mime_types: [{
	                        title: "Image files ",
	                        extensions: "jpg,gif,png,bmp "
	                    }]
	                },
	                init: {
	                    FilesAdded: function(uploader, files) {
	                        // 文件添加进队列后,处理相关的事情
	                        $(uploader.settings.browse_button)
	                            .parent('.ui-upload-thumb')
	                            .addClass('uploading');
	                    },
	                    BeforeUpload: function(uploader, file) {
	                           // 每个文件上传前,处理相关的事情 
	                    }, 
	                    UploadProgress: function(uploader, file) {
	                           // 每个文件上传时,处理相关的事情
	                    },
	                    FileUploaded: function(uploader, file, info) {
	                        var infos = JSON.parse(info),
	                            domain = uploader.getOption('domain');
	                        
	                       // 每个文件上传成功后,处理相关的事情
	                       // 其中 info 是文件上传成功后，服务端返回的json
	                        var _button = $(uploader.settings.browse_button),
	                            image = domain + infos.key +'-W300H300',
	                            key = infos.key;

	                        // 添加图片信息
	                        _button.parent('.ui-upload-thumb')
	                            .removeClass('uploading')
	                            .addClass('uploaded');

	                        // 更改图片路径
	                        _button.siblings('img.photo').attr('src', image);

	                        // 保存图片路径
	                        _button.find('input[type="hidden"]').val(key);
	                    },
	                    Error: function(uploader, file, errTip) {
	                       //上传出错时,处理相关的事情
	                       var re = /png|jpg|gif|bmp/gi;
	                        if (!re.test(file.name)) {
	                            showMessage('请上传图片格式文件!', true);
	                        }else{
	                            showMessage(errTip, true);
	                        }
	                    },
	                    UploadComplete: function() {
	                        // console.log('UploadComplete')
	                        // console.log(arguments)
	                        //队列文件处理完毕后,处理相关的事情
	                    }
	                }
	            };
	            
	            var Qiniu = new QiniuJsSDK(),
	                uploader = Qiniu.uploader(option);

	            $target.data('upload', true);
	        }

	        // 创建上传项
	        ['J_picker_logo',
	        'J_picker_licensed',
	        'J_picker_authen'
	        ].forEach(function(item){
	            createUploader(item);
	        });

	        $('.ui-upload-thumb').each(function(){
	            var $this = $(this);
	            var src = $this.find('.photo').attr('src');

	            if(src.indexOf('blank.gif') < 0){
	                $this.addClass('uploaded');
	            }
	            
	            $this.append('<div class="ui-loading"></div>');
	        });
		},
		mobChange: function(){
	        if(typeof resultMessage !== 'undefined' && resultMessage.length){
	            showMessage(resultMessage, true);
	        }
			// 手机号码修改表单验证
			var validator = new AccountValidator({
				element: '#J_form_mobile_edit',
				failSilently: true,
	            onFormValidated: function(err, results, form) {
	                if(!err){
	                    loading.show();
	                }
	            }                
			});

	        var sendMobileBtn = $('#J_send'),
	            getMobileCode;

			validator
				// 手机号码
				.addItem({
					element: '#mobile',
					required: true,
					rule: 'mobileAndAsync',
					display: '手机号码',
	                onItemValidated: function(err){
	                    getMobileCode.state = err ? false : true;
	                }                
				})
	            // 短信验证码
	            .addItem({
	                element: '#code',
	                required: true,
	                rule: 'mobilecode',
	                display: '短信验证码'
	            });

	        // 发送验证码
	        getMobileCode = new MobileCode({
	            input: '#mobile',
	            trigger: '#J_send',
	            auto: false,
	            propName: 'MobileNo',
	            url: '/Passport/SendVerifyCode',
	            validated: function(data){
	                if(!data.value){
	                    validator.query('#mobile').execute();
	                }
	            },
	            sended: function(data){
	                // console.log(data)
	                if(!data.validated && data.message.length){
	                    showMessage(data.message, true);
	                }
	            }
	        });
		},
		pswEdit: function(){
	        if(typeof resultMessage !== 'undefined' && resultMessage.length){
	            showMessage(resultMessage, true);
	        }      
			// 密码修改表单验证
			var validator = new AccountValidator({
				element: '#J_form_password_edit',
				failSilently: true,
	            onFormValidated: function(err, results, form) {
	                if(!err){
	                    loading.show();
	                }
	            }                
			});

			validator
				// 现用密码
				.addItem({
					element: '#psw_now',
					required: true,
					rule: '',
					display: '现用密码'
				})
	            // 新密码
	            .addItem({
	                element: '#psw_new',
	                required: true,
	                rule: 'password',
	                display: '新密码'
	            })
	            // 确认新密码
	            .addItem({
	                element: '#psw_now_confirm',
	                required: true,
	                rule: 'confirmation{target: "#psw_new"}',
	                display: '密码',
	                errormessageRequired: '请再重复输入一遍密码，不能留空。'
	            });
		},
	    contactEdit: function(){
	        if(typeof resultMessage !== 'undefined' && resultMessage.length){
	            showMessage(resultMessage, true);
	        }      
	        // 联系人信息修改表单验证
	        var validator = new AccountValidator({
	            element: '#J_form_contact_edit',
	            failSilently: true,
	            onFormValidated: function(err, results, form) {
	                if(!err){
	                    loading.show();
	                }
	            }                
	        });

	        validator
	            // 真实姓名
	            .addItem({
	                element: '#truename',
	                required: true,
	                rule: 'minlength{"min":2} maxlength{"max":16}',
	                display: '真实姓名'
	            })
	            // 手机号码
	            .addItem({
	                element: '#user_phone',
	                required: true,
	                rule: 'mobile',
	                display: '手机号码'                
	            })
	            // 邮箱
	            .addItem({
	                element: '#user_email',
	                required: true,
	                rule: 'email',
	                display: '邮箱'
	            });
	    },
	    message: function(){
	        var messageWrap = $('#J_member_message'),
	            messageList = $('#J_message_list'),
	            $messageCount = $('#J_message_count'),
	            $unreadNum = $('#J_unread_num'),
	            allCount = $messageCount.text() * 1,
	            unReadCount = $unreadNum.text() * 1;

	        var itemClass = '.member-message-item';

	        var checkboxSize = messageList.find('input[type="checkbox"]').size();

	        // 是否已无信息
	        function checkHasNull(items){
	            if(!items.length){
	                // messageList.append('<li class="null member-message-item">无相关信息</li>');
	                // $('.ui-paging').remove();
	                window.location.reload();
	            }
	        }

	        function ajax(url, data, successCallback){
	            loading.show();

	            $.ajax({
	                type: 'POST',
	                dataType: 'json',
	                url: url,
	                data: data || {}, 
	            }).success(function(data){
	                loading.hide();
	                successCallback && successCallback(data);
	            }).error(function(){
	                loading.hide();
	                alert('服务器繁忙，请重试');
	            });
	        }

	        var getItemData = function(trigger, _self){
	            var item = _self ? _self : trigger.closest('.member-message-item');
	            var getData = function(name){
	                return item.data(name) ? item.data(name) : '';
	            };
	            
	            return {
	                element: item,
	                id: getData('id'),
	                isReaded: !item.hasClass('unread')
	            };
	        };

	        var removeMessageItem = function(id, items, count, fn){
	            
	            ajax('/Member/BatchDeleteMessage', {
	                messageIds: id
	            }, function(res){
	                if(res.Succeeded){

	                    // 更新信息总数
	                    allCount -= count;
	                    var m = allCount < 0 ? 0 : allCount;
	                    $messageCount.text(m);
	                    
	                    // 更新未读数
	                    if(unReadCount){
	                        var n = 0;
	                        items.forEach(function(item){
	                            var isReadedItem = getItemData(null, item.parent).isReaded;
	                            if(!isReadedItem){
	                                n += 1;
	                            }
	                        });
	                        unReadCount = n;
	                        $unreadNum.text(n);                        
	                    }

	                    showMessage('删除成功', false, function(){
	                        checkHasNull(items); 
	                    });

	                    fn && fn();
	                }
	            });
	        };

	        if(checkboxSize === 0){
	            $('#J_checkall').prop('disabled', true);
	            $('#J_del_batch').remove();
	        }else{
	            // 全选·单选·删除·批量删除
	            $('#J_member_message').selection({
	                selectAllElem: '#J_checkall',
	                singleClass: '.checkbox-sub',
	                singleParentClass: '.member-message-item',
	                singleRemoveClass: '.remove',
	                batchRemoveElem: '#J_del_batch',
	                async: true,
	                onSelect: function(){},
	                onSingleRemove: function(data){
	                    var that = this,
	                        item = data,
	                        timestamp = data.timestamp;
	                    
	                    ConfirmBox.confirm('确定要删除这个商品吗？', '提示：', function(){

	                        removeMessageItem(
	                            item.parent.data('id'),
	                            that.items,
	                            1,
	                            that.itemRemove(timestamp)
	                        );
	                    });
	                },
	                onBatchRemove: function(data){
	                    var that = this,
	                        selecteds = this.selecteds;
	                    
	                    if(!selecteds.length) return false;

	                    ConfirmBox.confirm('确定要删除所选吗？', '提示：', function(){
	                        var ids = [];
	                        for(var i = 0; i < selecteds.length; i++){
	                            var currentItem = selecteds[i];
	                            ids.push(currentItem.parent.data('id'));
	                        }
	                        
	                        removeMessageItem(
	                            ids.join(','), 
	                            that.items,
	                            ids.length,
	                            that.batchRemove()
	                        );
	                    });
	                }
	            });

	            // 展开收起
	            $('#J_member_message').delegate('.read,.title', 'click', function(e){
	                var $this = $(this),
	                    parent = $this.closest('.member-message-item '),
	                    panel = $this.siblings('div.content'),
	                    openBtn = parent.find('.read'),
	                    both = parent.find('.read,.title');

	                var toggleStyle = function(type){
	                    return {
	                        open: function(){
	                            openBtn.text('收起');
	                            panel.show();
	                            both.addClass('active');
	                        },
	                        close: function(){
	                            openBtn.text('展开');
	                            panel.hide();
	                            both.removeClass('active');
	                        }
	                    }[type]();
	                };

	                $this.toggleClass('active');

	                if($this.hasClass('active')){
	                    var thisData = getItemData($this),
	                        item = thisData.element;

	                    if(!thisData.isReaded){
	                        $.ajax({
	                            url: '/Member/ReadMessage', 
	                            type: 'POST',
	                            dataType: 'json',
	                            data: {messageIds: thisData.id}, 
	                            success: function(res){
	                                
	                                if(res.Succeeded){
	                                    unReadCount--;

	                                    var n = unReadCount < 0 ? 0 : unReadCount;
	                                    
	                                    item.removeClass('unread');
	                                    $unreadNum.text(n);
	                                }
	                            }
	                        });
	                    }
	                    
	                    toggleStyle('open');
	                }else{
	                    toggleStyle('close');
	                }
	            });

	            // 页码操作
	            formPaginger('.ui-paging', '#J_form_message');            
	        }

	    }
	};

	window.account = account;

/***/ },

/***/ 9:
/***/ function(module, exports) {

	// var $ = require('jquery');

	var rules = {},
	    messages = {};

	function Rule(name, oper) {
	    var self = this;

	    self.name = name;

	    if (oper instanceof RegExp) {
	        self.operator = function (opts, commit) {
	            var rslt = oper.test($(opts.element).val());
	            commit(rslt ? null : opts.rule, _getMsg(opts, rslt));
	        };
	    } else if ($.isFunction(oper)) {
	        self.operator = function (opts, commit) {
	            var rslt = oper.call(this, opts, function (result, msg) {
	                commit(result ? null : opts.rule, msg || _getMsg(opts, result));
	            });
	            // 当是异步判断时, 返回 undefined, 则执行上面的 commit
	            if (rslt !== undefined) {
	                commit(rslt ? null : opts.rule, _getMsg(opts, rslt));
	            }
	        };
	    } else {
	        throw new Error('The second argument must be a regexp or a function.');
	    }
	}

	Rule.prototype.and = function (name, options) {
	    var target = name instanceof Rule ? name : getRule(name, options);

	    if (!target) {
	        throw new Error('No rule with name "' + name + '" found.');
	    }

	    var that = this;
	    var operator = function (opts, commit) {
	        that.operator.call(this, opts, function (err, msg) {
	            if (err) {
	                commit(err, _getMsg(opts, !err));
	            } else {
	                target.operator.call(this, opts, commit);
	            }
	        });
	    };

	    return new Rule(null, operator);
	};
	Rule.prototype.or = function (name, options) {
	    var target = name instanceof Rule ? name : getRule(name, options);

	    if (!target) {
	        throw new Error('No rule with name "' + name + '" found.');
	    }

	    var that = this;
	    var operator = function (opts, commit) {
	        that.operator.call(this, opts, function (err, msg) {
	            if (err) {
	                target.operator.call(this, opts, commit);
	            } else {
	                commit(null, _getMsg(opts, true));
	            }
	        });
	    };

	    return new Rule(null, operator);
	};
	Rule.prototype.not = function (options) {
	    var target = getRule(this.name, options);
	    var operator = function (opts, commit) {
	        target.operator.call(this, opts, function (err, msg) {
	            if (err) {
	                commit(null, _getMsg(opts, true));
	            } else {
	                commit(true, _getMsg(opts, false))
	            }
	        });
	    };

	    return new Rule(null, operator);
	};


	function addRule(name, operator, message) {
	    if ($.isPlainObject(name)) {
	        $.each(name, function (i, v) {
	            if ($.isArray(v))
	                addRule(i, v[0], v[1]);
	            else
	                addRule(i, v);
	        });
	        return this;
	    }

	    if (operator instanceof Rule) {
	        rules[name] = new Rule(name, operator.operator);
	    } else {
	        rules[name] = new Rule(name, operator);
	    }
	    setMessage(name, message);

	    return this;
	}

	function _getMsg(opts, b) {
	    var ruleName = opts.rule;
	    var msgtpl;

	    if (opts.message) { // user specifies a message
	        if ($.isPlainObject(opts.message)) {
	            msgtpl = opts.message[b ? 'success' : 'failure'];
	            // if user's message is undefined，use default
	            typeof msgtpl === 'undefined' && (msgtpl = messages[ruleName][b ? 'success' : 'failure']);
	        } else {//just string
	            msgtpl = b ? '' : opts.message
	        }
	    } else { // use default
	        msgtpl = messages[ruleName][b ? 'success' : 'failure'];
	    }

	    return msgtpl ? compileTpl(opts, msgtpl) : msgtpl;
	}

	function setMessage(name, msg) {
	    if ($.isPlainObject(name)) {
	        $.each(name, function (i, v) {
	            setMessage(i, v);
	        });
	        return this;
	    }

	    if ($.isPlainObject(msg)) {
	        messages[name] = msg;
	    } else {
	        messages[name] = {
	            failure: msg
	        };
	    }
	    return this;
	}



	function getRule(name, opts) {
	    if (opts) {
	        var rule = rules[name];
	        return new Rule(null, function (options, commit) {
	            rule.operator($.extend(null, options, opts), commit);
	        });
	    } else {
	        return rules[name];
	    }
	}

	function compileTpl(obj, tpl) {
	    var result = tpl;

	    var regexp1 = /\{\{[^\{\}]*\}\}/g,
	        regexp2 = /\{\{(.*)\}\}/;

	    var arr = tpl.match(regexp1);
	    arr && $.each(arr, function (i, v) {
	        var key = v.match(regexp2)[1];
	        var value = obj[$.trim(key)];
	        result = result.replace(v, value);
	    });
	    return result;
	}

	addRule('required', function (options) {
	    var element = $(options.element);

	    var t = element.attr('type');
	    switch (t) {
	        case 'checkbox':
	        case 'radio':
	            var checked = false;
	            element.each(function (i, item) {
	                if ($(item).prop('checked')) {
	                    checked = true;
	                    return false;
	                }
	            });
	            return checked;
	        default:
	            return Boolean($.trim(element.val()));
	    }
	}, '请输入{{display}}');

	addRule('email', /^\s*([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,20})\s*$/, '{{display}}的格式不正确');

	addRule('text', /.*/);

	addRule('password', /.*/);

	addRule('radio', /.*/);

	addRule('checkbox', /.*/);

	addRule('url', /^(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/, '{{display}}的格式不正确');

	addRule('number', /^[+-]?[1-9][0-9]*(\.[0-9]+)?([eE][+-][1-9][0-9]*)?$|^[+-]?0?\.[0-9]+([eE][+-][1-9][0-9]*)?$|^0$/, '{{display}}的格式不正确');

	// 00123450 是 digits 但不是 number
	// 1.23 是 number 但不是 digits
	addRule('digits', /^\s*\d+\s*$/, '{{display}}的格式不正确');

	addRule('date', /^\d{4}\-[01]?\d\-[0-3]?\d$|^[01]\d\/[0-3]\d\/\d{4}$|^\d{4}年[01]?\d月[0-3]?\d[日号]$/, '{{display}}的格式不正确');

	addRule('min', function (options) {
	    var element = options.element,
	        min = options.min;
	    return Number(element.val()) >= Number(min);
	}, '{{display}}必须大于或者等于{{min}}');

	addRule('max', function (options) {
	    var element = options.element,
	        max = options.max;
	    return Number(element.val()) <= Number(max);
	}, '{{display}}必须小于或者等于{{max}}');

	addRule('minlength', function (options) {
	    var element = options.element;
	    var l = element.val().length;
	    return l >= Number(options.min);
	}, '{{display}}的长度必须大于或等于{{min}}');

	addRule('maxlength', function (options) {
	    var element = options.element;
	    var l = element.val().length;
	    return l <= Number(options.max);
	}, '{{display}}的长度必须小于或等于{{max}}');

	// addRule('mobile', /^1\d{10}$/, '请输入正确的{{display}}');
	addRule('mobile', /^0?(13|15|18|14|17)[0-9]{9}$/, '请输入正确的{{display}}');

	addRule('confirmation', function (options) {
	    var element = options.element,
	        target = $(options.target);
	    return element.val() == target.val();
	}, '两次输入的{{display}}不一致，请重新输入');

	module.exports = {
	    addRule: addRule,
	    setMessage: setMessage,
	    getMessage: function(options, isSuccess) {
	        return _getMsg(options, isSuccess);
	    },
	    getRule: getRule,
	    getOperator: function (name) {
	        return rules[name].operator;
	    }
	};


/***/ },

/***/ 19:
/***/ function(module, exports) {

	var async = {};

	module.exports = async;

	//// cross-browser compatiblity functions ////

	var _forEach = function (arr, iterator) {
	  if (arr.forEach) {
	    return arr.forEach(iterator);
	  }
	  for (var i = 0; i < arr.length; i += 1) {
	    iterator(arr[i], i, arr);
	  }
	};

	var _map = function (arr, iterator) {
	  if (arr.map) {
	    return arr.map(iterator);
	  }
	  var results = [];
	  _forEach(arr, function (x, i, a) {
	    results.push(iterator(x, i, a));
	  });
	  return results;
	};

	var _keys = function (obj) {
	  if (Object.keys) {
	    return Object.keys(obj);
	  }
	  var keys = [];
	  for (var k in obj) {
	    if (obj.hasOwnProperty(k)) {
	      keys.push(k);
	    }
	  }
	  return keys;
	};

	//// exported async module functions ////

	async.forEach = function (arr, iterator, callback) {
	  callback = callback || function () {
	  };
	  if (!arr.length) {
	    return callback();
	  }
	  var completed = 0;
	  _forEach(arr, function (x) {
	    iterator(x, function (err) {
	      if (err) {
	        callback(err);
	        callback = function () {
	        };
	      }
	      else {
	        completed += 1;
	        if (completed === arr.length) {
	          callback(null);
	        }
	      }
	    });
	  });
	};

	async.forEachSeries = function (arr, iterator, callback) {
	  callback = callback || function () {
	  };
	  if (!arr.length) {
	    return callback();
	  }
	  var completed = 0;
	  var iterate = function () {
	    iterator(arr[completed], function (err) {
	      if (err) {
	        callback(err);
	        callback = function () {
	        };
	      }
	      else {
	        completed += 1;
	        if (completed === arr.length) {
	          callback(null);
	        }
	        else {
	          iterate();
	        }
	      }
	    });
	  };
	  iterate();
	};

	var doParallel = function (fn) {
	  return function () {
	    var args = Array.prototype.slice.call(arguments);
	    return fn.apply(null, [async.forEach].concat(args));
	  };
	};
	var doSeries = function (fn) {
	  return function () {
	    var args = Array.prototype.slice.call(arguments);
	    return fn.apply(null, [async.forEachSeries].concat(args));
	  };
	};


	var _asyncMap = function (eachfn, arr, iterator, callback) {
	  var results = [];
	  arr = _map(arr, function (x, i) {
	    return {index: i, value: x};
	  });
	  eachfn(arr, function (x, callback) {
	    iterator(x.value, function (err, v) {
	      results[x.index] = v;
	      callback(err);
	    });
	  }, function (err) {
	    callback(err, results);
	  });
	};
	async.map = doParallel(_asyncMap);
	async.mapSeries = doSeries(_asyncMap);

	async.series = function (tasks, callback) {
	  callback = callback || function () {
	  };
	  if (tasks.constructor === Array) {
	    async.mapSeries(tasks, function (fn, callback) {
	      if (fn) {
	        fn(function (err) {
	          var args = Array.prototype.slice.call(arguments, 1);
	          if (args.length <= 1) {
	            args = args[0];
	          }
	          callback.call(null, err, args);
	        });
	      }
	    }, callback);
	  }
	  else {
	    var results = {};
	    async.forEachSeries(_keys(tasks), function (k, callback) {
	      tasks[k](function (err) {
	        var args = Array.prototype.slice.call(arguments, 1);
	        if (args.length <= 1) {
	          args = args[0];
	        }
	        results[k] = args;
	        callback(err);
	      });
	    }, function (err) {
	      callback(err, results);
	    });
	  }
	};


/***/ },

/***/ 20:
/***/ function(module, exports, __webpack_require__) {

	// var $ = require('jquery');
	var Rule = __webpack_require__(9);

	var u_count = 0;
	var helpers = {};


	function unique() {
	    return '__anonymous__' + (u_count++);
	}

	function parseRules(str) {
	    if (!str) return null;

	    return str.match(/[a-zA-Z0-9\-\_]+(\{[^\{\}]*\})?/g);
	}

	function parseDom(field) {
	    var field = $(field);

	    var result = {};
	    var arr = [];

	    //parse required attribute
	    var required = field.attr('required');
	    if (required) {
	        arr.push('required');
	        result.required = true;
	    }

	    //parse type attribute
	    var type = field.attr('type');
	    if (type && type != 'submit' && type != 'cancel' && type != 'checkbox' && type != 'radio' && type != 'select' && type != 'select-one' && type != 'file' && type != 'hidden' && type != 'textarea') {

	        if (!Rule.getRule(type)) {
	            throw new Error('Form field with type "' + type + '" not supported!');
	        }

	        arr.push(type);
	    }

	    //parse min attribute
	    var min = field.attr('min');
	    if (min) {
	        arr.push('min{"min":"' + min + '"}');
	    }

	    //parse max attribute
	    var max = field.attr('max');
	    if (max) {
	        arr.push('max{max:' + max + '}');
	    }

	    //parse minlength attribute
	    var minlength = field.attr('minlength');
	    if (minlength) {
	        arr.push('minlength{min:' + minlength + '}');
	    }

	    //parse maxlength attribute
	    var maxlength = field.attr('maxlength');
	    if (maxlength) {
	        arr.push('maxlength{max:' + maxlength + '}');
	    }

	    //parse pattern attribute
	    var pattern = field.attr('pattern');
	    if (pattern) {
	        var regexp = new RegExp(pattern),
	            name = unique();
	        Rule.addRule(name, regexp);
	        arr.push(name);
	    }

	    //parse data-rule attribute to get custom rules
	    var rules = field.attr('data-rule');
	    rules = rules && parseRules(rules);
	    if (rules)
	        arr = arr.concat(rules);

	    result.rule = arr.length == 0 ? null : arr.join(' ');

	    return result;
	}

	function parseJSON(str) {
	    if (!str)
	        return null;

	    var NOTICE = 'Invalid option object "' + str + '".';

	    // remove braces
	    str = str.slice(1, -1);

	    var result = {};

	    var arr = str.split(',');
	    $.each(arr, function (i, v) {
	        arr[i] = $.trim(v);
	        if (!arr[i])
	            throw new Error(NOTICE);

	        var arr2 = arr[i].split(':');

	        var key = $.trim(arr2[0]),
	            value = $.trim(arr2[1]);

	        if (!key || !value)
	            throw new Error(NOTICE);

	        result[getValue(key)] = $.trim(getValue(value));
	    });

	    // 'abc' -> 'abc'  '"abc"' -> 'abc'
	    function getValue(str) {
	        if (str.charAt(0) == '"' && str.charAt(str.length - 1) == '"' || str.charAt(0) == "'" && str.charAt(str.length - 1) == "'") {
	            return eval(str);
	        }
	        return str;
	    }

	    return result;
	}

	function isHidden (ele) {
	    var w = ele[0].offsetWidth,
	        h = ele[0].offsetHeight,
	        force = (ele.prop('tagName') === 'TR');
	    return (w===0 && h===0 && !force) ? true : (w!==0 && h!==0 && !force) ? false : ele.css('display') === 'none';
	}

	module.exports = {
	    parseRule: function (str) {
	        var match = str.match(/([^{}:\s]*)(\{[^\{\}]*\})?/);

	        // eg. { name: "valueBetween", param: {min: 1, max: 2} }
	        return {
	            name: match[1],
	            param: parseJSON(match[2])
	        };
	    },
	    parseRules: parseRules,
	    parseDom: parseDom,
	    isHidden: isHidden,
	    helper: function (name, fn) {
	        if (fn) {
	            helpers[name] = fn;
	            return this;
	        }

	        return helpers[name];
	    }
	};



/***/ },

/***/ 46:
/***/ function(module, exports, __webpack_require__) {

	// var $ = require('jquery');
	var Widget = __webpack_require__(4),
	    async = __webpack_require__(19),
	    utils = __webpack_require__(20),
	    Item = __webpack_require__(48);

	var validators = [];

	var setterConfig = {
	    value: $.noop,
	    setter: function (val) {
	        return $.isFunction(val) ? val : utils.helper(val);
	    }
	};

	var Core = Widget.extend({
	    attrs: {
	        triggerType: 'blur',
	        checkOnSubmit: true,    // 是否在表单提交前进行校验，默认进行校验。
	        stopOnError: false,     // 校验整个表单时，遇到错误时是否停止校验其他表单项。
	        autoSubmit: true,       // When all validation passed, submit the form automatically.
	        checkNull: true,        // 除提交前的校验外，input的值为空时是否校验。
	        onItemValidate: setterConfig,
	        onItemValidated: setterConfig,
	        onFormValidate: setterConfig,
	        onFormValidated: setterConfig,
	        // 此函数用来定义如何自动获取校验项对应的 display 字段。
	        displayHelper: function (item) {
	            var labeltext, name;
	            var id = item.element.attr('id');
	            if (id) {
	                labeltext = $('label[for="' + id + '"]').text();
	                if (labeltext) {
	                    labeltext = labeltext.replace(/^[\*\s\:\：]*/, '').replace(/[\*\s\:\：]*$/, '');
	                }
	            }
	            name = item.element.attr('name');
	            return labeltext || name;
	        },
	        showMessage: setterConfig, // specify how to display error messages
	        hideMessage: setterConfig, // specify how to hide error messages
	        autoFocus: true,           // Automatically focus at the first element failed validation if true.
	        failSilently: false,       // If set to true and the given element passed to addItem does not exist, just ignore.
	        skipHidden: false          // 如果 DOM 隐藏是否进行校验
	    },

	    setup: function () {
	        // Validation will be executed according to configurations stored in items.
	        var self = this;

	        self.items = [];

	        // 外层容器是否是 form 元素
	        if (self.element.is('form')) {
	            // 记录 form 原来的 novalidate 的值，因为初始化时需要设置 novalidate 的值，destroy 的时候需要恢复。
	            self._novalidate_old = self.element.attr('novalidate');

	            // disable html5 form validation
	            // see: http://bugs.jquery.com/ticket/12577
	            try {
	                self.element.attr('novalidate', 'novalidate');
	            } catch (e) {}

	            //If checkOnSubmit is true, then bind submit event to execute validation.
	            if (self.get('checkOnSubmit')) {
	                self.element.on('submit.validator', function (e) {
	                    e.preventDefault();
	                    self.execute(function (err) {
	                        !err && self.get('autoSubmit') && self.element.get(0).submit();
	                    });
	                });
	            }
	        }

	        // 当每项校验之后, 根据返回的 err 状态, 显示或隐藏提示信息
	        self.on('itemValidated', function (err, message, element, event) {
	            this.query(element).get(err?'showMessage':'hideMessage').call(this, message, element, event);
	        });

	        validators.push(self);
	    },

	    Statics: $.extend({helper: utils.helper}, __webpack_require__(9), {
	        autoRender: function (cfg) {

	            var validator = new this(cfg);

	            $('input, textarea, select', validator.element).each(function (i, input) {

	                input = $(input);
	                var type = input.attr('type');

	                if (type == 'button' || type == 'submit' || type == 'reset') {
	                    return true;
	                }

	                var options = {};

	                if (type == 'radio' || type == 'checkbox') {
	                    options.element = $('[type=' + type + '][name=' + input.attr('name') + ']', validator.element);
	                } else {
	                    options.element = input;
	                }


	                if (!validator.query(options.element)) {

	                    var obj = utils.parseDom(input);

	                    if (!obj.rule) return true;

	                    $.extend(options, obj);

	                    validator.addItem(options);
	                }
	            });
	        },

	        query: function (selector) {
	            return Widget.query(selector);
	        },

	        // TODO 校验单项静态方法的实现需要优化
	        validate: function (options) {
	            var element = $(options.element);
	            var validator = new Core({
	                element: element.parents()
	            });

	            validator.addItem(options);
	            validator.query(element).execute();
	            validator.destroy();
	        }
	    }),


	    addItem: function (cfg) {
	        var self = this;
	        if ($.isArray(cfg)) {
	            $.each(cfg, function (i, v) {
	                self.addItem(v);
	            });
	            return this;
	        }

	        cfg = $.extend({
	            triggerType: self.get('triggerType'),
	            checkNull: self.get('checkNull'),
	            displayHelper: self.get('displayHelper'),
	            showMessage: self.get('showMessage'),
	            hideMessage: self.get('hideMessage'),
	            failSilently: self.get('failSilently'),
	            skipHidden: self.get('skipHidden')
	        }, cfg);

	        // 当 item 初始化的 element 为 selector 字符串时
	        // 默认到 validator.element 下去找
	        if (typeof cfg.element === 'string') {
	            cfg.element = this.$(cfg.element);
	        }

	        if (!$(cfg.element).length) {
	            if (cfg.failSilently) {
	                return self;
	            } else {
	                throw new Error('element does not exist');
	            }
	        }
	        var item = new Item(cfg);

	        self.items.push(item);
	        // 关联 item 到当前 validator 对象
	        item._validator = self;

	        item.delegateEvents(item.get('triggerType'), function (e) {
	            if (!this.get('checkNull') && !this.element.val()) return;
	            this.execute(null, {event: e});
	        });

	        item.on('all', function (eventName) {
	            this.trigger.apply(this, [].slice.call(arguments));
	        }, self);

	        return self;
	    },

	    removeItem: function (selector) {
	        var self = this,
	            target = selector instanceof Item ? selector : self.query(selector);

	        if (target) {
	            target.get('hideMessage').call(self, null, target.element);
	            erase(target, self.items);
	            target.destroy();
	        }

	        return self;
	    },

	    execute: function (callback) {
	        var self = this,
	            results = [],
	            hasError = false,
	            firstElem = null;

	        // 在表单校验前, 隐藏所有校验项的错误提示
	        $.each(self.items, function (i, item) {
	            item.get('hideMessage').call(self, null, item.element);
	        });
	        self.trigger('formValidate', self.element);

	        async[self.get('stopOnError') ? 'forEachSeries' : 'forEach' ](self.items, function (item, cb) {  // iterator
	            item.execute(function (err, message, ele) {
	                // 第一个校验错误的元素
	                if (err && !hasError) {
	                    hasError = true;
	                    firstElem = ele;
	                }
	                results.push([].slice.call(arguments, 0));

	                // Async doesn't allow any of tasks to fail, if you want the final callback executed after all tasks finished.
	                // So pass none-error value to task callback instead of the real result.
	                cb(self.get('stopOnError') ? err : null);

	            });
	        }, function () {  // complete callback
	            if (self.get('autoFocus') && hasError) {
	                self.trigger('autoFocus', firstElem);
	                firstElem.focus();
	            }

	            self.trigger('formValidated', hasError, results, self.element);
	            callback && callback(hasError, results, self.element);
	        });

	        return self;
	    },

	    destroy: function () {
	        var self = this,
	            len = self.items.length;

	        if (self.element.is('form')) {
	            try {
	                if (self._novalidate_old == undefined)
	                    self.element.removeAttr('novalidate');
	                else
	                    self.element.attr('novalidate', self._novalidate_old);
	            } catch (e) {
	            }

	            self.element.off('submit.validator');
	        }

	        for (var i = len - 1; i >= 0; i--) {
	            self.removeItem(self.items[i]);
	        }
	        erase(self, validators);

	        Core.superclass.destroy.call(this);
	    },

	    query: function (selector) {
	        return findItemBySelector(this.$(selector), this.items);

	        // 不使用 Widget.query 是因为, selector 有可能是重复, 选择第一个有可能不是属于
	        // 该组件的. 即使 再次使用 this.items 匹配, 也没法找到
	        /*var target = Widget.query(selector),
	            result = null;
	        $.each(this.items, function (i, item) {
	            if (item === target) {
	                result = target;
	                return false;
	            }
	        });
	        return result;*/
	    }
	});

	// 从数组中删除对应元素
	function erase(target, array) {
	    for(var i=0; i<array.length; i++) {
	        if (target === array[i]) {
	            array.splice(i, 1);
	            return array;
	        }
	    }
	}

	function findItemBySelector(target, array) {
	    var ret;
	    $.each(array, function (i, item) {
	        if (target.get(0) === item.element.get(0)) {
	            ret = item;
	            return false;
	        }
	    });
	    return ret;
	}

	module.exports = Core;


/***/ },

/***/ 47:
/***/ function(module, exports, __webpack_require__) {

	// var $ = require('jquery');
	var Core = __webpack_require__(46);
	var Validator = Core.extend({

	  events: {
	    'mouseenter .{{attrs.inputClass}}': 'mouseenter',
	    'mouseleave .{{attrs.inputClass}}': 'mouseleave',
	    'mouseenter .{{attrs.textareaClass}}': 'mouseenter',
	    'mouseleave .{{attrs.textareaClass}}': 'mouseleave',
	    'focus .{{attrs.itemClass}} input,textarea,select': 'focus',
	    'blur .{{attrs.itemClass}} input,textarea,select': 'blur'
	  },

	  attrs: {
	    explainClass: 'ui-form-explain',
	    itemClass: 'ui-form-item',
	    itemHoverClass: 'ui-form-item-hover',
	    itemFocusClass: 'ui-form-item-focus',
	    itemErrorClass: 'ui-form-item-error',
	    inputClass: 'ui-input',
	    textareaClass: 'ui-textarea',

	    showMessage: function (message, element) {
	      this.getExplain(element).html(message);
	      this.getItem(element).addClass(this.get('itemErrorClass'));
	    },

	    hideMessage: function (message, element) {
	      this.getExplain(element).html(element.attr('data-explain') || ' ');
	      this.getItem(element).removeClass(this.get('itemErrorClass'));
	    }
	  },

	  setup: function () {
	    Validator.superclass.setup.call(this);

	    var that = this;

	    this.on('autoFocus', function (ele) {
	      that.set('autoFocusEle', ele);
	    });
	  },

	  addItem: function (cfg) {
	    Validator.superclass.addItem.apply(this, [].slice.call(arguments));
	    var item = this.query(cfg.element);
	    if (item) {
	      this._saveExplainMessage(item);
	    }
	    return this;
	  },

	  _saveExplainMessage: function (item) {
	    var that = this;
	    var ele = item.element;

	    var explain = ele.attr('data-explain');
	    // If explaining message is not specified, retrieve it from data-explain attribute of the target
	    // or from DOM element with class name of the value of explainClass attr.
	    // Explaining message cannot always retrieve from DOM element with class name of the value of explainClass
	    // attr because the initial state of form may contain error messages from server.
	    // ---
	    // Also, If explaining message is under ui-form-item-error className
	    // it could be considered to be a error message from server
	    // that should not be put into data-explain attribute
	    if (explain === undefined && !this.getItem(ele).hasClass(this.get('itemErrorClass'))) {
	      ele.attr('data-explain', this.getExplain(ele).html());
	    }
	  },

	  getExplain: function (ele) {
	    var item = this.getItem(ele);
	    var explain = item.find('.' + this.get('explainClass'));

	    if (explain.length === 0) {
	     explain = $('<div class="' + this.get('explainClass') + '"></div>').appendTo(item);
	    }

	    return explain;
	  },

	  getItem: function (ele) {
	    ele = $(ele);
	    var item = ele.parents('.' + this.get('itemClass'));

	    return item;
	  },

	  mouseenter: function (e) {
	    this.getItem(e.target).addClass(this.get('itemHoverClass'));
	  },

	  mouseleave: function (e) {
	    this.getItem(e.target).removeClass(this.get('itemHoverClass'));
	  },

	  focus: function (e) {
	    var target = e.target,
	        autoFocusEle = this.get('autoFocusEle');

	    if (autoFocusEle && autoFocusEle.has(target)) {
	      var that = this;
	      $(target).keyup(function (e) {
	        that.set('autoFocusEle', null);
	        that.focus({target: target});
	      });
	      return;
	    }
	    this.getItem(target).removeClass(this.get('itemErrorClass'));
	    this.getItem(target).addClass(this.get('itemFocusClass'));
	    this.getExplain(target).html($(target).attr('data-explain') || '');
	  },

	  blur: function (e) {
	    this.getItem(e.target).removeClass(this.get('itemFocusClass'));
	  }
	});


	module.exports = Validator;


/***/ },

/***/ 48:
/***/ function(module, exports, __webpack_require__) {

	// var $ = require('jquery');
	var utils = __webpack_require__(20),
	    Widget = __webpack_require__(4),
	    async = __webpack_require__(19),
	    Rule = __webpack_require__(9);

	var setterConfig = {
	    value: $.noop,
	    setter: function (val) {
	        return $.isFunction(val) ? val : utils.helper(val);
	    }
	};

	function hasRequired(val){
	    return (' ' + val + ' ').indexOf(' required ') >= 0;
	}

	var Item = Widget.extend({
	    attrs: {
	        rule: {
	            value: '',
	            getter: function(val){
	                val = $.trim(val);

	                // 在获取的时候动态判断是否required，来追加或者删除 rule: required
	                if (this.get('required')) {
	                    if (!val || !hasRequired(val)) {
	                        val = $.trim('required ' + val);
	                    }
	                } else {
	                    if (hasRequired(val)) {
	                        val = $.trim((' ' + val + ' ').replace(' required ', ' '));
	                    }
	                }

	                return val;
	            }
	        },
	        display: null,
	        displayHelper: null,
	        triggerType: {
	            getter: function (val) {
	                if (!val)
	                    return val;

	                var element = this.element,
	                    type = element.attr('type');

	                // 将 select, radio, checkbox 的 blur 和 key 事件转成 change
	                var b = element.is("select") || type == 'radio' || type == 'checkbox';
	                if (b && (val.indexOf('blur') > -1 || val.indexOf('key') > -1))
	                    return 'change';
	                return val;
	            }
	        },
	        required: {
	            value: false,
	            getter: function(val) {
	                return $.isFunction(val) ? val() : val;
	            }
	        },
	        checkNull: true,
	        errormessage: null,
	        onItemValidate: setterConfig,
	        onItemValidated: setterConfig,
	        showMessage: setterConfig,
	        hideMessage: setterConfig
	    },

	    setup: function () {
	        if (!this.get('display') && $.isFunction(this.get('displayHelper'))) {
	            this.set('display', this.get('displayHelper')(this));
	        }
	    },

	    // callback 为当这个项校验完后, 通知 form 的 async.forEachSeries 此项校验结束并把结果通知到 async,
	    // 通过 async.forEachSeries 的第二个参数 Fn(item, cb) 的 cb 参数
	    execute: function (callback, context) {
	        var self = this,
	            elemDisabled = !!self.element.attr("disabled");

	        context = context || {};
	        // 如果是设置了不检查不可见元素的话, 直接 callback
	        if (self.get('skipHidden') && utils.isHidden(self.element) || elemDisabled) {
	            callback && callback(null, '', self.element);
	            return self;
	        }

	        self.trigger('itemValidate', self.element, context.event);

	        var rules = utils.parseRules(self.get('rule'));

	        if (rules) {
	            _metaValidate(self, rules, function (err, msg) {
	                self.trigger('itemValidated', err, msg, self.element, context.event);
	                callback && callback(err, msg, self.element);
	            });
	        } else {
	            self.trigger('itemValidated', null, '', self.element, context.event);
	            callback && callback(null, '', self.element);
	        }

	        return self;
	    },
	    getMessage: function(theRule, isSuccess, options) {
	        var message = '',
	            self = this,
	            rules = utils.parseRules(self.get('rule'));

	        isSuccess = !!isSuccess;

	        $.each(rules, function(i, item) {
	            var obj = utils.parseRule(item),
	                ruleName = obj.name,
	                param = obj.param;

	            if (theRule === ruleName) {
	                message = Rule.getMessage($.extend(options || {}, getMsgOptions(param, ruleName, self)), isSuccess);
	            }
	        });
	        return message;
	    }
	});

	function getMsgOptions(param, ruleName, self) {
	    var options = $.extend({}, param, {
	        element: self.element,
	        display: (param && param.display) || self.get('display'),
	        rule: ruleName
	    });

	    var message = self.get('errormessage' + upperFirstLetter(ruleName)) || self.get('errormessage');
	    if (message && !options.message) {
	        options.message = {
	            failure: message
	        };
	    }

	    return options;
	}

	function upperFirstLetter(str) {
	    str = str + "";
	    return str.charAt(0).toUpperCase() + str.slice(1);
	}

	function _metaValidate(self, rules, callback) {
	    var ele = self.element;

	    if (!self.get('required')) {
	        var truly = false;
	        var t = ele.attr('type');
	        switch (t) {
	            case 'checkbox':
	            case 'radio':
	                var checked = false;
	                ele.each(function (i, item) {
	                    if ($(item).prop('checked')) {
	                        checked = true;
	                        return false;
	                    }
	                });
	                truly = checked;
	                break;
	            default:
	                truly = !!ele.val();
	        }

	        // 非必要且没有值的时候, 直接 callback
	        if (!truly) {
	            callback && callback(null, null);
	            return;
	        }
	    }

	    if (!$.isArray(rules))
	        throw new Error('No validation rule specified or not specified as an array.');

	    var tasks = [];

	    $.each(rules, function (i, item) {
	        var obj = utils.parseRule(item),
	            ruleName = obj.name,
	            param = obj.param;

	        var ruleOperator = Rule.getOperator(ruleName);
	        if (!ruleOperator)
	            throw new Error('Validation rule with name "' + ruleName + '" cannot be found.');

	        var options = getMsgOptions(param, ruleName, self);

	        tasks.push(function (cb) {
	            // cb 为 async.series 每个 tasks 函数 的 callback!!
	            // callback(err, results)
	            // self._validator 为当前 Item 对象所在的 Validator 对象
	            ruleOperator.call(self._validator, options, cb);
	        });
	    });


	    // form.execute -> 多个 item.execute -> 多个 rule.operator
	    // 多个 rule 的校验是串行的, 前一个出错, 立即停止
	    // async.series 的 callback fn, 在执行 tasks 结束或某个 task 出错后被调用
	    // 其参数 results 为当前每个 task 执行的结果
	    // 函数内的 callback 回调给项校验
	    async.series(tasks, function (err, results) {
	        callback && callback(err, results[results.length - 1]);
	    });
	}

	module.exports = Item;


/***/ },

/***/ 50:
/***/ function(module, exports) {

	// 获取短信验证码

	function MobileCode(option){
	    this.option = $.extend({}, MobileCode.defualts, option);
	    this.state = true;
	    this.timer = null;
	    this.button = $(this.option.trigger);
	    this.input = $(this.option.input);
	    this.init();
	}

	MobileCode.prototype = {
	    init: function(){
	        var option = this.option;

	        this.bindEvent();

	        if(option.auto){
	            this.button.trigger('click');
	        }
	    },
	    bindEvent: function(){
	        var self = this,
	            option = this.option;

	        var postData = $.extend({}, option.data),
	            propName = option.propName ? option.propName : 'Mobile';

	        this.button.on('click', function(){

	            var $this = $(this);
	            var value = self.input.val();
	            var result = {
	                validated: false,
	                value: value,
	                message: ''
	            };

	            postData[propName] = value;

	            if(self.state){
	                // 如果正在倒计时，不往下走
	                if($this.data('disabled')) return false;

	                // 检测前回调
	                option.validate && option.validate.call(self, result);

	                // 验证手机格式
	                // 验证通过
	                if(/^0?(13|15|18|14|17)[0-9]{9}$/.test(value)){

	                    result.validated = true;
	                    result.message = '手机格式正确';

	                    // 检测后回调
	                    option.validated && option.validated.call(self, result);

	                    $this.text('正在获取...').data('disabled', true);

	                    $.ajax({
	                        type: 'POST',
	                        url: option.url,
	                        data: postData,
	                        success: function(data){

	                            // 如果成功，执行倒计时
	                            if(data.Succeeded){
	                                self.countdown();

	                            // 如果失败，重置
	                            }else{
	                                self.reset();
	                            }

	                            result.validated = data.Succeeded;
	                            result.message = data.Message;

	                            option.sended && option.sended.call(self, result);
	                        },
	                        error: function() {
	                            result.validated = false;
	                            result.message = '网络请求出错了';
	                            self.reset();
	                            option.sended && option.sended.call(self, result);
	                        }
	                    });

	                // 验证未通过
	                }else{
	                    result.message = '手机格式不正确';
	                    self.reset();
	                    option.validated && option.validated.call(self, result);
	                }
	            }
	        });
	    },
	    // 可用
	    enable: function(){
	        this.state = true;
	        this.button.text('获取短信验证码')
	            .prop('disabled', false)
	            .data('disabled', false)
	            .removeClass('ui-button-ldisable')
	            .addClass('ui-button-lwhite');
	    },
	    // 禁用
	    disable: function(){
	        this.state = false;
	        this.button.prop('disabled', true)
	            .removeClass('ui-button-lwhite')
	            .addClass('ui-button-ldisable');        
	    },
	    countdown: function(time){
	        var delay = this.option.delay;
	        var count = _time = delay;

	        if(typeof time !== 'undefined' && !isNaN(time)){
	            count = _time = parseInt(time, 10);
	        }

	        this.timer = setInterval(function(){

	            _time -= 1;

	            // 倒计时结束
	            if(_time < 0){
	                this.reset();

	            // 倒计时中
	            }else{
	                this.button.text('重新获取(' + _time + ')');
	                this.disable();
	            }
	        }.bind(this), 1000);
	    },
	    // 重置
	    reset: function(){
	        clearInterval(this.timer);
	        this.enable();
	    },
	    constructor: MobileCode
	};

	MobileCode.defualts = {
	    input: '', // 输入框(必须)
	    trigger: '', // 触发发送短信的按钮
	    delay: 120, // 时间间隔(倒计时)
	    auto: false, // 页面加载后自动发送短信请求
	    url: '',
	    data: {}, // ajax需传的数据
	    propName: '', // 用来替换data中Mobile属性，有时需要传给后端的属性不一定叫`Mobile`
	    validate: undefined, // 手机格式检验前
	    validated: undefined, // 手机格式检验后
	    sended: undefined // ajax回调
	};

	module.exports = MobileCode;

/***/ }

});