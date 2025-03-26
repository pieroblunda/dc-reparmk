$(function () {
    switchApprovalsState = function (args) {
        //console.log(args.IdApprovazione);
        //console.log(args.IdStatoApprovazione);
        $.ajax({
            url: "/switch-approvals-state/" + args.IdApprovazione,
            type: "PUT",
            data: {
                IdStatoApprovazione: args.IdStatoApprovazione,
                BuyerMail: args.BuyerMail
            }
        }).done(function (response) {
            if (response.status == "ERR") {
                var err = JSON.parse(response.error);
                ShowError(err.message);
            } else if (response.status == "OK") {
                //$('.btn-search').trigger('click');
                document.location.href = '/product-price-approvals-list/' + args.IdStatoApprovazione;
            }
        }).fail(function (xhr, status, errorThrown) {
        }).always(function (xhr, status) {

        });
    }
    $('.btn-search').click(function () {
        $.ajax({
            url: '/init',
            type: "POST",
            data: {},
        }).done(function (response) {
            $('#load-data').hide();
            /* Carica la lista dei risultati */
            $('.data-container').empty();
            loadProducts();
        })
    });
    loadProduct = function (approvazione, user) {
        templateString = '';
        $.get("../template/product-price-approvals-list.ejs", function (response) {
            templateString = response;
            var partialProduct = ejs.render(templateString, { approvazione, user });
            $('.data-container').append(partialProduct);
            $("#container-" + approvazione.Id).find('.btn-download-excel').each(function () {
                $(this).click(function () {
                    downloadExcel($(this).data('args'));
                });
            })
            $('a').tooltip();
        });
    }
    loadProducts = function () {
        /* Visualizza il loader */
        $('.spinner').show();
        $.ajax({
            url: "/product-price-approvals-list/" + $('input[name="IdStatoApprovazione"]:checked').val(),
            type: "POST",
            data: {},
        }).done(function (response) {
            if (response.status == "ERR") {
                var err = JSON.parse(response.error);
                $('.LoadedRows').html(0);
                $('.RowsCount').html(0);
                $('#load-data').hide();
                /* Visualizza l'errore */
                ShowError(err.message);
                /* Nasconde il loader al termine del caricamento */
                $('.spinner').hide();
            } else if (response.status == "OK") {
                console.log(response.user);

                if (Array.isArray(response.data)) {
                    $.each(response.data, function (key, product) {
                        loadProduct(product, response.user);
                    });
                } else {
                    loadProduct(response.data, response.user);
                }
                /* Visualizza il numero dei risultati trovati */
                if ((response.user.NextRows + response.user.OffsetRows) > response.rowscount) {
                    $('.LoadedRows').html(response.rowscount);
                } else {
                    $('.LoadedRows').html(response.user.NextRows + response.user.OffsetRows);
                }
                /* Visualizza il numero totale dei risultati */
                $('.RowsCount').empty().html(response.rowscount);

                /* Visualizza il pulsante per caricare altri risultati */
                if ($('.LoadedRows').html() != $('.RowsCount').html()) {
                    $('#load-data').show();
                }
                /* Nasconde il loader al termine del caricamento */
                $('.spinner').hide();
            }
        }).fail(function (xhr, status, errorThrown) {
        }).always(function (xhr, status) {
        });
    }
    $('#load-data').click(function () {
        $('#load-data').hide();
        /* Carica la lista dei risultati */
        if ($('.LoadedRows').html() != $('.RowsCount').html()) {
            loadProducts();
        }
    })
    $('.btn-download-excel').click(function () {
        downloadExcel($(this).data('args'));
    });
    function downloadExcel(IdApprovazione) {

        /* Visualizza il loader */
        $('.spinner-excel').show();

        /* Invoca la Route che si occupa di gestire l'estrazione dei dati */
        $.ajax({
            url: '/download-excel',
            type: 'POST',
            data: {
                IdApprovazione: IdApprovazione,
            },
            success: function (response, status, xhr) {

                /* Legge l'intestazione header della richiesta web */
                const header = xhr.getResponseHeader('Content-Disposition');

                /* Legge il nome del file excel contenuto nell'header */
                const filename = header.substring(header.indexOf('=') + 1);

                /* Crea l'oggetto Blob con la risposta del server */
                const blob = new Blob([response], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });
                /* Create un elemento link e lo aggiunge al documento della pagina */
                const link = document.createElement('a');

                /* Assegna l'oggetto blob al link */
                link.href = URL.createObjectURL(blob);

                /* Assegna il nome del file al link */
                link.download = filename;

                /* Invoca il download automatico del file excel */
                link.click();

                /* Nasconde il loader */
                $('.spinner-excel').hide();
            },
            error: function (xhr, status, error) {
                alert('Si è verificato un errore durante il download del file');
            },
            xhrFields: {
                responseType: 'arraybuffer'
            }
        });

    };
});