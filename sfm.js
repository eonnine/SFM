
/**
 * *****
 * SFM *
 * *****
 * Develope by Eongoo 2019-03-25
 */
(function(moduleName, module){
	this[moduleName] = module();
}('SFM', function(){
	'use strict'
	
    var SimpleFileManager = function (option) {
    	if( !(this instanceof SimpleFileManager) )
    		return new SimpleFileManager(option);
		
    	this.option = option;
			
    	this.fileMap = new DoublyLinkedHashMap();
		
    	this.init(option);
   	}
	
    SimpleFileManager.prototype = {
    	init: function (option) {
    		
    		if(option == undefined || option.id == undefined)
    			this.throwsException('SFM: "id" is required.');
    		
    		this.setOption(option);
    		this.createElementId(option);
    		this.createLayout();
    		this.createDefaultEventListener();
    	},
  
    	config: {	
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
    		file: {
    			file_size: '52428800',
    		  	file_extension: [],
    		  	file_extension_except: [],
    	  		file_parameter_name: 'file',
    	  		file_list_parameter_name: 'files',
    		},
    		message: {
    			file_delete: '삭제하시겠습니까?',
    			file_size_max_overflow: '허용된 크기(50mb)보다 용량이 큰 파일입니다',
    			file_extension: '허용된 확장자가 아닙니다.',
    			file_extension_except: '허용된 확장자가 아닙니다.',
    		},
    		layout: function (data) {
    			return '<fieldset><button id="'+data.fileUploadId+'" style="float:right; position:relative; bottom:13px;">upload</button><div id="'+data.fileAreaId+'" style="z-index:1;" fileDragArea><p dropzone-file-area-message></p></div></fieldset>';
    		},
    		item: function (data) {
    			return '<span dropzone-file-row style="z-index:10;"><p>&nbsp;&nbsp;<b id="'+data.fileDownloadId+'" style="width:15px; height:15px; margin-left:5px; font-size:15px; cursor:pointer;">▼</b>&nbsp;file: <strong>' + data.file.name + '</strong>&nbsp;&nbsp;&nbsp;type: <strong>' + data.file.type + '</strong>&nbsp;&nbsp;&nbsp;size: <strong>' + data.file.size + '</strong>bytes<data style="display:none;"></data><b style="width:10px; height:10px; margin-left:5px; font-size:10px; cursor:pointer;" id="'+data.fileRemoveId+'">X</b></p></span>';
    		},
    		url: {
    			file_get_list: '',
    			file_upload: '/scm/getExistFiles2.mims',
    			file_remove: '',
    			file_download: '',
    		},
    		event: {
    			file_upload: 'click',
    			file_remove: 'click',
    			file_download: 'click',
    		},
    		eventHandler: {
    			layout_create_after: function (data) {
    				
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
    			file_upload_before: function (data) {
    				console.log('uploadStart');
    			},
    			file_upload_after: function (data) {
    				console.log('uploadEnd');
    			},
    			file_remove_before: function (data) {
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
		},
		setConfig: function (option) {
 			this.initConfig( option, [] );
		},
		setOption: function (option) {
			var exceptProps = ['eventHandler', 'fix', 'key']
			this.initConfig( option, exceptProps );
			
			Object.freeze(this.option);
		},
		initConfig: function (option, exceptProps, target) {
			target = ( target == undefined ) ? this.getConfig() : target;
			
			for(var key in option){
				if(exceptProps.includes(key))
					continue;
				
				if(typeof target[key] === 'object' 
					&& target[key] != null
					&& target[key].constructor.name == 'Object'){
						
					this.initConfig(option[key], exceptProps, target[key]);
				}
				else{
					target[key] = option[key];
				}
			}
		},
			
		addCustomEventListener: function (element, type, listener, args) {
			element.addEventListener(type, function (e) {
				this.preventEvent(e);

				var paramArray = [];

				paramArray.push(e);
					
				if(Array.isArray(args)){
					for(var i in args)
						paramArray.push(args[i]);
				}
				else{
					paramArray.push(args);
				}
					
				listener.apply(this, paramArray);
					
			}.bind(this), false);
				
			return this;
		},
		addFile: function (files) {
			for(var i=0, f; f=files[f]; i++){
				if(f.name == undefined) this.throwsException('SFM : not exists attribute "name" in file object', f);
				this.addFileToFileMap(f, false);
				this.addItem(f);
			};
		},
		addNewFile: function (e) {
			var files = e.target.files || e.dataTransfer.files;
				
			for(var i=0, f; f=files[i]; i++){
				
				if(!this.fileValidator(f)) return;

				var key = this.getItemKey(f.name);
				var newFile = this.createNewFile(f, key);
						
				this.addFileToFileMap(newFile, true);
				this.addItem(newFile);
			};
				
			e.target.value = '';
		},
		addItem: function (f) {
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
				if(i == 0) itemkeyAreaHtml = '<span '+this.elementId.itemKeyArea+'>';
					
				var value = ( f[key] != undefined ) ? f[key] : '';
					
				itemkeyAreaHtml += '<input type="hidden" id="' + key + '" value="' + value + '"/>';

				if(i == (keys.length - 1)) itemkeyAreaHtml += '</span>';
			};
					
			itemHtml = '<span id="'+itemId+'">'+itemHtml+itemkeyAreaHtml+'</span>';
				
			fileArea.insertAdjacentHTML('beforeend', itemHtml);

			var fileRemoveElement = this.getElement(fileRemoveId);
			var fileDownloadElement = this.getElement(fileDownloadId);
			
			if(fileRemoveElement != null)
				this.addCustomEventListener(fileRemoveElement, this.getConfig('event', 'file_remove'), this.removeFile, [itemId, f]);
					
			if(fileDownloadElement != null)
				this.addCustomEventListener(fileDownloadElement, this.getConfig('event', 'file_download'), this.downloadFile, [itemId, f])
		},
		/*addDataToFile: function (f) {
			return f;
		},*/
		addFileToFileMap: function (f, isNewFile) {
			f.newFile = isNewFile;
			f.isNewFile = isNewFile
			this.fileMap.put(f.name, f);
		},
		addSeparator: function () {
			var len = arguments.length;
			var result = '';
			
			for(var i=0; i<len; i++)
				result += arguments[i] + '-';
			
			return result.slice(0, -1);
		},
		ajax: {
			get: function (url, formData, success, error, complete) {
				this.xhr({ method: 'GET', formData: formData, url: url, success: success, error: error });
			},
			post: function (url, formData, success, error, complete) {
				this.xhr({ method: 'POST', formData: formData, url: url, success: success, error: error });
			},
			put: function (url, formData, success, error, complete) {
				this.xhr({ method: 'PUT', formData: formData, url: url, success: success, error: error });
			},
			del: function (url, formData, success, error, complete) {
				this.xhr({ method: 'POST', formData: formData, url: url, success: success, error: error });
			},
			xhr: function (args) {
				var xhr = ( window.XMLHttpRequest ) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
				var props = {
						method: args.method || 'GET',
						url: args.url || '',
						formData: args.formData || null,
						async: args.async || false,
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
		},
		/**
		 * setConfig와 생성자에서 정의된 이벤트핸들러 호출 함수
		 * @param handlerName setConfig와 생성자 option에서 정의된 이벤트핸들러명
		 * @param param 이벤트핸들러로 전달될 파라미터
		 * @returns false인 경우 이벤트 후의 진행을 취소
		 */
		callEventHandler: function (handlerName, param) {
			var option = this.option;
			var flag = true;
				
			param = ( param == undefined ) ? {} : param
			param.self = this.getElement(this.option.id)
					
			flag = this.getConfig('eventHandler')[handlerName](param);
				
			if(flag !== false && option.eventHandler != null && option.eventHandler[handlerName] != null){
				flag = option.eventHandler[handlerName](param);
			}
				
			return ( flag === false ) ? false : true
		},
		createDefaultEventListener: function () {
			var fileArea = this.getElement(this.elementId.fileArea);
		    var fileInputElement = this.getElement(this.elementId.fileInputElement);
			    	
		    	//openInputFile dㅣ벤트때 영역만 체크
			this.addCustomEventListener(fileArea, 'click', this.openInputFile)
				 .addCustomEventListener(fileArea, 'drop', this.addNewFile)
				 .addCustomEventListener(fileArea, 'change', this.addNewFile)
 				 .addCustomEventListener(fileArea, 'mouseover', this.preventEvent)
 				 .addCustomEventListener(fileArea, 'mouseenter', this.preventEvent)
				 .addCustomEventListener(fileArea, 'dragover', this.preventEvent)
				 .addCustomEventListener(fileArea, 'mouseenter', this.preventEvent)
				 .addCustomEventListener(fileInputElement, 'change', this.addNewFile);
		},
		getParamName: function (isParamTypeList, isParamTypeFile, index, name) {
			var fileListParamName = this.getConfig('file', 'file_list_parameter_name') + '[' + index +  '].';
			var fileParamName = this.getConfig('file', 'file_parameter_name');
			
			if(isParamTypeList)
				return ( isParamTypeFile ) ? fileListParamName + fileParamName : fileListParamName + name;
			else
				return ( isParamTypeFile ) ? fileParamName : name;
		},
		/**
		 * request시에 파라미터로 보낼 formData를 세팅
		 * @param formData 파라미터용 formData
		 * @param file 파라미터로 보낼 파일
		 * @param isParamTypeList 파라미터가 List인지 여부
		 * @param index 파라미터가 List형식일 때 현재 index
		 */
		setParamFormData: function (formData, file, isParamTypeList, index) {
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
		},
		/**
		 * 단일 파일의 파라미터 만들기
		 */
		createParamFile: function (file) {
			var formData = new FormData();
			
			this.setParamFormData(formData, file, false);
			
			return formData;
		},
		/**
		 * 여러 파일의 파라미터 만들기
		 */
		createParamFiles: function () {
			var formData = new FormData();
			var files = this.fileMap.array();
			
			for(var i=0, file; file=files[i]; i++)
				this.setParamFormData(formData, file, true, i);
			
			return formData;
		},
		createLayout: function () {
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
				
			if(fileUploadElement != null)
				this.addCustomEventListener(fileUploadElement, this.getConfig('event', 'file_upload'), this.uploadFile);
					
			this.callEventHandler('layout_create_after', { fileArea: fileArea, fileUploadElement: fileUploadElement });
				
		},
		////파일객체를 Blob객체로 새로이 생성 (파일 객체의 name속성은 불변 속성이므로 변경하기 위함)
		createNewFile: function (f, key) {
			var blob = new Blob([f], { type: f.type });

			blob.name = key;
			blob.lastModified = f.lastModified || 0;
			blob.lastModifiedDate = f.lastModifiedDate || 0;
			
			return blob;
		},
		//SFM가 생성될 때 내부적으로 사용할 id값 생성
		createElementId: function (option) {
			this.elementId = {};
			
			var getId = function(str, str2){
				return this.addSeparator(this.option.id, this.getConfig(str, str2));
			}.bind(this);
			
			this.elementId.item = getId('fix', 'item');
			this.elementId.fileArea = getId('fix', 'file_area');
			this.elementId.fileUpload = getId('fix','file_upload');
			this.elementId.fileRemove = getId('fix','file_remove');
			this.elementId.itemKeyArea = getId('fix','item_key_area');
			this.elementId.fileDownload = getId('fix','file_download');
			this.elementId.fileInputElement = getId('fix','input_file');
				
			Object.freeze(this.elementId);
			
		},
		downloadFile: function (e, itemId, f) {
			var item = this.getElement(itemId);
			var flag = true;
			var downloadUrl = this.getConfig('url', 'file_download');
				
			if( !this.callEventHandler('file_download_before') ) 	return;
				
			if(downloadUrl != null && this.trim(downloadUrl) != ''){
				this.ajax.post(downloadUrl, null, function () {
					console.log('success');
				}, function(){
					flag = false;
				})
			}
				
			if(!flag) return;
				
			this.callEventHandler('file_download_after');
		},
		//새 파일을 추가할 때 파일의 유효성 검사
		fileValidator: function (f) {
			var k = f.name;
			var extension = k.substring( k.lastIndexOf('.')+1, k.length );
			var permitExtensions = this.getConfig('file', 'file_extension');
			var exceptExtensions = this.getConfig('file', 'file_extension_except');
			
			//추가할 파일의 크기와 파일사이즈 속성값 비교
			if(f.size > this.getConfig('file', 'file_size')){
				alert(this.getConfig('message', 'file_size_max_overflow'));
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
		},
		/**
		 * config 객체의 속성을 반환하는 함수, config 속성의 접근을 한 곳에서 관리하기 위함
		 * @param ex) message의 file_delete속성을 가져올 때는 getConfig('message', 'file_delete') 와 같이 호출.
		 * @returns 인자로 넘긴 경로의 속성값
		 */
		getConfig: function () {
			var size = arguments.length;
			var prop = this.config;
			
			if(size == 0) return prop;
			
			for(var i=0, arg; arg=arguments[i]; i++){
				if(prop[arg] != null) prop = prop[arg];
			}
			
			return prop;
		},
		getElement: function (id) {
			return document.getElementById(id);
		},
		getFiles: function (data) {
			var fileGetListUrl = this.getConfig('url', 'file_get_list'); 
			
			this.ajax.get(fileGetListUrl, data, function (files) {
				this.addFile(files);
			});
		},
		//동일한 파일명이 존재할 때 (2), (3), (4).....를 붙임
		getItemKey: function (k) {
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
		},
		openInputFile: function (e) {
			var fileInputElement = this.getElement(this.elementId.fileInputElement);
			
			fileInputElement.click();
		},
		preventEvent: function (e) {
			e.stopPropagation();
			e.preventDefault();
		},
		removeFile: function (e, itemId, f) {
			
			if( !confirm(this.getConfig('message', 'file_delete')) ) return;
				
			var key = f.name;
			var item = this.getElement(itemId);
			var formData = this.createParamFile(f);
			var fileRemoveUrl = this.getConfig('url', 'file_remove');
			var response = null;
			var flag = true;
					
			if( !this.callEventHandler('file_remove_before', { key: key, file: f, item: item }) ) return; 
				
			if(fileRemoveUrl != null && this.trim(fileRemoveUrl) != ''){
				this.ajax.del(fileRemoveUrl, formData, function (res) {
					response = res;
				}, function () {
					flag = false;
				})
			}
				
			if(!flag) return;

			this.fileMap.remove(key);
			item.remove();
					
			this.callEventHandler('file_remove_after', {
				key: key,
				response: response,
				removedFile: f,
				removedItem: item,
			})
		},
		throwsException: function (msg, object) {
			if(object != null) 	console.log(object);
			throw msg;
		},
		trim: function (str) {
			return str.replace(/\s/gi, '');
		},
		uploadFile: function () {
			var formData = this.createParamFiles();
			var response = null;
			var flag = true;
			var fileUploadUrl = this.getConfig('url', 'file_upload');
				
			if( !this.callEventHandler('file_upload_before') ) return;
			
			if(fileUploadUrl != null && this.trim(fileUploadUrl) != ''){
				this.ajax.post(fileUploadUrl, formData, function (res) {
					response = res;
				}, function(){
					flag = false;
				})
			}
				
			if(!flag) return;
			
			this.callEventHandler('file_upload_after', { response: response });
		}
    }
	
	return SimpleFileManager;
}));

//method 'remove' polyfill [ie 9~]
(function (arr) {
	arr.forEach(function (item) {
		if (item.hasOwnProperty('remove')) {
			return;
		}
		Object.defineProperty(item, 'remove', {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function remove() {
				if (this.parentNode !== null)
					this.parentNode.removeChild(this);
			}
		});
	});
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);

if (!Array.prototype.includes) {
	  Object.defineProperty(Array.prototype, 'includes', {
	    value: function(searchElement, fromIndex) {

	      if (this == null) {
	        throw new TypeError('"this" is null or not defined');
	      }

	      // 1. Let O be ? ToObject(this value).
	      var o = Object(this);

	      // 2. Let len be ? ToLength(? Get(O, "length")).
	      var len = o.length >>> 0;

	      // 3. If len is 0, return false.
	      if (len === 0) {
	        return false;
	      }

	      // 4. Let n be ? ToInteger(fromIndex).
	      //    (If fromIndex is undefined, this step produces the value 0.)
	      var n = fromIndex | 0;

	      // 5. If n ≥ 0, then
	      //  a. Let k be n.
	      // 6. Else n < 0,
	      //  a. Let k be len + n.
	      //  b. If k < 0, let k be 0.
	      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

	      function sameValueZero(x, y) {
	        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
	      }

	      // 7. Repeat, while k < len
	      while (k < len) {
	        // a. Let elementK be the result of ? Get(O, ! ToString(k)).
	        // b. If SameValueZero(searchElement, elementK) is true, return true.
	        if (sameValueZero(o[k], searchElement)) {
	          return true;
	        }
	        // c. Increase k by 1. 
	        k++;
	      }

	      // 8. Return false
	      return false;
	    }
	  });
}
