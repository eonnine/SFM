
/***********
 *  @Method setConfig @ParamType Object    @Desc SFM 환경을 설정한다. SFM의 공통 속성 정의 함수이며 SFM의 속성을 정의. 아래 예시 참고 
 *  			   getFiles   @ParamType formData @Desc url.file_get_list 에 정의한 url에서 파일 데이터 배열을 가져옴
 * 
 *  @Constructor option 객체, setConfig를 통해 정의된 공통 속성을 재정의함. ( 재정의 불가 속성 : 'eventHandler', 'fix', 'key' )
 *  
 * ********
 *  @Desc *
 * ********
 *   @DTO
		import java.util.List;
		import org.springframework.web.multipart.MultipartFile;
		
		public class FileDTO {
		
			private int fileIdx; //속성 key에 설정한 키값들을 추가
			private String fileSeq;
			private MultipartFile file; //속성 file_parameter_name의 설정값과 동일해야 함
			private List<FileDTO> files; //속성 file_list_parameter_name의 설정값과 동일해야 함
			
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
 *		
 *   @html ex) <div id='dropzone'></div>
 *   
 *   @script 
 *   			//setConfig에서 설정한 공통 기본값을 재정의하여 사용하고 싶다면 option 객체 설정. 'fix', 'key'를 제외하고 설정 가능
 *   			var option = {
 *					id: 'dropzone'  //필수
 *					url: {
 *						file_get_list: '/test/getFileList.te'
 *					}
 *					event: {
 *						file_upload: 'dblclick'
 *					}
 *	 			 }
 *   			var sfm = new SFM(option);
 *   
 *   
 *  
 *   ********************
 *   @Desc SFM 환경설정 예시 *
 *   ********************
 *  아래는 SFM 생성시 적용될 기본값을 정의되는 함수입니다. 반드시 변경할 속성만 선언하세요.
 */
SFM.prototype.setConfig({
	/**
	 * setConfig에서만 설정가능, , { dto의 프로퍼티명 : dto의 프로퍼티 타입}, ( 타입별 기본값 : string -> '', number -> 0 ) 
	 */
	key: {fileIdx: 'number', fileSeq: 'string'},
	/**
	 * setConfig에서만 설정가능, 전역으로 사용하게 될 고정 값 설정, 꼭 필요한 경우가 아니면 재정의 하지 않는 것을 권장함
	 */
	fix: { 
  		/**
  		 * 반복되는 파일 html의 id 삽입자
  		 */
  		item: 'item',
  		/**
  		 * 파일 반복부의 id 삽입자
  		 */
  		item_area: 'file-area',
  		/**
  		 * 각 파일의 키를 담을 element가 생성되는 영역의 id 삽입자
  		 */
		item_key_area:'item-key-area',
		/**
		 * 업로드 element id의 삽입자
		 */
		file_upload: 'upload-file',
		/**
		 * 삭제 element id의 삽입자
		 */
		file_remove: 'remove-file',
		/**
		 * 다운로드 download id의 삽입자
		 */
		file_download: 'download-file',
		/**
		 * 숨겨진 input file의 id 삽입자
		 */
		input_file: 'input-file',
	},
	file: {
		/**
		 * 업로드 가능한 최대 파일 사이즈 (기본값: 50mb)
		 */
	  	file_size: '52428800',
	  	/**
	  	 * 이 파일 확장자들만 업로드가 가능합니다. 기본값 : 제한없음
	  	 */
	  	file_extension: [],
	  	/**
	  	 * 이 파일 확장자들은 업로드가 불가능합니다. 기본값 : 제외없음
	  	 */
	  	file_extendsion_except: [],
	  	/**
	  	 * 서버로 파일 데이터를 보낼 때 사용될 requestParameter의 keyString
	  	 * 상단의 DTO구조 참고
	  	 */
  		file_parameter_name: 'file',
	  	/**
	  	 * 서버로 파일 목록 데이터를 보낼 때 사용될 requestParameter의 keyString
	  	 * 상단의 DTO구조 참고
	  	 */
  		file_list_parameter_name: 'files',
	},
	/**
	 * SFM의 알림 메시지
	 */
	message: {
		file_delete: '삭제하시겠습니까?',
		file_size_max_overflow: '허용된 크기(50mb)보다 용량이 큰 파일입니다',
	},
	/**
	 * SFM 파일 업로드 레이아웃
	 */ 
	layout: function (data) {
		return '<fieldset><button id="'+data.fileUploadId+'" style="float:right; position:relative; bottom:13px;">upload</button><div id="'+data.fileAreaId+'" style="z-index:1;" fileDragArea><p dropzone-file-area-message></p></div></fieldset>';
	},
	/**
	 * 레이아웃 내부에서 반복될 파일 html
	 */
	item: function (data) {
		return '<span dropzone-file-row style="z-index:10;"><p>&nbsp;&nbsp;<b id="'+data.fileDownloadId+'" style="width:15px; height:15px; margin-left:5px; font-size:15px; cursor:pointer;">▼</b>&nbsp;file: <strong>' + data.file.name + '</strong>&nbsp;&nbsp;&nbsp;type: <strong>' + data.file.type + '</strong>&nbsp;&nbsp;&nbsp;size: <strong>' + data.file.size + '</strong>bytes<data style="display:none;"></data><b style="width:10px; height:10px; margin-left:5px; font-size:10px; cursor:pointer;" id="'+data.fileRemoveId+'">X</b></p></span>';
	},
	/**
	 * url 설정
	 */
	url: {
		/**
		 * getFiles 함수를 호출하여 파일 목록을 불러올 때 사용할 url
		 */ 
		file_get_list: '',
		file_upload: '/scm/getExistFiles2.mims',
		file_remove: '/scm/getExistFiles2.mims',
		file_download: '',
	},
	/**
	 * event 설정
	 */
	event: {
		/**
		 * fileUploadId가 설정된 element가 어느 event에서 업로드를 트리거할 지 정함
		 */
		file_upload: 'click',
		/**
		 * fileRemoveId가 설정된 element가 어느 event에서 삭제를 트리거할 지 정함
		 */
		file_remove: 'click',
		/**
		 * fileDownloadId가 설정된 element가 어느 event에서 삭제를 트리거할 지 정함
		 */
		file_download: 'click',
	},
	eventHandler: {
		/**
		 * layout이 생성된 직후의 이벤트 핸들러
		 * @arguments fileArea 파일 반복부 영역 element
		 * 					   fileUploadElement fileUploadId가 id로 부여된 element
		 */ 
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
		/**
		 * 파일 업로드 하기 직전의 이벤트 핸들러, false를 리턴할 경우 업로드 취소
		 */
		file_upload_before: function () {
			console.log('uploadStart');
		},
		/**
		 * 파일 업로드가 완료된 후의 이벤트 핸들러
		 * @arguments response 업로드 후 응답받은 response 객체
		 */
		file_upload_after: function (data) {
			console.log('uploadEnd');
		},
		/**
		 * 파일을 삭제하기 전의 이벤트 핸들러, false를 리턴할 경우 삭제 취소
		 * @arguments key 삭제할 파일의 key값
		 * 					   file 삭제할 파일 객체
		 * 					   item 삭제할 파일의 element 
		 */		
		file_remove_before: function (data) {
			console.log('removeStart');
		},
		/**
		 * 파일 삭제가 완료된 후의 이벤트 핸들러
		 * @arguments key 삭제할 파일의 key값
		 * 					   response 업로드 후 응답받은 response 객체
		 * 					   file 삭제할 파일 객체
		 * 					   item 삭제할 파일의 element 
		 */		
		file_remove_after: function (data) {
			console.log('removeEnd');
		},
		/**
		 * 파일 다운로드가 시작되기 전의 이벤트 핸들러, false를 리턴할 경우 다운로드 취소
		 */ 
		file_download_before: function () {
			console.log('downloadStart');
		},
		/**
		 * 파일 다운로드가 시작된 후의 이벤트 핸들러
		 */
		file_download_after: function (data) {
			console.log('downloadEnd');
		}	
	}
});

