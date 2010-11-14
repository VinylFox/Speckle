Speckle.views.UserInfoForm = Ext.extend(Ext.form.FormPanel, {
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

Ext.reg('userinfoform', Speckle.views.UserInfoForm);