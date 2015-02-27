(function(global) {
	var options = fetchOptions();
	var client = new ShooterCli("/shoots");
	$("#shoot").on('click', function() {
		var timer = getTimer('.timer').start();
		$('.loading').show();
		client.shoot($("#url").val(), options, 
		function(task) {
			if(task.status === 4) {
				var img = document.createElement('img');
				img.onload = function() {
					var width = img.width,
						height = img.height,
						$img = $(img);
					$img.addClass('polaroid');
					$('.metro .image-body').find('img').remove().end().append($img);
					$('.loading').hide();
				}
				img.src = task.src;
				timer.stop();
			} else if(task.status === 1) {

			} else if(task.status === 2) {
				$('.loading').hide();
				timer.stop();
				$.Notify.show('Cannot take screen shoot').close(1000);
			}
		}, function(err) {
			$('.loading').hide();
			timer.stop();
			$.Notify.show('Cannot take screen shoot').close(1000);
		});
	});
	$('#url').on('keyup', function(evt) {
		if(evt.keyCode === 13) {
			$("#shoot").trigger('click');
		}
	});
	$('#toggleSidebar').click(function() {
		var sidebar = $('#sidebar');
		if(!sidebar.hasClass('close')) {
			sidebar.css('marginLeft', -sidebar.outerWidth());
		} else {
			sidebar.css('marginLeft', 0);
		}
		sidebar.toggleClass('close');
	});

	$('#updateSetting').on('click', function(evt) {
		evt.preventDefault();
		options = fetchOptions()
		$.Notify.show("Update Successfuly!").close(1000);
	});

	function fetchOptions() {
		return {
			format: $('#format').find('option:selected').text(),
			viewportSize: {
				width: +$('#v_w').val(),
				height: +$('#v_h').val()
			},
			clipRect: {
				top: +$('#c_t').val(),
				left: +$('#c_l').val(),
				width: $('#c_w').val(),
				height: $('#c_h').val()
			},
			quality: $('#quality').val(),
			zoomFactor: +$('#z_f').val()
			// javascriptEnable: !!$('#js:checked').length
		}
	}

	function round(num, bits) {
		bits = bits || 2;
		if(!num) {
			return 0;
		}
		return Math.round(num * Math.pow(10, bits)) / Math.pow(10, bits);
	}

	var getTimer = (function() {
		var timer, cbs = [];

		function startTimer(fn) {
			if(fn) {
				cbs.push(fn);
			}
			timer = setInterval(function() {
				if(!cbs.length) {
					clearInterval(timer);
					timer = undefined;
					return;
				}
				cbs.forEach(function(cb) {
					if(cb && typeof cb === 'function') {
						cb();
					}
				});
			}, 100);
		}

		return function(el) {
			return {
				el: $(el),
				started: false,
				stopped: false,
				start: function() {
					var self = this;
					if(this.started || this.stopped) return;
					this.d = new Date().getTime();
					this.update = function() {
						self.el[0].innerHTML = round((new Date().getTime() - self.d) / 1000, 1) + 's';
					}
					if(!timer) {
						startTimer(this.update);
					}
					return this;
				},
				stop: function() {
					var self = this;
					if(this.stopped) return;
					cbs.some(function(cb, i) {
						if(self.update === cb) {
							cbs.splice(i, 1);
							return true;
						}
					});
				}
			}
		}
	})() 
})(this);