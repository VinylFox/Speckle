Speckle.views.ProjectsList = Ext.extend(Ext.List, {
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

Ext.reg('projects', Speckle.views.ProjectsPanel);