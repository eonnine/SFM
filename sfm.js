/**
 * ******************
 * Simple File Manager *
 * ******************
 * Develope by Eg 2019-03-25
 */
(function (factory) {
	if(typeof define === 'function' && define.amd !== undefined){
		define(function(){
			return factory;
		});
	}
	if(typeof module === 'object' && typeof module.exports === 'object'){
		module.exports = factory;
	}else{
		this['SFM'] = factory;
	}
}((function (DoublyLinkedHashMap, Promise) { 'use strict'
	
	var __hasProp = Object.prototype.hasOwnProperty;
	
	var SimpleFileManager = function (option) {
  	if( !(this instanceof SimpleFileManager) ){
  		throw new SyntaxError('[SFM] "new" constructor operator is required');
  	}
  	this.requiredValidator(option);
  	
  	this.fileMap = new DoublyLinkedHashMap();
  	this.isIngUpload = false;
  	this.isIngDownload = false;
  	this.isIngRemove = false;
  	this.option = option;
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
	 */
 	SimpleFileManager.prototype.config = {
		//table 구조에 맞게 선언. { 테이블 컬럼명: 타입[string, number] }
		//타입에 따라 서버로 전송되는 기본값이 달라짐. string => '', number => 0
		key: { fileIdx: 'number', fileSeq: 'number' }, 
		fix: { 
	  	item: 'item', 
			item_key_area:'item-key-area', 
			file_upload: 'upload-file', 
			file_remove: 'remove-file',
			file_download: 'download-file',
			input_file: 'input-file', 
			item_area: 'file-area',
		},
		/*
		 * 파일 관련 속성
		 */
		file: {
			file_size: '52428800', // 50mb
			file_count: 0,
		  	file_extension: [],
		  	file_extension_except: [],
	  		file_parameter_name: 'file',
	  		file_list_parameter_name: 'files',
		},
		/*
		 * SFM에서 사용되는 메세지 속성
		 */
		message: {
			file_remove: '삭제하시겠습니까?',
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
		/*
		 *	SFM 전체 레이아웃 폼 속성
		 * SFM 객체 생성시 기본적으로 생성되는 바탕 폼
		 */
		layout: function (fileAreaId, fileUploadId) {
			// fileAreaId: SFM 바탕 폼 겍체에 주는 ID
			// fileUploadId: file upload 이벤트를 실행할 요소에 주는 ID
			return '<fieldset><button id="'+fileUploadId+'" style="float:right; position:relative; bottom:13px;">upload</button><div id="'+fileAreaId+'" style="z-index:1;" width="100%" height="100%" default-class-dropzone><p dropzone-file-area-message></p></div></fieldset>';
		},
		/*
		 * SFM 반복부 속성
		 * 파일을 추가할 때마다 해당 속성으로 정의된 폼이 추가됨
		 */
		item: function (file, fileRemoveId, fileDownloadId) {
			// file: 추가된 파일 폼에 해당하는 파일 객체
			// fileRemoveId: 이 파일의 다운로드 이벤트를 실행할 요소에 주는 ID 
			// fileDownloadId: 이 파일의 삭제 이벤트를 실행할 요소에 주는 ID
			return '<span style="z-index:10;"><p>&nbsp;&nbsp;<b id="'+fileDownloadId+'" style="width:12px; height:12px; margin-left:5px; font-size:12px; cursor:pointer;">▼</b>&nbsp;file: <strong>' + file.name + '</strong>&nbsp;&nbsp;&nbsp;type: <strong>' + file.type + '</strong>&nbsp;&nbsp;&nbsp;size: <strong>' + file.size + '</strong>bytes<data style="display:none;"></data><b style="width:12px; height:12px; margin-left:5px; font-size:12px; cursor:pointer;" id="'+fileRemoveId+'">X</b></p></span>';
		},
		/*
		 * 파일 목록 가져오기, 업로드, 삭제, 다운로드 url 속성
		 */
		url: {
			file_get_list: '',
			file_upload: '',
			file_remove: '',
			file_download: '',
		},
		/**
		 * 업로드, 삭제, 다운로드의 이벤트 속성
		 */
		event: {
			file_upload: 'click',
			file_remove: 'click',
			file_download: 'click',
		},
		/*
		 * SFM hooks
		 * @Param param 
		 * 		@Prop layout_create_after: layout 속성에 정의한 바탕 폼이 생성된 후 실행.
		 * 		@Prop file_upload_before: upload 실행 직전 실행. false를 리턴하면 업로드 중지.
		 * 		@Prop file_upload_after: upload 실행 후에 실행.
		 * 		@Prop file_remove_before: file 삭제 직전 실행. false를 리턴하면 삭제 중지.
		 * 		@Prop file_remove_after: file 삭제 후에 실행.
		 * 		@Prop file_download_before: file 다운로드 직전 실행. false를 리턴하면 다운로드 중지.
		 * 		@Prop file_download_after: file 다운로드 후에 실행.
		 */
		eventHandler: {
			layout_create_after: function (param) {
				/*
				 * config에 설정된 레이아웃이 그려진 후 이벤트리스너 등록
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
			this.initConfig( props, [] );
	}
	
	/**
	 * props로 받은 값들로 SFM config 속성들을 수정
	 */
	SimpleFileManager.prototype.initConfig = function (props, target) {
		target = ( target == null ) ? this.config : target;
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
	
	//SFM가 생성될 때 내부적으로 사용할 id값 생성
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
	
	SimpleFileManager.prototype.makeCallee = function () {
		this.callee.getFiles = this.getFiles.bind(this);
		this.callee.uploadFile = this.uploadFile.bind(this);
		this.callee.getNewFiles = this.getNewFiles.bind(this);
	}

	/*
	 * 생성된 이후의 SFM 객체의 속성이나 옵션은 변경 불가능하도록 설정
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
	
	SimpleFileManager.prototype.init = function (option) {
		this.makeElementId(); // SFM 객체에서 사용할 요소 ID 초기화
		this.createLayout();
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
			if(!this.fileValidator(f)){
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
	 */ 
	SimpleFileManager.prototype.createNewFile = function (f, key) {
		var blob = new Blob([f], { type: f.type });

		blob.name = key;
		blob.lastModified = f.lastModified || 0;
		blob.lastModifiedDate = f.lastModifiedDate || 0;
		
		return blob;
	}
	
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
			key = name + ' (' + suffix + ')' + extension;
		}
		
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
			this.addCustomEvent(
				fileRemoveElement, 
				this.getConfig('event', 'file_remove'), 
				this.removeFile.bind(this, itemId, this.createNewFile(f, f.name)) 
			);
		}
				
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
	
	SimpleFileManager.prototype.uploadFile = function (e) {
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
	 * 파일 ㅂ열의 파라미터 만들기
	 */
	SimpleFileManager.prototype.makeParamFiles = function () {
		var formData = new FormData();
		var files = this.fileMap.array();
		files.forEach(function (file, i) {
			this.setParamFormData(formData, file, true, i);
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
	SimpleFileManager.prototype.setParamFormData = function (formData, f, isParamTypeList, index) {
		var itemId = this.addSeparator(this.elementId.item, f.name);
		var keyAreaElementNodes = this.getElement(itemId).querySelector('[' + this.elementId.itemKeyArea + ']').childNodes;
		var keys = this.getConfig('key');
		var el;
		var i;
		//파일 키값 세팅
		for(i=0, el; el=keyAreaElementNodes[i]; i++){
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
	
	SimpleFileManager.prototype.getParamName = function (isParamTypeList, isParamTypeFile, index, name) {
		var fileListParamName = this.getConfig('file', 'file_list_parameter_name') + '[' + index +  '].';
		var fileParamName = this.getConfig('file', 'file_parameter_name');
		// 파라미터 타입이 리스트라면
		if(isParamTypeList){
			// 파라미턱 타입이 파일인지
			return ( isParamTypeFile ) ? fileListParamName + fileParamName : fileListParamName + name;
		}
		// 파라미터 타입이 단건이라면
		else {
			// 파라미턱 타입이 파일인지
			return ( isParamTypeFile ) ? fileParamName : name;
		}
	}
	
	SimpleFileManager.prototype.getFiles = function (data) {
		var fileGetListUrl = this.getConfig('url', 'file_get_list'); 
		var _this = this;
		try {
			_this.ajax.get(fileGetListUrl, data, function (files) {
				_this.addFile(files);
			});
		} catch(error) {
			console.error('[SFM] getFiles:', fileGetListUrl, error);
			alert(_this.getConfig('message', 'file_get_error'));
		}
	}
	
	SimpleFileManager.prototype.getNewFiles = function () {
		var newFiles = [];
		this.fileMap.each(function (i, item) {
			newFiles.push(item.value);
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
		param.self = this.getElement(this.option.id);
			
		/**
		 * config 속성에 설정된 전역 이벤트핸들러 실행
		 */
		flag = this.getConfig('eventHandler')[handlerName](this.copyObject(param));
			
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

	return SimpleFileManager;
	
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
		
		this.each(function (i, item) {
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
			
			if( callBack(i, param) === false ){
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
			
			if( callBack(i, param)  === false ){
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
		
		this.each(function (i, item) {
			array.push(item.value);
		});
		
		return array;
	}
	
	/**
	 * Map을 삽입한 역순의 array로 변환하여 리턴
	 */
	DoublyLinkedHashMap.prototype.	arrayRvs = function(){
		var array = [];
		
		this.reverseEach(function (i, item) {
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