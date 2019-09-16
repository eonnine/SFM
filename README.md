# SFM

##### 테이블 구조와 CSS의 의존성을 제거한 파일 업로드 모듈을 만들어 보고 싶어 개발.

*configuration 및 자세한 사용법은 sfm_usage.js 에서 확인*

 ```javascript
@html
	<div id='dropzone'></div>
@script 
	// setConfig에서 설정한 공통 속성 중 따로 사용하고 싶을 때 option 객체 설정
	var dropzone = new SFM({
	  id: 'dropzone', // 필수
	  url: {
	    file_get_list: '/test/getFileList.sample'
	  },
	  event: {
	    file_upload: 'click
	  },
	  ...
    });
```

 ```javascript
@script 
	// 생성자 파라미터 설정
	var dropzone = new SFMGrid({
	rowIdColumn: '_$uid', // 필수
	listParameterName: 'files' // 필수
	fileParameterName: 'file' // default: 'file'
 });
```
