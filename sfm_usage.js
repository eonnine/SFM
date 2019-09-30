/**
 * @Info 
 * SimpleFileManager의 사용법 가이드입니다. 이 파일은 읽기용이라 호출하시면 오류납니다.
 * 설명 내용 중 'option'은 각 인스턴스의 생성자 파라미터를 지칭합니다.
 */

/**
 * 서버측 DTO 예시
 */

import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public class FileDTO {
	/*
	 * config or option의 key에 설정한 키와 동일한 변수명이어야 함
	 */ 
	private int fileIdx;
	private String fileSeq;
	/*
	 * SFM: config or option의 file_parameter_name 속성값과 동일해야 함
	 * SFMGrid: option의 fileParameterName의 설정값과 동일해야 함
	 */ 
	private MultipartFile file; 
	/*
	 * SFM: config or option의 file_list_parameter_name 속성값과 동일해야 함
	 * SFMGrid: option의 listParameterName의 설정값과 동일해야 함
	 */ 
	private List<FileDTO> files; 
	
	public int getFileIdx() {
		return fileIdx;
	}
	public void setFileIdx(int fileIdx) {
		this.fileIdx = fileIdx;
	}
	public String getFileSeq() {
		return fileSeq;
	}
	public void setFileSeq(String fileSeq) {
		this.fileSeq = fileSeq;
	}
	public MultipartFile getFile() {
		return file;
	}
	public void setFile(MultipartFile file) {
		this.file = file;
	}
	public List<FileDTO> getFiles() {
		return files;
	}
	public void setFiles(List<FileDTO> files) {
		this.files = files;
	}
}


/**
 * *********************************
 * @Desc SimpleFileManager 기본 제공 함수 *
 * *********************************
 */
var simpleFileManger = new SFM({
	/*
	 * 필수 속성
	 * 파일 드랍존을 생성할 영역의 id
	 */
	id: 'dropzone' 
});

/*
 * props.url.file_get_list 에 정의한 url에서 파일목록을 가져옵니다.
 */ 
simpleFileManger.addFilesFromUrl();

/*
 * 현재 등록되어 있는 전체 파일목록을 가져옵니다.
 */
simpleFileManger.getFiles(); 

/*
 * upload url이 지정되어 있을 때 upload event를 트리거합니다.
 */ 
simpleFileManger.uploadFile(); 

/*
 * 현재 등록되어 있는 파일들 중 새로 등록된 파일들의 목록만 가져옵니다.
 */ 
simpleFileManger.getNewFiles(); 

/*
 * 현재 등록되어 있는 파일들을 전부 제거합니다.
 */
SimpleFileManager.clear();

/*
 * 등록되어 있는 파일들을 인자로 넘긴 formData객체에 추가한 뒤 반환합니다.
 * 인자로 formData를 넘기지 않는다면 파일 목록이 담긴 새 formData를 반환합니다.
 * 반환받은 formData를 서버로 요청하면 상단 예시 DTO 형태로 매핑됩니다.
 */ 
var formData = new FormData();
formData = simpleFileManger.getFileToFormData(formData); 

/*
 * 인자로 넘긴 formData객체에 새로 등록된 파일들만 추가한 뒤 반환합니다.
 * 인자로 formData를 넘기지 않는다면 파일 목록이 담긴 새 formData를 반환합니다.
 * 반환받은 formData를 서버로 요청하면 상단 예시 DTO 형태로 매핑됩니다.
 */ 
var newFileFormData = simpleFileManger.getNewFileToFormData();


/**
 * *********************************
 * @Desc SimpleFileManager 설정 및 초기화  *
 * *********************************
 *  아래는 SFM 생성시 모든 객체에 공통으로 적용될 기본값을 정의하는 함수입니다.
 *  변경하고자 할 때는 반드시 변경할 속성만 선언하세요.
 *  아무 설정도 하지 않았을 때, 아래와 같은 설정값으로 초기화됩니다.
 */
SFM.prototype.setConfig({
	//파일 table 구조에 맞게 선언. { 테이블 컬럼명: 타입[string, number], ... }
	//타입에 따라 서버로 전송되는 기본값이 달라짐. string => '', number => 0
	key: { fileIdx: 'number', fileSeq: 'number' }, 
	/**
	 * 파일 추가시 유효성 검사할 속성
	 */
	file: {
		file_size: '52428800', // 사이즈 제한, 50mb
		file_count: 0, // 등록 파일 개수 제한
  		file_extension: [], // 파일 등록 시 허용할 확장자 (여기 선언된 확장자만 허용함)
  		file_extension_except: [], // 파일 등록 시 제외할 확장자 (여기서 설정한 확장자의 파일은 등록하지 않음)
		file_parameter_name: 'file', //단건 파일 파라미터 기본 키값, 여러 SFM객체별로 다르게 지정하여 한 DTO로 바인딩할 수 있음.
		file_list_parameter_name: 'files', // 다중 파일 파리미터 기본 키값, 여러 SFM객체별로 다르게 지정하여 한 DTO로 바인딩할 수 있음.
	},
	/**
	 * SFM에서 사용되는 메세지
	 */
	message: {
		file_remove: '삭제하시겠습니까?',
		file_already_exist: '동일한 이름의 파일이 이미 등록되어 있습니다',
		file_size_max_overflow: '허용된 크기(50mb)보다 용량이 큰 파일입니다',
		file_count_over: '허용된 개수를 초과합니다',
		file_extension: '허용된 확장자가 아닙니다',
		file_extension_except: '허용된 확장자가 아닙니다',
		file_get_error: '파일 목록을 불러오는 도중 에러가 발생했습니다',
		file_upload_error: '파일 업로드 도중 에러가 발생했습니다',
		file_remove_error: '파일 삭제 도중 에러가 발생했습니다',
		file_download_error: '파일 다운로드 도중 에러가 발생했습니다',
		file_upload_is_ing: '업로드 중입니다',
		file_remove_is_ing: '삭제 중입니다',
		file_download_is_ing: '다운로드 중입니다',
	},
	/**
	 * SFM 전체 레이아웃 폼 속성
	 * SFM 객체 생성시 기본적으로 생성되는 바탕 폼
	 * @Param fileAreaId SFM 바탕 폼 겍체에 주는 ID
	 * @Param fileUploadId file upload 이벤트를 실행할 요소에 주는 ID
	 */
	layout: function (fileAreaId, fileUploadId) {
		/*
		 * fileAreaId가 부여된 요소를 layout 객체로 인식하고 그 내부의 요소는 기본 메세지로 간주합니다.
		 * 파일매니저의 파일 목록이 없을 때 최초 파일이 추가되면 기본 메세지 요소는 비워집니다.
		 * 반대로 파일 삭제 후 남은 파일 목록이 없다면 기본 메세지 요소가 다시 나타납니다. 
		 */ 
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
	 * SFM을 사용할 때 발생하는 이벤트 훅
	 * eventHandler는 다른 속성들과 다르게 setConfig에서 정의한 훅과 SFM 객체별로 option에서 정의한 훅이 각각 실행됩니다.
	 * 즉 이벤트핸들러를 덮어쓰는 개념이 아니고 추가하는 개념.
	 * setCofig에서 정의한 훅이 먼저 실행되고 option에서 정의한 훅이 나중에 실행된다.
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
			 * fileArea영역에 드래그할 때, 커서가 내부로 들어오면 실선, 벗어나면 점선이 되도록 클래스 조작
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
		},
		file_upload_after: function (param) {
			// param.response 업로드 요청에 대해 받은 응답 객체
		},
		file_remove_before: function (param) {
			// param.file 삭제될 파일
			// param.item 삭제되는 파일의 폼
		},
		file_remove_after: function (param) {
			// param.response 삭제 요청에 대해 받은 응답 객체
		},
		file_download_before: function (param) {
			// param.file 다운로드될 파일
			// param.item 다운로드되는 파일의 폼
		},
		file_download_after: function () {
		}	
	}
});


/**
 * *******************************************
 * @Desc SimpleFileManagerForGrid 기본 제공 함수       *
 * 그리드용이며 현재는 row : file (1:1) 관계만 고려되어 있습니다.*
 * 위 config 설정과는 전혀 관련없습니다.                            *
 * *******************************************
 */
var simpleFileMangerForGrid = new SFMGrid({ 
	/*
	 * AUIGrid의 경우 rowIdField로 정의한 컬럼명
	 * rowIdField를 지정하지 않았다면 _$uid 값으로 설정하면 됩니다. 
	 */
	rowIdColumn: 'dropzone',
	/*
	 *  DTO의 List<**DTO> 타입인 propertyName
	 *  ex) 상단 예시 DTO의 files
	 */
	listParameterName: 'dataList', 
	/*
	 *  DTO의 MultipartFile 타입인 propertyName
	 *  ex) 상단 예시 DTO의 file
	 */
	fileParameterName: 'file' 
});

var tempKey = 'AUIGrid인 경우 rowIdField의 값, rowIdField를 지정하지 않았다면 _$uid 값';

/*
 * 파일을 키값과 함께 저장합니다.
 */ 
simpleFileMangerForGrid.set(tempKey, '등록한 file 객체');

/*
 * set했던 파일 정보를 가져옵니다.
 */ 
simpleFileMangerForGrid.get(tempKey); 

/*
 * 저장한 파일을 삭제합니다.
 */ 
simpleFileMangerForGrid.remove(tempKey); 

/*
 * 저장한 파일을을 전부 삭제합니다.
 */ 
simpleFileMangerForGrid.clear(); 

/*
 * 인자로 넘긴 그리드 데이터 객체와 저장되어있는 파일을 키값으로 매칭하여 formData 형식으로 변환합니다.
 * 반환받은 formData를 서버로 요청하면 상단 예시 DTO 형태로 매핑됩니다.
 */
var gridItem = 'AUIGrid의 경우 한 row의 item 객체';
var formData = simpleFileMangerForGrid.getFormDataFromObject(gridItem); 

/*
 * 인자로 넘긴 그리드 데이터 배열과 저장되어있는 파일들을 키값으로 매칭하여 formData 형식으로 변환합니다.
 * 반환받은 formData를 서버로 요청하면 상단 예시 DTO 형태로 매핑됩니다.
 */ 
var gridDataArray = 'AUIGrid의 경우 row item의 배열 ex) AUIGrid.getGridData() 함수의 반환값';
var formData = simpleFileMangerForGrid.getFormDataFromArray(gridDataArray);
