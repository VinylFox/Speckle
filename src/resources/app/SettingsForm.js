Speckle.views.SettingsForm = Ext.extend(Ext.form.FormPanel, {
	fullscreen : true,
	scroll : 'vertical',
	dock : 'left',
	initComponent : function() {
		Speckle.views.SettingsForm.superclass.initComponent.call(this);
		this.on('activate',function(frm) {
			frm.getComponent('acct').getComponent('account').setValue(localStorage.getItem('account') || '');
			frm.getComponent('acct').getComponent('token').setValue(localStorage.getItem('token') || '');
			frm.getComponent('pref').getComponent('geo').setValue(localStorage.getItem('geo') || false);
		}, {
			defer : 200
		});
		this.on('beforedeactivate', function(cmp) {
			var f = cmp, v = f.getValues();
			if (v.account != '' && v.token != '') {
				if (v.account != localStorage.getItem('account')|| v.token != localStorage.getItem('token')) {
					cmp.saveChanges.call(cmp, v);
				}
				return true;
			} else {
				cmp.ownerCt.setActiveItem(2);
				return false;
			}
		});
	},
	items : [ {
		xtype : 'fieldset',
		title : 'Account',
		itemId : 'acct',
		items : [ {
			label : Speckle.locale.account,
			xtype : 'textfield',
			name : 'account',
			itemId : 'account'
		}, {
			label : Speckle.locale.apikey,
			xtype : 'textfield',
			name : 'token',
			itemId : 'token'
		} ]
	},{
		xtype : 'fieldset',
		title : 'Preferences',
		itemId : 'pref',
		items : [ {
			label : 'Location Aware',
			xtype : 'toggle',
			name : 'geo',
			itemId : 'geo',
			listeners : {
				"change" : function(s, t, ov, nv) {
					if (nv) {
						if (localStorage.getItem('account') == 'apitest') {
							Ext.Msg.alert('Testing','Since this is a test account, Location awareness cannot be enabled.');
							s.toggle();
						} else {
							Ext.Msg.alert('Location Aware','This feature will decide the project your working on based on your location if you have previously logged hours on this project at the current location.');
						}
					}
				}
			}
		} ]
	}, {
		xtype : 'container',
		html : '&nbsp;'
	}, {
		xtype : 'button',
		text : 'Update',
		itemId : 'update',
		handler : function(b) {
			var f = b.ownerCt, v = f.getValues();
			f.saveChanges.call(f, v);
		}
	} ],
	dockedItems : [ {
		xtype : "toolbar",
		dock : "top",
		title : Speckle.locale.settings,
		defaults : {
			iconMask : true,
			ui : 'plain'
		},
		items : [ {
			iconCls : 'trash',
			handler : function() {
				Ext.Msg.confirm('Clear Settings','Are you sure you want to clear all your local settings?<br/><br/>This means you will have to enter account information again to use this app and any active timers will be lost.<br/><br/>No data on your Freckle account will be changed.',function() {
					app.saveAccountInfo('', '');
					localStorage.setItem('geo', null);
					location.href = window.location.href;
				});
			}
		} ]
	} ],
	saveChanges : function(v) {
		if (!v) {
			v = this.getValues();
		}
		if (v.account != '' && v.token != '') {
			localStorage.setItem('geo', this.getComponent('pref').getComponent('geo').getValue());
			this.body.mask(false, Speckle.locale.verifying);
			app.loadStores(v, function() {
				this.body.unmask();
				localStorage.setItem('account',v.account);
				localStorage.setItem('token', v.token);
				app.getComponent('mainapp').setActiveItem(0);
			}, this);
			Speckle.stores.Projects.load( {
				params : v
			});
		} else {
			Ext.Msg.alert(Speckle.locale.accountinfo, Speckle.locale.accountinfomsg);
		}
	}
});

Ext.reg('settingsform', Speckle.views.SettingsForm);