Speckle.views.TimerForm = Ext.extend(Ext.form.FormPanel, {
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

Ext.reg('timer-form', Speckle.views.TimerForm);