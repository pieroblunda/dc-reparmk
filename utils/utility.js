
$('#confirm-delete').on('show.bs.modal', function(e) {
	$(this).find('.btn-ok').click({
		param1: $(e.relatedTarget).data('callback'),
		param2: $(e.relatedTarget).data('args')
	}, ConfirmCallback)
	function ConfirmCallback(args) {
		window[args.data.param1](args.data.param2);
	}		
});
$('#confirm-operation').on('show.bs.modal', function (e) {
	$(this).find('.btn-ok').click({
		param1: $(e.relatedTarget).data('callback'),
		param2: $(e.relatedTarget).data('args')
	}, ConfirmCallback)
	function ConfirmCallback(args) {
		window[args.data.param1](args.data.param2);
	}
});
ShowError = function (message) {
	$('.pnl-errors').html('');
	$('.pnl-errors').html(message);
	$('#system-message').show();
	setTimeout(function () {
		$('#system-message').fadeOut('slow');
	}, 3000);
}