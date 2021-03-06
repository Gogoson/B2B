webpackJsonp([24],{

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
	var AjaxUpload = __webpack_require__(65);
	var cookie = __webpack_require__(67);

	// 侧边折叠菜单
	__webpack_require__(52)();

	//分销商采购管理
	var purchase = {

	    //已购采购商品管理
	    index: function() {
	        var form = $('#J_form_query');

	        //tab
	        $('.ui-tabs-triggers').on('click', '.ui-tabs-trigger', function(event) {
	            event.preventDefault();
	            var currentStatus = $(this).find('a').data('type');
	            $('input[name="LockStatus"]').val(currentStatus);
	            form.submit();
	        });

	        //全选
	        $('.member-tabs-purchase').selection({
	            selectAllElem: '#J_select_all',
	            singleClass: '.checkbox-sub',
	            singleParentClass: '.table-group',
	            onSelect: function() {},
	            onSelectAll: function() {}
	        });

	        //数组去重
	        function unique(arr) {
	            var ret = [];
	            var hash = {};

	            for (var i = 0; i < arr.length; i++) {
	                var item = arr[i];
	                var key = typeof(item) + item;
	                if (hash[key] !== 1) {
	                    ret.push(item);
	                    hash[key] = 1;
	                }
	            }
	            return ret;
	        }


	        //新增订单
	        $('#J_up_batch').on('click', function(event) {
	            event.preventDefault();
	            var $checkboxes = $('.checkbox-sub:checked');

	            if ($checkboxes.length > 0) {
	                var itemIds = [];
	                $checkboxes.each(function(index, element) {
	                    var $itemId = $(element).closest('.table-group').find('.table-group-item');
	                    var ids = $itemId.map(function(index, element) {
	                            return $.trim($(element).data('itemid'));
	                        })
	                        .get();
	                    $.merge(itemIds, ids);
	                });
	                itemIds = unique(itemIds).join(',');

	                $.ajax({
	                        url: '/ItemLock/BatchAddInventoryLockItemToCart',
	                        type: 'POST',
	                        dataType: 'json',
	                        data: { itemIds: itemIds }
	                    })
	                    .done(function(data) {
	                        if (data.Succeeded) {
	                            var newCookie,
	                                oldCookie = cookie.get('CO'),
	                                cookieOption = {
	                                    expires: 365,
	                                    path: '/',
	                                    domain: 'papago.hk'
	                                };

	                            if (oldCookie) {
	                                newCookie = (oldCookie + ',' + itemIds).split(',');
	                                newCookie = unique(newCookie).join(',');
	                                cookie.set('CO', newCookie, cookieOption);
	                            } else {
	                                cookie.set('CO', itemIds, cookieOption);
	                            }

	                            window.location.href = wwwDomain + "/Cart";
	                        } else {
	                            showMessage(data.Message, false);
	                        }
	                    })
	                    .fail(function() {
	                        showMessage('网络出错，请稍后再试！', false);
	                    });
	            } else {
	                showMessage('请选择订单', false);
	            }
	        });

	        formPaginger('.ui-paging', '#J_form_query');

	        initRangeDate();

	    },

	    //我的关注
	    attention: function() {
	        var queryForm = $('#J_form_query');

	        //点击tab
	        $('.ui-tabs-trigger').on('click', function() {
	            var $this = $(this);
	            var type = $this.find('a').data('type');
	            $('input[name="ItemStatus"]').val(type);
	            queryForm.submit();
	        });

	        //全选
	        $('.member-attention').selection({
	            selectAllElem: '#J_select_all',
	            singleClass: '.checkbox-sub',
	            singleParentClass: '.member-table-item',
	            batchRemoveElem: '#J_del_batch',
	            async: true,
	            onSelect: function() {},
	            onSelectAll: function() {},
	            onBatchRemove: function(data) {
	                var that = this,
	                    selecteds = this.selecteds,
	                    datas = [];

	                if (!selecteds.length) {
	                    showMessage('请选择要删除的商品！', false);
	                    return false;
	                }

	                ConfirmBox.confirm('确定要删除所选商品吗？', '提示', function() {

	                    for (var i = 0; i < selecteds.length; i++) {
	                        var item = selecteds[i];
	                        datas.push(item.parent.data('pid'));
	                    }

	                    var pids = datas.join(','); //待删除的商品id
	                    $.ajax({
	                            url: '/ItemFollow/BatchDeleteItemFollow',
	                            data: { itemFollowIds: pids },
	                            type: 'POST',
	                            dataType: 'json'
	                        })
	                        .done(function(data) {
	                            if (data.Succeeded) {
	                                var count = $('.inner-count').text() - selecteds.length;
	                                $('.inner-count').text(count);
	                                that.batchRemove();
	                                checkHasNull(that.items);
	                                showMessage('删除成功！', false);
	                            } else {
	                                showMessage('删除失败，请稍后再试！', false);
	                            }
	                        })
	                        .fail(function() {
	                            showMessage('网络出错，请稍后再试！', false);
	                        });
	                });
	            }
	        });

	        //放入采购车
	        // $('#J_in_cart').on('click', function() {
	        //     var checkbox = $('.checkbox-sub');
	        //     var datas = [];
	        //     var msg = '';

	        //     for (var i = 0; i < checkbox.length; i++) {
	        //         var $item = $(checkbox[i]);
	        //         if ($item.prop('checked')) {
	        //             datas.push($item.closest('tr').data('pid'));
	        //         }
	        //     }
	        //     var pids = datas.join(','); //待放入采购车的商品id            

	        //     if (pids === '') {
	        //         ConfirmBox.alert('请选择商品！', function() {}, { title: '提示：' });
	        //     } else {
	        //         $.ajax({
	        //             url: '/addcart',
	        //             data: { pids: pids },
	        //             type: 'post',
	        //             dataType: 'json',
	        //             success: function(data) {
	        //                 showMessage('您的商品已放入采购车！', false);
	        //             },
	        //             error: function() {
	        //                 showMessage('网络出错，请稍后再试！', false);
	        //             }
	        //         });
	        //     }
	        // });

	        //批量关注
	        // $('#J_attention_batch').on('click', function(e) {
	        //     e.preventDefault();
	        //     var uploader = null;
	        //     var uploadValueEl;
	        //     var exportledBatch = [
	        //         '<div class="order-exportleds-dialog ui-dialog-form ui-form">',
	        //         '<div class="ui-form-item" id="J_exportled_upload_wrap">',
	        //         '<label class="ui-label">选择：</label>',
	        //         '<a href="javascript:;" class="ui-button-lgreen ui-button" id="J_exportled_upload">上传</a>',
	        //         '<span class="ui-form-text fn-hide" id="upload_loading">上传中...</span>',
	        //         '<input type="hidden" id="J_upload_value">',
	        //         '<div class="ui-tiptext-container ui-tiptext-container-message ui-mt20">',
	        //         '<p class="ui-tiptext ui-tiptext-message">',
	        //         '<i class="ui-tiptext-icon iconfont" title="提示">&#xe614;</i>温馨提示：<br>',
	        //         '1. 只能上传后缀为.XLS格式的Excel文件，可以下载我司现有样例文件 ： 订单上传模板 最后更新时间：2015-09-23 00:00:00<br>',
	        //         '2. 如果您上传的文件格式不识别，请下载模板，然后再次上传 <br>',
	        //         '3. 批量上传订单数据不能超过300条<br> ',
	        //         '4. 如有错误或疑问，请及时联系我们客服 </p>',
	        //         '</div>',
	        //         '</div></div>'
	        //     ].join('');

	        //     ConfirmBox.confirm(exportledBatch, '批量关注', null, {
	        //         onShow: function() {

	        //             var $trigger = $('#J_exportled_upload'),
	        //                 uploadLoading = $('#upload_loading');

	        //             uploadValueEl = $('#J_upload_value');

	        //             uploader = new AjaxUpload($trigger, {
	        //                 action: '/Passport/Upload',
	        //                 responseType: 'json',
	        //                 title: '',
	        //                 data: {
	        //                     AjaxRequest: "true"
	        //                 },
	        //                 onChange: function(file, extension) {
	        //                     var re = /xls/gi;
	        //                     if (!re.test(extension)) {
	        //                         alert('请上传Excel格式文件!');
	        //                         return false;
	        //                     }
	        //                 },
	        //                 onSubmit: function(file, extension) {
	        //                     // 上传中
	        //                     $trigger.hide();
	        //                     uploadLoading.show();
	        //                 },
	        //                 onComplete: function(file, response) {
	        //                     uploadLoading.hide();
	        //                     console.log(file);
	        //                     // console.log(response)
	        //                 }
	        //             });
	        //         },
	        //         onHide: function() {
	        //             uploader = null;
	        //         },
	        //         onConfirm: function() {

	        //             var uploadValue = uploadValueEl.val();

	        //             if ($.trim(uploadValue) !== '') {
	        //                 this.hide();
	        //                 self.showMessage('操作成功');
	        //             } else {
	        //                 alert('请上传Excel文件');
	        //             }

	        //         }
	        //     });
	        // });

	        //翻页
	        formPaginger('.ui-paging', '#J_form_query');

	        initRangeDate();
	    }
	};

	// 是否已无信息
	function checkHasNull(items) {
	    if (!items.length) {
	        $('.ui-table tbody').append('<tr><td colspan="7" class="member-table-none">无相关信息</td></tr>');
	        $('.ui-paging').remove();
	    }
	}

	//提示信息
	function showMessage(message, hold) {
	    ConfirmBox.show(message, null, {
	        title: '提示：',
	        onShow: function() {
	            if (!hold) {
	                var that = this;
	                setTimeout(function() {
	                    that.hide();
	                }, 2000);
	            }
	        }
	    });
	}
	// 日历初始化
	function initRangeDate() {
	    // 异步加载日历组件
	    __webpack_require__.e/* nsure */(0, function(require) {
	        var Calendar = __webpack_require__(63);

	        var dateStart, dateEnd;
	        // 日历开始
	        dateStart = new Calendar({
	            trigger: '#J_date_start'
	        });

	        // 日历结束
	        dateEnd = new Calendar({
	            trigger: '#J_date_end'
	        });

	        // 初始化日期
	        var dateStartVal = $('#J_date_start').val(),
	            dateEndVal = $('#J_date_end').val();

	        var date = new Date(),
	            year = date.getFullYear(),
	            month = date.getMonth() * 1 + 1,
	            day = date.getDate() * 1;

	        var today = year + '-' +
	            (month >= 10 ? month : '0' + month) + '-' +
	            (day >= 10 ? day : '0' + day);
	        // console.log(today)

	        if ($.trim(dateStartVal) === '' && $.trim(dateEndVal) === '') {
	            dateStart.range([null, today]);
	            dateEnd.range([null, today]);
	        } else {
	            dateStart.range([null, today]);
	            dateEnd.range([dateStartVal, today]);
	        }

	        // 当选日期时，调整可选日期的范围
	        dateStart.on('selectDate', function(date) {
	            dateEnd.range([date, today]);
	        });

	        dateEnd.on('selectDate', function(date) {
	            dateStart.range([null, date]);
	        });

	    });
	}

	window.purchase = purchase;


/***/ },

/***/ 65:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	* AJAX Upload ( http://valums.com/ajax-upload/ ) 
	* Copyright (c) Andrew Valums
	* Licensed under the MIT license 
	*/

	/**
	* Attaches event to a dom element.
	* @param {Element} el
	* @param type event name
	* @param fn callback This refers to the passed element
	*/

	(function (factory) {

	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    }
	    else if (typeof module != 'undefined' && typeof module.exports != 'undefined') {
	        module.exports = factory();
	    }
	    else if (typeof Package !== 'undefined') {
	        AjaxUpload = factory();  // export for Meteor.js
	    }
	    else {
	        /* jshint sub:true */
	        window['AjaxUpload'] = factory();
	    }
	})(function () {

	    function addEvent(el, type, fn) {
	        if (el.addEventListener) {
	            el.addEventListener(type, fn, false);
	        } else if (el.attachEvent) {
	            el.attachEvent('on' + type, function () {
	                fn.call(el);
	            });
	        } else {
	            throw new Error('not supported or DOM not loaded');
	        }
	    }

	    /**
	    * Attaches resize event to a window, limiting
	    * number of event fired. Fires only when encounteres
	    * delay of 100 after series of events.
	    * 
	    * Some browsers fire event multiple times when resizing
	    * http://www.quirksmode.org/dom/events/resize.html
	    * 
	    * @param fn callback This refers to the passed element
	    */
	    function addResizeEvent(fn) {
	        var timeout;

	        addEvent(window, 'resize', function () {
	            if (timeout) {
	                clearTimeout(timeout);
	            }
	            timeout = setTimeout(fn, 100);
	        });
	    }

	    // Needs more testing, will be rewriten for next version        
	    // getOffset function copied from jQuery lib (http://jquery.com/)
	    if (document.documentElement.getBoundingClientRect) {
	        // Get Offset using getBoundingClientRect
	        // http://ejohn.org/blog/getboundingclientrect-is-awesome/
	        var getOffset = function (el) {
	            var box = el.getBoundingClientRect();
	            var doc = el.ownerDocument;
	            var body = doc.body;
	            var docElem = doc.documentElement; // for ie 
	            var clientTop = docElem.clientTop || body.clientTop || 0;
	            var clientLeft = docElem.clientLeft || body.clientLeft || 0;

	            // In Internet Explorer 7 getBoundingClientRect property is treated as physical,
	            // while others are logical. Make all logical, like in IE8.	
	            var zoom = 1;
	            if (body.getBoundingClientRect) {
	                var bound = body.getBoundingClientRect();
	                zoom = (bound.right - bound.left) / body.clientWidth;
	            }

	            if (zoom > 1) {
	                clientTop = 0;
	                clientLeft = 0;
	            }

	            var top = box.top / zoom + (window.pageYOffset || docElem && docElem.scrollTop / zoom || body.scrollTop / zoom) - clientTop, left = box.left / zoom + (window.pageXOffset || docElem && docElem.scrollLeft / zoom || body.scrollLeft / zoom) - clientLeft;

	            return {
	                top: top,
	                left: left
	            };
	        };
	    } else {
	        // Get offset adding all offsets 
	        var getOffset = function (el) {
	            var top = 0, left = 0;
	            do {
	                top += el.offsetTop || 0;
	                left += el.offsetLeft || 0;
	                el = el.offsetParent;
	            } while (el);

	            return {
	                left: left,
	                top: top
	            };
	        };
	    }

	    /**
	    * Returns left, top, right and bottom properties describing the border-box,
	    * in pixels, with the top-left relative to the body
	    * @param {Element} el
	    * @return {Object} Contains left, top, right,bottom
	    */
	    function getBox(el) {
	        var left, right, top, bottom;
	        var offset = getOffset(el);
	        left = offset.left;
	        top = offset.top;

	        right = left + el.offsetWidth;
	        bottom = top + el.offsetHeight;

	        return {
	            left: left,
	            right: right,
	            top: top,
	            bottom: bottom
	        };
	    }

	    /**
	    * Helper that takes object literal
	    * and add all properties to element.style
	    * @param {Element} el
	    * @param {Object} styles
	    */
	    function addStyles(el, styles) {
	        for (var name in styles) {
	            if (styles.hasOwnProperty(name)) {
	                el.style[name] = styles[name];
	            }
	        }
	    }

	    /**
	    * Function places an absolutely positioned
	    * element on top of the specified element
	    * copying position and dimentions.
	    * @param {Element} from
	    * @param {Element} to
	    */
	    function copyLayout(from, to) {
	        var box = getBox(from);

	        addStyles(to, {
	            position: 'absolute',
	            left: box.left + 'px',
	            top: box.top + 'px',
	            width: from.offsetWidth + 'px',
	            height: from.offsetHeight + 'px'
	        });
	    }

	    /**
	    * Creates and returns element from html chunk
	    * Uses innerHTML to create an element
	    */
	    var toElement = (function () {
	        var div = document.createElement('div');
	        return function (html) {
	            div.innerHTML = html;
	            var el = div.firstChild;
	            return div.removeChild(el);
	        };
	    })();

	    /**
	    * Function generates unique id
	    * @return unique id 
	    */
	    var getUID = (function () {
	        var id = 0;
	        return function () {
	            return 'ValumsAjaxUpload' + id++;
	        };
	    })();

	    /**
	    * Get file name from path
	    * @param {String} file path to file
	    * @return filename
	    */
	    function fileFromPath(file) {
	        return file.replace(/.*(\/|\\)/, "");
	    }

	    /**
	    * Get file extension lowercase
	    * @param {String} file name
	    * @return file extenstion
	    */
	    function getExt(file) {
	        return (-1 !== file.indexOf('.')) ? file.replace(/.*[.]/, '') : '';
	    }

	    function hasClass(el, name) {
	        var re = new RegExp('\\b' + name + '\\b');
	        return re.test(el.className);
	    }
	    function addClass(el, name) {
	        if (!hasClass(el, name)) {
	            el.className += ' ' + name;
	        }
	    }
	    function removeClass(el, name) {
	        var re = new RegExp('\\b' + name + '\\b');
	        el.className = el.className.replace(re, '');
	    }

	    function removeNode(el) {
	        el.parentNode.removeChild(el);
	    }

	    /**
	    * Easy styling and uploading
	    * @constructor
	    * @param button An element you want convert to 
	    * upload button. Tested dimentions up to 500x500px
	    * @param {Object} options See defaults below.
	    */
	    window.AjaxUpload = function (button, options) {
	        this._settings = {
	            // Location of the server-side upload script
	            action: 'upload.php',
	            // File upload name
	            name: 'userfile',
	            // Select & upload multiple files at once FF3.6+, Chrome 4+
	            multiple: false,
	            // Additional data to send
	            data: {},
	            // Submit file as soon as it's selected
	            autoSubmit: true,
	            // The type of data that you're expecting back from the server.
	            // html and xml are detected automatically.
	            // Only useful when you are using json data as a response.
	            // Set to "json" in that case. 
	            responseType: false,
	            // Class applied to button when mouse is hovered
	            hoverClass: 'hover',
	            // Class applied to button when button is focused
	            focusClass: 'focus',
	            // Class applied to button when AU is disabled
	            disabledClass: 'disabled',
	            // When user selects a file, useful with autoSubmit disabled
	            // You can return false to cancel upload			
	            onChange: function (file, extension) {
	            },
	            // Callback to fire before file is uploaded
	            // You can return false to cancel upload
	            onSubmit: function (file, extension) {
	            },
	            // Fired when file upload is completed
	            // WARNING! DO NOT USE "FALSE" STRING AS A RESPONSE!
	            onComplete: function (file, response) {
	            },
	            onError: function(file, response){}
	        };

	        // Merge the users options with our defaults
	        for (var i in options) {
	            if (options.hasOwnProperty(i)) {
	                this._settings[i] = options[i];
	            }
	        }

	        // button isn't necessary a dom element
	        if (button.jquery) {
	            // jQuery object was passed
	            button = button[0];
	        } else if (typeof button == "string") {
	            if (/^#.*/.test(button)) {
	                // If jQuery user passes #elementId don't break it					
	                button = button.slice(1);
	            }

	            button = document.getElementById(button);
	        }

	        if (!button || button.nodeType !== 1) {
	            throw new Error("Please make sure that you're passing a valid element");
	        }

	        if (button.nodeName.toUpperCase() == 'A') {
	            // disable link                       
	            addEvent(button, 'click', function (e) {
	                if (e && e.preventDefault) {
	                    e.preventDefault();
	                } else if (window.event) {
	                    window.event.returnValue = false;
	                }
	            });
	        }

	        // DOM element
	        this._button = button;
	        // DOM element                 
	        this._input = null;
	        // If disabled clicking on button won't do anything
	        this._disabled = false;

	        // if the button was disabled before refresh if will remain
	        // disabled in FireFox, let's fix it
	        this.enable();

	        this._rerouteClicks();
	    };

	    // assigning methods to our class
	    AjaxUpload.prototype = {
	        setData: function (data) {
	            this._settings.data = data;
	        },
	        disable: function () {
	            addClass(this._button, this._settings.disabledClass);
	            this._disabled = true;

	            var nodeName = this._button.nodeName.toUpperCase();
	            if (nodeName == 'INPUT' || nodeName == 'BUTTON') {
	                this._button.setAttribute('disabled', 'disabled');
	            }

	            // hide input
	            if (this._input) {
	                if (this._input.parentNode) {
	                    // We use visibility instead of display to fix problem with Safari 4
	                    // The problem is that the value of input doesn't change if it 
	                    // has display none when user selects a file
	                    this._input.parentNode.style.visibility = 'hidden';
	                }
	            }
	        },
	        enable: function () {
	            removeClass(this._button, this._settings.disabledClass);
	            this._button.removeAttribute('disabled');
	            this._disabled = false;

	        },
	        /**
	        * Creates invisible file input 
	        * that will hover above the button
	        * <div><input type='file' /></div>
	        */
	        _createInput: function () {
	            var self = this;

	            var input = document.createElement("input");
	            input.setAttribute('type', 'file');
	            input.setAttribute('title', this._settings.title);
	            input.setAttribute('name', this._settings.name);
	            if (this._settings.multiple) input.setAttribute('multiple', 'multiple');

	            addStyles(input, {
	                'position': 'absolute',
	                // in Opera only 'browse' button
	                // is clickable and it is located at
	                // the right side of the input
	                'right': 0,
	                'margin': 0,
	                'padding': 0,
	                'fontSize': '480px',
	                // in Firefox if font-family is set to
	                // 'inherit' the input doesn't work
	                'fontFamily': 'sans-serif',
	                'cursor': 'pointer'
	            });

	            var div = document.createElement("div");
	            addStyles(div, {
	                'display': 'block',
	                'position': 'absolute',
	                'overflow': 'hidden',
	                'margin': 0,
	                'padding': 0,
	                'opacity': 0,
	                // Make sure browse button is in the right side
	                // in Internet Explorer
	                'direction': 'ltr',
	                //Max zIndex supported by Opera 9.0-9.2
	                'zIndex': 2147483583
	            });

	            // Make sure that element opacity exists.
	            // Otherwise use IE filter            
	            if (div.style.opacity !== "0") {
	                if (typeof (div.filters) == 'undefined') {
	                    throw new Error('Opacity not supported by the browser');
	                }
	                div.style.filter = "alpha(opacity=0)";
	            }

	            addEvent(input, 'change', function () {

	                if (!input || input.value === '') {
	                    return;
	                }

	                // Get filename from input, required                
	                // as some browsers have path instead of it          
	                var file = fileFromPath(input.value);

	                if (false === self._settings.onChange.call(self, file, getExt(file))) {
	                    self._clearInput();
	                    return;
	                }

	                // Submit form when value is changed
	                if (self._settings.autoSubmit) {
	                    self.submit();
	                }
	            });

	            addEvent(input, 'mouseover', function () {
	                addClass(self._button, self._settings.hoverClass);
	            });

	            addEvent(input, 'mouseout', function () {
	                removeClass(self._button, self._settings.hoverClass);
	                removeClass(self._button, self._settings.focusClass);

	                if (input.parentNode) {
	                    // We use visibility instead of display to fix problem with Safari 4
	                    // The problem is that the value of input doesn't change if it 
	                    // has display none when user selects a file
	                    input.parentNode.style.visibility = 'hidden';
	                }
	            });

	            addEvent(input, 'focus', function () {
	                addClass(self._button, self._settings.focusClass);
	            });

	            addEvent(input, 'blur', function () {
	                removeClass(self._button, self._settings.focusClass);
	            });

	            div.appendChild(input);
	            document.body.appendChild(div);

	            this._input = input;
	        },
	        _clearInput: function () {
	            if (!this._input) {
	                return;
	            }

	            // this._input.value = ''; Doesn't work in IE6                               
	            removeNode(this._input.parentNode);
	            this._input = null;
	            this._createInput();

	            removeClass(this._button, this._settings.hoverClass);
	            removeClass(this._button, this._settings.focusClass);
	        },
	        /**
	        * Function makes sure that when user clicks upload button,
	        * the this._input is clicked instead
	        */
	        _rerouteClicks: function () {
	            var self = this;

	            // IE will later display 'access denied' error
	            // if you use using self._input.click()
	            // other browsers just ignore click()

	            addEvent(self._button, 'mouseover', function () {
	                if (self._disabled) {
	                    return;
	                }

	                if (!self._input) {
	                    self._createInput();
	                }

	                var div = self._input.parentNode;
	                copyLayout(self._button, div);
	                div.style.visibility = 'visible';

	            });


	            // commented because we now hide input on mouseleave
	            /**
	            * When the window is resized the elements 
	            * can be misaligned if button position depends
	            * on window size
	            */
	            //addResizeEvent(function(){
	            //    if (self._input){
	            //        copyLayout(self._button, self._input.parentNode);
	            //    }
	            //});            

	        },
	        /**
	        * Creates iframe with unique name
	        * @return {Element} iframe
	        */
	        _createIframe: function () {
	            // We can't use getTime, because it sometimes return
	            // same value in safari :(
	            var id = getUID();

	            // We can't use following code as the name attribute
	            // won't be properly registered in IE6, and new window
	            // on form submit will open
	            // var iframe = document.createElement('iframe');
	            // iframe.setAttribute('name', id);                        

	            var iframe = toElement('<iframe src="javascript:false;" name="' + id + '" />');
	            // src="javascript:false; was added
	            // because it possibly removes ie6 prompt 
	            // "This page contains both secure and nonsecure items"
	            // Anyway, it doesn't do any harm.            
	            iframe.setAttribute('id', id);

	            iframe.style.display = 'none';
	            document.body.appendChild(iframe);

	            return iframe;
	        },
	        /**
	        * Creates form, that will be submitted to iframe
	        * @param {Element} iframe Where to submit
	        * @return {Element} form
	        */
	        _createForm: function (iframe) {
	            var settings = this._settings;

	            // We can't use the following code in IE6
	            // var form = document.createElement('form');
	            // form.setAttribute('method', 'post');
	            // form.setAttribute('enctype', 'multipart/form-data');
	            // Because in this case file won't be attached to request                    
	            var form = toElement('<form method="post" enctype="multipart/form-data"></form>');

	            form.setAttribute('action', settings.action);
	            form.setAttribute('target', iframe.name);
	            form.style.display = 'none';
	            document.body.appendChild(form);

	            // Create hidden input element for each data key
	            for (var prop in settings.data) {
	                if (settings.data.hasOwnProperty(prop)) {
	                    var el = document.createElement("input");
	                    el.setAttribute('type', 'hidden');
	                    el.setAttribute('name', prop);
	                    el.setAttribute('value', settings.data[prop]);
	                    form.appendChild(el);
	                }
	            }
	            return form;
	        },
	        /**
	        * Gets response from iframe and fires onComplete event when ready
	        * @param iframe
	        * @param file Filename to use in onComplete callback 
	        */
	        _getResponse: function (iframe, file) {
	            // getting response
	            var toDeleteFlag = false, self = this, settings = this._settings;

	            addEvent(iframe, 'load', function () {
	                if (// For Safari 
	                    iframe.src == "javascript:'%3Chtml%3E%3C/html%3E';" ||
	                // For FF, IE
	                    iframe.src == "javascript:'<html></html>';") {
	                    // First time around, do not delete.
	                    // We reload to blank page, so that reloading main page
	                    // does not re-submit the post.

	                    if (toDeleteFlag) {
	                        // Fix busy state in FF3
	                        setTimeout(function () {
	                            removeNode(iframe);
	                        }, 0);
	                    }

	                    return;
	                }

	                var doc = iframe.contentDocument ? iframe.contentDocument : window.frames[iframe.id].document;

	                // fixing Opera 9.26,10.00
	                if (doc.readyState && doc.readyState != 'complete') {
	                    // Opera fires load event multiple times
	                    // Even when the DOM is not ready yet
	                    // this fix should not affect other browsers
	                    return;
	                }

	                // fixing Opera 9.64
	                if (doc.body && doc.body.innerHTML == "false") {
	                    // In Opera 9.64 event was fired second time
	                    // when body.innerHTML changed from false 
	                    // to server response approx. after 1 sec
	                    return;
	                }

	                var response;

	                if (doc.XMLDocument) {
	                    // response is a xml document Internet Explorer property
	                    response = doc.XMLDocument;
	                } else if (doc.body) {

	                    // response is html document or plain text
	                    response = doc.body.innerHTML;
	                    
	                    // 添加error回调
	                    // 妈蛋，表单提交拿不到http状态码，这里根据返回的页面内容处理
	                    // 只针对当前ppg平台
	                    if(doc.body.firstChild.nodeName.toUpperCase() !== 'PRE' &&
	                        doc.body.firstChild.nextSibling){
	                        settings.onError.call(self, file, response);
	                        return;
	                    }

	                    if (settings.responseType && settings.responseType.toLowerCase() == 'json') {
	                        // If the document was sent as 'application/javascript' or
	                        // 'text/javascript', then the browser wraps the text in a <pre>
	                        // tag and performs html encoding on the contents.  In this case,
	                        // we need to pull the original text content from the text node's
	                        // nodeValue property to retrieve the unmangled content.
	                        // Note that IE6 only understands text/html
	                        if (doc.body.firstChild && doc.body.firstChild.nodeName.toUpperCase() == 'PRE') {
	                            doc.normalize();
	                            response = doc.body.firstChild.firstChild.nodeValue;
	                        }

	                        if (response) {
	                            response = eval("(" + response + ")");
	                        } else {
	                            response = {};
	                        }
	                    }
	                } else {
	                    // response is a xml document
	                    response = doc;
	                }

	                settings.onComplete.call(self, file, response);

	                // Reload blank page, so that reloading main page
	                // does not re-submit the post. Also, remember to
	                // delete the frame
	                toDeleteFlag = true;

	                // Fix IE mixed content issue
	                iframe.src = "javascript:'<html></html>';";
	            });
	        },
	        /**
	        * Upload file contained in this._input
	        */
	        submit: function () {
	            var self = this, settings = this._settings;

	            if (!this._input || this._input.value === '') {
	                return;
	            }

	            var file = fileFromPath(this._input.value);

	            // user returned false to cancel upload
	            if (false === settings.onSubmit.call(this, file, getExt(file))) {
	                this._clearInput();
	                return;
	            }

	            // sending request    
	            var iframe = this._createIframe();
	            var form = this._createForm(iframe);

	            // assuming following structure
	            // div -> input type='file'
	            removeNode(this._input.parentNode);
	            removeClass(self._button, self._settings.hoverClass);
	            removeClass(self._button, self._settings.focusClass);

	            form.appendChild(this._input);

	            form.submit();

	            // request set, clean up                
	            removeNode(form); form = null;
	            removeNode(this._input); this._input = null;

	            // Get response from iframe and fire onComplete event when ready
	            this._getResponse(iframe, file);

	            // get ready for next request            
	            this._createInput();
	        }
	    };

	    return AjaxUpload;

	});



/***/ },

/***/ 67:
/***/ function(module, exports) {

	// Cookie
	// -------------
	// Thanks to:
	//  - http://www.nczonline.net/blog/2009/05/05/http-cookies-explained/
	//  - http://developer.yahoo.com/yui/3/cookie/


	var Cookie = exports;

	var decode = decodeURIComponent;
	var encode = encodeURIComponent;


	/**
	 * Returns the cookie value for the given name.
	 *
	 * @param {String} name The name of the cookie to retrieve.
	 *
	 * @param {Function|Object} options (Optional) An object containing one or
	 *     more cookie options: raw (true/false) and converter (a function).
	 *     The converter function is run on the value before returning it. The
	 *     function is not used if the cookie doesn't exist. The function can be
	 *     passed instead of the options object for conveniently. When raw is
	 *     set to true, the cookie value is not URI decoded.
	 *
	 * @return {*} If no converter is specified, returns a string or undefined
	 *     if the cookie doesn't exist. If the converter is specified, returns
	 *     the value returned from the converter.
	 */
	Cookie.get = function(name, options) {
	    validateCookieName(name);

	    if (typeof options === 'function') {
	        options = { converter: options };
	    }
	    else {
	        options = options || {};
	    }

	    var cookies = parseCookieString(document.cookie, !options['raw']);
	    return (options.converter || same)(cookies[name]);
	};


	/**
	 * Sets a cookie with a given name and value.
	 *
	 * @param {string} name The name of the cookie to set.
	 *
	 * @param {*} value The value to set for the cookie.
	 *
	 * @param {Object} options (Optional) An object containing one or more
	 *     cookie options: path (a string), domain (a string),
	 *     expires (number or a Date object), secure (true/false),
	 *     and raw (true/false). Setting raw to true indicates that the cookie
	 *     should not be URI encoded before being set.
	 *
	 * @return {string} The created cookie string.
	 */
	Cookie.set = function(name, value, options) {
	    validateCookieName(name);

	    options = options || {};
	    var expires = options['expires'];
	    var domain = options['domain'];
	    var path = options['path'];

	    if (!options['raw']) {
	        value = encode(String(value));
	    }

	    var text = name + '=' + value;

	    // expires
	    var date = expires;
	    if (typeof date === 'number') {
	        date = new Date();
	        date.setDate(date.getDate() + expires);
	    }
	    if (date instanceof Date) {
	        text += '; expires=' + date.toUTCString();
	    }

	    // domain
	    if (isNonEmptyString(domain)) {
	        text += '; domain=' + domain;
	    }

	    // path
	    if (isNonEmptyString(path)) {
	        text += '; path=' + path;
	    }

	    // secure
	    if (options['secure']) {
	        text += '; secure';
	    }

	    document.cookie = text;
	    return text;
	};


	/**
	 * Removes a cookie from the machine by setting its expiration date to
	 * sometime in the past.
	 *
	 * @param {string} name The name of the cookie to remove.
	 *
	 * @param {Object} options (Optional) An object containing one or more
	 *     cookie options: path (a string), domain (a string),
	 *     and secure (true/false). The expires option will be overwritten
	 *     by the method.
	 *
	 * @return {string} The created cookie string.
	 */
	Cookie.remove = function(name, options) {
	    options = options || {};
	    options['expires'] = new Date(0);
	    return this.set(name, '', options);
	};


	function parseCookieString(text, shouldDecode) {
	    var cookies = {};

	    if (isString(text) && text.length > 0) {

	        var decodeValue = shouldDecode ? decode : same;
	        var cookieParts = text.split(/;\s/g);
	        var cookieName;
	        var cookieValue;
	        var cookieNameValue;

	        for (var i = 0, len = cookieParts.length; i < len; i++) {

	            // Check for normally-formatted cookie (name-value)
	            cookieNameValue = cookieParts[i].match(/([^=]+)=/i);
	            if (cookieNameValue instanceof Array) {
	                try {
	                    cookieName = decode(cookieNameValue[1]);
	                    cookieValue = decodeValue(cookieParts[i]
	                            .substring(cookieNameValue[1].length + 1));
	                } catch (ex) {
	                    // Intentionally ignore the cookie -
	                    // the encoding is wrong
	                }
	            } else {
	                // Means the cookie does not have an "=", so treat it as
	                // a boolean flag
	                cookieName = decode(cookieParts[i]);
	                cookieValue = '';
	            }

	            if (cookieName) {
	                cookies[cookieName] = cookieValue;
	            }
	        }

	    }

	    return cookies;
	}


	// Helpers

	function isString(o) {
	    return typeof o === 'string';
	}

	function isNonEmptyString(s) {
	    return isString(s) && s !== '';
	}

	function validateCookieName(name) {
	    if (!isNonEmptyString(name)) {
	        throw new TypeError('Cookie name must be a non-empty string');
	    }
	}

	function same(s) {
	    return s;
	}


/***/ }

});