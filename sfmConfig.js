SFM.prototype.setConfig({
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
		file_default: '파일을 여기에 드래그하거나 클릭하세요',
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
		return '<fieldset><button id="'+fileUploadId+'" style="float:right; position:relative; bottom:13px;">upload</button><div id="'+fileAreaId+'" style="z-index:1;" width="100%" height="100%" default-class-dropzone><p>파일을 여기에 드래그하거나 클릭하세요</p></div></fieldset>';
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
});