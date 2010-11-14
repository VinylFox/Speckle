Ext.override(Ext.form.FormPanel, {
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