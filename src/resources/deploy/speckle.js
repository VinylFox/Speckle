/*
 * Copyright 2010 Speckle Mobile
 */
Ext.ns("Ext.ux.touch");Ext.ux.touch.SwipeTabs=Ext.extend(Ext.util.Observable,{init:function(a){this.cmp=a;this.setFn=(Ext.versionDetail.major===0)?"Card":"ActiveItem";a.on("render",this.initSwipeHandlers,this)},initSwipeHandlers:function(){this.cmp.til=this.cmp.items.length-1;this.cmp.items.each(function(b,a){b.idx=a;if(b.getLayout().type==="card"){if(b.rendered){this.initChildSwipeHandlers(b)}else{b.on("render",this.initChildSwipeHandlers,this)}}else{if(b.rendered){this.addSwipe(b,a)}else{b.on("render",function(){this.addSwipe(b,a)},this)}}},this)},initChildSwipeHandlers:function(b){var a=b.idx;b.items.each(function(c){this.addSwipe(c,a)},this)},addSwipe:function(b,a){if(a===0){this.addSwipeLeft(b,a)}else{if(a===this.cmp.til){this.addSwipeRight(b,a)}else{this.addSwipeLeft(b,a);this.addSwipeRight(b,a)}}},addSwipeLeft:function(b,a){b.mon(b.el,"swipe",function(c){if(c.direction=="left"){this.cmp["set"+this.setFn](a+1)}},this)},addSwipeRight:function(b,a){b.mon(b.el,"swipe",function(c){if(c.direction=="right"){this.cmp["set"+this.setFn](a-1,{type:"slide",direction:"right"})}},this)}});Ext.preg("swipetabs",Ext.ux.touch.SwipeTabs);Ext.apply(Ext.anims,{rotate:new Ext.Anim({autoClear:false,out:false,before:function(a){var b="";if(this.dir=="ccw"){b="-"}this.from={"-webkit-transform":"rotate("+b+""+this.fromAngle+"deg)"};this.to={"-webkit-transform":"rotate("+b+""+this.toAngle+"deg)"}}})});Ext.ns("Ext.ux.touch");Ext.ux.touch.ListPullRefresh=Ext.extend(Ext.util.Observable,{langPullRefresh:"Pull down to refresh...",langReleaseRefresh:"Release to refresh...",langLoading:"Loading...",loading:false,reloadFn:undefined,init:function(a){this.cmp=a;this.lastUpdate=new Date();a.loadingText=undefined;a.on("render",this.initPullHandler,this);if(!this.reloadFn){a.getStore().on("load",this.reloadComplete,this)}},initPullHandler:function(){this.pullTpl=new Ext.XTemplate('<div class="msgwrap" style="height: 75px; margin-top: {[values.h-75]}px; position: relative;"><span class="arrow {s}"></span><span class="msg">{m}</span><span class="lastupdate">Last Updated: {[Ext.util.Format.date(values.l,"m/d/Y h:iA")]}</span></div>');this.pullWrapTpl=new Ext.XTemplate('<div class="pullrefresh" style="text-align: bottom; overflow: hidden;"></div>');this.loadingSpacerTpl=new Ext.XTemplate('<div class="loadingspacer" style="height: 0; position: relative;"><span class="arrow loading"></span><span class="msg">'+this.langLoading+"</span></div>");this.loadSpacerEl=this.loadingSpacerTpl.insertFirst(this.cmp.el.parent(),{},true);this.pullEl=this.pullWrapTpl.append(this.cmp.el.parent(),{},true);this.pullTpl.overwrite(this.pullEl,{h:0,m:this.langPullRefresh,l:this.lastUpdate});this.cmp.scroller.on("offsetchange",this.handlePull,this)},handlePull:function(a,b){if(a.direction==="vertical"&&!this.loading){if(b.y>0){if(b.y>75){if(this.state!==1){this.prevState=this.state;this.state=1;this.pullTpl.overwrite(this.pullEl,{h:b.y,m:this.langReleaseRefresh,l:this.lastUpdate});this.pullEl.setHeight(b.y);Ext.Anim.run(this.pullEl.select(".arrow").first(),"rotate",{dir:"ccw",fromAngle:0,toAngle:180})}}else{if(a.isAnimating){if(this.state!==3){this.prevState=this.state;this.state=3;if(this.prevState==1){this.loading=true;this.pullEl.setHeight(0);this.loadSpacerEl.setHeight(75);if(this.reloadFn){this.reloadFn.call(this,this.reloadComplete,this)}else{this.cmp.getStore().load()}}}else{this.pullEl.setHeight(0)}}else{this.prevState=this.state;this.state=2;this.pullTpl.overwrite(this.pullEl,{h:b.y,m:this.langPullRefresh,l:this.lastUpdate});this.pullEl.setHeight(b.y);if(this.prevState==1){Ext.Anim.run(this.pullEl.select(".arrow").first(),"rotate",{dir:"cw",fromAngle:180,toAngle:0})}}}}}},reloadComplete:function(){this.loading=false;this.lastUpdate=new Date();this.pullTpl.overwrite(this.pullEl,{h:0,m:this.langPullRefresh,l:this.lastUpdate});this.pullEl.setHeight(0);this.loadSpacerEl.setHeight(0)}});Ext.preg("listpullrefresh",Ext.ux.touch.ListPullRefresh);Ext.regModel("Timers",{idProperty:"id",fields:[{name:"id"},{name:"start_time",type:"date",dateFormat:"c"},{name:"end_time",type:"date",dateFormat:"c"},{name:"project_id"},{name:"description"},{name:"active",type:"boolean"},{name:"synced",type:"boolean"}]});Speckle.stores.Timers=new Ext.data.Store({model:"Timers",proxy:{type:"localstorage",id:"timers"},autoLoad:true,listeners:{add:function(){app.getComponent("mainapp").getComponent("timer").tab.setBadge(Speckle.stores.Timers.getCount())},remove:function(){app.getComponent("mainapp").getComponent("timer").tab.setBadge(Speckle.stores.Timers.getCount())}}});Ext.regModel("TimerPauses",{idProperty:"id",fields:[{name:"id"},{name:"start_time"},{name:"end_time"},{name:"timer_id"},{name:"active",type:"boolean"}]});Speckle.stores.TimerPauses=new Ext.data.Store({model:"TimerPauses",proxy:{type:"localstorage",id:"timerpauses"},autoLoad:true});Ext.regModel("Projects",{idProperty:"id",fields:[{name:"id"},{name:"account_id"},{name:"user_id"},{name:"created_at"},{name:"name"},{name:"billable"},{name:"updated_at"},{name:"enabled"},{name:"stepping"},{name:"invoice_recipient_details"},{name:"budget"}]});Speckle.stores.Projects=new Ext.data.Store({model:"Projects",proxy:{type:"ajax",url:"/api/projects",reader:{type:"json",root:"data"}},disableCache:true});Ext.regModel("Tags",{idProperty:"id",fields:[{name:"id"},{name:"account_id"},{name:"created_at"},{name:"name"},{name:"billable"},{name:"updated_at"}]});Speckle.stores.Tags=new Ext.data.Store({model:"Tags",proxy:{type:"ajax",url:"/api/tags",reader:{type:"json",root:"data"}},sorters:"name",getGroupString:function(a){return a.get("name").split("")[0]},disableCache:true});Ext.regModel("Entries",{idProperty:"id",fields:[{name:"id"},{name:"created_at"},{name:"description"},{name:"billable"},{name:"updated_at"},{name:"project_id"},{name:"minutes"},{name:"user_id"},{name:"url"},{name:"date",type:"date",dateFormat:"Y-m-d"},{name:"week_start",mapping:"date",convert:function(a){if(a.indexOf("-")>-1){var b=Date.parseDate(a,"c");var d=parseInt(b.format("w"),10),c=b.add(Date.DAY,(d*-1));return c.format("n/j")}else{return a}}},{name:"date_sort",mapping:"date",convert:function(a){if(!Ext.isNumber(a)&&a.indexOf("-")>-1){var b=Date.parseDate(a,"c");return b.format("U")}else{return a}}}]});Speckle.stores.Entries=new Ext.data.Store({model:"Entries",proxy:{type:"ajax",url:"/api/entries",reader:{type:"json",root:"data"}},sorters:{direction:"DESC",property:"date_sort"},getGroupString:function(a){return a.get("week_start")},disableCache:true});Ext.contains=function(b,c){var d=false;Ext.each(b,function(a){if(a.value==c){d=true}});return d};Speckle.stores.WeekGroups=new Ext.data.Store({model:"IndexBarModel"});Speckle.stores.Entries.on("load",function(a,b,d){if(d){var c=[];Speckle.stores.Entries.each(function(e){if(!Ext.contains(c,e.get("week_start"))){c.push({key:e.get("week_start"),value:e.get("week_start")})}});Speckle.stores.WeekGroups.loadData(c)}});Speckle.views.EntriesList=Ext.extend(Ext.List,{itemTpl:new Ext.XTemplate('<tpl for="."><div class="entry" id="entry-{id}"><div class="date">{[Speckle.dateRenderer(values.date)]}</div><div class="minutes">{[Speckle.minuteRenderer(values.minutes)]}</div><div class="project">{[Speckle.projectRenderer(values.project_id)]}</div><div class="tags">{[Speckle.tagsRenderer(values.description)]}</div></div></tpl>'),itemSelector:"div.entry",singleSelect:true,indexBar:{alphabet:[],store:Speckle.stores.WeekGroups},grouped:true,autoHeight:true,overItemCls:"x-view-over",emptyText:"No Time Entries",initComponent:function(){this.store=Speckle.stores.Entries;this.plugins=[new Ext.ux.touch.ListPullRefresh({reloadFn:function(a,b){Speckle.stores.Entries.on("load",a,b,{single:true});var c=Ext.apply(app.settings,{search_date_from:(localStorage.getItem("account")=="apitest")?new Date().add("d",-240).format("Y-m-d"):new Date().add("d",-30).format("Y-m-d")});Speckle.stores.Entries.load({params:c})}})];Speckle.views.EntriesList.superclass.initComponent.call(this)}});Ext.reg("entrieslist",Speckle.views.EntriesList);Speckle.views.EntriesPanel=Ext.extend(Ext.Panel,{fullscreen:true,cls:"entries",dock:"left",layout:"fit",items:[{xtype:"entrieslist"}],dockedItems:[{xtype:"toolbar",dock:"top",title:Speckle.locale.entries,defaults:{iconMask:true,ui:"plain"},items:[{iconCls:"search",handler:function(){app.getComponent("mainapp").getComponent("entries").setActiveItem(1,"flip")}}]}]});Ext.reg("entries",Speckle.views.EntriesPanel);Speckle.views.ProjectsList=Ext.extend(Ext.List,{itemTpl:'<tpl for="."><div class="project" id="project-{id}"><div class="budget"><a href="" class="budget-piechart p40"></a></div><div class="name">{name}</div></div></tpl>',itemSelector:"div.project",singleSelect:true,indexBar:true,grouped:false,autoHeight:true,overItemCls:"x-view-over",emptyText:"No Projects",initComponent:function(){this.store=Speckle.stores.Projects;Speckle.views.ProjectsList.superclass.initComponent.call(this);this.on("itemtap",function(c,a,g,f){var b=c.getStore().getAt(a),d=app.getComponent("mainapp").getComponent("projects");d.getComponent("detail").loadProjectRecord.call(d.getComponent("detail"),b);d.setActiveItem(1,"flip")})}});Ext.reg("projectslist",Speckle.views.ProjectsList);Speckle.views.ProjectsPanel=Ext.extend(Ext.Panel,{fullscreen:true,cls:"projects",dock:"left",layout:"fit",items:[{xtype:"projectslist"}],dockedItems:[{xtype:"toolbar",dock:"top",title:Speckle.locale.projects,defaults:{iconMask:true,ui:"plain"},items:[{iconCls:"add",handler:function(){var a=app.getComponent("mainapp").getComponent("projects");a.getComponent("edit").resetProjectForm.call(a.getComponent("edit"));a.setActiveItem(2,"flip")}}]}]});Ext.reg("projects",Speckle.views.ProjectsPanel);Speckle.views.ProjectDetail=Ext.extend(Ext.Panel,{fullscreen:true,autoHeight:true,dock:"left",cls:"project-detail coming-soon",dockedItems:[{xtype:"toolbar",dock:"top",title:Speckle.locale.project,items:[{ui:"back",text:Speckle.locale.projects,handler:function(){this.ownerCt.ownerCt.ownerCt.setActiveItem(0,"flip")}},{xtype:"spacer"},{text:Speckle.locale.edit,handler:function(b){var c=app.getComponent("mainapp").getComponent("projects"),a=Speckle.stores.Projects.getAt(Speckle.stores.Projects.find("id",c.getComponent("detail").projectId));c.getComponent("edit").loadProjectRecord.call(c.getComponent("edit"),a);c.setActiveItem(2,"flip")}}]}],resetProjectForm:function(){this.projectId=undefined},loadProjectRecord:function(a){this.projectId=a.data.id},updateProjectRecord:function(){}});Ext.reg("project-detail",Speckle.views.ProjectDetail);Speckle.views.ProjectEdit=Ext.extend(Ext.form.FormPanel,{fullscreen:true,autoHeight:true,dock:"left",cls:"project-edit",items:[{xtype:"fieldset",title:"Project Settings",items:[{xtype:"textfield",label:"Name",name:"name"},{xtype:"checkboxfield",label:"Billable",name:"billable"},{xtype:"checkboxfield",label:"Enabled",name:"enabled"},{xtype:"numberfield",label:"Stepping",name:"stepping"},{xtype:"numberfield",label:"Budget",name:"budget"}],}],dockedItems:[{xtype:"toolbar",dock:"top",title:"Edit Project",items:[{ui:"back",text:Speckle.locale.projects,handler:function(){app.getComponent("mainapp").getComponent("projects").setActiveItem(0,"flip")}}]}],resetProjectForm:function(){this.projectId=undefined},loadProjectRecord:function(a){this.load(a);this.projectId=a.data.id},updateProjectRecord:function(){}});Ext.reg("project-edit",Speckle.views.ProjectEdit);Speckle.views.UserInfoForm=Ext.extend(Ext.form.FormPanel,{fullscreen:true,scroll:"vertical",dock:"left",items:[{cls:"descriptive-text",html:Speckle.locale.accountdesc,xtype:"container"},{label:Speckle.locale.account,xtype:"textfield",name:"account",itemId:"account"},{cls:"hint-text",html:Speckle.locale.accounthint,xtype:"container"},{cls:"descriptive-text",html:Speckle.locale.apikeydesc,xtype:"container"},{label:Speckle.locale.apikey,xtype:"textfield",name:"token",itemId:"token"},{xtype:"checkbox",label:"Test Only",listeners:{check:function(a){a.ownerCt.getComponent("account").disable();a.ownerCt.getComponent("token").disable();a.ownerCt.getComponent("account").setValue(app.settingsTest.account);a.ownerCt.getComponent("token").setValue(app.settingsTest.token)},uncheck:function(a){a.ownerCt.getComponent("account").enable();a.ownerCt.getComponent("token").enable();a.ownerCt.getComponent("account").setValue("");a.ownerCt.getComponent("token").setValue("")}}},{xtype:"container",html:"&nbsp;"},{xtype:"button",text:"Let's go!",handler:function(a){var d=a.ownerCt,c=d.getValues();if(c.account!=""&&c.token!=""){d.body.mask(false,Speckle.locale.verifying);app.saveAccountInfo(c.account,c.token);app.loadStores(c,function(){d.body.unmask();app.setActiveItem(1)})}else{Ext.Msg.alert(Speckle.locale.accountinfo,Speckle.locale.accountinfomsg)}}}],dockedItems:[{xtype:"toolbar",dock:"top",title:"Account Settings"}]});Ext.reg("userinfoform",Speckle.views.UserInfoForm);Speckle.views.SettingsForm=Ext.extend(Ext.form.FormPanel,{fullscreen:true,scroll:"vertical",dock:"left",initComponent:function(){Speckle.views.SettingsForm.superclass.initComponent.call(this);this.on("activate",function(a){a.getComponent("acct").getComponent("account").setValue(localStorage.getItem("account")||"");a.getComponent("acct").getComponent("token").setValue(localStorage.getItem("token")||"");a.getComponent("pref").getComponent("geo").setValue(localStorage.getItem("geo")||false)},{defer:200});this.on("beforedeactivate",function(b){var c=b,a=c.getValues();if(a.account!=""&&a.token!=""){if(a.account!=localStorage.getItem("account")||a.token!=localStorage.getItem("token")){b.saveChanges.call(b,a)}return true}else{b.ownerCt.setActiveItem(2);return false}})},items:[{xtype:"fieldset",title:"Account",itemId:"acct",items:[{label:Speckle.locale.account,xtype:"textfield",name:"account",itemId:"account"},{label:Speckle.locale.apikey,xtype:"textfield",name:"token",itemId:"token"}]},{xtype:"fieldset",title:"Preferences",itemId:"pref",items:[{label:"Location Aware",xtype:"toggle",name:"geo",itemId:"geo",listeners:{change:function(d,c,b,a){if(a){if(localStorage.getItem("account")=="apitest"){Ext.Msg.alert("Testing","Since this is a test account, Location awareness cannot be enabled.");d.toggle()}else{Ext.Msg.alert("Location Aware","This feature will decide the project your working on based on your location if you have previously logged hours on this project at the current location.")}}}}}]},{xtype:"container",html:"&nbsp;"},{xtype:"button",text:"Update",itemId:"update",handler:function(a){var d=a.ownerCt,c=d.getValues();d.saveChanges.call(d,c)}}],dockedItems:[{xtype:"toolbar",dock:"top",title:Speckle.locale.settings,defaults:{iconMask:true,ui:"plain"},items:[{iconCls:"trash",handler:function(){Ext.Msg.confirm("Clear Settings","Are you sure you want to clear all your local settings?<br/><br/>This means you will have to enter account information again to use this app and any active timers will be lost.<br/><br/>No data on your Freckle account will be changed.",function(){app.saveAccountInfo("","");localStorage.setItem("geo",null);location.href=window.location.href})}}]}],saveChanges:function(a){if(!a){a=this.getValues()}if(a.account!=""&&a.token!=""){localStorage.setItem("geo",this.getComponent("pref").getComponent("geo").getValue());this.body.mask(false,Speckle.locale.verifying);app.loadStores(a,function(){this.body.unmask();localStorage.setItem("account",a.account);localStorage.setItem("token",a.token);app.getComponent("mainapp").setActiveItem(0)},this);Speckle.stores.Projects.load({params:a})}else{Ext.Msg.alert(Speckle.locale.accountinfo,Speckle.locale.accountinfomsg)}}});Ext.reg("settingsform",Speckle.views.SettingsForm);Speckle.views.TimerList=Ext.extend(Ext.List,{itemTpl:new Ext.XTemplate('<tpl for="."><div class="timer <tpl if="active">active</tpl>" id="timer-{id}"><div class="date">{[Speckle.dateRenderer(values.start_time)]}</div><div class="minutes">{[this.getMinutes(values)]}</div><div class="project">{[Speckle.projectRenderer(values.project_id)]}</div><div class="tags">{[Speckle.tagsRenderer(values.description)]}</div></div></tpl>',{getMinutes:function(a){return Speckle.minuteRenderer(Speckle.getTimerMinutes({data:a}),a.project_id,false,0)}}),itemSelector:"div.timer",singleSelect:true,indexBar:true,grouped:false,autoHeight:true,overItemCls:"x-view-over",emptyText:"No Active Timers",initComponent:function(){this.store=Speckle.stores.Timers;Speckle.views.TimerList.superclass.initComponent.call(this);this.on("itemtap",function(d,a,g,f){var c=d.getStore().getAt(a),b=app.getComponent("mainapp").getComponent("timer");b.getComponent("form").loadTimeRecord(c);b.setActiveItem(1,"flip")});this.on("activate",function(a){app.getComponent("mainapp").getComponent("timer").getComponent("list").refresh()})}});Ext.reg("timerslist",Speckle.views.TimerList);Speckle.views.TimerPanel=Ext.extend(Ext.Panel,{fullscreen:true,cls:"timers",dock:"left",layout:"fit",items:[{xtype:"timerslist"}],dockedItems:[{xtype:"toolbar",dock:"top",title:"Timers",defaults:{iconMask:true,ui:"plain"},items:[{iconCls:"add",handler:function(b){var a=app.getComponent("mainapp").getComponent("timer");a.setActiveItem(1,"flip");a.getComponent("form").resetTimerForm()}}]}]});Ext.reg("timers",Speckle.views.TimerPanel);Speckle.views.TimerForm=Ext.extend(Ext.form.FormPanel,{fullscreen:true,scroll:"vertical",dock:"left",items:[{xtype:"panel",items:[{xtype:"container",html:"&nbsp;",hidden:true,cls:"timer-current",itemId:"timerCurrent"},{xtype:"button",text:"Start",itemId:"start",ui:"confirm-round",handler:function(c){var d=Speckle.stores.Tags.getAt(Speckle.stores.Tags.find("id",c.ownerCt.ownerCt.getComponent("timedetail").getComponent("tags").getValue())),a=(d)?d.data.name:"";var e=Speckle.stores.Timers.add({id:Speckle.stores.Timers.getCount()+1,start_time:new Date(),active:true,project_id:c.ownerCt.ownerCt.getComponent("timedetail").getComponent("project").getValue(),description:a});Speckle.stores.Timers.sync();c.ownerCt.ownerCt.loadTimeRecord.call(c.ownerCt.ownerCt,e[0])}},{xtype:"container",html:"&nbsp;"},{xtype:"button",text:"Pause",itemId:"pause",ui:"action-round",disabled:true,handler:function(a){Ext.Msg.alert("Sorry","Feature not implemented yet.")}},{xtype:"container",html:"&nbsp;"},{xtype:"button",text:"Stop",itemId:"stop",ui:"decline-round",disabled:true,handler:function(a){var c=Speckle.stores.Timers.getAt(Speckle.stores.Timers.find("id",a.ownerCt.ownerCt.timerId));app.saveEntry(c)}}]},{xtype:"fieldset",title:"Time Detail",itemId:"timedetail",items:[{label:"Project",xtype:"select",name:"project",itemId:"project",displayField:"name",valueField:"id",store:Speckle.stores.Projects,listeners:{change:function(b,a){if(b.ownerCt.ownerCt.timerId){var c=Speckle.stores.Timers.getAt(Speckle.stores.Timers.find("id",b.ownerCt.ownerCt.timerId));c.set("project_id",a);Speckle.stores.Timers.sync()}}}},{label:"Tags",xtype:"select",name:"tags",itemId:"tags",displayField:"name",valueField:"id",store:Speckle.stores.Tags,listeners:{change:function(b,a){if(b.ownerCt.ownerCt.timerId){var c=Speckle.stores.Timers.getAt(Speckle.stores.Timers.find("id",b.ownerCt.ownerCt.timerId));c.set("description",Speckle.stores.Tags.getAt(Speckle.stores.Tags.find("id",a)).data.name);Speckle.stores.Timers.sync()}}}}]}],dockedItems:[{xtype:"toolbar",dock:"top",title:Speckle.locale.timer,itemId:"timertb",items:[{ui:"back",text:"Timers",itemId:"timers",handler:function(b){var a=app.getComponent("mainapp").getComponent("timer");a.setActiveItem(0,"flip");a.getComponent("list").getComponent(0).refresh()}},{xtype:"spacer"},{iconMask:true,ui:"plain",iconCls:"trash",itemId:"timertrash",handler:function(a){if(a.ownerCt.ownerCt.timerId){Ext.Msg.confirm("Delete Timer?","Are you sure you want to delete this Timer?",function(){Speckle.stores.Timers.removeAt(Speckle.stores.Timers.find("id",a.ownerCt.ownerCt.timerId));Speckle.stores.Timers.sync();if(Speckle.stores.Timers.getCount()==0){a.ownerCt.ownerCt.ownerCt.setActiveItem(1);a.ownerCt.ownerCt.ownerCt.items.items[1].resetTimerForm()}else{a.ownerCt.ownerCt.ownerCt.setActiveItem(0)}})}else{Ext.Msg.alert("No Timer","No Timer has been started yet.")}}}]}],resetTimerForm:function(){var a=this.items.items;a[0].items.items[0].hide();a[0].items.items[1].show();a[0].items.items[3].disable();a[0].items.items[5].disable();a[1].getComponent("project").setValue(0);a[1].getComponent("tags").setValue("");this.timerId=undefined},loadTimeRecord:function(b){var a=this.items.items;a[0].items.items[1].hide();a[0].items.items[0].show();a[0].items.items[3].enable();a[0].items.items[5].enable();this.timerId=b.data.id;if(b.data.project_id!=""){a[1].getComponent("project").setValue(b.data.project_id)}if(b.data.description!=""){a[1].getComponent("tags").setValue(b.data.description)}setTimeout(function(){app.updateTimer(b)},30)},updateTimerRecord:function(){}});Ext.reg("timer-form",Speckle.views.TimerForm);Speckle.views.Search=Ext.extend(Ext.Panel,{fullscreen:true,autoHeight:true,dock:"left",cls:"search coming-soon",dockedItems:[{xtype:"toolbar",dock:"top",title:"Entry Search",items:[{ui:"back",text:Speckle.locale.entries,handler:function(){app.getComponent("mainapp").getComponent("entries").setActiveItem(0,"flip")}}]}]});Ext.reg("search",Speckle.views.Search);Ext.override(Ext.form.FormPanel,{setValues:function(b){var a=this.getFields(),c,d;b=b||{};for(c in b){if(b.hasOwnProperty(c)){if(Ext.isArray(a[c])){a[c].forEach(function(e){if(Ext.isArray(b[c])){e.setChecked((b[c].indexOf(e.getValue())!=-1))}else{e.setChecked((b[c]==e.getValue()))}})}else{d=a[c];if(d&&d.setChecked){d.setChecked(b[c])}else{if(d){d.setValue(b[c])}}}}}return this}});Speckle.minuteRenderer=function(d,n,i,c){var a="m",f="h",o="<span>",j="</span>";c=(!c)?0:c;if(d==0){k=Speckle.locale.zero;e="0"+a}else{var k=d+o+a+j,e;if((n&&Ext.isNumber(n))||c>0){if(c==0){var l=Speckle.stores.Projects.find("id",n);if(l){var b=Speckle.stores.Projects.getAt(l);if(b&&b.data){c=b.data.stepping}}}if(c>0){var g=d%c;if(g<c&&g!=0){d=d-g+c;k=d+o+a+j;e=d+a}}}if(d<60){if(d%30==0){k=Speckle.locale.half+o+f+j;e="30"+a}else{if(d%15==0){if(d%60==15){k=Speckle.locale.quarter+o+f+j;e="15"+a}else{k=Speckle.locale.threequarter+o+f+j;e="45"+a}}else{if(d%60==20){k=Speckle.locale.third+o+f+j}else{if(d%60==40){k=Speckle.locale.twothirds+o+f+j}}}}}else{if(d%60==0){k=(d/60)+o+f+j}else{if(d%30==0){k=((d-30)/60)+Speckle.locale.half+o+f+j;e=d+a}else{if(d%15==0&&d!=15&&d!=45){if(d%60==15){k=((d-15)/60)+Speckle.locale.quarter+o+f+j;e=d+a}else{k=((d-45)/60)+Speckle.locale.threequarter+o+f+j;e=d+a}}else{if(d%60==40){k=((d-40)/60)+Speckle.locale.twothirds+o+f+j}else{if(d%60==20){k=((d-20)/60)+Speckle.locale.third+o+f+j}}}}}}}if(i){k=(e)?e:String(k).replace(/<\/?[^>]+>/gi,"")}return k};Speckle.getTimerMinutes=function(f){if(f.data.start_time){var e=f.data.start_time,d=e.getTime(),b=new Date().getTime(),c=b-d,a=Math.ceil((c/1000)/60);return a}else{return 0}};Speckle.dateRenderer=function(b){if(b=="Invalid Date"||b==null||!b){return""}else{if(!Ext.isDate(b)){b=Date.parseDate(b,"c")}var c=b.format("M j"),a=new Date();if(b.getFullYear()!=a.getFullYear()){c=b.format("M j Y")}return c}};Speckle.projectRenderer=function(a){if(a&&Ext.isNumber(a)){var b=Speckle.stores.Projects.getAt(Speckle.stores.Projects.find("id",a));if(b&&b.data){return b.data.name}else{return"N/A"}}else{return"N/A"}};Speckle.tagsRenderer=function(b){var a='<a class="tag">',c="</a>";if(b==""){return""}else{var d="";if(b.indexOf(",")!=-1){b=b.split(",")}else{b=[b]}Ext.each(b,function(e){d=d+a+e+c});return d}};Speckle.views.Splash=Ext.extend(Ext.Panel,{fullscreen:true,cardSwitchAnimation:"flip",autoHeight:true,dock:"left",cls:"splash-bg",dockedItems:[{xtype:"toolbar",dock:"top",title:Speckle.locale.appname}]});Ext.reg("splash",Speckle.views.Splash);Speckle.views.MainApp=Ext.extend(Ext.TabPanel,{fullscreen:true,activeItem:0,tabBar:{dock:"bottom",scroll:"horizontal",sortable:true,layout:{pack:"center"}},plugins:[new Ext.ux.touch.SwipeTabs()],items:[{iconCls:"bookmarks",title:Speckle.locale.entries,itemId:"entries",layout:{activeItem:0,type:"card"},items:[{xtype:"entries",itemId:"list"},{xtype:"search",itemId:"search"}]},{iconCls:"time",title:Speckle.locale.timer,badgeText:"0",layout:{activeItem:0,type:"card"},itemId:"timer",listeners:{beforeactivate:function(a){if(Speckle.stores.Timers.getCount()<2){if(Speckle.stores.Timers.getCount()==1){a.getComponent("form").loadTimeRecord(Speckle.stores.Timers.getAt(0))}a.setActiveItem(1)}else{a.setActiveItem(0)}return true}},items:[{xtype:"timers",itemId:"list"},{xtype:"timer-form",itemId:"form"}]},{iconCls:"favorites",title:Speckle.locale.projects,itemId:"projects",layout:{activeItem:0,type:"card"},items:[{xtype:"projects",itemId:"list"},{xtype:"project-detail",itemId:"detail"},{xtype:"project-edit",itemId:"edit"}]},{iconCls:"settings",title:Speckle.locale.settings,xtype:"settingsform",itemId:"settingsform"}]});Ext.reg("mainapp",Speckle.views.MainApp);Speckle.App=Ext.extend(Ext.Panel,{fullscreen:true,cardSwitchAnimation:"flip",layout:{activeItem:0,type:"card"},items:[{xtype:"splash"},{xtype:"mainapp",itemId:"mainapp"},{xtype:"userinfoform",itemId:"userinfo"}],loadStores:function(b,a,c){b=(b)?b:app.settings;Speckle.stores.Projects.on("load",function(d,e,g){if(e&&d&&d.proxy&&d.proxy.reader&&d.proxy.reader.jsonData&&d.proxy.reader.jsonData.success){app.startTimers();var f=Ext.apply(b,{search_date_from:(localStorage.getItem("account")=="apitest")?new Date().add("d",-240).format("Y-m-d"):new Date().add("d",-30).format("Y-m-d")});Speckle.stores.Entries.load({params:f});Speckle.stores.Tags.load({params:b});if(a){a.call(c||this)}}else{app.getComponent("userinfo").body.unmask();app.getComponent("mainapp").getComponent("settingsform").body.unmask();Ext.Msg.alert(Speckle.locale.error,"There was a problem communicating with Freckle.<br/><br/>Check your settings to make sure the API key and Account are correct.");app.getComponent("mainapp").setActiveItem(3)}},this,{single:true});if(navigator.onLine){Speckle.stores.Projects.load({params:b})}else{app.getComponent("userinfo").body.unmask();app.getComponent("mainapp").getComponent("settingsform").body.unmask();Ext.Msg.alert("Offline","Your currently offline, so im not gonna do anything. This feature will be implemented soon.")}},saveAccountInfo:function(b,a){window.localStorage.setItem("account",b);window.localStorage.setItem("token",a)},startTimers:function(){app.getComponent("mainapp").getComponent("timer").tab.setBadge(Speckle.stores.Timers.getCount());setTimeout(function(){app.updateTimer();app.startTimers()},20000)},updateTimer:function(c){var a=app.getComponent("mainapp").getComponent("timer"),b;if(Speckle.stores.Timers.getCount()>0){if(!c){b=Speckle.stores.Timers.getAt(Speckle.stores.Timers.find("active",true))}else{b=c}if(b&&b.data&&a.getActiveItem()){if(a.getActiveItem().id==a.getComponent("form").id){a.items.items[1].items.items[0].items.items[0].el.update(Speckle.minuteRenderer(app.getTimerMinutes(b),b.data.project_id,false,0))}else{if(a.getActiveItem().id==a.getComponent("list").id){a.getComponent("list").getComponent(0).refresh()}}}}},getLocation:function(b,a){if(this.getGeo()){this.getGeo().getCurrentPosition(function(c){if(c.coords.accuracy<50&&c.timestamp.getTime()>b.getTime()){a(c.coords)}},function(c){})}},getGeo:function(){if(navigator.geolocation){return navigator.geolocation}},saveEntry:function(b){if(navigator.onLine){var a=this.getTimerMinutes(b);Ext.Ajax.request({url:"/api/entries",method:"POST",params:{account:localStorage.getItem("account"),token:localStorage.getItem("token"),minutes:Speckle.minuteRenderer(a,b.data.project_id,true,0),project_id:b.data.project_id,desc:b.data.description,date:b.data.start_time.format("Y-m-d")},callback:function(e,g,f){if(g&&f.status==200){var d=Ext.decode(f.responseText),c=app.getComponent("mainapp").getComponent("timer");if(d.success){Speckle.stores.Timers.remove(b);Speckle.stores.Timers.sync();c.setActiveItem(0);c.getComponent("form").resetTimerForm();app.loadStores();if(localStorage.getItem("account")=="apitest"){Ext.Msg.alert("Testing","Since this is a test account, your time entry was mock submitted. Please use your own account to submit actual time entries.")}}else{if(d.status==200){if(localStorage.getItem("account")=="apitest"){Speckle.stores.Timers.remove(b);Speckle.stores.Timers.sync();c.setActiveItem(0);c.getComponent("form").resetTimerForm();Ext.Msg.alert("Testing","Since this is a test account, your time entry was mock submitted. Please use your own account to submit actual time entries.")}else{Ext.Msg.alert(Speckle.locale.error,"There was a problem submitting your time entry, make sure to select a Project and Tag before submitting time and try again.")}}else{Ext.Msg.alert(Speckle.locale.error,"There was a problem submitting your time entry, make sure to select a Project and Tag before submitting time and try again.")}}}}})}else{Ext.Msg.alert("Offline","Your currently offline, so im not gonna do anything. This feature will be implemented soon.")}},getTimerMinutes:function(a){return Speckle.getTimerMinutes(a)}});