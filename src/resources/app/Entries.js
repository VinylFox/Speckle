Speckle.views.EntriesList = Ext.extend(Ext.List,{
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

Ext.reg('entries', Speckle.views.EntriesPanel);