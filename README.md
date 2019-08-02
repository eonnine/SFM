# SFM

##### 테이블 구조와 CSS의 의존성을 제거한 파일 업로드 모듈을 만들어 보고 싶어 개발.

*configuration은 default_config.js 에서 확인*

```
@DTO
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
```

 ```		javascript
@html
	<div id='dropzone'></div>
@script 
	// setConfig에서 설정한 공통 속성 중 따로 사용하고 싶을 때 option 객체 설정
	var dropzone = new SFM({
	id: 'dropzone'  //필수
	url: {
		file_get_list: '/test/getFileList.sample'
	}
	event: {
		file_upload: 'click''
	}
	...
 });
```