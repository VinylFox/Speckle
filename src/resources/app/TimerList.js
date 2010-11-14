Speckle.views.TimerList = Ext.extend(Ext.List,{
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

Ext.reg('timers', Speckle.views.TimerPanel);