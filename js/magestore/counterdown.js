var AuctionCounterDown = Class.create();
AuctionCounterDown.prototype = {
    initialize: function(){
        this.timeDiffirent  = 0;
        this.selector   = $$('.countdown');
        this.content    = '<span class="date">{d} Days </span><span class="hour">{h}</span>:<span class="min">{m}</span>:<span class="sec">{s}</span>'
        this.interval   = 1000;
        this.timeDiffirent = 0;
        this.timer      = null;
        this.patterns   = {
            days    : 86400,
            hours   : 3600,
            minutes : 60,
            seconds : 1
        };
        if($$('.countdown').length)
            this.run();
    },
    run : function() {
        new Ajax.Request(autionUrl.updateTimeDiffirentUrl,{
            method: 'post', 
            onComplete: function(xhr){
                this.timeDiffirent = parseInt((new Date().getTime() - new Date(xhr.responseText).getTime())/1000);
                this.timer = setInterval(function() {
                    var now = parseInt((new Date().getTime())/1000)-this.timeDiffirent;
                    this.selector.each(function(el){
                        var sec = parseInt(new Date(el.readAttribute('endTime').replace(/-/gi,'/')).getTime()/1000)-now;
                        if(sec<=1) {
							el.hide();
							if(isProductPage){
								isProductPage = false;
								window.location.href = window.location.href;
							}
						}else this.display(sec,el);
                    }.bind(this));
                }.bind(this), this.interval);
            }.bind(this),
            onFailure: ""
        });  
    },
    display : function(sec,el) {
        var days = parseInt(sec/this.patterns.days);
        if(days<10)
            days = '0'+days;
        sec -= this.patterns.days*days;
        var hours = parseInt(sec/this.patterns.hours);
        if(hours<10)
            hours = '0'+hours;
        sec -= this.patterns.hours*hours;
        var minutes = parseInt(sec/this.patterns.minutes);
        if(minutes<10)
            minutes = '0'+minutes;
        sec -= this.patterns.minutes*minutes;
        var seconds = parseInt(sec/this.patterns.seconds);
        if(seconds<10)
            seconds = '0'+seconds;
		var abc = this.content.replace('{d}',days).replace('{h}',hours).replace('{m}',minutes).replace('{s}',seconds);
        el.update(abc);
		if($('auction_box11_count'))
			$('auction_box11_count').update(abc);
    }
};

var AuctionsManager = Class.create();
AuctionsManager.prototype = {
    initialize: function(){
        this.selector   = $$('.auction_box');
        this.interval   = 3000;
        this.timer      = null;
        if($$('.auction_box').length)
            this.run();
    },
    run : function() {
        this.timer = setInterval(function() {
            new Ajax.Request(autionUrl.auctionUpdateUrl,{
                method: 'post', 
                onComplete: function(xhr){
                    if (xhr.responseText && xhr.responseText.isJSON()){
                        var auction = JSON.parse(xhr.responseText);
                        this.selector.each(function(el){
                            if(auction[el.readAttribute('auctionId')]){
                                this.update(el,auction[el.readAttribute('auctionId')]);
                            }
                        }.bind(this)); 
                    }
                }.bind(this),
                onFailure: ""
            });  
        }.bind(this), this.interval);
    },
    update : function(element,option){
        switch(option.status) {
            case '3':
                element.down('.auction_label').update(auctionMsg.msgBeforestart);
                element.down('.countdown').setAttribute('endTime',option.start_time);
                break;
            case '4':
                element.down('.auction_label').update(auctionMsg.msgBeforeDone);
                element.down('.countdown').setAttribute('endTime',option.end_time);
                break;
            case '5' : 
                element.down('.auction_label').update(auctionMsg.msgAfter);
        }
        element.setAttribute('updateTime',option.update);
        element.down('.price').update(option.price);
        element.down('.bidder').update(option.bidder);
    }
};


var AuctionInfoUpdateManager = Class.create();
AuctionInfoUpdateManager.prototype = {
    initialize: function(){
        this.interval   = 10000;
        this.timer      = null;
        this.min_next_price = 0;
        this.max_next_price = 0;
        this.selector  = $('auction');
        this.info       = null;
        if(this.selector){
            this.bidButton = $('auction_bid_button');
            this.bidButton.observe('mouseover',this.bidButtonMouseOverHanlde.bind(this));
            this.bidButton.observe('mouseout',this.bidButtonMouseOutHanlde.bind(this));
            this.bidButton.observe('click',this.bidButtonClickHanlde.bind(this));
            this.auctionId = $('auction').readAttribute('autionid');
            this.customerId = $('auction').readAttribute('customerId');
            this.run();
        }
    },
    run : function() {
        this.timer = setInterval(function() {
            new Ajax.Request(autionUrl.auctionUpdateInfoUrl,{
                method: 'post', 
                parameters: {auctionid: this.selector.readAttribute('auctionId')},
                onComplete: function(xhr){
                    if (xhr.responseText && xhr.responseText.isJSON()){
                        this.info = JSON.parse(xhr.responseText);
                        this.update();
                    }
                }.bind(this),
                onFailure: ""
            });  
        }.bind(this), this.interval);
    },
    update : function(){
        var auction = this.info;
        $$('#auction .bids a').first().update(auction.totalBid);
        $$('#auction .current_price').first().update(auction.price);
		if($('auction_box11_current_price'))
			$('auction_box11_current_price').update(auction.price);
        $$('#auction .bidder').first().update(auction.bidder);
		if($('auction_box11_bidder'))
			$('auction_box11_bidder').update(auction.bidder);
        $$('#auction .start_price').first().update(auction.initPrice);
        $$('#auction .start_time').first().update(auction.start_time);
        $$('#auction .end_time').first().update(auction.end_time);
        $$('#auction .price_condition').first().update(" "+auction.price_codition);
        this.min_next_price=auction.minNextPrice;
        this.max_next_price=auction.maxNextPrice;
        $('auction').setAttribute('update',auction.update)
    },
    bidButtonMouseOverHanlde : function(){
        if(!customerInfo.isLogin){
            this.bidButton.down('span span').update(customerInfo.loginLabel);
            return;
        }
        if(customerInfo.requiteBiderName)
            this.bidButton.down('span span').update(customerInfo.createBiderName);
    },
    bidButtonMouseOutHanlde : function(){
            this.bidButton.down('span span').update(customerInfo.bid);
    },
    bidButtonClickHanlde : function(){
        if(!customerInfo.isLogin){
            location.href = customerInfo.loginUrl;
            return;
        }
        if(customerInfo.requiteBiderName){
            location.href = customerInfo.createBiderUrl;
            return;
        }
        $('auction_bid_waitting').show();
        new Ajax.Request(customerInfo.bidUrl,{
            method: 'post',
            parameters: {bid_price:$F('bid_price')  ,product_id: $('auction').readAttribute('autionProductId'), bid_type:$$('input[name=bid_type]:checked').first().value},
            onComplete: function(xhr){
                if (xhr.responseText && xhr.responseText.isJSON()){
                    var info = JSON.parse(xhr.responseText);
                    if(!info.success){
						$('msg_success').hide();
                        $('msg_error').show().update(info.msg);
						}
                    else{
						$('msg_error').hide();
                        $('msg_success').show().update(info.msg);
						}
                }
                $('auction_bid_waitting').hide();
            },
            onFailure: ""
        });
		$('bid_price').value = '';
    }
};