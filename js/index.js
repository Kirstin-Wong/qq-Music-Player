$(function () {
    // 1.定义变量
    $('.music').mCustomScrollbar();
    var $musicList = $('.music_list');
    var $audio = $('audio');
    var player = new Player($audio);
    var progress;
    var voiceProgress;
    var lyric;

    // 2. 加载歌曲信息
    getPlayerList();
    function getPlayerList() {
        $.ajax({
            url: "source/musiclist.json",
            dataType: "json",
            success: function (data) {               
                // 找到被插入元素 写在外面只查找一次性能更好
                player.musicList = data;
                // 遍历数据 创建音乐
                $.each(data, function (index, music) {
                    var $item = createMusicItem(index, music);                   
                    $musicList.append($item);
                });
                initMusicInfo(data[0]);
                initLyricInfo(data[0]);
            },
            error: function (e) {
                console.log(e);
            }

        })
    }

    // 3. 初始化进度条
    initProgress()
    function initProgress() {
        var $progressBar = $('.pro');
        var $progressLine = $('.pro .progress_line');
        var $progressDot = $('.pro .progress_point');
        progress = new Progress($progressBar, $progressLine, $progressDot);
        progress.progressClick(function (value) {
            player.musicSeekTo(value)
        });
        progress.progressMove(function (value) {
            player.musicSeekTo(value)
        });
        // 音量
        var $voiceBar = $('.column_control');
        var $voiceLine = $('.column_line');
        var $voiceDot = $('.column_point');
        voiceProgress = new Progress($voiceBar, $voiceLine, $voiceDot);
        voiceProgress.progressClick(function (value) {
            player.musicVoiceSeekTo(value)
        });
        voiceProgress.progressMove(function (value) {
            player.musicVoiceSeekTo(value)
        });
    }
   
    // 4. 初始化歌曲信息
    function initMusicInfo(music) {
        //获取对应的元素
        var $musicImage = $('.song_info_pic img');
        var $musicName = $('.song_info_name a');
        var $musicSinger = $('.song_info_singer a');
        var $musicAlbum = $('.song_info_album a');
        var $musicProgressName = $('.progress_info_title');
        var $musicProgressTime = $('.progress_info_time');
        var $musicBg = $('.mask_bg');

        //给获取到的元素赋值
        $musicImage.attr("src", music.cover);
        $musicName.text(music.name);
        $musicSinger.text(music.singer);
        $musicAlbum.text(music.album);
        $musicProgressName.text(music.name +" - "+ music.singer);
        $musicProgressTime.text("00:00 / "+ music.time);
        $musicBg.css("background", "url('"+music.cover+"')")
    }

    // 5. 初始化歌词信息
    function initLyricInfo(music) {
        lyric = new Lyric(music.link_lrc);
        var $lyricContainer = $('.song_lyric')
        $lyricContainer.html("");
        lyric.loadLyric(function () {
            $.each(lyric.lyrics, function (index, ele) {
                var $item = $('<li>'+ele+'</li>');
                $lyricContainer.append($item);
            })
        });
    }
    // 6. 初始化监听事件
    initEvents();
    function initEvents() {
        // 6.1 监听复选框
        $musicList.delegate(".checkbox", "click", function () {
            $(this).toggleClass("checked");
            if($(this).attr('class').indexOf("checked") != -1) {
                $(this).css("opacity", "1");
            }else{
                $(this).css("opacity", ".5");
            }
        });
        $('.header .checkbox').click(function () {
            $('.checkbox').toggleClass("checked");
            if($(this).attr('class').indexOf("checked") != -1) {
                $('.checkbox').css("opacity", "1");
            }else{
                $('.checkbox').css("opacity", ".5");
            }
        })

        // 6.2 监听子菜单播放按钮监听 用事件委托 因为是动态创建的
        $musicList.delegate(".list_music_play", "click", function () {
            var $item = $(this).parents('.music_list_item')
            // 清除兄弟样式
            $(this).parents('.music_list_item').siblings().find('.list_music_play').removeClass('list_music_play2')
            // 设置自己样式
            $(this).toggleClass('list_music_play2')
            // 底部播放区域
            if($(this).attr('class').indexOf('list_music_play2') != -1) {
                // 当前是播放
                $('.play_now').addClass('play_now2')
            }else{
                // 当前是暂停
                $('.play_now').removeClass('play_now2')
            }
            // 文字高亮
            $item.find('.song').css('color', "#fff")
            $item.find('.singer').css('color', "#fff")
            // 文字高亮排他
            $item.siblings().find('.song').css('color', "rgba(255,255,255,.5)")
            $item.siblings().find('.singer').css('color', "rgba(255,255,255,.5)")
            // 波浪
            $item.find('.number').toggleClass('number2')
            $item.siblings().find('.number').removeClass('number2')
            // 播放音乐
            player.playMusic($item.get(0).index, $item.get(0).music)
            initMusicInfo($item.get(0).music);
            initLyricInfo($item.get(0).music);
            $('.progress_info_time').text($item.get(0).time)
            $('.music_fav').removeClass('music_fav2')
            if($item.attr('class').indexOf('isCollected') != -1){
                console.log('a')
                $('.music_fav').addClass('music_fav2')
            }
        })

        // 6.3 监听底部控制区域
        $('.play_now').click(function () {
            if(player.currentIndex == -1){
                $('.music_list_item').eq(0).find('.list_music_play').trigger('click')
            }else{
                $('.music_list_item').eq(player.currentIndex).find('.list_music_play').trigger('click')
            }
        });
        // 6.4 监听上一首
        $('.play_last').click(function () {   
            $('.music_list_item').eq(player.preIndex()).find('.list_music_play').trigger('click')
        });
        // 6.5 监听下一首
        $('.play_next').click(function () {
            $('.music_list_item').eq(player.nextIndex()).find('.list_music_play').trigger('click')
        });
        // 6.6 监听删除按钮
        $musicList.delegate(".list_music_del", "click", function () {
            var $item = $(this).parents('.music_list_item');
            // 判断是否在播放 如果正在播放 触发下一首播放按钮
            if($item.get(0).index  == player.currentIndex){
                $('.play_next').trigger('click');
            }
            // 在页面上删除
            $item.remove();
            // 在获取到的列表中删除
            player.changeMusic($item.get(0).index)
            // 排序
            $('.music_list_item').each(function (index, ele) {
                // 改变原生属性
                ele.index = index;
                // 改变页面上的顺序
                $(ele).find(".number").text(index + 1);
            })
        });

        // 6.7 监听播放进度
        player.musicTimeUpdate(function (currentTime, duration, timeStr) {
            // 同步时间
            $('.progress_info_time').text(timeStr)
            // 同步进度条
            var value = currentTime / duration *100;
            progress.setProgress(value);
            // 实现歌词同步
            var index = lyric.currentIndex(currentTime);
            var $item = $('.song_lyric li').eq(index);
            $item.addClass('cur');
            $item.siblings().removeClass('cur');
            if(index <=2) return;
            $('.song_lyric').css({
                marginTop: (-index + 2) * 30
            })
            if(currentTime == duration){
                $('.play_next').trigger("click")
            }
        })
        // 6.8 监听音量按钮点击
        $('.column_icon').click(function () {
            // 切换图标
            $(this).toggleClass('music_voice_icon2')
            // 切换声音
            if($(this).attr('class').indexOf('music_voice_icon2') != -1) {
                player.musicVoiceSeekTo(0)
            }else{
                player.musicVoiceSeekTo(1)
            }
        })
        // 6.9 监听收藏按钮点击
        $('.collect').click(function () {
            if(!$('.music_list_item .checked').length){
                message(0, -220, '请选择操作的单曲');
            }else{
                $('.music_list_item .checked').parents('.music_list_item').addClass('isCollected')
                console.log($('.music_list_item .checked'))
                message(0, -150, '添加歌曲到歌单成功');               
            }          
        })

        function message(left, top, string) {
            var $message = $('.message');
            $message.children('i').css({
                backgroundLeft: left + "px",
                backgroundTop: top + "px",
            });
            $message.children('h2').text(string);
            $message.fadeIn(100).fadeOut(1000)
        }

        $('.music_fav').click(function () {
            if($('.music_list_item').eq(player.currentIndex).attr("class").indexOf('isCollected') != -1){
                $(this).removeClass('music_fav2')
                $('.music_list_item').eq(player.currentIndex).removeClass('isCollected')
            }else{
                $(this).addClass('music_fav2')
                message(0, -150, '添加歌曲到歌单成功');
                $('.music_list_item').eq(player.currentIndex).addClass('isCollected')
            }
        })
        // 6.11 监听删除按钮点击
        $('.del').click(function () {
            console.log('a')
            if(!$('.music_list_item .checked').length){
                message(0, -220, '请选择操作的单曲');
            }else{
                $('.music_list_item .checked').parents('.music_list_item').find(".list_music_del").trigger('click');
            }
        })
        // 6.12 纯净模式
        $('.music_only').click(function () {
            $(this).toggleClass('music_only2');
            if($(this).attr('class').indexOf('music_only2') != -1) {
                $('.list').css('display', 'none');
                $('.song_info').css('display', 'none');
                $('.lyric_containter').addClass('only_lyric');
            }else{
                console.log('a')
                $('.list').css('display', 'block');
                $('.song_info').css('display', 'block');
                $('.lyric_containter').removeClass('only_lyric');
            }       
        })
        var index = 1;
        // 6.13 播放模式
        $('.music_mode').click(function () {
            index ++;
            switch(index){
                case 1:
                    $(this).removeClass('music_mode4');
                    $(this).attr('title', '列表循环[O]');
                    break;
                case 2:
                    $(this).addClass('music_mode2');
                    $(this).attr('title', '顺序播放[O]');
                    if(player.currentIndex > player.musicList.length() - 1) {
                        player.currentIndex = 0;
                    }
                    break;
                case 3:
                    $(this).removeClass('music_mode2').addClass('music_mode3');
                    $(this).attr('title', '随机播放[O]');
                    break;
                case 4:
                    $(this).removeClass('music_mode3').addClass('music_mode4');
                    $(this).attr('title', '单曲循环[O]');
                    player.musicLoop();
                    index = 0
                    break;
            }    
        })
    }
    // 创建一条音乐
    function createMusicItem(index, ele) {
        var $item = $(`<li class="music_list_item clearfix">
        <div class="music_item clearfix">
            <div class="checkbox"><i></i></div>
            <div class="number">`+(index+1)+`</div>
            <div class="song">
                <span>`+ele.name+`</span>
                <div class="item_menu">
                    <a href="javascript:;" class="list_music_play"></a>
                    <a href="javascript:;"></a>
                    <a href="javascript:;"></a>
                    <a href="javascript:;"></a>
                </div>
            </div>
            <div class="singer">`+ele.singer+`</div>
            <div class="time">
                <span>`+ele.time+`</span>
                <a href="javascript:;" class="list_music_del"></a>
            </div>
        </div>
    </li>`);
        $item.get(0).index = index;
        $item.get(0).music = ele;
        return $item;
    }
})