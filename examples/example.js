var F = FrameBox;
var body = document.getElementsByTagName('body')[0];
var add = function(text){
	body.innerHTML+='<pre>\n'+text+'\n<pre>';
}
var slice = Array.prototype.slice;

F.setup(
	//['iframe.html','iframe.html']
	// or
	// {'main':'iframe.html'}
	// or
	slice.call(document.querySelectorAll('iframe'))
,	{
		'writeDashes': function(props,parts){
			add('----' + props + '-----')
		}
	,	'writeLowDash/:optional?': function(props,parts){
			add(this.id+':_' + JSON.stringify(props) + '_ optional: ' + parts['optional'] )
		}
	,	'changeSize':function(callback,parts){
			var parent = this.parent.window;
			var frame = this.window;
			var size = function(){
				//complex code to get internal size of iframe here
				callback(200,400);
			}
			size();
		}
})
.on('writePercents',function(props){

	add('Only on window 0: '+props)

},'0');

setTimeout(function(){
	F.trigger('writeDashes','this will print in all windows')
	F.trigger('writeDashes','this will also print in all windows','*')
	F.trigger('writeDashes','this will print in window 2','1')
	F.trigger('writePercents','some string')
	F.trigger('writeLowDash/something',{a:'1',b:'2'});
	F.trigger('writeLowDash',{a:'3',b:'5'},'0');
},500);

if(F.isParent()){
	window.onresize = function(e){
		F.trigger('changeSize',function callback(width,height){
			//resize the iframe here
			console.log('resized iframe to '+width+'x'+height);
		})
	}
}