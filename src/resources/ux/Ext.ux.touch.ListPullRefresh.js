Ext.apply(Ext.anims, {
    rotate: new Ext.Anim({
        autoClear: false,
        out: false,
        before: function(el) {
            var d = '';
            if (this.dir == 'ccw'){
              d = '-';
            }

            this.from = {
                '-webkit-transform': 'rotate('+d+''+this.fromAngle+'deg)'
            };

            this.to = {
                '-webkit-transform': 'rotate('+d+''+this.toAngle+'deg)'
            };
                        
        }
    })
});  

Ext.ns('Ext.ux.touch');
/**
 * @author Shea Frederick - http://www.vinylfox.com - Concept and Style/Images from enormego's EGOTableViewPullRefresh
 * @class Ext.ux.touch.ListPullRefresh
 * <p>A plugin that creates 'pull to refresh' functionality in List and DataView components.</p>
 * <p>Sample Usage</p>
 * <pre><code>
 {
     xtype: 'list',
     ...,
     plugins: [new Ext.ux.touch.ListPullRefresh()],
     ...
 }
 * </code></pre>
 */
Ext.ux.touch.ListPullRefresh = Ext.extend(Ext.util.Observable, {
  langPullRefresh: 'Pull down to refresh...',
  langReleaseRefresh: 'Release to refresh...',
  langLoading: 'Loading...',
  loading: false,
  //define the function to call for reloading.
  reloadFn: undefined,
  // private
  init: function(cmp){
    this.cmp = cmp;
    this.lastUpdate = new Date();
    cmp.loadingText = undefined;
    cmp.on('render', this.initPullHandler, this);
    if (!this.reloadFn){
      cmp.getStore().on('load', this.reloadComplete, this);
    }
  },
  // private
  initPullHandler: function(){
    this.pullTpl = new Ext.XTemplate(
        '<div class="msgwrap" style="height: 75px; margin-top: {[values.h-75]}px; position: relative;">'+
          '<span class="arrow {s}"></span>'+
          '<span class="msg">{m}</span>'+
          '<span class="lastupdate">Last Updated: {[Ext.util.Format.date(values.l,"m/d/Y h:iA")]}</span>'+
        '</div>'
    );
    this.pullWrapTpl = new Ext.XTemplate(
      '<div class="pullrefresh" style="text-align: bottom; overflow: hidden;">'+
      '</div>'
    );
    this.loadingSpacerTpl = new Ext.XTemplate(
      '<div class="loadingspacer" style="height: 0; position: relative;">'+
        '<span class="arrow loading"></span>'+
        '<span class="msg">'+this.langLoading+'</span>'+
      '</div>'
    );
    this.loadSpacerEl = this.loadingSpacerTpl.insertFirst(this.cmp.el.parent(), {}, true);
    this.pullEl = this.pullWrapTpl.append(this.cmp.el.parent(), {}, true);
    this.pullTpl.overwrite(this.pullEl, {h:0,m:this.langPullRefresh,l:this.lastUpdate});
    this.cmp.scroller.on('offsetchange', this.handlePull, this);
  },
  //private
  handlePull: function(scroller, offset){
    if (scroller.direction === 'vertical' && !this.loading){
      if (offset.y > 0){
        if (offset.y > 75){
          //console.log('state 1');
          // state 1
          if (this.state !== 1){
            this.prevState = this.state;
            this.state = 1;
            this.pullTpl.overwrite(this.pullEl, {h:offset.y,m:this.langReleaseRefresh,l:this.lastUpdate});
            this.pullEl.setHeight(offset.y);
            Ext.Anim.run(this.pullEl.select('.arrow').first(),'rotate',{dir:'ccw',fromAngle:0,toAngle:180});
          }
        }else if (scroller.isAnimating){
          // state 3
          //console.log('state 3');
          if (this.state !== 3){
            this.prevState = this.state;
            this.state = 3;
            if (this.prevState == 1){
              //console.log('state reloading now');
              this.loading = true;
              this.pullEl.setHeight(0);
              this.loadSpacerEl.setHeight(75);
              if (this.reloadFn){
                this.reloadFn.call(this,this.reloadComplete,this);
              }else{
                this.cmp.getStore().load();
              }
            }
          }else{
            //console.log('decided not to reload, hide the pull el');
            this.pullEl.setHeight(0);
          }
        }else{
          // state 2
          //console.log('state 2');
          //if (this.state !== 2){
            this.prevState = this.state;
            this.state = 2;
            this.pullTpl.overwrite(this.pullEl, {h:offset.y,m:this.langPullRefresh,l:this.lastUpdate});
            this.pullEl.setHeight(offset.y);
            if (this.prevState == 1){
              Ext.Anim.run(this.pullEl.select('.arrow').first(),'rotate',{dir:'cw',fromAngle:180,toAngle:0});
            }
          //}
        }
      }
    }
  },
  //private
  reloadComplete: function(){
    //console.log('finished reload, hide the pull and loader el');
    this.loading = false;
    this.lastUpdate = new Date();
    this.pullTpl.overwrite(this.pullEl, {h:0,m:this.langPullRefresh,l:this.lastUpdate});
    this.pullEl.setHeight(0);
    this.loadSpacerEl.setHeight(0);
  }
});

Ext.preg('listpullrefresh', Ext.ux.touch.ListPullRefresh);