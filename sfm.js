/**
 * ******************
 * Simple File Manager *
 * ******************
 * Developed by Eg 2019-03-25
 */
(function (factory) {
	if(typeof define === 'function' && define.amd ){
		define(function(){
			return factory;
		});
	} else
	if(typeof module === 'object' && typeof module.exports === 'object'){
		module.exports = factory;
	} else {
		for(var key in factory){
			this[key] = factory[key];
		}
	}
}((function (DoublyLinkedHashMap, Promise) { 'use strict'
	
	var __hasProp = Object.prototype.hasOwnProperty;
	
	var SimpleFileManager = function (option) {
  	if( !(this instanceof SimpleFileManager) ){
  		throw new SyntaxError('[SFM] "new" constructor operator is required');
  	}
  	this.requiredValidator(option);
  	/**
  	 * 파일 데이터가 이 곳에 저장됩니다.
  	 */
  	this.fileMap = new DoublyLinkedHashMap();
  	/**
  	 * 다중 이벤트 방지 플래그 변수
  	 * upload, download, remove가 진행되고 있을 때 연달아 시작되지 않도록 제어합니다. 
  	 */
  	this.isIngUpload = false;
  	this.isIngDownload = false;
  	this.isIngRemove = false;
  	this.option = option;
  	/**
  	 * SFM 객체가 반환할 객체
  	 */
  	this.callee = {};
  	
  	this.init(option);
  	
  	return this.callee;
	}
	
	/**
	 * SFM 생성 시 필수값 체크
	 */
	SimpleFileManager.prototype.requiredValidator = function (option) {
		if(option == null || !__hasProp.call(option, 'id') ){
			throw new SyntaxError('[SFM] constructor property "id" is required');
		}
	}
	
	/**
	 * SFM 공유 속성
	 * setConfig 함수를 이용하여 초기 설정이 가능합니다.
	 * SFM 객체를 생성할 때 생성자 옵션을 이용하여 객체 별로 따로 적용도 가능합니다.
	 */
 	SimpleFileManager.prototype.config = {
		key: { fileIdx: 'number', fileSeq: 'string' }, 
		fix: { 
	  	item: 'item', 
			item_key_area:'item-key-area', 
			file_upload: 'upload-file', 
			file_remove: 'remove-file',
			file_download: 'download-file',
			input_file: 'input-file', 
			item_area: 'file-area',
		},
		file: {
			file_size: '52428800',
			file_count: 0,
	  	file_extension: [],
	  	file_extension_except: [],
  		file_parameter_name: 'file',
  		file_list_parameter_name: 'files',
		},
		message: {
			file_remove: '삭제하시겠습니까?',
			file_already_exist: '동일한 이름의 파일이 이미 등록되어 있습니다',
			file_size_max_overflow: '허용된 크기(50mb)보다 용량이 큰 파일입니다',
			file_count_over: '허용된 개수를 초과합니다',
			file_extension: '허용된 확장자가 아닙니다.',
			file_extension_except: '허용된 확장자가 아닙니다.',
			file_get_error: '파일 목록을 불러오는 도중 에러가 발생했습니다.',
			file_upload_error: '파일 업로드 도중 에러가 발생했습니다.',
			file_remove_error: '파일 삭제 도중 에러가 발생했습니다.',
			file_download_error: '파일 다운로드 도중 에러가 발생했습니다.',
			file_upload_is_ing: '업로드 중입니다',
			file_remove_is_ing: '삭제 중입니다',
			file_download_is_ing: '다운로드 중입니다',
		},
		layout: function (fileAreaId, fileUploadId) {
			return '<fieldset><button id="'+fileUploadId+'" style="float:right; position:relative; bottom:13px;">upload</button><div id="'+fileAreaId+'" style="z-index:1;" width="100%" height="100%" default-class-dropzone><p dropzone-file-area-message></p></div></fieldset>';
		},
		item: function (file, fileRemoveId, fileDownloadId) {
			return '<span style="z-index:10;"><p>&nbsp;&nbsp;<b id="'+fileDownloadId+'" style="width:12px; height:12px; margin-left:5px; font-size:12px; cursor:pointer;">▼</b>&nbsp;file: <strong>' + file.name + '</strong>&nbsp;&nbsp;&nbsp;type: <strong>' + file.type + '</strong>&nbsp;&nbsp;&nbsp;size: <strong>' + file.size + '</strong>bytes<data style="display:none;"></data><b style="width:12px; height:12px; margin-left:5px; font-size:12px; cursor:pointer;" id="'+fileRemoveId+'">X</b></p></span>';
		},
		url: {
			file_get_list: '',
			file_upload: '',
			file_remove: '',
			file_download: '',
		},
		event: {
			file_upload: 'click',
			file_remove: 'click',
			file_download: 'click',
		},
		eventHandler: {
			layout_create_after: function (param) {
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
				
				var fileArea = param.fileArea;
				fileArea.addEventListener('mouseover', FileMouseHover, false);
				fileArea.addEventListener('mouseenter', FileMouseHover, false);
				fileArea.addEventListener('mouseleave', FileMouseHover, false);
				fileArea.addEventListener('dragover', FileDragHover, false);
				fileArea.addEventListener('dragenter', FileDragHover, false);
				fileArea.addEventListener('dragleave', FileDragHover, false);
			},
			file_upload_before: function (data) {
				console.log('uploadStart');
			},
			file_upload_after: function (data) {
				console.log('uploadEnd');
			},
			file_remove_before: function (param) {
				console.log('removeStart');
			},
			file_remove_after: function (data) {
				console.log('removeEnd');
			},
			file_download_before: function () {
				console.log('downloadStart');
			},
			file_download_after: function (data) {
				console.log('downloadEnd');
			}	
		}
	}
	
	/**
	 * config 객체의 속성을 반환하는 함수, config 속성의 접근을 한 곳에서 관리하기 위함
	 * @param ex) message의 file_remove속성을 가져올 때는 getConfig('message', 'file_remove') 와 같이 호출.
	 * @returns 인자로 넘긴 경로의 속성값
	 */
	SimpleFileManager.prototype.getConfig = function () {
		var prop = this.searchProp(this.option, arguments);
		if( prop === null ){
			prop = this.searchProp(this.config, arguments);
		}
		return prop;
	}
	
	SimpleFileManager.prototype.searchProp = function (prop, args) {
		var i, arg;
		for(var i=0, arg; arg=args[i]; i++){
			if( __hasProp.call(prop, arg) ){
				prop = prop[arg];
			} else {
				return null;
			}
		}
		return prop;
	}
 	
 	/**
 	 * SFM 공유 속성을 임의로 지정할 수 있는 함수
 	 */
	SimpleFileManager.prototype.setConfig = function (props) {
			this.initConfig( props );
	}
	
	/**
	 * props로 받은 값들로 SFM config 속성들을 수정
	 */
	SimpleFileManager.prototype.initConfig = function (props, target) {
		target = ( target ) ? target : this.config;
		
		for(var key in props){
			if( key === 'fix' ){
				continue;
			}
			if(typeof target[key] === 'object' && __hasProp.call(target, key) && target[key].constructor.name == 'Object'){
				this.initConfig(props[key], target[key]);
			} 
			else{
				target[key] = props[key];
			}
		}
	}
 	
	SimpleFileManager.prototype.getElement = function (id) {
		return document.getElementById(id);
	}
	
	/**
	 * SFM가 생성될 때 내부적으로 사용할 id값 생성
	 */
	SimpleFileManager.prototype.makeElementId = function (option) {
		this.elementId = {};
		this.elementId.item = this.makeConfigId('fix', 'item');
		this.elementId.fileArea = this.makeConfigId('fix', 'item_area');
		this.elementId.fileUpload = this.makeConfigId('fix','file_upload');
		this.elementId.fileRemove = this.makeConfigId('fix','file_remove');
		this.elementId.itemKeyArea = this.makeConfigId('fix','item_key_area');
		this.elementId.fileDownload = this.makeConfigId('fix','file_download');
		this.elementId.fileInputElement = this.makeConfigId('fix','input_file');
	}
	
	SimpleFileManager.prototype.makeConfigId = function () {
		return this.addSeparator(this.option.id, this.getConfig.apply(this, arguments));
	}
	
	SimpleFileManager.prototype.addSeparator = function () {
		var i, len = arguments.length;
		var result = '';
		for(i=0; i<len; i++){
			result += arguments[i] + '-';
		}
		return result.slice(0, -1);
	}
	
	/**
	 * SFM 객체 생성 시 반환할 객체를 설정합니다.
	 */
	SimpleFileManager.prototype.makeCallee = function () {
		this.callee.getFilesFromUrl = this.getFilesFromUrl.bind(this);
		this.callee.uploadFile = this.uploadFile.bind(this);
		this.callee.getNewFiles = this.getNewFiles.bind(this);
		this.callee.getFileToFormData = this.getFileToFormData.bind(this);
		this.callee.getNewFileToFormData = this.getNewFileToFormData.bind(this);
	}

	/*
	 * 생성된 이후의 SFM 객체의 속성이나 옵션은 변경 불가능하도록 설정합니다.
	 */
	SimpleFileManager.prototype.freezeProperty = function () {
		Object.freeze(this.callee);
		Object.defineProperties(this, {
			'fileMap': { configurable: false, writable: false },
			'isIngUpload': { configurable: false },
			'isIngDownload': { configurable: false },
			'isIngRemove': { configurable: false },
		});
	}
	
	/**
	 * SFM 객체 초기화
	 */
	SimpleFileManager.prototype.init = function (option) {
		this.makeElementId(); // SFM 객체에서 사용할 요소 ID 초기화
		this.createLayout(); // config.layout에 정의된 레이아웃을 렌더링합니다.
		this.createDefaultEventListener(); // SFM 기본 이벤트 설정 (드래그 앤 드랍)
		this.makeCallee(); // SFM 객체가 반환해줄 변수 초기화
		this.freezeProperty();
	}
	
	SimpleFileManager.prototype.createLayout = function () {
		var fileAreaId = this.elementId.fileArea;
		var fileUploadId = this.elementId.fileUpload;
		var 	self = this.getElement(this.option.id);
		
		self.innerHTML = this.getConfig('layout')(fileAreaId, fileUploadId);
		self.insertAdjacentHTML('afterbegin', '<input type="file" id="' + this.elementId.fileInputElement + '" multiple="multiple" style="display:none;"/>');
		
		var fileArea = this.getElement(fileAreaId);
		var fileUploadElement = this.getElement(fileUploadId);
		
		if(fileUploadElement != null){
			// config.layout함수에서 fileUploadId가 부여된 요소가 있다면 해당 요소에 uploadFile 이벤트 리스너를 선언합니다.
			this.addCustomEvent(fileUploadElement, this.getConfig('event', 'file_upload'), this.uploadFile.bind(this));
		}
		this.callConfigEventHandler('layout_create_after', { fileArea: fileArea, fileUploadElement: fileUploadElement });
	}
	
	/*
	 *	SFM 기본 이벤트 설정 (드래그 앤 드랍) 
	 */
	SimpleFileManager.prototype.createDefaultEventListener = function () {
		var fileArea = this.getElement(this.elementId.fileArea);
	  var fileInputElement = this.getElement(this.elementId.fileInputElement);
	  //openInputFile 이벤트때 영역만 체크
		this
		.addCustomEvent(fileArea, 'click', this.openInputFile.bind(this))
		.addCustomEvent(fileArea, 'drop', this.addNewFile.bind(this))
		//.addCustomEvent(fileArea, 'change', this.addNewFile.bind(this))
		.addCustomEvent(fileArea, 'mouseover', this.preventEvent.bind(this))
		.addCustomEvent(fileArea, 'mouseenter', this.preventEvent.bind(this))
		.addCustomEvent(fileArea, 'dragover', this.preventEvent.bind(this))
		.addCustomEvent(fileArea, 'mouseenter', this.preventEvent.bind(this))
		.addCustomEvent(fileInputElement, 'change', this.addNewFile.bind(this));
	}
	
	SimpleFileManager.prototype.openInputFile = function (e) {
		this.preventEvent(e);
		this.getElement(this.elementId.fileInputElement).click();
	}
	
	SimpleFileManager.prototype.addNewFile = function (e) {
		this.preventEvent(e);
		var files = e.target.files || e.dataTransfer.files;
	
		for(var i=0, f; f=files[i]; i++){
			if( !this.addFileStopValidator(f) ){
				return;
			}
			var key = this.makeItemKey(f.name);
			var newFile = this.createNewFile(f, key);
			this.addFileToFileMap(newFile, true);
			this.addItem(newFile);
		};
		e.target.value = '';
	}
	
	//새 파일을 추가할 때 파일의 유효성 검사
	SimpleFileManager.prototype.addFileStopValidator = function (f) {
		var k = f.name;
		var extension = k.substring( k.lastIndexOf('.')+1, k.length );
		var permitExtensions = this.getConfig('file', 'file_extension');
		var exceptExtensions = this.getConfig('file', 'file_extension_except');
		var fileCount = this.getConfig('file', 'file_count');
		
		//동일한 이름의 파일이 이미 등록되어 있는지 체크
		if( this.fileMap.isContainsKey(f.name) ){
			alert(this.getConfig('message', 'file_already_exist'));
			return false;
		}
		
		//추가할 파일의 크기와 파일크기제한 속성값 비교
		if( f.size > this.getConfig('file', 'file_size') ){
			alert(this.getConfig('message', 'file_size_max_overflow'));
			return false;
		}
		//등록된 파일이 설정한 파일 개수보다 많은지 유효성 검증, 설정 개수가 0 이면 등록 개수 제한 없음
		if( fileCount !== 0 && fileCount < this.fileMap.size() ){
			alert(this.getConfig('message', 'file_count_over'));
			return false;
		}
		//허용된 확장자인지 체크 (허용된 확장자가 아니면 파일을 추가하지 않음)
		for(var i=0, permitExtension; permitExtension=permitExtensions[i]; i++){
			if(extension !== permitExtension){
				alert(this.getConfig('message', 'file_extension'));
				return false;
			}
		}
		//제외 확장자에 포함되는지 체크 (포함된다면 제외해야할 파일이므로 추가하지 않음)
		for(var i=0, exceptExtension; exceptExtension=exceptExtensions[i]; i++){
			if(extension === exceptExtension){
				alert(this.getConfig('message', 'file_extension_except'));
				return false;
			}
		}
		
		return true;
	}
	
	/*
	 * 파일객체를 Blob객체로 새로이 생성 (파일 객체의 name속성은 불변 속성이므로 변경하기 위함)
	 * Blob 객체를 서버쪽에서 multipartfile 객체로 받을 때 originalfilename으로 파일명을 가져올 수 없음.
	 * 따라서 중복된 파일명을 가진 파일 등록 시 [makeItemKey] 함수를 통해 새로운 파일명을 부여하는 대신 올리지 못하도록 변경.
	 */ 
	SimpleFileManager.prototype.createNewFile = function (f, key) {
/*  	
    var blob = new Blob([f], { type: f.type });

		blob.name = key;
		blob.lastModified = f.lastModified || 0;
		blob.lastModifiedDate = f.lastModifiedDate || 0;

		return blob;
 */
		return f;
	}
	
	/**
	 * 동일한 파일명이 존재할 때 (2), (3), (4).....를 붙임
	 */
	SimpleFileManager.prototype.makeItemKey = function (k) {
		var key = k;
/*
 		var suffix = 1;
		var name = null;
		var extension = null;
		
		while (this.fileMap.isContainsKey(key)) {
			suffix++;
			extension = k.substring( k.lastIndexOf('.'), k.length );
			name = k.substring( 0, k.lastIndexOf('.') );
			key = name + ' (' + suffix + ')' + extension;
		}
 */
		return key;
	}
	
	SimpleFileManager.prototype.addFile = function (files) {
		for(var i=0, f; f=files[f]; i++){
			if( !__hasProp.call(f, 'name') ){
				console.error('[SFM] not exists attribute "name" in file object', f);
			} else {
				this.addFileToFileMap(f, false);
				this.addItem(f);
			}
		};
	}
	
	SimpleFileManager.prototype.addFileToFileMap = function (f, isNewFile) {
		f.isNewFile = isNewFile
		this.fileMap.put(f.name, f);
	}
	
	SimpleFileManager.prototype.addItem = function (f) {
		var 	fileRemoveId = this.addSeparator(this.elementId.fileRemove, f.name)
		var 	fileDownloadId = this.addSeparator(this.elementId.fileDownload, f.name)
		var fileArea = this.getElement(this.elementId.fileArea);
		var keys = this.getConfig('key');
		var itemKeyArea = this.elementId.itemKeyArea;
		var itemkeyAreaHtml = '';
		var itemId = this.addSeparator(this.elementId.item, f.name);
		var itemHtml = this.getConfig('item')(f, fileRemoveId, fileDownloadId);
		
		/*
		 * 파일 키값이 저장될 element 구성
		 */
		Object.keys(keys).forEach(function (key, i) {
			if(i === 0){
				itemkeyAreaHtml = '<span ' + itemKeyArea + '>';
			}
			itemkeyAreaHtml += '<input type="hidden" id="' + key + '" value="' + ( ( f[key] ) ? f[key] : '' ) + '"/>';
			if(i == (keys.length - 1)){
				itemkeyAreaHtml += '</span>';
			}			
		});
				
		itemHtml = '<span id="' + itemId + '">' + itemHtml + itemkeyAreaHtml + '</span>';
		fileArea.insertAdjacentHTML('beforeend', itemHtml);

		var fileRemoveElement = this.getElement(fileRemoveId);
		var fileDownloadElement = this.getElement(fileDownloadId);
		
		if( fileRemoveElement ){
			// config.item에서 정의한 함수에서 fileRemoveId가 부여된 요소가 있다면 해당 요소에 removeFile 이벤트 리스너를 선언합니다.
			this.addCustomEvent(
				fileRemoveElement, 
				this.getConfig('event', 'file_remove'), 
				this.removeFile.bind(this, itemId, this.createNewFile(f, f.name)) 
			);
		}
				
		// config.item에서 정의한 함수에서 fileDownloadId가 부여된 요소가 있다면 해당 요소에 removeFile 이벤트 리스너 선언를 선언합니다.
		if( fileDownloadElement ){
			this.addCustomEvent(
				fileDownloadElement, 
				this.getConfig('event', 'file_download'), 
				this.downloadFile.bind(this, itemId, this.createNewFile(f, f.name)) )
			;
		}
	}
	
	SimpleFileManager.prototype.removeFile = function (itemId, f, e) {
		if( this.isIngRemove ){
  		alert(this.getConfig('message', 'file_remove_is_ing'));
			return false;
		}
		if( !confirm(this.getConfig('message', 'file_remove')) ){
			return false;
		}
		this.isIngRemove  = true;	
		this.preventEvent(e);
		
		var _this = this;
		var promise = new Promise();
		var key = f.name;
		var item = _this.getElement(itemId);
		var formData = _this.makeParamFile(f);
		var fileRemoveUrl = _this.getConfig('url', 'file_remove');
		
		promise
		.then(function (resolve, reject) {
			if( _this.callConfigEventHandler('file_remove_before', { file: f, item: item }) ){
				resolve();
			} else {
				reject();
			}
		})
		.then(function (resolve, reject) {
			if(fileRemoveUrl == null || _this.trim(fileRemoveUrl) === ''){
				fileRemoveUrl = location.href;
			}
			try {
				_this.ajax.post(fileRemoveUrl, formData, function (res) {
					resolve(res);
				});
			} catch(error) {
				console.error('[SFM] fail remove file:', fileRemoveUrl, error);
				reject();
				alert(_this.getConfig('message', 'file_remove_error'));
			}
		})
		.then(function (_, __, res) {
			_this.removeSelf(item);
			_this.fileMap.remove(key);
			
			_this.callConfigEventHandler('file_remove_after', { response: res });
			
			_this.isIngRemove  = false;
		});
	}
	
	SimpleFileManager.prototype.downloadFile = function (itemId, f, e) {
		this.isIngDownload = true;
		this.preventEvent(e);

		var _this = this;
		var promise = new Promise();
		var item = _this.getElement(itemId);
		var downloadUrl = _this.getConfig('url', 'file_download');
			
		promise
		.then(function (resolve, reject) {
			if( _this.callConfigEventHandler('file_download_before', { file: f, item: item }) ){
				resolve();
			} else {
				reject();
			}
		})
		.then(function (resolve, reject) {
			if(downloadUrl != null && _this.trim(downloadUrl) !== ''){
				try {
					location.href = downloadUrl;
					resolve();
				} catch(error) {
					console.error('[SFM] fail download file:', downloadUrl, error);
					reject();
					alert(_this.getConfig('message', 'file_download_error'));
				}
			} else {
				console.warn('[SFM] downloadURL is not define');
			}
		})
		.then(function () {
			_this.callConfigEventHandler('file_download_after');
			_this.isIngDownload = false;
		});
	}
	
	SimpleFileManager.prototype.uploadFile = function () {
		if(this.isIngUpload){
			alert(this.getConfig('message', 'file_upload_is_ing'));
			return false;
		}
		this.isIngUpload = true;

		var _this = this;
		var promise = new Promise();
		var formData = _this.makeParamFiles();
		var fileUploadUrl = _this.getConfig('url', 'file_upload');
	
		promise
		.then(function (resolve, reject) {
			if( _this.callConfigEventHandler('file_upload_before') ){
				resolve();
			} else {
				reject();
			}
		})
		.then(function (resolve, reject) {
			if(fileUploadUrl == null || _this.trim(fileUploadUrl) === ''){
				fileUploadUrl = location.href;
			}
			try {
				_this.ajax.post(fileUploadUrl, formData, function (res) {
					resolve(res);
				});
			} catch(error) {
				console.error('[SFM] fail upload:', fileUploadUrl, error);
				reject();
				alert(_this.getConfig('message', 'file_upload_error'));
			}
		})
		.then(function (_, __, res) {
			_this.callConfigEventHandler('file_upload_after', { response: res });
			_this.isIngUpload = false;
		});
		
	}
	
	SimpleFileManager.prototype.removeSelf = function (self) {
		self.parentNode.removeChild(self);
	}
	
	/**
	 * 단일 파일의 파라미터 만들기
	 */
	SimpleFileManager.prototype.makeParamFile = function (file) {
		var formData = new FormData();
		this.setParamFormData(formData, file, false);
		return formData;
	}
	
	/**
	 * 파일 배열의 파라미터 만들기
	 */
	SimpleFileManager.prototype.makeParamFiles = function (formData, isNewFile) {
		var formData = ( formData ) ? formData : new FormData();
		var files = this.fileMap.array();
		isNewFile = ( isNewFile ) ? isNewFile : false; 
		
		files.forEach(function (file, i) {
			this.setParamFormData(formData, file, true, i, isNewFile);
		}.bind(this));
		
		return formData;
	}
	
	/**
	 * request시에 파라미터로 보낼 formData를 세팅
	 * @param formData 파라미터용 formData
	 * @param f 파라미터로 보낼 파일
	 * @param isParamTypeList 파라미터가 List인지 여부
	 * @param index 파라미터가 List형식일 때 현재 index
	 */
	SimpleFileManager.prototype.setParamFormData = function (formData, f, isParamTypeList, index, isOnlyNewFile) {
		var itemId = this.addSeparator(this.elementId.item, f.name);
		var keyAreaElementNodes = this.getElement(itemId).querySelector('[' + this.elementId.itemKeyArea + ']').childNodes;
		var keys = this.getConfig('key');
		var el;
		var i;
		
		//파일 키값 세팅
		if( !isOnlyNewFile || ( isOnlyNewFile && f.isNewFile ) ){
			for(i=0; i<keyAreaElementNodes.length; i++){
				el = keyAreaElementNodes[i];
				if(__hasProp.call(keys, el.id)){
					formData.append(
						this.getParamName(isParamTypeList, false, index, el.id),
						( keys[el.id].toLowerCase() === 'number' ) ? Number(el.value) : String(el.value)
					);
				}
			};
			
			//파일 세팅
			formData.append( 
				this.getParamName(isParamTypeList, true, index),
				f
			);
		}
	}
		
	/**
	 * 서버의 DTO와 매핑할 FormData의 키값을 가져옵니다.
	 * DTO와 매핑할 파라미터의 타입이 파일 객체 배열인지 파일 객체인지에 따라 구분하여 반환합니다. 
	 */
	SimpleFileManager.prototype.getParamName = function (isParamTypeList, isParamTypeFile, index, name) {
		var fileListParamName = this.getConfig('file', 'file_list_parameter_name') + '[' + index +  '].';
		var fileParamName = this.getConfig('file', 'file_parameter_name');
		// 파라미터 타입이 리스트라면
		if(isParamTypeList){
			// 파라미터 타입이 파일인지
			return ( isParamTypeFile ) ? fileListParamName + fileParamName : fileListParamName + name;
		}
		// 파라미터 타입이 단건이라면
		else {
			// 파라미터 타입이 파일인지
			return ( isParamTypeFile ) ? fileParamName : name;
		}
	}
	
	/*
	 * 등록되어 있는 파일들을 인자로 넘긴 formData객체에 추가한 뒤 반환합니다.
	 * 인자로 formData를 넘기지 않는다면 파일 목록이 담긴 새 formData를 반환합니다.
	 * 반환받은 formData를 서버로 요청하면 상단 예시 DTO 형태로 매핑됩니다.
	 */ 
	SimpleFileManager.prototype.getFileToFormData = function (formData) {
		return this.makeParamFiles(formData);
	}
	
	/*
	 * 인자로 넘긴 formData객체에 새로 등록된 파일들만 추가한 뒤 반환합니다.
	 * 인자로 formData를 넘기지 않는다면 파일 목록이 담긴 새 formData를 반환합니다.
	 * 반환받은 formData를 서버로 요청하면 상단 예시 DTO 형태로 매핑됩니다.
	 */ 
	SimpleFileManager.prototype.getNewFileToFormData = function (formData) {
		return this.makeParamFiles(formData, true);
	}
	
	/*
	 * props.url.file_get_list 에 정의한 url에서 파일목록을 가져옵니다.
	 */ 
	SimpleFileManager.prototype.getFilesFromUrl = function (data) {
		var fileGetListUrl = this.getConfig('url', 'file_get_list'); 
		var _this = this;
		try {
			_this.ajax.get(fileGetListUrl, data, function (files) {
				_this.addFile(files);
			});
		} catch(error) {
			console.error('[SFM] getFilesFromUrl:', fileGetListUrl, error);
			alert(_this.getConfig('message', 'file_get_error'));
		}
	}

	/*
	 * 현재 등록되어 있는 전체 파일목록을 가져옵니다.
	 */
	SimpleFileManager.prototype.getFiles = function () {
		var files = [];
		this.fileMap.each(function (item, i) {
			files.push(item.value);
		});
		return files;
	}
	
	/*
	 * 현재 등록되어 있는 파일들 중 새로 등록된 파일들의 목록만 가져옵니다.
	 */ 
	SimpleFileManager.prototype.getNewFiles = function () {
		var newFiles = [];
		this.fileMap.each(function (item, i) {
			if( item.value.isNewFile ){
				newFiles.push(item.value);
			}
		});
		return newFiles;
	}

	SimpleFileManager.prototype.addCustomEvent = function (element, evtNm, fn) {
		if( element._$sfmEventListeners === undefined  ){
			element._$sfmEventListeners = {};
		}
		
		element._$sfmEventListeners[evtNm] = function (e) {
			e.stopPropagation();
			e.preventDefault();
			fn(e);
		}
		element.addEventListener(evtNm, element._$sfmEventListeners[evtNm], false );

		if( !__hasProp.call(element._$sfmEventListeners, 'DOMNodeRemovedFromDocument') ){
			/**
			 * DOM에서 해당 노드가 삭제될 때 적용되어 있는 모든 이벤트리스너를 해제한다.
			 */
			this.addCustomEvent(element, 'DOMNodeRemovedFromDocument', function(e){
				if( this._$sfmEventListeners ){
					Object.keys(this._$sfmEventListeners).forEach(function (key) {
						this.removeEventListener(key, this._$sfmEventListeners[key]);
						delete this._$sfmEventListeners[key];
					}.bind(this));
					
					delete this._$sfmEventListeners;
				}
			}.bind(this));
		}
		return this;
	}
	
	SimpleFileManager.prototype.callConfigEventHandler = function (handlerName, param) {
		var option = this.option;
		var flag = true;
		
		param = ( param === undefined ) ? {} : param
		param.self = this.getElement(option.id);
			
		/**
		 * config 속성에 설정된 전역 이벤트핸들러 실행
		 */
		flag = this.searchProp(this.config, ['eventHandler', handlerName])( this.copyObject(param) );
			
		/*
		 * SMF 생성자 옵션에 정의한 이벤트핸들러가 있다면 실행
		 */
		if( flag !== false && __hasProp.call(option, 'eventHandler') && __hasProp.call(option.eventHandler, handlerName) ){
			flag = option.eventHandler[handlerName](this.copyObject(param));
		}
			
		return ( flag === false ) ? false : true;
	}
	
	SimpleFileManager.prototype.preventEvent = function (e) {
		e.stopPropagation();
		e.preventDefault();
	}
	
	SimpleFileManager.prototype.copyObject = function (object) {
		var result = {};
		if(typeof object === 'string'){
			result = object;
		} else {
			result = {};
			for(var k in object){
				result[k] = object[k];
			}
		}
		return result;
	}
	
	SimpleFileManager.prototype.trim = function (str) {
		return str.replace(/\s/g, '');
	}
	
	SimpleFileManager.prototype.ajax = {
		get: function (url, formData, success, error) {
			this.xhr( 'GET', url, formData, success, error );
		},
		post: function (url, formData, success, error) {
			this.xhr( 'POST', url, formData, success, error );
		},
		xhr: function (method, url, formData, success ,error) {
			var xhr = ( window.XMLHttpRequest ) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
							       
			xhr.onload = function (data) {
				if (this.readyState == 4 && this.status == 200){
					if( success ){
						success(data.target.response, xhr);
					}
				} else {
					if( error ){
						error(xhr);
					}
				}
			}
			xhr.open(method, url, true);
			xhr.setRequestHeader('encType', 'multipart/form-data');
			xhr.send(formData);
		}
	}
	

	/**
	 * @Desc Grid용 SFM, row : file (1:1) 구조
	 */
	var SimpleFileManagerForGrid = function (option) {
		if( !(this instanceof SimpleFileManagerForGrid) ){
  		throw new SyntaxError('[SFMGrid] "new" constructor operator is required');
  	}
  	
		this.requiredValidator(option);
  	this.fileMap = Object.create(null);
  	this.rowIdColumn = option.rowIdColumn;
  	this.listParameterName = option.listParameterName;
  	this.fileParameterName = option.fileParameterName || 'file';
  	this.callee = {};
  	
  	this.init();
  	
  	return this.callee;
	}
	
	SimpleFileManagerForGrid.prototype.requiredValidator = function  (option) {
		if( option == null || !__hasProp.call(option, 'rowIdColumn') ){
			throw new SyntaxError('[SFMGrid] constructor property "rowIdColumn" is required');
		}
		if( !__hasProp.call(option, 'listParameterName') ){
			throw new SyntaxError('[SFMGrid] constructor property "listParameterName" is required');
		}
		if( !__hasProp.call(option, 'fileParameterName') ){
			console.warn('[SFMGrid] constructor property "fileParameterName" is not define');
		}
	}
	
	SimpleFileManagerForGrid.prototype.init = function () {
		this.makeCallee();
	}
	
	SimpleFileManagerForGrid.prototype.makeCallee = function () {
		this.callee.get = this.get.bind(this);
		this.callee.set = this.set.bind(this);
		this.callee.remove = this.remove.bind(this);
		this.callee.clear = this.clear.bind(this);
		this.callee.getFormDataFromObject = this.getFormDataFromObject.bind(this);
		this.callee.getFormDataFromArray = this.getFormDataFromArray.bind(this);
	}

	SimpleFileManagerForGrid.prototype.get = function (item) {
		return this.fileMap[ item[this.rowIdColumn] ];
	}
	
	SimpleFileManagerForGrid.prototype.set = function (item, file) {
		this.fileMap[ item[this.rowIdColumn] ] = file;
	}

	SimpleFileManagerForGrid.prototype.remove = function (item) {
		delete this.fileMap[ item[this.rowIdColumn] ];
	}
	
	SimpleFileManagerForGrid.prototype.clear = function (key) {
		this.fileMap.clear();
	}
	
	/**
	 * 인자로 넘긴 그리드 데이터 객체와 저장되어있는 파일을 키값으로 매칭하여 formData 형식으로 변환합니다.
	 * 반환받은 formData를 서버로 요청하면 상단 예시 DTO 형태로 매핑됩니다.
	 * @param gridItem 'AUIGrid의 경우 한 row의 item 객체'
	 */
	SimpleFileManagerForGrid.prototype.getFormDataFromObject = function (gridRowItem) {
		var formData = new FormData();
		for(var k in this.fileMap){
			if( this.rowIdColumn === k && __hasProp.call(this.fileMap, this.fileMap[this.rowIdColumn]) ){
				formData.append( 	this.fileParameterName, this.fileMap[ this.fileMap[this.rowIdColumn] ] );
			}
			formData.append( k, this.fileMap[k] );
		}
		return formData;
	}
	
	/**
	 * 인자로 넘긴 그리드 데이터 배열과 저장되어있는 파일들을 키값으로 매칭하여 formData 형식으로 변환합니다.
	 * 반환받은 formData를 서버로 요청하면 상단 예시 DTO 형태로 매핑됩니다.
	 * @param gridDataArray 'AUIGrid의 경우 row item의 배열 ex) AUIGrid.getGridData() 함수의 반환값'
	 */ 
	SimpleFileManagerForGrid.prototype.getFormDataFromArray = function (gridData) {
		if( gridData.length == 0 ){
			return null;
		}
		var _this = this;
		var formData = new FormData();
		var compareFileMap = this.copyObject(this.fileMap);
		
		gridData.forEach(function (row, i) {
			for(var k in row){
				if( _this.rowIdColumn === k && 	__hasProp.call(compareFileMap, row[_this.rowIdColumn]) ){
					formData.append(
						_this.listParameterName + '[' + i + '].' + _this.fileParameterName, 
						compareFileMap[ row[_this.rowIdColumn] ]
					);
					delete compareFileMap[ row[_this.rowIdColumn] ];
				}
				formData.append(
					_this.listParameterName + '[' + i + '].' + k, 
					row[k]
				);
			}
		});
		return formData;
	}
	
	SimpleFileManagerForGrid.prototype.copyObject = function (obj) {
		var newObj = {};
		for(var k  in obj){
			newObj[k] = obj[k];
		}
		return newObj;
	}
	
	return {
		SFM: SimpleFileManager,
		SFMGrid: SimpleFileManagerForGrid,
	}
	
}((function () { 'use strict' //DoublyLinkedHashMap
	
	//양방향 링크드리스트
	var DoublyLinkedHashMap = function () {
		this.head = null;
		this.tail = null;
		this.map = Object.create(null);
		this.length = 0;
		this.hasProp = Object.prototype.hasOwnProperty;
	}

	DoublyLinkedHashMap.prototype.clear = function () {
		this.head = null;
		this.tail = null;
		this.map = Object.create(null);
		this.length = 0;
	}
	
	DoublyLinkedHashMap.prototype.get = function (k) {
		var item = ( this.hasProp.call(this.map, k) ) ? this.map[k] : {};
		return item.value;
	}
	
	DoublyLinkedHashMap.prototype.	size = function () {
		return this.map.length;
	}
	
	/**
	 * index에 해당하는 값을 리턴
	 */
	DoublyLinkedHashMap.prototype.	getByIndex = function (index) {
		var item = this.getItemByIndex(index);
		return item.value;
	}
			
	/**
	 * key에 해당하는 인덱스를 리턴
	 */ 
	DoublyLinkedHashMap.prototype.getIndexByKey = function (k) {
		var item = this.getItemByKey(k);
		return item.index;
	}
	
	/**
	 * key에 해당하는 데이터를 리턴
	 * @data index, key, value
	 */
	DoublyLinkedHashMap.prototype.getItemByKey = function (k) {
		var result = null;
		
		this.each(function (item, i) {
			if(k === item.key){
				result = { 
					index: i, 
					key: item.key, 
					value: item.value, 
				};
				return false;
			}
		});
					
		return result;
	}
	
	/**
		 * index에 해당하는 데이터를 리턴
		 * @data index, key, value
		 */
	DoublyLinkedHashMap.prototype.	getItemByIndex = function (index) {
		var result = null;
		
		this.each(function (item, i) {
			if(index == i){
				result = { 
					index: i, 
					key: item.key, 
					value: item.value 
				};
				return false;
			}
		});
		
		return result;
	}

	/**
	 * Map에 key를 가진 데이터가 있는지 여부 확인
	 * @return boolean 
	 */
	DoublyLinkedHashMap.prototype.isContainsKey = function (k) {
		return ( this.hasProp.call(this.map, k) ) ? true : false;
	}
	
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
		
		if(this.length === 0){
			this.head = item;
		}
	
		if(this.tail){
			this.tail.next = item;
		}
	
		this.tail = item;
		
		this.length += 1;
	}

	/**
	 * key에 해당하는 데이터를 삭제
	 */
	DoublyLinkedHashMap.prototype.	remove = function (k) {
		if( !this.hasProp.call(this.map, k) ){
			return;
		}

		var item = this.map[k];
		
		if( this.head === item ){
			if( item.next ){
				item.next.prev = null;
			}
			this.head = item.next;
		}
		
		if( this.tail === item ){
			if( item.prev ){
				item.prev.next = null;
			}
			this.tail = item.prev;
		}
		
		if( item.next ){
			item.next.prev = item.prev;
		}
		
		if( item.prev ){
			item.prev.next = item.next;
		}
		
		delete this.map[k];
		this.length -= 1;
	}
	
	
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
			
			if( callBack(param, i) === false ){
				break;
			}
			
			item = item.next;
			i++;
		}
	}
		
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
			
			if( callBack(param, i)  === false ){
				break;
			}
			
			item = item.prev;
			i--;
		}
	}
	

	/**
	 * Map을 삽입한 순서의 array로 변환하여 리턴
	 */
	DoublyLinkedHashMap.prototype.array = function(){
		var array = [];
		
		this.each(function (item, i) {
			array.push(item.value);
		});
		
		return array;
	}
	
	/**
	 * Map을 삽입한 역순의 array로 변환하여 리턴
	 */
	DoublyLinkedHashMap.prototype.	arrayRvs = function(){
		var array = [];
		
		this.reverseEach(function (item, i) {
			array.push(item.value);
		});
		
		return array;
	}
	
	return DoublyLinkedHashMap;
	
}()), (function () { 'use strict' //Promise
	
	var Promise = function () {
		this.queue = [];
		this.isIng = false;
		this.onError =	null;
		this.onReject = null;
	}
	
	/**
	 * Promise 실행함수
	 * Promise Queue에서 shift한 콜백 함수를 실행
	 * 이전 프로미스의 resolve함수에서 넘긴 파라미터가 있다면 콜백 함수의 세 번째 인자로 넘김 
	 */
	Promise.prototype.run = function (data) {
		if( this.queue.length > 0 && !this.isIng ){
			this.isIng = true;
			try {
				this.queue.shift()(this.makeResolve(), this.makeReject(), data);
			} catch(error) {
				( this.onError ) ? this.onError(error) : console.error(error.message);
			}
		}
	}
	
	/**
	 * Promise Queue에 콜백 함수를 push하며 대기열이 없다면 즉시 실행
	 */
	Promise.prototype.then = function (fn) {
		this.queue.push(fn);
		this.run();
		return this;
	}
	
	/**
	 * 에러가 발생했을 때 실행될 콜백 함수를 정의
	 */
	Promise.prototype.error = function (fn) {
		this.onError = fn;
		return this;
	}
	
	/**
	 * Promise 중단 함수
	 * Promise Queue를 초기화 
	 */
	Promise.prototype.stop = function () {
		this.queue = [];
		this.isIng = false;
	}
	
	/**
	 * reject를 호출헀을 때 실행될 콜백 함수를 정의
	 */
	Promise.prototype.reject = function (fn) {
		this.onReject = fn;
		return this;
	}
	
	/**
	 * 다음 Promise를 실행시키는 resolve 함수를 생성하는 함수
	 */
	Promise.prototype.makeResolve = function () {
		return function resolve (data) {
			this.isIng = false;
			this.run(data);
		}.bind(this);
	}
	
	/**
	 * Promise를 중단시키는 reject 함수를 생성하는 함수
	 */
	Promise.prototype.makeReject = function () {
		return function reject (data) {
			this.stop();
			if( this.onReject ){
				this.onReject(data);
			}
		}.bind(this);
	}
	
	return Promise;
	
}())))));