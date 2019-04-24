
/**
 * ********************
 * DoublyLinkedHashMap *
 * (이중 연결 해쉬맵)            *
 * ********************
 * Develope by Eongoo 2019-04-10
 */
function DoublyLinkedHashMap () {
	this.head = null
	this.tail = null
	this.map = {}
	this.length = 0
}

DoublyLinkedHashMap.prototype = {
		clear: function () {
			this.head = null
			this.tail = null
			this.map = {}
			this.length = 0
		},
		get: function (k) {
			var item = this.map[k] || {}
			return item.value
		},
		/**
		 * index에 해당하는 값을 리턴
		 */
		getByIndex: function (index) {
			var item = this.getItemByIndex(index)
			return item.value
		},
		/**
		 * key에 해당하는 인덱스를 리턴
		 */ 
		getIndexByKey: function (k) {
			var item = this.getItemByKey(k)
			return item.index
		},
		/**
		 * key에 해당하는 데이터를 리턴
		 * @data index, key, value
		 */
		getItemByKey: function (k) {
			var result = null
			
			this.each(function (i, item) {
				if(k == item.key){
					result = { 
									index: i, 
									key: item.key, 
									value: item.value, 
								}
					return false
				}
			})
			
			return result
		},
		/**
		 * index에 해당하는 데이터를 리턴
		 * @data index, key, value
		 */
		getItemByIndex: function (index) {
			var result = null
			
			this.each(function (i, item) {
				if(index == i){
					result = { 
									index: i, 
									key: item.key, 
									value: item.value 
								}
					return false
				}
			})
			
			return result
		},
		/**
		 * Map에 key를 가진 데이터가 있는지 여부 확인
		 * @return boolean 
		 */
		isContainsKey: function (k) {
			return ( this.map[k] != null ) ? true : false
		},
		/**
		 * Map에 데이터 삽입
		 */
		put: function (k, v) {
			this.remove(k)
	
			var item = {
				key: k,
				value: v,
				prev: this.tail,
				next: null,
			}
	
			this.map[k] = item
			
			if(this.length == 0)
				this.head = item
		
			if(this.tail)
				this.tail.next = item
		
			this.tail = item
			
			this.length += 1
		},
		/**
		 * key에 해당하는 데이터를 삭제
		 */
		remove: function (k) {
			if(this.map[k] == null) 
				return

			var item = this.map[k]
			
			if(this.head === item){
				if(item.next != null)
					item.next.prev = null
			
					this.head = item.next
				}
			
			if(this.tail === item){
				if(item.prev != null)
					item.prev.next = null
			
					this.tail = item.prev
				}
			
			if(item.next != null)
				item.next.prev = item.prev
		
			if(item.prev != null)
				item.prev.next = item.next
			
			delete this.map[k]
			
			this.length -= 1
		},
		/**
		 * Map을 삽입한 순서대로 반복 실행
		 * @callBackParam index, data
		 */
		each: function (callBack) {
			var 
				 i = 0
				,len = this.length
				,item = this.head
				,param = null
				
			while( i < len ){
				
				param = {
					key: item.key,
					value: item.value,
				}
				
				callBack(i, param)
				
				item = item.next
				
				i++
				
			}
		},
		/**
		 * Map을 삽입한 역순으로 반복 실행
		 * @callBackParam index, data
		 */
		eachRvs: function (callBack) {
			var 
				 i = this.length
				,item = this.tail
				,param = null
				
			while( i > 0 ){
				
				param = {
						key: item.key,
						value: item.value,
				}
				
				callBack(i, param)
				
				item = item.prev
				
				i--
				
			}
		},
		/**
		 * Map을 삽입한 순서의 array로 변환하여 리턴
		 */
		array: function(){
			var array = []
			
			this.each(function (i, item) {
				array.push(item.value)
			})
			
			return array
		},
		/**
		 * Map을 삽입한 역순의 array로 변환하여 리턴
		 */
		arrayRvs: function(){
			var array = []
			
			this.reverseEach(function (i, item) {
				array.push(item.value)
			})
			
			return array
		}
};
