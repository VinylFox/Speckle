Speckle.views.ProjectEdit = Ext.extend(Ext.form.FormPanel, {
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

Ext.reg('project-edit', Speckle.views.ProjectEdit);