Speckle.views.ProjectDetail = Ext.extend(Ext.Panel, {
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

Ext.reg('project-detail', Speckle.views.ProjectDetail);