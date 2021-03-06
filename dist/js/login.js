/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "http://10.10.112.5:3000/dist/js/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	
	var TIP_UNAME_NULL = '请输入用户名',
		TIP_UNAME_ERROR = '用户名以英文字母开头，4-20个字母或数字、下划线，不能用中文',
		TIP_PASSWORD_NULL = '请输入登录密码',
		TIP_PASSWORD_ERROR = '密码由6-20个字母(区分大小写)或数字组成';

	var unameInput = $('#uname'),
		upasswordInput = $('#upassword'),
		failedEl = $('#J_failed'),
		form = $('#J_login_form');

	var login = {
		init: function(){
			this.bindEvent();
			PPG.placeholder('#J_login_form', {
				styles: {
					left: 50,
					top: 13				
				}
			});
		},
		bindEvent: function(){

			form.on('submit', function(){
				var errors = [];

				['username', 'password'].forEach(function(item){
					login.validate(item, function(result){
						if(result.error){
							errors.push(result.error);
						}
					}, true);
				});

				// console.log(errors)

				if(errors.length){
					login.showFailed(errors.join(' / '));
					return false;
				}

			});	

			form.find('input.ui-input').on('focus blur', function(e){
				
				var id = this.id,
					target = $(e.target),
					formItem = target.closest('.ui-form-item', form);

				if(e.type === 'focus'){
					formItem.addClass('ui-form-item-focus');
				}else{

					if($.trim(target.val()) !== ''){
						formItem.removeClass('ui-form-item-error');
						login.hideFailed();
					}

					formItem.removeClass('ui-form-item-focus');
				}
			});
		},
		showFailed: function(message){
			failedEl.empty().html('<i class="iconfont">&#xe62e;</i>' + message);
		},
		hideFailed: function(){
			failedEl.empty();
		},
		validate: function(type, callback, validEmpty){

			return {
				username: function(callback){
					var uname = unameInput.val(),
						item = unameInput.closest('.ui-form-item', form),
						result = {
							val: uname,
							required: true,
							error: '',
							elem: item
						};

					// 未通过的处理
					var failed = function(message){
						result.error = message;
						result.required = false;
						item.addClass('ui-form-item-error');
						login.showFailed(message);
					};

					if(validEmpty && $.trim(uname) === ''){

						failed(TIP_UNAME_NULL);

					}/*else if(!/^[a-zA-Z]\w{3,20}$/.test(uname)){

						failed(TIP_UNAME_ERROR);
					}*/

					callback && callback(result);

					return result.required;
				},
				password: function(callback){
					var password = upasswordInput.val(),
						item = upasswordInput.closest('.ui-form-item', form),
						result = {
							val: password,
							required: true,
							error: '',
							elem: item
						};

					// 未通过的处理
					var failed = function(message){
						result.error = message;
						result.required = false;
						item.addClass('ui-form-item-error');
						login.showFailed(message);
					};

					if(validEmpty && $.trim(password) === ''){

						failed(TIP_PASSWORD_NULL);

					}/*else if(!/^\w{6,20}$/.test(password)){

						failed(TIP_PASSWORD_ERROR);
					}*/

					callback && callback(result);

					return result.required;
				}
			}[type](callback);
		}
	};

	$(function(){
		login.init();	
	});



/***/ }
/******/ ]);