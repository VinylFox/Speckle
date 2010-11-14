/*!
 * Copyright 2010 Speckle Mobile
 */
Ext.ns('Ext.ux.touch');
/**
 * @author Shea Frederick - http://www.vinylfox.com
 * @class Ext.ux.touch.SwipeTabs
 * <p>A plugin that lets the user swipe between tabs in a TabPanel. No configuration is needed.</p>
 * <p>Sample Usage</p>
 * <pre><code>
 {
     xtype: 'tabpanel',
     ...,
     plugins: [new Ext.ux.touch.SwipeTabs()],
     ...
 }
 * </code></pre>
 */
Ext.ux.touch.SwipeTabs = Ext.extend(Ext.util.Observable, {
  // private
  init: function(cmp){
    this.cmp = cmp;
    this.setFn = (Ext.versionDetail.major === 0) ? 'Card' : 'ActiveItem'; 
    cmp.on('render', this.initSwipeHandlers, this);
  },
  // private
  initSwipeHandlers: function(){
    this.cmp.til = this.cmp.items.length-1;
    this.cmp.items.each(function(itm, i){
      itm.idx = i;
      if (itm.getLayout().type === 'card'){
        if (itm.rendered){
          this.initChildSwipeHandlers(itm);
        }else{
          itm.on('render', this.initChildSwipeHandlers, this);
        }
      }else{
        if (itm.rendered){
          this.addSwipe(itm, i);
        }else{
          itm.on('render', function(){ 
            this.addSwipe(itm, i);
          }, this);
        }
      }
    },this)
  },
  // private
  initChildSwipeHandlers: function(itm){
    var i = itm.idx;
    itm.items.each(function(itm){
      this.addSwipe(itm, i);
    }, this);
  },
  // private
  addSwipe: function(itm, i){
    if (i === 0){
      this.addSwipeLeft(itm, i);
    }else if(i === this.cmp.til){
      this.addSwipeRight(itm, i);
    }else{
      this.addSwipeLeft(itm, i);
      this.addSwipeRight(itm, i);
    }
  },
  // private
  addSwipeLeft: function(itm, i){
    itm.mon(itm.el, 'swipe', function(ev) {
      if (ev.direction == "left") {
        this.cmp['set'+this.setFn](i + 1);
      }
    }, this);
  },
  // private
  addSwipeRight: function(itm, i){
    itm.mon(itm.el, 'swipe', function(ev) {
      if (ev.direction == "right") {
        this.cmp['set'+this.setFn](i - 1, {type : 'slide', direction : 'right'});
      }
    }, this);
  }
});

Ext.preg('swipetabs', Ext.ux.touch.SwipeTabs);Ext.apply(Ext.anims, {
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

Ext.preg('listpullrefresh', Ext.ux.touch.ListPullRefresh);Ext.regModel('Timers', {
	idProperty : 'id',
	fields : [ {
		name : 'id'
	}, {
		name : 'start_time',
		type : 'date',
		dateFormat : 'c'
	}, {
		name : 'end_time',
		type : 'date',
		dateFormat : 'c'
	}, {
		name : 'project_id'
	}, {
		name : 'description'
	}, {
		name : 'active',
		type : 'boolean'
	}, {
		name : 'synced',
		type : 'boolean'
	} ]
});

Speckle.stores.Timers = new Ext.data.Store( {
	model : 'Timers',
	proxy : {
		type : 'localstorage',
		id : 'timers'
	},
	autoLoad : true,
	listeners : {
		'add' : function() {
			app.getComponent('mainapp').getComponent('timer').tab.setBadge(Speckle.stores.Timers.getCount());
		},
		'remove' : function() {
			app.getComponent('mainapp').getComponent('timer').tab.setBadge(Speckle.stores.Timers.getCount());
		}
	}
});

Ext.regModel('TimerPauses', {
	idProperty : 'id',
	fields : [ {
		name : 'id'
	}, {
		name : 'start_time'
	}, {
		name : 'end_time'
	}, {
		name : 'timer_id'
	}, {
		name : 'active',
		type : 'boolean'
	} ]
});

Speckle.stores.TimerPauses = new Ext.data.Store( {
	model : 'TimerPauses',
	proxy : {
		type : 'localstorage',
		id : 'timerpauses'
	},
	autoLoad : true
});

Ext.regModel('Projects', {
	idProperty: 'id',
	fields : [ {
		name : 'id'
	}, {
		name : 'account_id'
	}, {
		name : 'user_id'
	}, {
		name : 'created_at'
	}, {
		name : 'name'
	}, {
		name : 'billable'
	}, {
		name : 'updated_at'
	}, {
		name : 'enabled'
	}, {
		name : 'stepping'
	}, {
		name : 'invoice_recipient_details'
	}, {
		name : 'budget'
	} ]
});

Speckle.stores.Projects = new Ext.data.Store( {
	model : 'Projects',
	proxy : {
		type : 'ajax',
		url : '/api/projects',
		reader : {
			type : 'json',
			root : 'data'
		}
	},
	disableCache : true
});

Ext.regModel('Tags', {
	idProperty : 'id',
	fields : [ {
		name : 'id'
	}, {
		name : 'account_id'
	}, {
		name : 'created_at'
	}, {
		name : 'name'
	}, {
		name : 'billable'
	}, {
		name : 'updated_at'
	} ]
});

Speckle.stores.Tags = new Ext.data.Store( {
	model : 'Tags',
	proxy : {
		type : 'ajax',
		url : '/api/tags',
		reader : {
			type : 'json',
			root : 'data'
		}
	},
	sorters : "name",
	getGroupString : function(record) {
		return record.get("name").split('')[0];
	},
	disableCache : true
});

Ext.regModel('Entries', {
	idProperty : 'id',
	fields : [ {
		name : 'id'
	}, {
		name : 'created_at'
	}, {
		name : 'description'
	}, {
		name : 'billable'
	}, {
		name : 'updated_at'
	}, {
		name : 'project_id'
	}, {
		name : 'minutes'
	}, {
		name : 'user_id'
	}, {
		name : 'url'
	}, {
		name : 'date',
		type : 'date',
		dateFormat : 'Y-m-d'
	}, {
		name : 'week_start',
		mapping: 'date',
		convert : function(v) {
			if (v.indexOf('-') > -1) {
				var dt = Date.parseDate(v, 'c');
				var dow = parseInt(dt.format('w'), 10), wk_start = dt.add(Date.DAY, (dow * -1));
				return wk_start.format('n/j');
			} else {
				return v;
			}
		}
	}, {
		name : 'date_sort',
		mapping: 'date',
		convert : function(v) {
			if (!Ext.isNumber(v) && v.indexOf('-') > -1) {
				var dt = Date.parseDate(v, 'c');
				return dt.format('U');
			} else {
				return v;
			}
		}
	} ]
});

Speckle.stores.Entries = new Ext.data.Store( {
	model : 'Entries',
	proxy : {
		type : 'ajax',
		url : '/api/entries',
		reader : {
			type : 'json',
			root : 'data'
		}
	},
	sorters : {
		direction : 'DESC',
		property : "date_sort"
	},
	getGroupString : function(record) {
		return record.get("week_start");
	},
	disableCache : true
});

Ext.contains = function(a, v) {
	var found = false;
	Ext.each(a, function(itm) {
		if (itm.value == v) {
			found = true;
		}
	});
	return found;
};

Speckle.stores.WeekGroups = new Ext.data.Store( {
	model : 'IndexBarModel'
});

Speckle.stores.Entries.on('load', function(s, r, success) {
	if (success) {
		var wks = [];
		Speckle.stores.Entries.each(function(rec) {
			if (!Ext.contains(wks, rec.get('week_start'))) {
				wks.push( {
					key : rec.get('week_start'),
					value : rec.get('week_start')
				});
			}
		});
		Speckle.stores.WeekGroups.loadData(wks);
	}
});Speckle.views.EntriesList = Ext.extend(Ext.List,{
	itemTpl : new Ext.XTemplate(
		'<tpl for="."><div class="entry" id="entry-{id}">'
		+ '<div class="date">{[Speckle.dateRenderer(values.date)]}</div>'
		+ '<div class="minutes">{[Speckle.minuteRenderer(values.minutes)]}</div>'
		+ '<div class="project">{[Speckle.projectRenderer(values.project_id)]}</div>'
		+ '<div class="tags">{[Speckle.tagsRenderer(values.description)]}</div>'
		+ '</div></tpl>'),
	itemSelector : 'div.entry',
	singleSelect : true,
	indexBar : {
		alphabet : [],
		store : Speckle.stores.WeekGroups
	},
	grouped : true,
	autoHeight : true,
	overItemCls : 'x-view-over',
	emptyText : 'No Time Entries',
	initComponent : function() {
		this.store = Speckle.stores.Entries;
		this.plugins = [new Ext.ux.touch.ListPullRefresh({
		  reloadFn: function(cb,scope){
		    Speckle.stores.Entries.on('load',cb,scope,{single:true});
        var params = Ext.apply(app.settings, {
          "search_date_from" : (localStorage.getItem('account') == 'apitest') ? new Date().add('d',-240).format('Y-m-d') : new Date().add('d',-30).format('Y-m-d')
        });
        Speckle.stores.Entries.load({
          params : params
        });
		  }
		})];
		Speckle.views.EntriesList.superclass.initComponent.call(this);
	}
});

Ext.reg('entrieslist', Speckle.views.EntriesList);

Speckle.views.EntriesPanel = Ext.extend(Ext.Panel,{
  fullscreen : true,
  cls : 'entries',
  dock : 'left',
  layout: 'fit',
  items: [{
    xtype: 'entrieslist'
  }],
  dockedItems : [ {
    xtype : "toolbar",
    dock : "top",
    title : Speckle.locale.entries,
    defaults : {
      iconMask : true,
      ui : 'plain'
    },
    items : [ {
      iconCls : 'search',
      handler : function() {
        app.getComponent('mainapp').getComponent('entries').setActiveItem(1,'flip');
      }
    } ]
  } ]
});

Ext.reg('entries', Speckle.views.EntriesPanel);Speckle.views.ProjectsList = Ext.extend(Ext.List, {
  itemTpl : '<tpl for="."><div class="project" id="project-{id}"><div class="budget"><a href="" class="budget-piechart p40"></a></div><div class="name">{name}</div></div></tpl>',
  itemSelector : 'div.project',
  singleSelect : true,
  indexBar : true,
  grouped : false,
  autoHeight : true,
  overItemCls : 'x-view-over',
  emptyText : 'No Projects',
  initComponent : function() {
    this.store = Speckle.stores.Projects;
    Speckle.views.ProjectsList.superclass.initComponent.call(this);
    this.on('itemtap', function(cmp, idx, itm, e) {
      var r = cmp.getStore().getAt(idx), p = app.getComponent('mainapp').getComponent('projects');;
      p.getComponent('detail').loadProjectRecord.call(p.getComponent('detail'), r);
      p.setActiveItem(1,'flip');
    });
  }
});

Ext.reg('projectslist', Speckle.views.ProjectsList);

Speckle.views.ProjectsPanel = Ext.extend(Ext.Panel, {
  fullscreen : true,
  cls : 'projects',
  dock : 'left',
  layout: 'fit',
  items: [{
    xtype: 'projectslist'
  }],
  dockedItems : [ {
    xtype : "toolbar",
    dock : "top",
    title : Speckle.locale.projects,
    defaults : {
      iconMask : true,
      ui : 'plain'
    },
    items : [ {
      iconCls : 'add',
      handler : function() {
        var p = app.getComponent('mainapp').getComponent('projects');
        p.getComponent('edit').resetProjectForm.call(p.getComponent('edit'));
        p.setActiveItem(2,'flip');
      }
    } ]
  } ]
});

Ext.reg('projects', Speckle.views.ProjectsPanel);Speckle.views.ProjectDetail = Ext.extend(Ext.Panel, {
    fullscreen : true,
	autoHeight : true,
	dock : 'left',
	cls : 'project-detail coming-soon',
	dockedItems : [ {
		xtype : "toolbar",
		dock : "top",
		title : Speckle.locale.project,
		items : [ {
			ui : 'back',
			text : Speckle.locale.projects,
			handler : function() {
				this.ownerCt.ownerCt.ownerCt.setActiveItem(0,'flip');
			}
		}, {
			xtype : 'spacer'
		}, {
			text : Speckle.locale.edit,
			handler : function(cmp) {
				var p = app.getComponent('mainapp').getComponent('projects'), r = Speckle.stores.Projects.getAt(Speckle.stores.Projects.find('id',p.getComponent('detail').projectId));
				p.getComponent('edit').loadProjectRecord.call(p.getComponent('edit'), r);
				p.setActiveItem(2,'flip');
			}
		} ]
	} ],
	resetProjectForm: function(){
		this.projectId = undefined;
	},
	loadProjectRecord: function(rec){
		this.projectId = rec.data.id;
	},
	updateProjectRecord: function(){
		
	}
});

Ext.reg('project-detail', Speckle.views.ProjectDetail);Speckle.views.ProjectEdit = Ext.extend(Ext.form.FormPanel, {
  fullscreen : true,
	autoHeight : true,
	dock : 'left',
	cls : 'project-edit',
	items: [{
		xtype: 'fieldset',
		title: 'Project Settings',
		items: [{
			xtype: 'textfield',
			label: 'Name',
			name: 'name'
		},{
			xtype: 'checkboxfield',
			label: 'Billable',
			name: 'billable'
		},{
			xtype: 'checkboxfield',
			label: 'Enabled',
			name: 'enabled'
		},{
			xtype: 'numberfield',
			label: 'Stepping',
			name: 'stepping'
		},{
			xtype: 'numberfield',
			label: 'Budget',
			name: 'budget'
		}],
	}],
	dockedItems : [ {
		xtype : "toolbar",
		dock : "top",
		title : 'Edit Project',
		items : [ {
			ui : 'back',
			text : Speckle.locale.projects,
			handler : function() {
				app.getComponent('mainapp').getComponent('projects').setActiveItem(0,'flip');
			}
		} ]
	} ],
	resetProjectForm: function(){
		this.projectId = undefined;
	},
	loadProjectRecord: function(rec){
		this.load(rec);
		this.projectId = rec.data.id;
	},
	updateProjectRecord: function(){
		
	}
});

Ext.reg('project-edit', Speckle.views.ProjectEdit);Speckle.views.UserInfoForm = Ext.extend(Ext.form.FormPanel, {
    fullscreen : true,
    scroll: 'vertical',
    dock: 'left',
    items: [{
      cls: 'descriptive-text',
      html: Speckle.locale.accountdesc,
      xtype: 'container'
    },{
      label: Speckle.locale.account,
      xtype: 'textfield',
      name: 'account',
      itemId: 'account'
    },{
      cls: 'hint-text',
      html: Speckle.locale.accounthint,
      xtype: 'container'
    },{
      cls: 'descriptive-text',
      html: Speckle.locale.apikeydesc,
      xtype: 'container'
    },{
      label: Speckle.locale.apikey,
      xtype: 'textfield',
      name: 'token',
      itemId: 'token'
    },{
		xtype: 'checkbox',
		label: 'Test Only',
		listeners: {
		  check: function(cb){
		      cb.ownerCt.getComponent('account').disable();
		      cb.ownerCt.getComponent('token').disable();
		      cb.ownerCt.getComponent('account').setValue(app.settingsTest.account);
		      cb.ownerCt.getComponent('token').setValue(app.settingsTest.token);
		  },
		  uncheck: function(cb){
		      cb.ownerCt.getComponent('account').enable();
		      cb.ownerCt.getComponent('token').enable();
          cb.ownerCt.getComponent('account').setValue('');
          cb.ownerCt.getComponent('token').setValue('');
		  }
		}
    },{
      xtype: 'container',
      html: '&nbsp;'
    },{
      xtype: 'button',
      text: 'Let\'s go!',
      handler: function(b){
        var f = b.ownerCt, v = f.getValues();
        if (v.account != '' && v.token != ''){
          f.body.mask(false, Speckle.locale.verifying);
          app.saveAccountInfo(v.account,v.token);
          app.loadStores(v,function(){
            f.body.unmask();
            app.setActiveItem(1);
          });
        }else{
          Ext.Msg.alert(Speckle.locale.accountinfo,Speckle.locale.accountinfomsg);
        }
      }
    }],
    dockedItems : [{
      xtype : "toolbar",
      dock : "top",
      title: 'Account Settings'
    }]  
});

Ext.reg('userinfoform', Speckle.views.UserInfoForm);Speckle.views.SettingsForm = Ext.extend(Ext.form.FormPanel, {
	fullscreen : true,
	scroll : 'vertical',
	dock : 'left',
	initComponent : function() {
		Speckle.views.SettingsForm.superclass.initComponent.call(this);
		this.on('activate',function(frm) {
			frm.getComponent('acct').getComponent('account').setValue(localStorage.getItem('account') || '');
			frm.getComponent('acct').getComponent('token').setValue(localStorage.getItem('token') || '');
			frm.getComponent('pref').getComponent('geo').setValue(localStorage.getItem('geo') || false);
		}, {
			defer : 200
		});
		this.on('beforedeactivate', function(cmp) {
			var f = cmp, v = f.getValues();
			if (v.account != '' && v.token != '') {
				if (v.account != localStorage.getItem('account')|| v.token != localStorage.getItem('token')) {
					cmp.saveChanges.call(cmp, v);
				}
				return true;
			} else {
				cmp.ownerCt.setActiveItem(2);
				return false;
			}
		});
	},
	items : [ {
		xtype : 'fieldset',
		title : 'Account',
		itemId : 'acct',
		items : [ {
			label : Speckle.locale.account,
			xtype : 'textfield',
			name : 'account',
			itemId : 'account'
		}, {
			label : Speckle.locale.apikey,
			xtype : 'textfield',
			name : 'token',
			itemId : 'token'
		} ]
	},{
		xtype : 'fieldset',
		title : 'Preferences',
		itemId : 'pref',
		items : [ {
			label : 'Location Aware',
			xtype : 'toggle',
			name : 'geo',
			itemId : 'geo',
			listeners : {
				"change" : function(s, t, ov, nv) {
					if (nv) {
						if (localStorage.getItem('account') == 'apitest') {
							Ext.Msg.alert('Testing','Since this is a test account, Location awareness cannot be enabled.');
							s.toggle();
						} else {
							Ext.Msg.alert('Location Aware','This feature will decide the project your working on based on your location if you have previously logged hours on this project at the current location.');
						}
					}
				}
			}
		} ]
	}, {
		xtype : 'container',
		html : '&nbsp;'
	}, {
		xtype : 'button',
		text : 'Update',
		itemId : 'update',
		handler : function(b) {
			var f = b.ownerCt, v = f.getValues();
			f.saveChanges.call(f, v);
		}
	} ],
	dockedItems : [ {
		xtype : "toolbar",
		dock : "top",
		title : Speckle.locale.settings,
		defaults : {
			iconMask : true,
			ui : 'plain'
		},
		items : [ {
			iconCls : 'trash',
			handler : function() {
				Ext.Msg.confirm('Clear Settings','Are you sure you want to clear all your local settings?<br/><br/>This means you will have to enter account information again to use this app and any active timers will be lost.<br/><br/>No data on your Freckle account will be changed.',function() {
					app.saveAccountInfo('', '');
					localStorage.setItem('geo', null);
					location.href = window.location.href;
				});
			}
		} ]
	} ],
	saveChanges : function(v) {
		if (!v) {
			v = this.getValues();
		}
		if (v.account != '' && v.token != '') {
			localStorage.setItem('geo', this.getComponent('pref').getComponent('geo').getValue());
			this.body.mask(false, Speckle.locale.verifying);
			app.loadStores(v, function() {
				this.body.unmask();
				localStorage.setItem('account',v.account);
				localStorage.setItem('token', v.token);
				app.getComponent('mainapp').setActiveItem(0);
			}, this);
			Speckle.stores.Projects.load( {
				params : v
			});
		} else {
			Ext.Msg.alert(Speckle.locale.accountinfo, Speckle.locale.accountinfomsg);
		}
	}
});

Ext.reg('settingsform', Speckle.views.SettingsForm);Speckle.views.TimerList = Ext.extend(Ext.List,{
	itemTpl : new Ext.XTemplate(
		'<tpl for="."><div class="timer <tpl if="active">active</tpl>" id="timer-{id}">'
		+ '<div class="date">{[Speckle.dateRenderer(values.start_time)]}</div>'
		+ '<div class="minutes">{[this.getMinutes(values)]}</div>'
		+ '<div class="project">{[Speckle.projectRenderer(values.project_id)]}</div>'
		+ '<div class="tags">{[Speckle.tagsRenderer(values.description)]}</div>'
		+ '</div></tpl>',
		{
			getMinutes: function(values){
				return Speckle.minuteRenderer(Speckle.getTimerMinutes({
					data:values
				}),values.project_id,false,0);
			}
		}),
	itemSelector : 'div.timer',
	singleSelect : true,
	indexBar : true,
	grouped : false,
	autoHeight : true,
	overItemCls : 'x-view-over',
	emptyText : 'No Active Timers',
	initComponent : function() {
		this.store = Speckle.stores.Timers;
		Speckle.views.TimerList.superclass.initComponent.call(this);
		this.on('itemtap', function(cmp, idx, itm, e) {
			var r = cmp.getStore().getAt(idx), t = app.getComponent('mainapp').getComponent('timer');
			t.getComponent('form').loadTimeRecord(r);
			t.setActiveItem(1,'flip');
		});
		this.on('activate', function(cmp) {
			app.getComponent('mainapp').getComponent('timer').getComponent('list').refresh();
		});
	}
});

Ext.reg('timerslist', Speckle.views.TimerList);

Speckle.views.TimerPanel = Ext.extend(Ext.Panel,{
  fullscreen : true,
  cls : 'timers',
  dock : 'left',
  layout: 'fit',
  items: [{
    xtype: 'timerslist'
  }],
  dockedItems : [ {
    xtype : "toolbar",
    dock : "top",
    title : 'Timers',
    defaults : {
      iconMask : true,
      ui : 'plain'
    },
    items : [ {
      iconCls : 'add',
      handler : function(cmp) {
        var t = app.getComponent('mainapp').getComponent('timer');
        t.setActiveItem(1,'flip');
        t.getComponent('form').resetTimerForm();
      }
    } ]
  } ]
});

Ext.reg('timers', Speckle.views.TimerPanel);Speckle.views.TimerForm = Ext.extend(Ext.form.FormPanel, {
	fullscreen : true,
	scroll : 'vertical',
	dock : 'left',
	items : [ {
		xtype : 'panel',
		items : [ {
			xtype: 'container',
			html: '&nbsp;',
			hidden: true,
			cls: 'timer-current',
			itemId: 'timerCurrent'
		}, {
			xtype: 'button',
			text: 'Start',
			itemId: 'start',
			ui: 'confirm-round',
			handler: function(b){
				var tagrec = Speckle.stores.Tags.getAt(Speckle.stores.Tags.find('id',b.ownerCt.ownerCt.getComponent('timedetail').getComponent('tags').getValue())), tag = (tagrec)?tagrec.data.name:'';
				var rec = Speckle.stores.Timers.add({
					id: Speckle.stores.Timers.getCount()+1,
					start_time: new Date(),
					active: true,
					project_id: b.ownerCt.ownerCt.getComponent('timedetail').getComponent('project').getValue(),
					description: tag
				});
				Speckle.stores.Timers.sync();
				b.ownerCt.ownerCt.loadTimeRecord.call(b.ownerCt.ownerCt, rec[0]);
			}
		}, {
			xtype: 'container',
			html: '&nbsp;'
		}, {
			xtype: 'button',
			text: 'Pause',
			itemId: 'pause',
			ui: 'action-round',
			disabled: true,
			handler: function(b){
				Ext.Msg.alert('Sorry','Feature not implemented yet.');
			}
		}, {
			xtype: 'container',
			html: '&nbsp;'
		}, {
			xtype: 'button',
			text: 'Stop',
			itemId: 'stop',
			ui: 'decline-round',
			disabled: true,
			handler: function(b){
				var rec = Speckle.stores.Timers.getAt(Speckle.stores.Timers.find('id', b.ownerCt.ownerCt.timerId));
				app.saveEntry(rec);
			}
		} ]
    },{
      xtype: 'fieldset',
      title: 'Time Detail',
      itemId: 'timedetail',
      items: [{
        label: 'Project',
        xtype: 'select',
        name: 'project',
        itemId: 'project',
        displayField: 'name',
        valueField: 'id',
        store: Speckle.stores.Projects,
        listeners: {
          change: function(f,nv){
              //console.log(arguments);
	    	  if (f.ownerCt.ownerCt.timerId){
	            var rec = Speckle.stores.Timers.getAt(Speckle.stores.Timers.find('id', f.ownerCt.ownerCt.timerId));
	            rec.set('project_id',nv);
	            Speckle.stores.Timers.sync();
	    	  }
          }
        }
      },{
        label: 'Tags',
        xtype: 'select',
        name: 'tags',
        itemId: 'tags',
        displayField: 'name',
        valueField: 'id',
        store: Speckle.stores.Tags,
        listeners: {
          change: function(f,nv){
            //console.log(arguments);
    	  if (f.ownerCt.ownerCt.timerId){
            var rec = Speckle.stores.Timers.getAt(Speckle.stores.Timers.find('id', f.ownerCt.ownerCt.timerId));
            rec.set('description',Speckle.stores.Tags.getAt(Speckle.stores.Tags.find('id',nv)).data.name);
            Speckle.stores.Timers.sync();
    	  }
          }
        }
      }]
    }],
    dockedItems : [{
      xtype : "toolbar",
      dock : "top",
      title: Speckle.locale.timer,
      itemId: 'timertb',
      items: [{
        ui: 'back',
        text: 'Timers',
        itemId: 'timers',
        handler: function(cmp){
    	  var t = app.getComponent('mainapp').getComponent('timer');
          t.setActiveItem(0, 'flip');
          t.getComponent('list').getComponent(0).refresh();
        }
      },{xtype: 'spacer'},{
        iconMask: true,
        ui: 'plain',
        iconCls: 'trash',
        itemId: 'timertrash',
        handler: function(cmp){
          if (cmp.ownerCt.ownerCt.timerId){
            Ext.Msg.confirm('Delete Timer?', 'Are you sure you want to delete this Timer?', function(){
              Speckle.stores.Timers.removeAt(Speckle.stores.Timers.find('id', cmp.ownerCt.ownerCt.timerId));
              Speckle.stores.Timers.sync();
              if (Speckle.stores.Timers.getCount() == 0){
                cmp.ownerCt.ownerCt.ownerCt.setActiveItem(1);
                cmp.ownerCt.ownerCt.ownerCt.items.items[1].resetTimerForm();
              }else{
                cmp.ownerCt.ownerCt.ownerCt.setActiveItem(0);
              }
            });
          }else{
            Ext.Msg.alert('No Timer','No Timer has been started yet.');
          }
        }
      }]
    }],
  resetTimerForm: function(){
		var i = this.items.items;
		i[0].items.items[0].hide();
		i[0].items.items[1].show();
		i[0].items.items[3].disable();
		i[0].items.items[5].disable();
		i[1].getComponent('project').setValue(0);
		i[1].getComponent('tags').setValue('');
		this.timerId = undefined;
	},
  loadTimeRecord: function(rec){
		var i = this.items.items;
		i[0].items.items[1].hide();
		i[0].items.items[0].show();
		i[0].items.items[3].enable();
    i[0].items.items[5].enable();
    this.timerId = rec.data.id;
    if (rec.data.project_id != ''){
		  i[1].getComponent('project').setValue(rec.data.project_id);
		}
		if (rec.data.description != ''){
		  i[1].getComponent('tags').setValue(rec.data.description);
		}
		setTimeout(function(){app.updateTimer(rec);}, 30);
		//app.getLocation(new Date().add("mi",-15),function(loc){console.log(loc);});
  },
  updateTimerRecord: function(){
   	
  }
});

Ext.reg('timer-form', Speckle.views.TimerForm);Speckle.views.Search = Ext.extend(Ext.Panel, {
	fullscreen : true,
	autoHeight : true,
	dock : 'left',
	cls : 'search coming-soon',
	dockedItems : [ {
		xtype : "toolbar",
		dock : "top",
		title : 'Entry Search',
		items : [ {
			ui : 'back',
			text : Speckle.locale.entries,
			handler : function() {
				app.getComponent('mainapp').getComponent('entries').setActiveItem(0,'flip');
			}
		} ]
	} ]
});

Ext.reg('search', Speckle.views.Search);Ext.override(Ext.form.FormPanel, {
    setValues: function(values) {
         var fields = this.getFields(),
             name,
             field;
        values = values || {};
        
        for (name in values) {
            if (values.hasOwnProperty(name)) {
                if (Ext.isArray(fields[name])) {
                    fields[name].forEach(function(field) {
                        if (Ext.isArray(values[name])) {
                            field.setChecked((values[name].indexOf(field.getValue()) != -1));
                        } else {
                            field.setChecked((values[name] == field.getValue()));
                        }
                    });
                } else {
                    field = fields[name];
                    if (field && field.setChecked){
                      field.setChecked(values[name]);
                    }else if (field){
                      field.setValue(values[name]);
                    }
                }
            }       
        }
        
        return this;
    }
});

Speckle.minuteRenderer = function(min, project_id, strip_html, stepping) {
	var m = 'm', h = 'h', ss = '<span>', se = '</span>';
	stepping = (!stepping)?0:stepping;
	if (min == 0){
		display = Speckle.locale.zero;
		alt = '0' + m;
	}else{
		var display = min + ss + m + se, alt;
		if ((project_id && Ext.isNumber(project_id)) || stepping > 0){
		  if (stepping == 0){
			  var idx = Speckle.stores.Projects.find('id', project_id);
			  if (idx){
				  var rec = Speckle.stores.Projects.getAt(idx);
				  if (rec && rec.data){
					  stepping = rec.data.stepping;
				  }
			  }
		  }
	      if (stepping > 0){
	        var remain = min % stepping;
	        if (remain < stepping && remain != 0){
	          min = min - remain + stepping;
	          display = min + ss + m + se;
	          alt = min + m;
	        }
		  }
		}
		if (min < 60){
		    if (min % 30 == 0) {
		      display = Speckle.locale.half + ss + h + se;
		      alt = '30' + m;
		    } else if (min % 15 == 0) {
		      if (min % 60 == 15) {
		        display = Speckle.locale.quarter + ss + h + se;
		        alt = '15' + m;
		      } else {
		        display = Speckle.locale.threequarter + ss + h + se;
		        alt = '45' + m;
		      }
		    } else if (min % 60 == 20){
		    	display = Speckle.locale.third + ss + h + se;
		    } else if (min % 60 == 40){
		    	display = Speckle.locale.twothirds + ss + h + se;
		    }
		}else{
		  	if (min % 60 == 0) {
		  		display = (min / 60) + ss + h + se;
		  	} else if (min % 30 == 0) {
		  		display = ((min - 30) / 60) + Speckle.locale.half + ss + h + se;
		  		alt = min + m;
		  	} else if (min % 15 == 0 && min != 15 && min != 45) {
		  		if (min % 60 == 15) {
		  			display = ((min - 15) / 60) + Speckle.locale.quarter + ss + h + se;
		  			alt = min + m;
		  		} else {
		  			display = ((min - 45) / 60) + Speckle.locale.threequarter + ss + h + se;
		  			alt = min + m;
		  		}
		  	} else if (min % 60 == 40){
		    	display = ((min - 40) / 60) + Speckle.locale.twothirds + ss + h + se;
		    } else if (min % 60 == 20){
		    	display = ((min - 20) / 60) + Speckle.locale.third + ss + h + se;
		    }
		}
	}
	if (strip_html){
	    display = (alt)?alt:String(display).replace(/<\/?[^>]+>/gi,'');
	}
	return display;
};

Speckle.getTimerMinutes = function(rec) {
	if (rec.data.start_time) {
		var dt = rec.data.start_time, ts = dt.getTime(), tc = new Date().getTime(), s = tc - ts, m = Math.ceil((s / 1000) / 60);
		return m;
	} else {
		return 0;
	}
};

Speckle.dateRenderer = function(dt) {
	if (dt == 'Invalid Date' || dt == null || !dt) {
		return '';
	} else {
		if (!Ext.isDate(dt)) {
			dt = Date.parseDate(dt, 'c');
		}
		var display = dt.format('M j'), today = new Date();
		if (dt.getFullYear() != today.getFullYear()) {
			display = dt.format('M j Y');
		}
		return display;
	}
};

Speckle.projectRenderer = function(project_id) {
	if (project_id && Ext.isNumber(project_id)) {
		var rec = Speckle.stores.Projects.getAt(Speckle.stores.Projects.find('id', project_id));
		if (rec && rec.data) {
			return rec.data.name;
		} else {
			return 'N/A';
		}
	} else {
		return 'N/A';
	}
};

Speckle.tagsRenderer = function(tags) {
	var as = '<a class="tag">', ae = '</a>';
	if (tags == '') {
		return '';
	} else {
		var display = '';
		if (tags.indexOf(',') != -1) {
			tags = tags.split(',');
		} else {
			tags = [ tags ];
		}
		Ext.each(tags, function(itm) {
			display = display + as + itm + ae;
		});
		return display;
	}
};

Speckle.views.Splash = Ext.extend(Ext.Panel, {
	fullscreen : true,
	cardSwitchAnimation : 'flip',
	autoHeight : true,
	dock : 'left',
	cls : 'splash-bg',
	dockedItems : [ {
		xtype : "toolbar",
		dock : "top",
		title : Speckle.locale.appname
	} ]
});

Ext.reg('splash', Speckle.views.Splash);

Speckle.views.MainApp = Ext.extend(Ext.TabPanel, {
	fullscreen : true,
	activeItem : 0,
	tabBar : {
		dock : 'bottom',
		scroll : 'horizontal',
		sortable : true,
		layout : {
			pack : 'center'
		}
	},
	plugins: [new Ext.ux.touch.SwipeTabs()],
	items : [ {
		iconCls : 'bookmarks',
		title : Speckle.locale.entries,
		itemId : 'entries',
		layout : {
			activeItem : 0,
			type : 'card'
		},
		items : [ {
			xtype : 'entries',
			itemId : 'list'
		}, {
			xtype : 'search',
			itemId : 'search'
		} ]
	},{
		iconCls : 'time',
		title : Speckle.locale.timer,
		badgeText : '0',
		layout : {
			activeItem : 0,
			type : 'card'
		},
		itemId : 'timer',
		listeners : {
			'beforeactivate' : function(cmp) {
				if (Speckle.stores.Timers.getCount() < 2) {
					if (Speckle.stores.Timers.getCount() == 1) {
						cmp.getComponent('form').loadTimeRecord(Speckle.stores.Timers.getAt(0));
					}
					cmp.setActiveItem(1);
				} else {
					cmp.setActiveItem(0);
				}
				return true;
			}
		},
		items : [ {
			xtype : 'timers',
			itemId : 'list'
		}, {
			xtype : 'timer-form',
			itemId : 'form'
		} ]
	}, {
		iconCls : 'favorites',
		title : Speckle.locale.projects,
		itemId : 'projects',
		layout : {
			activeItem : 0,
			type : 'card'
		},
		items : [ {
			xtype : 'projects',
			itemId : 'list'
		}, {
			xtype : 'project-detail',
			itemId : 'detail'
		}, {
			xtype : 'project-edit',
			itemId : 'edit'
		} ]
	}, {
		iconCls : 'settings',
		title : Speckle.locale.settings,
		xtype : 'settingsform',
		itemId : 'settingsform'
	} ]
});

Ext.reg('mainapp', Speckle.views.MainApp);

Speckle.App = Ext.extend(Ext.Panel,{
	fullscreen : true,
	cardSwitchAnimation : 'flip',
	layout : {
		activeItem : 0,
		type : 'card'
	},
	items : [ {
		xtype : 'splash'
	}, {
		xtype : 'mainapp',
		itemId : 'mainapp'
	}, {
		xtype : 'userinfoform',
		itemId : 'userinfo'
	} ],
	loadStores : function(acctinfo, cb, scope) {
		acctinfo = (acctinfo) ? acctinfo : app.settings;
		Speckle.stores.Projects.on('load',function(s, r, success) {
			if (r && s && s.proxy && s.proxy.reader && s.proxy.reader.jsonData && s.proxy.reader.jsonData.success) {
				app.startTimers();
				var params = Ext.apply(acctinfo, {
					"search_date_from" : (localStorage.getItem('account') == 'apitest') ? new Date().add('d',-240).format('Y-m-d') : new Date().add('d',-30).format('Y-m-d')
				});
				Speckle.stores.Entries.load({
					params : params
				});
				Speckle.stores.Tags.load({
					params : acctinfo
				});
				if (cb) {
					cb.call(scope || this);
				}
			} else {
				app.getComponent('userinfo').body.unmask();
				app.getComponent('mainapp').getComponent('settingsform').body.unmask();
				Ext.Msg.alert(Speckle.locale.error,'There was a problem communicating with Freckle.<br/><br/>Check your settings to make sure the API key and Account are correct.');
				app.getComponent('mainapp').setActiveItem(3);
			}
		}, this, {
			single : true
		});
		if (navigator.onLine){
			Speckle.stores.Projects.load( {
				params : acctinfo
			});
		}else{
			app.getComponent('userinfo').body.unmask();
			app.getComponent('mainapp').getComponent('settingsform').body.unmask();
			Ext.Msg.alert('Offline','Your currently offline, so im not gonna do anything. This feature will be implemented soon.');
		}
	},
	saveAccountInfo : function(account, token) {
		window.localStorage.setItem('account', account);
		window.localStorage.setItem('token', token);
	},
	startTimers : function() {
		app.getComponent('mainapp').getComponent('timer').tab.setBadge(Speckle.stores.Timers.getCount());
		setTimeout(function() {
			app.updateTimer();
			app.startTimers();
		}, 20000);
	},
	updateTimer : function(rec) {
		var t = app.getComponent('mainapp').getComponent('timer'), active;
		if (Speckle.stores.Timers.getCount() > 0) {
			if (!rec) {
				active = Speckle.stores.Timers.getAt(Speckle.stores.Timers.find('active', true));
			} else {
				active = rec;
			}
			if (active && active.data && t.getActiveItem()) {
				if (t.getActiveItem().id == t.getComponent('form').id) {
					t.items.items[1].items.items[0].items.items[0].el.update(Speckle.minuteRenderer(app.getTimerMinutes(active), active.data.project_id, false, 0));
				} else if (t.getActiveItem().id == t.getComponent('list').id) {
					t.getComponent('list').getComponent(0).refresh();
				}
			}
		}
	},
	getLocation : function(ts, cb) {
		if (this.getGeo()) {
			this.getGeo().getCurrentPosition(function(position) {
				if (position.coords.accuracy < 50 && position.timestamp.getTime() > ts.getTime()) {
					cb(position.coords);
				}
			}, function(error) {
				// do nothing yet
			});
		}
	},
	getGeo : function() {
		if (navigator.geolocation) {
			return navigator.geolocation;
		}
	},
	saveEntry : function(rec) {
		if (navigator.onLine){
			var m = this.getTimerMinutes(rec);
			Ext.Ajax.request( {
				url : '/api/entries',
				method : 'POST',
				params : {
					account : localStorage.getItem('account'),
					token : localStorage.getItem('token'),
					minutes : Speckle.minuteRenderer(m,rec.data.project_id,true,0),
					project_id : rec.data.project_id,
					desc : rec.data.description,
					date : rec.data.start_time.format('Y-m-d')
				},
				callback : function(req, success, resp) {
					if (success && resp.status == 200) {
						var r = Ext.decode(resp.responseText), t = app.getComponent('mainapp').getComponent('timer');
						if (r.success) {
							Speckle.stores.Timers.remove(rec);
							Speckle.stores.Timers.sync();
							t.setActiveItem(0);
							t.getComponent('form').resetTimerForm();
							app.loadStores();
							if (localStorage.getItem('account') == 'apitest') {
                Ext.Msg.alert('Testing','Since this is a test account, your time entry was mock submitted. Please use your own account to submit actual time entries.');
              }
						} else if (r.status == 200) {
							if (localStorage.getItem('account') == 'apitest') {
								Speckle.stores.Timers.remove(rec);
								Speckle.stores.Timers.sync();
								t.setActiveItem(0);
								t.getComponent('form').resetTimerForm();
								Ext.Msg.alert('Testing','Since this is a test account, your time entry was mock submitted. Please use your own account to submit actual time entries.');
							} else {
								Ext.Msg.alert(Speckle.locale.error,'There was a problem submitting your time entry, make sure to select a Project and Tag before submitting time and try again.');
							}
						} else {
							Ext.Msg.alert(Speckle.locale.error,'There was a problem submitting your time entry, make sure to select a Project and Tag before submitting time and try again.');
						}
					}
				}
			});
		}else{
			Ext.Msg.alert('Offline','Your currently offline, so im not gonna do anything. This feature will be implemented soon.');
		}
	},
	getTimerMinutes : function(rec) {
		return Speckle.getTimerMinutes(rec);
	}
});