 /**
 * ****************************
 * @Desc SimpleFileManager 초기화 *
 * ****************************
 *  아래는 SFM 생성시 모든 객체에 공통으로 적용될 기본값을 정의하는 함수입니다.
 *  변경하고자 할 때는 반드시 변경할 속성만 선언하세요.
 *  아래는 초기 설정값입니다.
 */
SFM.prototype.setConfig({
	//파일 table 구조에 맞게 선언. { 테이블 컬럼명: 타입[string, number], ... }
	//타입에 따라 서버로 전송되는 기본값이 달라짐. string => '', number => 0
	key: { fileIdx: 'number', fileSeq: 'number' }, 
	/**
	 * 파일 추가시 유효성 검사할 속성
	 */
	file: {
		file_size: '52428800', // 사이즈 제한
		file_count: 0, // 파일 개수 제한
  	file_extension: [], // 허용할 확장자
  	file_extension_except: [], // 제외할 확장자
		file_parameter_name: 'file', //단건 파일 파라미터 기본 키값 
		file_list_parameter_name: 'files', // 다중 파일 파리미터 기본 키값
	},
	/**
	 * SFM에서 사용되는 메세지
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
	/**
	 *	SFM 전체 레이아웃 폼 속성
	 * SFM 객체 생성시 기본적으로 생성되는 바탕 폼
	 * @Param fileAreaId SFM 바탕 폼 겍체에 주는 ID
	 * @Param fileUploadId file upload 이벤트를 실행할 요소에 주는 ID
	 */
	layout: function (fileAreaId, fileUploadId) {
		return '<fieldset><button id="'+fileUploadId+'" style="float:right; position:relative; bottom:13px;">upload</button><div id="'+fileAreaId+'" style="z-index:1;" width="100%" height="100%" default-class-dropzone><p dropzone-file-area-message></p></div></fieldset>';
	},
	/**
	 * SFM 반복부 속성
	 * 파일을 추가할 때마다 해당 속성으로 정의된 폼이 추가됨
	 * @Param file 추가된 파일 폼에 해당하는 파일 객체
	 * @param fileRemoveId 이 파일의 다운로드 이벤트를 실행할 요소에 주는 ID 
	 * @param fileDownloadId 이 파일의 삭제 이벤트를 실행할 요소에 주는 ID
	 */
	item: function (file, fileRemoveId, fileDownloadId) {
		return '<span style="z-index:10;"><p>&nbsp;&nbsp;<b id="'+fileDownloadId+'" style="width:12px; height:12px; margin-left:5px; font-size:12px; cursor:pointer;">▼</b>&nbsp;file: <strong>' + file.name + '</strong>&nbsp;&nbsp;&nbsp;type: <strong>' + file.type + '</strong>&nbsp;&nbsp;&nbsp;size: <strong>' + file.size + '</strong>bytes<data style="display:none;"></data><b style="width:12px; height:12px; margin-left:5px; font-size:12px; cursor:pointer;" id="'+fileRemoveId+'">X</b></p></span>';
	},
	/**
	 * 파일 목록 가져오기, 업로드, 삭제, 다운로드 url 속성
	 * ex) getFiles 시 file_get_list에 지정된 url로 요청함
	 */
	url: {
		file_get_list: '',
		file_upload: '',
		file_remove: '',
		file_download: '',
	},
	/**
	 * layout, item에서 각 업로드, 삭제, 다운로드의 id를 지정한 요소의 트리거 이벤트 설정
	 * ex) fileAreaId 가 지정된 요소를 클릭하면 업로드 이벤트 트리거
	 */
	event: {
		file_upload: 'click',
		file_remove: 'click',
		file_download: 'click',
	},
	/**
	 * SFM hooks
	 * SFM 을 사용할 때 발생하는 이벤트들의 훅
	 * 	@Prop layout_create_after layout 속성에 정의한 바탕 폼이 생성된 후 실행.
	 * 	@Prop file_upload_before upload 실행 직전 실행. false를 리턴하면 업로드 중지.
	 * 	@Prop file_upload_after upload 실행 후에 실행.
	 * 	@Prop file_remove_before file 삭제 직전 실행. false를 리턴하면 삭제 중지.
	 * 	@Prop file_remove_after file 삭제 후에 실행.
	 * 	@Prop file_download_before file 다운로드 직전 실행. false를 리턴하면 다운로드 중지.
	 * 	@Prop file_download_after file 다운로드 후에 실행.
	 */
	eventHandler: {
		layout_create_after: function (param) {
			// fileArea 파일 바탕 폼 객체 
			// fileUploadElement 파일 업로드 ID가 부여된 요소 객체
			
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
		file_upload_before: function () {
			console.log('uploadStart');
		},
		file_upload_after: function (param) {
			// param.response 업로드 요청에 대해 받은 응답 객체
			console.log('uploadEnd');
		},
		file_remove_before: function (param) {
			// param.file 삭제될 파일
			// param.item 삭제되는 파일의 폼
			console.log('removeStart');
		},
		file_remove_after: function (param) {
			// param.response 삭제 요청에 대해 받은 응답 객체
			console.log('removeEnd');
		},
		file_download_before: function (param) {
			// param.file 다운로드될 파일
			// param.item 다운로드되는 파일의 폼
			console.log('downloadStart');
		},
		file_download_after: function () {
			console.log('downloadEnd');
		}	
	}
});

