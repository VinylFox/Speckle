Ext.regModel('Timers', {
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
});