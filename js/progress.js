(function (window){
    function Progress($progressBar, $progressLine, $progressDot) {
        return new Progress.prototype.init($progressBar, $progressLine, $progressDot)
    }
    Progress.prototype = {
        constructor: Progress,
        isMove: false,
        init: function ($progressBar, $progressLine, $progressDot) {
            this.$progressBar = $progressBar;
            this.$progressLine = $progressLine;
            this.$progressDot = $progressDot;
        },
        progressClick: function (callBack) {
            var $this = this;
            this.$progressBar.click(function (event) {
                var normalLeft = $(this).offset().left;
                var eventLeft = event.pageX;
                $this.$progressLine.css("width", eventLeft - normalLeft);
                $this.$progressDot.css("left", eventLeft - normalLeft);
                var value = (eventLeft - normalLeft) / $(this).width();
                callBack(value)
            })
        },
        progressMove: function (callBack) {
            var $this = this;  
            var normalLeft = this.$progressBar.offset().left;
            var eventLeft;        
            // 1. 监听鼠标按下
            this.$progressBar.mousedown(function () {  
                
                // 2. 监听鼠标拖动        
                $(document).mousemove(function () {  
                    $this.isMove = true; 
                    eventLeft = event.pageX;
                    var subLeft = eventLeft - normalLeft;
                    if(subLeft < 0) {
                        $this.$progressLine.css("width", 0);
                        $this.$progressDot.css("left", 0);
                    }else if(subLeft > $this.$progressBar.width()){
                        $this.$progressLine.css("width", $this.$progressBar.width());
                        $this.$progressDot.css("left", $this.$progressBar.width());
                    }else{
                        $this.$progressLine.css("width", subLeft);
                        $this.$progressDot.css("left", subLeft);
                    }          
                })
            })           
            // 3. 监听鼠标抬起
            $(document).mouseup(function () {               
                $(document).off('mousemove')   
                $this.isMove = false          
                var value = (eventLeft - normalLeft) / $this.$progressBar.width();
                callBack(value)       
            })
        },
        setProgress: function (value) {
            if(this.isMove) return;
            if(value < 0 || value > 100) return 
            this.$progressLine.css({
                width: value + "%"
            });
            this.$progressDot.css({
                left: value+"%"
            })
        }
    }
    Progress.prototype.init.prototype = Progress.prototype
    window.Progress = Progress;
})(window)