;(function(factory){
  // AMD
  if( typeof define === "function" && define.amd ){
    define(["jquery"], factory);
  // CommonJS
  }else if( typeof exports === "object" ){
    module.exports = factory(require("jquery"));
  // Default (browser)
  }else{
    factory(jQuery);
  }

}(function($){

  // 渡せるオプションのデフォルト
  var defaults = {
    baseClass: "tooltip",
    direction: "top",
    duration: 300,
    hideDelay: 300,
    offsetY: 0,
    offsetX: 0
  };

  // プラグインで使用するイベント名
  // ※ここでは詳しくは書きませんが、イベントに名前空間を指定することで
  // 　他の処理との思わぬ競合を防ぎます
  var MouseEvent = {
    ROLL_OVER: "mouseenter.tooltip",
    ROLL_OUT: "mouseleave.tooltip"
  };

  // 指定した要素の上下左右の座標＋サイズを取得する
  function getElementInfo($elem){
    var offset = $elem.offset();
    var width = $elem.outerWidth();
    var height = $elem.outerHeight();

    return {
      top    : offset.top,
      right  : offset.left + width,
      bottom : offset.top + height,
      left   : offset.left,
      centerY: offset.top + height / 2,
      centerX: offset.left + width / 2,
      width  : width,
      height : height
    };
  }


  // jQueryに "tooltip" というプラグインを登録する
  $.fn.tooltip = function(options){
    var $body = $("body");
    var _options = $.extend(true, {}, defaults, options);

    // 実行したセレクタ(要素)全てに処理を行う
    // 要素自体を "return" することで、メソッドチェーンを可能にする
    return this.each(function(){
      var $this = $(this);
      var title = $this.attr("title");
      var baseClass = [
        _options.baseClass,
        _options.baseClass + "--" + _options.direction
      ].join(" ");
      var bodyClass = _options.baseClass + "__body";

      // ツールチップ本体を生成
      // 生成されるHTMLは下記のような感じ
      // <span class="tooltip tooltip--{方向}">
      //   <span class="tooltip__body">{内容}</span>
      // </span>
      var $tooltip = $([
        "<span class='" + baseClass + "'>",
          "<span class='" + bodyClass + "'>",
            title,
          "</span>",
        "</span>"
      ].join(""));

      // ブラウザ標準で出るツールチップを防止する
      $this.attr("title", "");

      // 最初はツールチップを非表示にしておく
      $tooltip.hide();

      // ロールオーバー/ロールアウトそれぞれにイベントを設定
      $this
        .on(MouseEvent.ROLL_OVER, function(){

          // <body> へツールチップを追加
          $body.append($tooltip);

          // 位置を調整
          var elemInfo = getElementInfo($this);
          var width = $tooltip.outerWidth();
          var height = $tooltip.outerHeight();

          // オプションで指定した方向に従って座標を設定
          var cssParams = {
            top: 0,
            left: 0
          };

          switch( _options.direction ){
            case "top":
              cssParams.top = elemInfo.top - height + _options.offsetY;
              cssParams.left = elemInfo.centerX - width / 2 + _options.offsetX;
              break;

            case "right":
              cssParams.top = elemInfo.centerY - height / 2 + _options.offsetY;
              cssParams.left = elemInfo.right + _options.offsetX;
              break;

            case "bottom":
              cssParams.top = elemInfo.bottom + _options.offsetY;
              cssParams.left = elemInfo.centerX - width / 2 + _options.offsetX;
              break;

            case "left":
              cssParams.top = elemInfo.centerY - height / 2 + _options.offsetY;
              cssParams.left = elemInfo.left - width + _options.offsetX;
              break;
          }

          // 座標を反映して、アニメーション表示
          // `jQuery.fn.stop(true,false)` で、現在のアニメーションキューをクリア、
          // なおかつ現在の状態で止めることで自然な動きに調整します。
          $tooltip.stop(true, false).css(cssParams).fadeIn(_options.duration);
        })
        .on(MouseEvent.ROLL_OUT, function(){
          // ロールアウトで、フェードアウトして
          // アニメーション完了時に要素を削除
          $tooltip.stop(true, false).delay(_options.hideDelay).fadeOut(_options.duration, function(){
            $tooltip.remove();
          });
        });
    });
  };

}));