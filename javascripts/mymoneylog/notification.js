var notification  = 
{
	id		: "#mini-notification",
	cssClass	: ".notification",
	container	: 
	{
		id: "#notificationContainer",
		html: ""
	},
	settings	:
	{
		closeButton		: true, 
		closeButtonText	: 'x', 
		hideOnClick		: true,  
		position		: 'bottom', 
		effect			: 'slide', 
		opacity			: 1, 
		time			: 5000
	},
	type	:
	{
		success 	: "notify-green",
		warning 	: "notify-yellow",
		error   	: "notify-red",
		important	: "notify-blue",
		blank		: "notify-blankact",
		remove		: function()
		{
			var removedClasses="";
			for(key in notification.type)
			{
				removedClasses+=" " + notification.type[key];
			}
			$(notification.cssClass).removeClass(removedClasses);
		}
	},
	title	:	
	{
		id	: "#notificationTitle",
		text: ""	
	},
	message	:
	{
		id	: "#notificationMessage",
		text: ""
	},
	events	:
	{
		init: function (event, ui)
		{
			//guardo o html do container pois precisarei dele ao fazer uma notificacao
			//mas so guardo a primeira vez que entramos
			if(notification.container.html == "")
			{
				notification.container.html = $(notification.container.id).html();
			}
		},
		hide: function (event, ui)
		{
			//escondo a notificacao
			$(notification.container.id).hide();
		}
	},
	show	: function(message, title, type, timeOut)
	{
		var defaultSettings = {};
		if(type == undefined)
		{
			type = "important";
		}
		if(type == "blank")
		{
			defaultSettings =
			{
				closeButton: false, 
				hideOnClick: true,  
				position: 'bottom', 
				effect: 'fade',  
				time: 2500 
			};
		}
		else 
		{
			if(title == undefined)
			{
				title = mlog.translator.msg(type);
			}
		}
		
		if(timeOut != undefined)
		{
			defaultSettings.time = timeOut;
		}
		
		type = notification.type[type];
		
		defaultSettings = $.extend({},notification.settings, defaultSettings);
		
		//coloco o html de volta porque o plugin tem um bug q ele joga
		//dentro do html atual outro html recursivamente
		$(notification.container.id).html(notification.container.html);
		//notification.type.remove();
		$(notification.cssClass).addClass(type);
		$(notification.title.id).html(title);
		$(notification.message.id).html(mlog.translator.msg(message));
		$(notification.container.id).show();
		//por padrao o plugin cria um cache em $.data
		defaultSettings.onHidden = notification.onHidden;
		$(notification.container.id+' .'+ type).miniNotification(defaultSettings).removeData('miniNotification');		
	},
	showSuccess: function(message, title, timeOut)
	{
		notification.show(message, title, "success", timeOut);
	},
	showWarning: function(message, title, timeOut)
	{
		notification.show(message, title, "warning", timeOut);
	},
	showError: function(message, title, timeOut)
	{
		notification.show(message, title, "error", timeOut);
	},
	showImportant: function(message, title, timeOut)
	{
		notification.show(message, title, "important", timeOut);
	},
	showBlank: function(timeOut)
	{
		notification.show("", "", "blank", timeOut);
	},
	onHidden: function()
	{
		$(notification.container.id).hide();
	}
};
