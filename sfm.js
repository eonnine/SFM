/**
 * ******************
 * Simple File Manager *
 * ******************
 * Develope by Eongoo 2019-03-25
 */
(function(factoryName, factory){
	if(typeof define === 'function' && define.amd !== undefined){
		define('SFM', {}, function(){
			return factory;
		});
	}
	if(typeof module === 'object' && typeof module.exports === 'object'){
		module.exports = factory;
	}else{
		window[factoryName] = factory;
	}
}('SFM', function(modules){
		'use strict'
	
		var DoublyLinkedHashMap = modules.DoublyLinkedHashMap;
		var Promise = modules.Promise;
	
    var SimpleFileManager = function (option) {
    	if( !(this instanceof SimpleFileManager) ){
    		return new SimpleFileManager(option);
    	}
		
    	this.option = option;
    	this.fileMap = new DoublyLinkedHashMap();
    	this.init(option);
    	
    	this.isIngUpload = false;
    	this.isIngDownload = false;
    	this.isIngRemove = false;
   	};
	
    SimpleFileManager.prototype.init = function (option) {
  		if(option == undefined || option.id == undefined){
  			this.throwsError('SFM: property "id" is required.');
  		}
  		
  		this.setOption(option);
  		this.createElementId(option);
  		this.createLayout();
  		this.createDefaultEventListener();
  		
  		this.setDefaultMethod();
  	};
  	
  	SimpleFileManager.prototype.config = {
  		'key': { fileIdx: 'number', fileSeq: 'number' },
  		'fix': { 
  	  	'item': 'item', 
  			'item_key_area':'item-key-area', 
  			'file_upload': 'upload-file', 
  			'file_remove': 'remove-file',
  			'file_download': 'download-file',
  			'input_file': 'input-file', 
  			'item_area': 'file-area',
  		},
  		'file': {
  			'file_size': '52428800',
  			'file_count': 0,
  		  	'file_extension': [],
  		  	'file_extension_except': [],
  	  		'file_parameter_name': 'file',
  	  		'file_list_parameter_name': 'files',
  		},
  		'message': {
  			'file_remove': '삭제하시겠습니까?',
  			'file_size_max_overflow': '허용된 크기(50mb)보다 용량이 큰 파일입니다',
  			'file_count_over': '허용된 개수를 초과합니다',
  			'file_extension': '허용된 확장자가 아닙니다.',
  			'file_extension_except': '허용된 확장자가 아닙니다.',
  			'file_upload_error': '파일 업로드 도중 에러가 발생했습니다.',
  			'file_remove_error': '파일 삭제 도중 에러가 발생했습니다.',
  			'file_download_error': '파일 다운로드 도중 에러가 발생했습니다.',
  			'file_upload_is_ing': '업로드 중입니다',
  			'file_remove_is_ing': '삭제 중입니다',
  			'file_download_is_ing': '다운로드 중입니다',
  		},
  		'layout': function (data) {
  			return '<fieldset><button id="'+data.fileUploadId+'" style="float:right; position:relative; bottom:13px;">upload</button><div id="'+data.fileAreaId+'" style="z-index:1;" width="100%" height="100%" fileDragArea><p dropzone-file-area-message></p></div></fieldset>';
  		},
  		'item': function (data) {
  			return '<span dropzone-file-row style="z-index:10;"><p>&nbsp;&nbsp;<b id="'+data.fileDownloadId+'" style="width:15px; height:15px; margin-left:5px; font-size:15px; cursor:pointer;">▼</b>&nbsp;file: <strong>' + data.file.name + '</strong>&nbsp;&nbsp;&nbsp;type: <strong>' + data.file.type + '</strong>&nbsp;&nbsp;&nbsp;size: <strong>' + data.file.size + '</strong>bytes<data style="display:none;"></data><b style="width:10px; height:10px; margin-left:5px; font-size:10px; cursor:pointer;" id="'+data.fileRemoveId+'">X</b></p></span>';
  		},
  		'url': {
  			'file_get_list': '',
  			'file_upload': '',
  			'file_remove': '',
  			'file_download': '',
  		},
  		'event': {
  			'file_upload': 'click',
  			'file_remove': 'click',
  			'file_download': 'click',
  		},
  		'eventHandler': {
  			'layout_create_after': function (data) {
  				
  				/*
  				 * config에 설정된 레이아웃이 그려진 후 기본 이벤트리스너 등록
  				 */
  				var FileMouseHover = function (e) {
  					e.stopPropagation();
  					e.preventDefault();
  					e.target.className = ( e.type == 'mouseover' || e.type == 'mouseenter' ) ? 'mhover' : '';
  				}
  						
  				var FileDragHover = function (e) {
  					e.stopPropagation();
  					e.preventDefault();
  					e.target.className = ( e.type == 'dragover' || e.type == 'dragenter' ) ? 'hover' : '';
  				}
  				
  				var fileArea = data.fileArea;
  				fileArea.addEventListener('mouseover', FileMouseHover, false);
  				fileArea.addEventListener('mouseenter', FileMouseHover, false);
  				fileArea.addEventListener('mouseleave', FileMouseHover, false);
  				fileArea.addEventListener('dragover', FileDragHover, false);
  				fileArea.addEventListener('dragenter', FileDragHover, false);
  				fileArea.addEventListener('dragleave', FileDragHover, false);
  			},
  			'file_upload_before': function (data) {
  				console.log('uploadStart');
  			},
  			'file_upload_after': function (data) {
  				console.log('uploadEnd');
  			},
  			'file_remove_before': function (data) {
  				console.log('removeStart');
  			},
  			'file_remove_after': function (data) {
  				console.log('removeEnd');
  			},
  			'file_download_before': function () {
  				console.log('downloadStart');
  			},
  			'file_download_after': function (data) {
  				console.log('downloadEnd');
  			}	
  		}
		};
  	
  	SimpleFileManager.prototype.setConfig = function (option) {
 			this.initConfig( option, [] );
		};
		
		SimpleFileManager.prototype.setOption = function (option) {
			/**
			 * 옵션값으로 환경설정을 변경할 때 제외할 속성.
			 */
			var exceptProps = ['eventHandler', 'fix', 'key']
			this.initConfig( option, exceptProps );
			
			/*
			 * 옵션값 적용 후에는 옵션변경 불가
			 */
			Object.freeze(this.option);
		};
		
		SimpleFileManager.prototype.initConfig = function (option, exceptProps, target) {
			target = ( target == undefined ) ? this.getConfig() : target;
			
			for(var key in option){
				if(exceptProps.indexOf(key) !== -1){
					continue;
				}
				
				if(typeof target[key] === 'object' 
					&& target[key] != null
					&& target[key].constructor.name == 'Object'){
						
					this.initConfig(option[key], exceptProps, target[key]);
				} 
				else{
					target[key] = option[key];
				}
			}
		};
			
		SimpleFileManager.prototype.addCustomEventListener = function (element, type, listener, args) {
			var _this = this;
			element.addEventListener(type, function (e) {
				_this.preventEvent(e);

				var paramArray = [];

				paramArray.push(e);
					
				if(Array.isArray(args)){
					for(var i in args){
						paramArray.push(args[i]);
					}
				}
				else{
					paramArray.push(args);
				}
					
				listener.apply(_this, paramArray);
					
			}, false);
				
			return _this;
		};
		
		SimpleFileManager.prototype.addFile = function (files) {
			for(var i=0, f; f=files[f]; i++){
				if(f.name == undefined){
					this.throwsError('SFM : not exists attribute "name" in file object', f);
				}
				this.addFileToFileMap(f, false);
				this.addItem(f);
			};
		};
		
		SimpleFileManager.prototype.addNewFile = function (e) {
			var files = e.target.files || e.dataTransfer.files;
				
			for(var i=0, f; f=files[i]; i++){
				
				if(!this.fileValidator(f)){
					return;
				}

				var key = this.makeItemKey(f.name);
				var newFile = this.createNewFile(f, key);
						
				this.addFileToFileMap(newFile, true);
				this.addItem(newFile);
			};
				
			e.target.value = '';
		};
		
		SimpleFileManager.prototype.addItem = function (f) {
			var fileArea = this.getElement(this.elementId.fileArea);
			var itemId = this.addSeparator(this.elementId.item, f.name);
			var fileUploadId = this.elementId.fileUpload;
			var fileRemoveId = this.addSeparator(this.elementId.fileRemove, f.name);
			var fileDownloadId = this.addSeparator(this.elementId.fileDownload, f.name);
			var itemkeyAreaHtml = '';
			var itemHtml = this.getConfig('item')({
				file: f,
				itemId: itemId,
				fileUploadId: fileUploadId,
				fileRemoveId: fileRemoveId,
				fileDownloadId: fileDownloadId,
			});
					
			var keys = Object.keys(this.getConfig('key'));
			
			for(var i=0, key; key=keys[i]; i++){
				if(i == 0){
					itemkeyAreaHtml = '<span '+this.elementId.itemKeyArea+'>';
				}
					
				var value = ( f[key] != undefined ) ? f[key] : '';
					
				itemkeyAreaHtml += '<input type="hidden" id="' + key + '" value="' + value + '"/>';

				if(i == (keys.length - 1)){
					itemkeyAreaHtml += '</span>';
				}
			}
					
			itemHtml = '<span id="'+itemId+'">'+itemHtml+itemkeyAreaHtml+'</span>';
				
			fileArea.insertAdjacentHTML('beforeend', itemHtml);

			var fileRemoveElement = this.getElement(fileRemoveId);
			var fileDownloadElement = this.getElement(fileDownloadId);
			
			if(fileRemoveElement != null){
				this.addCustomEventListener(fileRemoveElement, this.getConfig('event', 'file_remove'), this.removeFile, [itemId, f]);
			}
					
			if(fileDownloadElement != null){
				this.addCustomEventListener(fileDownloadElement, this.getConfig('event', 'file_download'), this.downloadFile, [itemId, f]);
			}
			
		};
		
		
		/*addDataToFile: function (f) {
			return f;
		},*/
		SimpleFileManager.prototype.addFileToFileMap = function (f, isNewFile) {
			f.newFile = isNewFile;
			f.isNewFile = isNewFile
			this.fileMap.put(f.name, f);
		};
		
		SimpleFileManager.prototype.addSeparator = function () {
			var len = arguments.length;
			var result = '';
			
			for(var i=0; i<len; i++){
				result += arguments[i] + '-';
			}
			
			return result.slice(0, -1);
		};
		
		SimpleFileManager.prototype.ajax = {
			get: function (url, formData, success, error) {
				this.xhr({ method: 'GET', formData: formData, url: url, success: success, error: error });
			},
			post: function (url, formData, success, error) {
				this.xhr({ method: 'POST', formData: formData, url: url, success: success, error: error });
			},
			xhr: function (args) {
				var xhr = ( window.XMLHttpRequest ) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
				var props = {
						method: args.method || 'GET',
						url: args.url || '',
						formData: args.formData || null,
						async: args.async || true,
						success: args.success || function () {},
						error: args.error || function () {},
					};
								       
				xhr.onload = function (data) {
					if (this.readyState == 4 && this.status == 200)
						props.success(data.target.response, xhr);
					else
						props.error(xhr);
				}
								    
				xhr.open(props.method.toUpperCase(), props.url, props.async);
				xhr.setRequestHeader('encType', 'multipart/form-data');
				xhr.send(props.formData);
			}
		};
		
		/**
		 * setConfig와 생성자에서 정의된 이벤트핸들러 호출 함수
		 * @param handlerName setConfig와 생성자 option에서 정의된 이벤트핸들러명
		 * @param param 이벤트핸들러로 전달될 파라미터
		 * @returns false인 경우 이벤트 후의 진행을 취소
		 */
		SimpleFileManager.prototype.callEventHandler = function (handlerName, param) {
			var option = this.option;
			var flag = true;
				
			param = ( param == undefined ) ? {} : param
			param.self = this.getElement(this.option.id)
					
			flag = this.getConfig('eventHandler')[handlerName](param);
				
			if(flag !== false && option.eventHandler != null && option.eventHandler[handlerName] != null){
				flag = option.eventHandler[handlerName](param);
			}
				
			return ( flag === false ) ? false : true
		};
		
		SimpleFileManager.prototype.createDefaultEventListener = function () {
			var fileArea = this.getElement(this.elementId.fileArea);
		  var fileInputElement = this.getElement(this.elementId.fileInputElement);
			    	
		  //openInputFile 이벤트때 영역만 체크
			this
			.addCustomEventListener(fileArea.parentNode, 'click', this.openInputFile)
			.addCustomEventListener(fileArea, 'drop', this.addNewFile)
			.addCustomEventListener(fileArea, 'change', this.addNewFile)
 			.addCustomEventListener(fileArea, 'mouseover', this.preventEvent)
 			.addCustomEventListener(fileArea, 'mouseenter', this.preventEvent)
			.addCustomEventListener(fileArea, 'dragover', this.preventEvent)
			.addCustomEventListener(fileArea, 'mouseenter', this.preventEvent)
			.addCustomEventListener(fileInputElement, 'change', this.addNewFile);
		};
		
		SimpleFileManager.prototype.getParamName = function (isParamTypeList, isParamTypeFile, index, name) {
			var fileListParamName = this.getConfig('file', 'file_list_parameter_name') + '[' + index +  '].';
			var fileParamName = this.getConfig('file', 'file_parameter_name');
			
			if(isParamTypeList){
				return ( isParamTypeFile ) ? fileListParamName + fileParamName : fileListParamName + name;
			}
			else {
				return ( isParamTypeFile ) ? fileParamName : name;
				
			}
		};
		
		/**
		 * request시에 파라미터로 보낼 formData를 세팅
		 * @param formData 파라미터용 formData
		 * @param file 파라미터로 보낼 파일
		 * @param isParamTypeList 파라미터가 List인지 여부
		 * @param index 파라미터가 List형식일 때 현재 index
		 */
		SimpleFileManager.prototype.setParamFormData = function (formData, file, isParamTypeList, index) {
			var keys = this.getConfig('key');
			var itemId = this.addSeparator(this.elementId.item, file.name);
			var keyAreaElementNodes = this.getElement(itemId).querySelector('[' + this.elementId.itemKeyArea + ']').childNodes;
			
			//파일 키값 세팅
			for(var i=0, el; el=keyAreaElementNodes[i]; i++){
				if(keys.hasOwnProperty(el.id)){
					formData.append(
						this.getParamName(isParamTypeList, false, index, el.id),
						( keys[el.id].toUpperCase() === 'NUMBER' ) ? Number(el.value) : String(el.value)
					);
				}
			};
								 
			//파일 세팅
			formData.append(
				this.getParamName(isParamTypeList, true, index),
				file
			);
		};
		
		/**
		 * 단일 파일의 파라미터 만들기
		 */
		SimpleFileManager.prototype.createParamFile = function (file) {
			var formData = new FormData();
			this.setParamFormData(formData, file, false);
			return formData;
		};
		
		/**
		 * 여러 파일의 파라미터 만들기
		 */
		SimpleFileManager.prototype.createParamFiles = function () {
			var formData = new FormData();
			var files = this.fileMap.array();
			
			for(var i=0, file; file=files[i]; i++){
				this.setParamFormData(formData, file, true, i);
			}
			
			return formData;
		};
		
		SimpleFileManager.prototype.createLayout = function () {
			var self = this.getElement(this.option.id);
			var fileAreaId = this.elementId.fileArea;
			var fileUploadId = this.elementId.fileUpload;
			
			self.innerHTML = this.getConfig('layout')({ 
				fileAreaId: fileAreaId,
				fileUploadId: fileUploadId,
			});
				
			self.insertAdjacentHTML('afterbegin', '<input type="file" id="' + this.elementId.fileInputElement + '" multiple="multiple" style="display:none;"/>');
				
			var fileArea = this.getElement(fileAreaId);
			var fileUploadElement = this.getElement(fileUploadId);
				
			if(fileUploadElement != null){
				this.addCustomEventListener(fileUploadElement, this.getConfig('event', 'file_upload'), this.uploadFile);
			}
					
			this.callEventHandler('layout_create_after', { fileArea: fileArea, fileUploadElement: fileUploadElement });
				
		};
		
		/*
		 * 파일객체를 Blob객체로 새로이 생성 (파일 객체의 name속성은 불변 속성이므로 변경하기 위함)
		 */ 
		SimpleFileManager.prototype.createNewFile = function (f, key) {
			var blob = new Blob([f], { type: f.type });

			blob.name = key;
			blob.lastModified = f.lastModified || 0;
			blob.lastModifiedDate = f.lastModifiedDate || 0;
			
			return blob;
		};
		
		//SFM가 생성될 때 내부적으로 사용할 id값 생성
		SimpleFileManager.prototype.createElementId = function (option) {
			this.elementId = {};
			
			var getId = function(str, str2){
				return this.addSeparator(this.option.id, this.getConfig(str, str2));
			}.bind(this);
			
			this.elementId.item = getId('fix', 'item');
			this.elementId.fileArea = getId('fix', 'item_area');
			this.elementId.fileUpload = getId('fix','file_upload');
			this.elementId.fileRemove = getId('fix','file_remove');
			this.elementId.itemKeyArea = getId('fix','item_key_area');
			this.elementId.fileDownload = getId('fix','file_download');
			this.elementId.fileInputElement = getId('fix','input_file');
				
			//내부 id값은 임의로 변경할 수 없음
			Object.freeze(this.elementId);
			
		};
		
		SimpleFileManager.prototype.downloadFile = function (e, itemId, f) {
			var _this = this;
			
			_this.isIngDownload = true;
			
			var promise = new Promise();
			var item = _this.getElement(itemId);
			var downloadUrl = _this.getConfig('url', 'file_download');
				
			promise
			.then(function (resolve) {
				resolve(_this.callEventHandler('file_download_before'));
			})
			.then(function (resolve) {
				if(downloadUrl != null && _this.trim(downloadUrl) !== ''){
					try{
						location.href = downloadUrl;
						resolve();
					} catch(error) {
						_this.throwsError('SFM: fail download file:', downloadUrl);
						alert(_this.getConfig('message', 'file_download_error'));
					}
				}
			})
			.then(function () {
				_this.callEventHandler('file_download_after');
				_this.isIngDownload = false;
			});
			
		};
		
		//새 파일을 추가할 때 파일의 유효성 검사
		SimpleFileManager.prototype.fileValidator = function (f) {
			var k = f.name;
			var extension = k.substring( k.lastIndexOf('.')+1, k.length );
			var permitExtensions = this.getConfig('file', 'file_extension');
			var exceptExtensions = this.getConfig('file', 'file_extension_except');
			var fileCount = this.getConfig('file', 'file_count');
			
			//추가할 파일의 크기와 파일사이즈 속성값 비교
			if( f.size > this.getConfig('file', 'file_size') ){
				alert(this.getConfig('message', 'file_size_max_overflow'));
				return false;
			}
			
			//등록된 파일이 설정한 파일 개수보다 많은지 유효성 검증, 설정 개수가 0 이면 등록 개수 제한 없음
			if( fileCount != 0 && fileCount < this.fileMap.size() ){
				alert(this.getConfig('message', 'file_count_over'));
				return false;
			}
			
			//허용된 확장자가 아닌지 체크
			for(var i=0, permitExtension; permitExtension=permitExtensions[i]; i++){
				if(extension != permitExtension){
					alert(this.getConfig('message', 'file_extension'));
					return false;
				}
			}
			
			//제외 확장자에 포함되는지 체크
			for(var i=0, exceptExtension; exceptExtension=exceptExtensions[i]; i++){
				if(extension == exceptExtension){
					alert(this.getConfig('message', 'file_extension_except'));
					return false;
				}
			}
			
			return true;
		};
		
		
		/**
		 * config 객체의 속성을 반환하는 함수, config 속성의 접근을 한 곳에서 관리하기 위함
		 * @param ex) message의 file_remove속성을 가져올 때는 getConfig('message', 'file_remove') 와 같이 호출.
		 * @returns 인자로 넘긴 경로의 속성값
		 */
		SimpleFileManager.prototype.getConfig = function () {
			var size = arguments.length;
			var prop = this.config;
			
			if(size == 0){
				return prop;
			}
			
			for(var i=0, arg; arg=arguments[i]; i++){
				if(prop[arg] != null) prop = prop[arg];
			}
			
			return prop;
		};
		
		SimpleFileManager.prototype.getElement = function (id) {
			return document.getElementById(id);
		};
		
		SimpleFileManager.prototype.getFiles = function (data) {
			var fileGetListUrl = this.getConfig('url', 'file_get_list'); 
			var _this = this;
			_this.ajax.get(fileGetListUrl, data, function (files) {
				_this.addFile(files);
			});
		};
		
		SimpleFileManager.prototype.getNewFiles = function (data) {
			var newFiles = [];
			this.fileMap.each(function (i, item) {
				newFiles.push(item.value);
			});
			return newFiles;
		};
		
		//동일한 파일명이 존재할 때 (2), (3), (4).....를 붙임
		SimpleFileManager.prototype.makeItemKey = function (k) {
			var suffix = 1;
			var key = k;
			var name = null;
			var extension = null;
					
			while (this.fileMap.isContainsKey(key)) {
				suffix++;
				extension = k.substring( k.lastIndexOf('.'), k.length );
				name = k.substring( 0, k.lastIndexOf('.') );
				key = name + '(' + suffix + ')' + extension;
			}
			
			return key;
		};
		
		SimpleFileManager.prototype.openInputFile = function (e) {
			var fileInputElement = this.getElement(this.elementId.fileInputElement);
			
			fileInputElement.click();
		};
		
		SimpleFileManager.prototype.preventEvent = function (e) {
			e.stopPropagation();
			e.preventDefault();
		};
		
		SimpleFileManager.prototype.removeFile = function (e, itemId, f) {
			var _this = this;
			
			if(_this.isIngRemove ){
    		alert(_this.getConfig('message', 'file_remove_is_ing'));
				return false;
			}
			_this.isIngRemove  = true;	
			
			if( !confirm(_this.getConfig('message', 'file_remove')) ){
				return;
			}
			
			var promise = new Promise();
			var key = f.name;
			var item = _this.getElement(itemId);
			var formData = _this.createParamFile(f);
			var fileRemoveUrl = _this.getConfig('url', 'file_remove');
			
			promise
			.then(function (resolve) {
				resolve(_this.callEventHandler('file_remove_before', { key: key, file: f, item: item }));
			})
			.then(function (resolve) {
				if(fileRemoveUrl == null || _this.trim(fileRemoveUrl) === ''){
					fileRemoveUrl = location.href;
				}
				
				_this.ajax.post(fileRemoveUrl, formData, function (res) {
					resolve(res);
				}.bind(_this), function () {
					_this.throwsError('SFM: fail remove file:', fileRemoveUrl);
					alert(_this.getConfig('message', 'file_remove_error'));
				}.bind(_this));
			})
			.then(function (_, res) {
				_this.removeCustomEventListener(f);
				_this.fileMap.remove(key);
				item.parentNode.removeChild(item);
				
				_this.callEventHandler('file_remove_after', {
					key: key,
					response: res,
					removedFile: f,
					removedItem: item,
				});
				
				_this.isIngRemove  = false;
			});
			
		};
		
		SimpleFileManager.prototype.removeCustomEventListener = function (f) {
			var fileRemoveId = this.addSeparator(this.elementId.fileRemove, f.name);
			var fileDownloadId = this.addSeparator(this.elementId.fileDownload, f.name);
			var fileRemoveElement = this.getElement(fileRemoveId);
			var fileDownloadElement = this.getElement(fileDownloadId);

			if(fileRemoveElement != null){
				fileRemoveElement.removeEventListener(this.getConfig('event', 'file_remove'), this.removeFile);
			}
					
			if(fileDownloadElement != null){
				fileDownloadElement.removeEventListener(this.getConfig('event', 'file_download'), this.downloadFile);
			}
		};
		
		SimpleFileManager.prototype.setDefaultMethod = function () {
			this['uploadFile'] = this.uploadFile;
			this['getFiles'] = this.getFiles;
			this['getNewFiles'] = this.getNewFiles;
		};
		
		SimpleFileManager.prototype.throwsError = function (msg, object) {
			console.error(msg, object);
		};
		
		SimpleFileManager.prototype.trim = function (str) {
			return str.replace(/\s/gi, '');
		};
		
		SimpleFileManager.prototype.uploadFile = function () {
			var _this = this;
			
			if(_this.isIngUpload){
  			alert(_this.getConfig('message', 'file_upload_is_ing'));
				return false;
			}
			_this.isIngUpload = true;
			
			var promise = new Promise();
			var formData = _this.createParamFiles();
			var fileUploadUrl = _this.getConfig('url', 'file_upload');
		
			promise
			.then(function (resolve) {
				resolve(_this.callEventHandler('file_upload_before'));
			})
			.then(function (resolve) {
				if(fileUploadUrl == null || _this.trim(fileUploadUrl) === ''){
					fileUploadUrl = location.href;
				}
				
				_this.ajax.post(fileUploadUrl, formData, function (res) {

					resolve(res);
					
				}.bind(_this), function(){
					_this.throwsError('SFM: fail upload:', fileUploadUrl);
					alert(_this.getConfig('message', 'file_upload_error'));
				}.bind(_this));
				
			})
			.then(function (_, res) {
				_this.callEventHandler('file_upload_after', { response: res });
				_this.isIngUpload = false;
			});
			
		};
	
		return SimpleFileManager;
	
}(function () {
		
		//양방향 링크드리스트
		var DoublyLinkedHashMap = function () {
			this.head = null;
			this.tail = null;
			this.map = {};
			this.length = 0;
		};
	
		DoublyLinkedHashMap.prototype.clear = function () {
			this.head = null;
			this.tail = null;
			this.map = {};
			this.length = 0;
		};
		
		DoublyLinkedHashMap.prototype.get = function (k) {
			var item = this.map[k] || {};
			return item.value;
		};
		
		
		DoublyLinkedHashMap.prototype.	size = function () {
			return this.map.length;
		};
		
		/**
		 * index에 해당하는 값을 리턴
		 */
		DoublyLinkedHashMap.prototype.	getByIndex = function (index) {
			var item = this.getItemByIndex(index);
			return item.value;
		};
				
		/**
		 * key에 해당하는 인덱스를 리턴
		 */ 
		DoublyLinkedHashMap.prototype.getIndexByKey = function (k) {
			var item = this.getItemByKey(k);
			return item.index;
		};
		
		/**
		 * key에 해당하는 데이터를 리턴
		 * @data index, key, value
		 */
		DoublyLinkedHashMap.prototype.getItemByKey = function (k) {
			var result = null;
			
			this.each(function (i, item) {
				if(k == item.key){
					result = { 
						index: i, 
						key: item.key, 
						value: item.value, 
					};
					return false;
				}
			});
						
			return result;
		};
		
		/**
			 * index에 해당하는 데이터를 리턴
			 * @data index, key, value
			 */
		DoublyLinkedHashMap.prototype.	getItemByIndex = function (index) {
			var result = null;
			
			this.each(function (i, item) {
				if(index == i){
					result = { 
						index: i, 
						key: item.key, 
						value: item.value 
					};
					return false;
				}
			});
			
			return result
		};
		
	
		/**
		 * Map에 key를 가진 데이터가 있는지 여부 확인
		 * @return boolean 
		 */
		DoublyLinkedHashMap.prototype.isContainsKey = function (k) {
			return ( this.map[k] != null ) ? true : false;
		};
		
		
		/**
		 * Map에 데이터 삽입
		 */
		DoublyLinkedHashMap.prototype.	put = function (k, v) {
			this.remove(k);
	
			var item = {
				key: k,
				value: v,
				prev: this.tail,
				next: null,
			};
	
			this.map[k] = item;
			
			if(this.length == 0)
				this.head = item;
		
			if(this.tail)
				this.tail.next = item;
		
			this.tail = item;
			
			this.length += 1;
		};
		
	
		/**
		 * key에 해당하는 데이터를 삭제
		 */
		DoublyLinkedHashMap.prototype.	remove = function (k) {
			if(this.map[k] == null){
				return;
			}
	
			var item = this.map[k];
			
			if(this.head === item){
				if(item.next != null){
					item.next.prev = null;
				}
			
				this.head = item.next;
			}
			
			if(this.tail === item){
				if(item.prev != null){
					item.prev.next = null;
				}
			
				this.tail = item.prev;
			}
			
			if(item.next != null){
				item.next.prev = item.prev;
			}
		
			if(item.prev != null){
				item.prev.next = item.next;
			}
			
			delete this.map[k];
			
			this.length -= 1;
		};
		
		
		/**
		 * Map을 삽입한 순서대로 반복 실행
		 * @callBackParam index, data
		 */
		DoublyLinkedHashMap.prototype.each = function (callBack) {
			var 
				 i = 0
				,len = this.length
				,item = this.head
				,param = null;
				
			while( i < len ){
				
				param = {
					key: item.key,
					value: item.value,
				};
				
				callBack(i, param);
				
				item = item.next;
				
				i++;
				
			}
		};
			
		/**
		 * Map을 삽입한 역순으로 반복 실행
		 * @callBackParam index, data
		 */
		DoublyLinkedHashMap.prototype.eachRvs = function (callBack) {
			var 
				 i = this.length
				,item = this.tail
				,param = null;
				
			while( i > 0 ){
				
				param = {
						key: item.key,
						value: item.value,
				};
				
				callBack(i, param);
				
				item = item.prev;
				
				i--;
				
			}
		};
		
	
		/**
		 * Map을 삽입한 순서의 array로 변환하여 리턴
		 */
		DoublyLinkedHashMap.prototype.array = function(){
			var array = [];
			
			this.each(function (i, item) {
				array.push(item.value);
			});
			
			return array;
		};
		
		/**
		 * Map을 삽입한 역순의 array로 변환하여 리턴
		 */
		DoublyLinkedHashMap.prototype.	arrayRvs = function(){
			var array = [];
			
			this.reverseEach(function (i, item) {
				array.push(item.value);
			});
			
			return array;
		};
		
		var Promise = function () {
			this.queue = [];
			this.isIng = false;
		};
		
		Promise.prototype.run = function (data) {
			if( this.queue.length > 0 && !this.isIng ){
				this.isIng = true;
				this.queue.shift()(this.createProgress(), data);
			}
		};
		
		Promise.prototype.then = function (fun) {
			this.queue.push(fun);
			this.run();
			return this;
		};
		
		Promise.prototype.stop = function () {
			this.queue = [];
			this.isIng = true;
		};
		
		Promise.prototype.createProgress = function () {
			return function resolve (data) {
				this.isIng = false;
				if(data === false){
					this.stop();
				} else {
					this.run(data);
				}
			}.bind(this);
		};
		
		return {
			DoublyLinkedHashMap: DoublyLinkedHashMap,
			Promise: Promise
		};
		
}())));