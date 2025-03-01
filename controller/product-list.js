$(document).ready(function () {
    loadBuyer = function () {
        /* Visualizza il loader */
        $('.spinner').show();
        $.ajax({
            url: "/buyer",
            type: "GET",
            data: {},
        }).done(function (response) {
            if (response.status == "ERR") {
                var err = JSON.parse(response.error);
                $('.pnl-errors').html(err.message);
                $('.form-errors').show();
            } else if (response.status == "OK") {
                $.each(response.data, function (key, buyer) {
                    $("#Buyer").append(new Option(buyer.Nominativo, buyer.CodiceBuyer));
                })
            }
            /* Nasconde il loader al termine del caricamento */
            $('.spinner').hide();
        }).fail(function (xhr, status, errorThrown) {
        }).always(function (xhr, status) {

        });
    }
    loadFornitori = function (CodiceBuyer) {
        /* Visualizza il loader */
        $('.spinner').show();
        $.ajax({
            url: "/fornitori/" + CodiceBuyer,
            type: "GET",
            data: {},
        }).done(function (response) {
            if (response.status == "ERR") {
                var err = JSON.parse(response.error);
                $('.pnl-errors').html(err.message);
                $('.form-errors').show();
            } else if (response.status == "OK") {
                $("#Fornitore").empty();
                $("#Fornitore").append(new Option('Tutti', ''));
                $.each(response.data, function (key, fornitore) {
                    $("#Fornitore").append(new Option(fornitore.RagioneSocialeFornitore, fornitore.CodiceFornitore));
                })
            }
            /* Nasconde il loader al termine del caricamento */
            $('.spinner').hide();
        }).fail(function (xhr, status, errorThrown) {
        }).always(function (xhr, status) {

        });
    }
    detectPrice = function (codicearticolo) {
        /* Visualizza il loader */
        $('.spinner').show();
        $.ajax({
            url: "/product-list/" + codicearticolo,
            type: "GET",
            data: {},
        }).done(function (response) {
            if (response.status == "ERR") {
                var err = JSON.parse(response.error);
                $('.pnl-errors').html(err.message);
                $('.form-errors').show();
            } else if (response.status == "OK") {
                var product = JSON.parse(response.data);
                $('.CodiceArticolo').html(product.CodiceArticolo);
                $('.PrezzoListinoBase').html(product.PrezzoListinoBase);
                if (product.PrezzoFamily != undefined) {
                    $('.PrezzoFamily').html(product.PrezzoFamily);
                } else {
                    $('.PrezzoFamily').html('0.00');
                }
                if (product.PrezzoIlomo != undefined) {
                    $('.PrezzoIlomo').html(product.PrezzoIlomo);
                } else {
                    $('.PrezzoIlomo').html('0.00');
                }
                if (product.PrezzoSunlux != undefined) {
                    $('.PrezzoSunlux').html(product.PrezzoSunlux);
                } else {
                    $('.PrezzoSunlux').html('0.00');
                }   
                $('.PercentualeRicarico').html(product.PercentualeRicarico);
                $('.Applicazione').html(product.Applicazione);
                $('.Gamma').html(product.Gamma);
                $('.MediaVendita').html(product.MediaVendita);
                $('#detect-price').modal('show');
            }
            /* Nasconde il loader al termine del caricamento */
            $('.spinner').hide();
        }).fail(function (xhr, status, errorThrown) {
        }).always(function (xhr, status) {

        });
    }
    suggestPrice = function (codicearticolo) {
        /* Visualizza il loader */
        $('.spinner').show();
        $.ajax({
            url: "/product-list/" + codicearticolo,
            type: "GET",
            data: {},
        }).done(function (response) {
            if (response.status == "ERR") {
                var err = JSON.parse(response.error);
                $('.pnl-errors').html(err.message);
                $('.form-errors').show();
            } else if (response.status == "OK") {
                var product = JSON.parse(response.data);
                $('.CodiceArticolo').html(product.CodiceArticolo);
                $('.PrezzoListinoBase').html(product.PrezzoListinoBase);
                $('.PrezzoFamily').html(product.PrezzoFamily);
                $('.PrezzoIlomo').html(product.PrezzoIlomo);
                $('.PrezzoSunlux').html(product.PrezzoSunlux);
                $('.PercentualeRicarico').html(product.PercentualeRicarico);
                $('.Applicazione').html(product.Applicazione);
                $('.Gamma').html(product.Gamma);
                $('.MediaVendita').html(product.MediaVendita);
                $('#suggest-price').modal('show');
            }
            /* Nasconde il loader al termine del caricamento */
            $('.spinner').hide();
        }).fail(function (xhr, status, errorThrown) {
        }).always(function (xhr, status) {

        });
    }
    loadProducts = function (CodiceFornitore, CodiceArticolo) {
        /* Visualizza il loader */
        $('.spinner').show();
        $.ajax({
            url: "/product-list",
            type: "POST",
            data: {
                CodiceFornitore: CodiceFornitore,
                CodiceArticolo: CodiceArticolo
            },
        }).done(function (response) {
            if (response.status == "ERR") {
                var err = JSON.parse(response.error);
                /* Visualizza l'errore */
                ShowError(err.message);
                /* Nasconde il loader al termine del caricamento */
                $('.spinner').hide();
            } else if (response.status == "OK") {
                if (Array.isArray(response.data)) {
                    $.each(response.data, function (key, product) {
                        loadProduct(product);
                    });
                } else {
                    loadProduct(response.data);
                }
                $('.btn-detect-price').click(function () {
                    detectPrice($(this).data("codicearticolo"));
                });
                $('.btn-suggest-price').click(function () {
                    suggestPrice($(this).data("codicearticolo"));
                });
                /* Visualizza il numero delle anomalie rispetto alla paginazione */
                $('.LoadedRows').html($('.jumbotron').length);

                /* Visualizza il numero totale delle anomalie rilevate */
                $('.RowsCount').html(response.rowscount);

                /* Nasconde il loader al termine del caricamento */
                $('.spinner').hide();
            }
        }).fail(function (xhr, status, errorThrown) {
        }).always(function (xhr, status) {

        });
    }
    loadProduct = function (product) {

        /* badge percentuale sconto */
        var partialSconto = '';
        if (product.PercentualeSconto != '0.00') {
            partialSconto += '<h6 class="rounded" style="position:relative; margin:0; width:52px !important; height:20px !important; padding:4px; padding-left:6px; margin-right:0; float:right; top:-10px; background-color:#0088ff; color:#fff;">';
            partialSconto += parseFloat(product.PercentualeSconto) + '%';
            partialSconto += '</h6>';
        }

        var partialUnita = '';
        if (eval(product.QuantitaPacco) != (product.QuantitaBox)) {
            partialUnita = '<h6 class="text-muted">' + product.QuantitaPacco + ' unit&agrave; / Confezione da ' + product.QuantitaBox + ' PZ</h6>';
        } else {
            partialUnita = '<h6 class="text-muted">Confezione da ' + product.QuantitaBox + ' PZ</h6>';
        }
        var partialFornitore = '';
        if (product.CodiceFornitore != '') {
            partialFornitore = '<h6>' + product.RagioneSocialeFornitore + '</h6>'
        } else {
            partialFornitore = 'Fornitore non dispnonibile';
        }
        var PrezzoFamily = '0.00';
        if (product.PrezzoFamily != '' && product.PrezzoFamily != undefined) {
            PrezzoFamily = product.PrezzoFamily;
        }
        var PrezzoIlomo = '0.00';
        if (product.PrezzoIlomo != '' && product.PrezzoIlomo != undefined) {
            PrezzoIlomo = product.PrezzoIlomo;
        }
        var PrezzoSunlux = '0.00';
        if (product.PrezzoSunlux != '' && product.PrezzoSunlux != undefined) {
            PrezzoSunlux = product.PrezzoSunlux;
        }
        var partialPrezzo = '';
            partialPrezzo = '' +
                '<h3 style="color:#0088ff;">&euro;&nbsp;' + product.PrezzoListinoBase + '</h3>' +
                '<h4>&euro;&nbsp; <span style="text-decoration: line-through;">' + product.PrezzoListinoFornitore + '</span></h4>';

        var partialProduct = '' +
        '<div class="col-lg-3 col-md-3 col-sm-6 col-xs-12">' +
            '<div class="jumbotron" style="padding-left:0; padding-right:0; padding-top:15px; border:1px solid lightgray; background-color:#fff;">' +
                '<div class="container-fluid" style="padding:0 !important;">' +
                    partialSconto +
                    '<h5 class="bi bi-circle-fill" style="position:absolute; left:25px; top:-14px; color:#0088ff;"></h5>' +
                    '<div class="col-xs-12">' +
                        '<a href="/productDetail/' + product.CodiceArticolo + '">' +
                            '<img src="https://ik.imagekit.io/dccasa/FOTODC_AGENTI/' + product.CodiceArticolo + '.jpg"' +
                            'onerror="this.onerror=null; this.src=&apos;images/image.png&apos;;"' +
                            'class="img-fluid" />' +
                        '</a>' +
                    '</div>' +
                    '<div class="col-xs-12">' +
                        '<h5 style="color:gray;"><span class="glyphicon glyphicon-barcode"></span>&nbsp;&nbsp;' + product.CodiceArticolo + '</h5>' +
                        '<h6 style="color:#0088ff;"><i>' +
                            product.DescrizioneSottocategoria +
                        '</i></h6>' + partialFornitore +
                        '<h4 class="text-info" style="height:60px !important;">' +
                            '<a class="text-decoration-none" href="/productDetail/' + product.CodiceArticolo + '">' +
                                '<b class="text-dark">' + product.Denominazione + '</b>' +
                            '</a>' +
                        '</h4>' + 
                    '</div>' +
                    '<div class="col-xs-12">' +
                        '<table class="table table-striped table-sm" style="font-size:11px;">' +
                            '<tbody>' +
                                '<tr class="table-dark">' +
                                    '<td scope="col"><b>DC Group</b></td>' +
                                    '<td scope="col" class="text-right">' +
                                        '<b>' + product.PrezzoListinoBase + '<span class="bi bi-currency-euro"></span></b>' +
                                    '</td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td scope="col">Fornitore</td>' +
                                    '<td scope="col" class="text-right">' +
                                        product.PrezzoListinoFornitore + '<span class="bi bi-currency-euro"></span>' +
                                    '</td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td scope="col">Family</td>' +
                                    '<td scope="col" class="text-right">' +
                                        PrezzoFamily + '<span class="bi bi-currency-euro"></span>' +
                                    '</td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td scope="col">Ilomo</td>' +
                                    '<td scope="col" class="text-right">' +
                                        PrezzoIlomo + '<span class="bi bi-currency-euro"></span>' +
                                    '</td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td scope="col">Sunlux</td>' +
                                    '<td scope="col" class="text-right">' +
                                        PrezzoSunlux + '<span class="bi bi-currency-euro"></span>' +
                                    '</td>' +
                                '</tr>' +
                            '</tbody>' +
                        '</table>' +
                    '</div>' +
                    '<div class="col-xs-12">' +
                        '<div class="btn-group dropup" style="position:absolute; display:block; width:100%; z-index:10;">' +
                            '<button type="button" class="btn btn-default bi bi-three-dots-vertical rounded-circle"' +
                                'data-bs-toggle="dropdown" style="width:34px; height:34px; padding:0; float:right; margin-right:25px; margin-bottom:8px;">' +
                            '</button>' +
                            '<ul class="dropdown-menu dropdown-menu-lg-end" style="width:250px;">' +
                                '<li>' +
                                    '<div class="col-xs-12">' +
                                        '<b class="gruppo-operativo-1">Azioni</b>' +
                                    '</div>' +
                                '</li>' +
                                '<li class="dropdown-item">' +
                                    '<hr class="dropdown-divider">' +
                                '</li>' +
                                '<li class="dropdown-item">' +
                                    '<button data-codicearticolo="' + product.CodiceArticolo + '" type="button" class="btn btn-light col-xs-12 btn-detect-price">' +
                                        'Rileva prezzo competitor' +
                                    '</button>' +
                                '</li>' +
                                '<li class="dropdown-item">' +
                                    '<button data-codicearticolo="' + product.CodiceArticolo + '" type="button" class="btn btn-light col-xs-12 btn-suggest-price">' +
                                        'Suggerisci prezzo di vendita' +
                                    '</button>' +
                                '</li>' +
                                '<li class="dropdown-item">' +
                                    '<button type="button" class="btn btn-light col-xs-12">' +
                                        'Condividi in approvazione' +
                                    '</button>' +
                                '</li>' +
                            '</ul>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
        $('.data-container').append(partialProduct);
    }

    $('.btn-detect-price').click(function () {
        detectPrice($(this).data("codicearticolo"));
    });
    $('.btn-suggest-price').click(function () {
        suggestPrice($(this).data("codicearticolo"));
    });
    $('#Buyer').change(function () {
        loadFornitori($('#Buyer').val());
    });
    $('.btn-search').click(function () {
        $.ajax({
            url: '/init',
            type: "POST",
            data: {},
        }).done(function (response) {
            /* Carica la lista delle anomalie */
            $('.data-container').empty();
            loadProducts($('#Fornitore').val(), $('#CodiceArticolo').val());
        })

    });
    $(window).scroll(function () {
        if ($(window).scrollTop() + $(window).height() >= $(document).height()) {
            if ($('.LoadedRows').html() != $('.RowsCount').html()) {
                loadProducts($('#Fornitore').val(), $('#CodiceArticolo').val());
            }
        }
    });
    loadBuyer();
});