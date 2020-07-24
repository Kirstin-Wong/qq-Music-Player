(function (window){
    function Lyric(path) {
        return new Lyric.prototype.init(path)
    }
    Lyric.prototype = {
        constructor: Lyric,
        init: function (path) {          
            this.path = path; 
        },
        loadLyric: function (callBack) {
            var $this = this
            $.ajax({
                url: $this.path,
                dataType:"text",
                success: function (data) {               
                    // console.log(data)
                    $this.parseLyric(data);
                    callBack();
                },
                error: function (e) {
                    console.log(e);
                }
    
            })
        },
        times: [],
        lyrics: [],
        index : -1,
        parseLyric: function (data) {
            var $this = this;
            $this.times = [];
            $this.lyrics = [];
            // console.log(data) 文本类型
            var array = data.split('\n');
            var timeReg = /\[(\d*:\d*\.\d*)\]/;
            $.each(array, function (index, ele) {
                // 排除歌词              
                var lrc = ele.split(']')[1];
                if(lrc.length == 1) return true;
                $this.lyrics.push(lrc)
                // console.log(array)
                var res = timeReg.exec(ele); // 找到匹配文本 返回数组
                if(res == null) return true;
                // console.log(res)
                var timeStr = res[1]; // 00:00.92
                // console.log(timeStr)
                var res2 = timeStr.split(':');
                // console.log(res2)
                var min = parseInt(res2[0]) * 60;
                var sec = parseFloat(res2[1]);
                var time = parseFloat(Number(min + sec).toFixed(2));
                $this.times.push(time);     
            })
        },
        currentIndex: function (currentTime) {
            if(currentTime >= this.times[0]) {
                this.index ++;
                this.times.shift();
            }
            return this.index;
        }     
    }
    Lyric.prototype.init.prototype = Lyric.prototype
    window.Lyric = Lyric;
})(window)