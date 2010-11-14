Speckle.views.Search = Ext.extend(Ext.Panel, {
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

Ext.reg('search', Speckle.views.Search);