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
        $('#nav-tabs-detect-price a[href="#tabpanel-detect-price-detail"]').tab('show');

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
                    $('#PrezzoFamily').val('');
                    $('.PrezzoFamily').html('0.00');
                }
                if (product.PrezzoIlomo != undefined) {
                    $('.PrezzoIlomo').html(product.PrezzoIlomo);
                } else {
                    $('#PrezzoIlomo').val('');
                    $('.PrezzoIlomo').html('0.00');
                }
                if (product.PrezzoSunlux != undefined) {
                    $('.PrezzoSunlux').html(product.PrezzoSunlux);
                } else {
                    $('#PrezzoSunlux').val('');
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
        $('#PrezzoSuggerito').val('');
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
                $('.LoadedRows').html(0);
                $('.RowsCount').html(0);
                $('#load-data').hide();
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
        var PrezzoFamily = '<span id="' + product.CodiceArticolo + '-PrezzoFamily">0.00</span>';
        if (product.PrezzoFamily != '' && product.PrezzoFamily != undefined) {
            PrezzoFamily = '<span id="' + product.CodiceArticolo + '-PrezzoFamily">' + product.PrezzoFamily + '</span>';
        }
        var PrezzoIlomo = '<span id="' + product.CodiceArticolo + '-PrezzoIlomo">0.00</span>';
        if (product.PrezzoIlomo != '' && product.PrezzoIlomo != undefined) {
            PrezzoIlomo = '<span id="' + product.CodiceArticolo + '-PrezzoIlomo">' + product.PrezzoIlomo + '</span>';
        }
        var PrezzoSunlux = '<span id="' + product.CodiceArticolo + '-PrezzoSunlux">0.00</span>';
        if (product.PrezzoSunlux != '' && product.PrezzoSunlux != undefined) {
            PrezzoSunlux = '<span id="' + product.CodiceArticolo + '-PrezzoSunlux">' + product.PrezzoSunlux + '</span>';
        }
        var partialPrezzo = '';
        partialPrezzo = '' +
            '<h3 style="color:#0088ff;">&euro;&nbsp;' + product.PrezzoListinoBase + '</h3>' +
            '<h4>&euro;&nbsp; <span style="text-decoration: line-through;">' + product.PrezzoListinoFornitore + '</span></h4>';

        var partialProduct = '' +
            '<div class="col-lg-4 col-md-4 col-sm-6 col-xs-12">' +
            '<div class="jumbotron" style="padding-left:0; padding-right:0; padding-top:15px; border:1px solid lightgray; background-color:#fff;">' +
            '<div class="container-fluid" style="padding:0 !important;">' +
            partialSconto +
            '<h5 id="' + product.CodiceArticolo + '-StatoArticolo" class="bi bi-circle-fill text-primary" style="position:absolute; left:25px; top:-14px;"></h5>' +
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
            '<table class="table table-striped table-sm" style="font-size:12px;">' +
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
            '<button id="' + product.CodiceArticolo + '-btn-suggest-price" data-codicearticolo="' + product.CodiceArticolo + '" type="button" class="btn btn-light col-xs-12 btn-suggest-price">' +
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
    detectPriceOk = function (CodiceArticolo) {

        var isvalidform = true;
        const forms = document.querySelectorAll('.form-control-detect, .form-select-detect')
        Array.from(forms).forEach(form => {
            if (!form.checkValidity()) {
                isvalidform = false;
            }
        })
        /* Save data */
        if (isvalidform) {
            $.ajax({
                url: "/detect-price/" + CodiceArticolo,
                type: "POST",
                data: {
                    CodiceArticolo: CodiceArticolo,
                    PrezzoFamily: $('#PrezzoFamily').val(),
                    PrezzoIlomo: $('#PrezzoIlomo').val(),
                    PrezzoSunlux: $('#PrezzoSunlux').val(),
                },
            }).done(function (response) {
                if (response.status == "ERR") {
                    //console.log("response error: " + response.error);
                    //console.log("JSON.parse error: " + JSON.parse(response.error));
                    //console.log("JSON.parse error message: " + JSON.parse(response.error).message.Status);
                    var err = JSON.parse(response.error);
                    $('.pnl-errors').html(err.message);
                    $('.form-errors').show();
                }
                else if (response.status == "OK") {
                    /* Aaggiorna i prezzi nel jumbtron dello specifico articolo */
                    $('#' + CodiceArticolo + '-PrezzoFamily').html($('#PrezzoFamily').val());
                    $('#' + CodiceArticolo + '-PrezzoIlomo').html($('#PrezzoIlomo').val());
                    $('#' + CodiceArticolo + '-PrezzoSunlux').html($('#PrezzoSunlux').val());
                    $('#detect-price').modal('hide');
                }
            })
        }


    }
    suggestPriceOk = function (CodiceArticolo) {
        var isvalidform = true;
        const forms = document.querySelectorAll('.form-control-suggest')
        Array.from(forms).forEach(form => {
            if (!form.checkValidity()) {
                isvalidform = false;
            }
        })
        /* Save data */
        if (isvalidform) {
            $.ajax({
                url: "/suggest-price/" + CodiceArticolo,
                type: "POST",
                data: {
                    CodiceArticolo: CodiceArticolo,
                    PrezzoSuggerito: $('#PrezzoSuggerito').val(),
                    Note: $('#Note').val(),
                },
            }).done(function (response) {
                if (response.status == "ERR") {
                    var err = JSON.parse(response.error);
                    $('.pnl-errors').html(err.message);
                    $('.form-errors').show();
                }
                else if (response.status == "OK") {
                    /* Aaggiorna il conteggio nel badge <Approvazioni> */
                    $('#' + CodiceArticolo + '-btn-suggest-price').addClass('disabled');
                    $('#' + CodiceArticolo + '-StatoArticolo').removeClass('text-primary');
                    $('#' + CodiceArticolo + '-StatoArticolo').addClass('text-danger');
                    $('#suggest-price').modal('hide');
                }
            })
        }
    }
    detectPriceHistory = function (codicearticolo) {
        /* Visualizza il loader */
        $('.spinner').show();
        $.ajax({
            url: "/detect-price-history/" + codicearticolo,
            type: "GET",
            data: {},
        }).done(function (response) {
            if (response.status == "ERR") {
                var err = JSON.parse(response.error);
                $('.pnl-errors').html(err.message);
                $('.form-errors').show();
            } else if (response.status == "OK") {
                $('#detect-price-history-container').empty();
                var partialProduct = '';
                if (Array.isArray(response.data)) {
                    $.each(response.data, function (key, product) {
                        partialProduct +=
                            '<tr>' +
                            '<td scope="col">' + product.PrezzoFamily + '</td>' +
                            '<td scope="col">' + product.PrezzoIlomo + '</td>' +
                            '<td scope="col">' + product.PrezzoSunlux + '</td>' +
                            '<td scope="col">' + product.DataRegistrazione + '</td>' +
                            '<td scope="col">' + product.Utente + '</td>' +
                            '</tr>'
                    });
                } else {
                    loadProduct(response.data);
                }
                $('#detect-price-history-container').append(partialProduct);
            }
            /* Nasconde il loader al termine del caricamento */
            $('.spinner').hide();
        }).fail(function (xhr, status, errorThrown) {
        }).always(function (xhr, status) {

        });
    }
    $("input.decimal").bind("change keyup input", function () {
        var position = this.selectionStart - 1;
        //remove all but number and .
        var fixed = this.value.replace(/[^0-9\.]/g, "");
        if (fixed.charAt(0) === ".")
            //can't start with .
            fixed = fixed.slice(1);
        var pos = fixed.indexOf(".") + 1;
        if (pos >= 0)
            //avoid more than one .
            fixed = fixed.substr(0, pos) + fixed.slice(pos).replace(".", "");
        //cancel sub input string
        if (fixed.indexOf(".") > 0 && fixed.substr(pos).length > 2)
            fixed = fixed.substr(0, pos) + '.' + fixed.substr(pos, 2);
        //set cursor position to end
        if (this.value !== fixed) {
            this.value = fixed;
            this.selectionStart = position + 1;
            this.selectionEnd = position + 1;
        }
    });
    $('#rbSuggestPrice').change(function () {
        if ($("input[name=rbSuggestPrice]").prop("checked")) {
            $('.btn-suggest-price-ok').removeClass('disabled');
            $('.form-suggest-price-alert').show();
        } else {
            $('.btn-suggest-price-ok').addClass('disabled');
            $('.form-suggest-price-alert').hide();
        }
    });
    $('#tab-detect-price-history').click(function () {
        detectPriceHistory($('.CodiceArticolo').html());
    });
    $('.btn-detect-price-ok').click(function () {
        detectPriceOk($('.CodiceArticolo').html());
    });
    $('.btn-suggest-price-ok').click(function () {
        suggestPriceOk($('.CodiceArticolo').html());
    });
    $('.btn-detect-price').click(function () {
        detectPrice($(this).data("codicearticolo"));
    });
    $('.btn-suggest-price').click(function () {
        suggestPrice($(this).data("codicearticolo"));
    });
    $('#Buyer').change(function () {
        if ($(this).val() == '') {
            $("#Fornitore").empty();
            $("#Fornitore").append(new Option('Tutti', ''));
        } else {
            loadFornitori($('#Buyer').val());
        }
    });
    $('.btn-search').click(function () {
        $.ajax({
            url: '/init',
            type: "POST",
            data: {},
        }).done(function (response) {
            $('#load-data').hide();
            /* Carica la lista dei risultati */
            $('.data-container').empty();
            loadProducts($('#Fornitore').val(), $('#CodiceArticolo').val());
        })

    });
    $('#load-data').click(function () {
        $('#load-data').hide();
        /* Carica la lista dei risultati */
        if ($('.LoadedRows').html() != $('.RowsCount').html()) {
            loadProducts($('#Fornitore').val(), $('#CodiceArticolo').val());
        }
    })
    //$(window).scroll(function (e) {
    //    if (($(window).scrollTop() + $(window).height()) >= $(document).height()) {
    //        if ($('.LoadedRows').html() != $('.RowsCount').html()) {
    //            loadProducts($('#Fornitore').val(), $('#CodiceArticolo').val());
    //        }
    //    }
    //});
    loadBuyer();
});