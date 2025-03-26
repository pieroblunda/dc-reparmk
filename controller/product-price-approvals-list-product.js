$(document).ready(function () {
    switchProductApprovalsState = function (args) {
        $.ajax({
            url: "/switch-product-approvals-state/" + args.IdApprovazioneArticolo,
            type: "PUT",
            data: {
                IdStatoApprovazione: args.IdStatoApprovazione
            }
        }).done(function (response) {
            if (response.status == "ERR") {
                var err = JSON.parse(response.error);
                ShowError(err.message);
            } else if (response.status == "OK") {
                /* Aggiorna il pulsante di origine */
                $('#' + args.CodiceArticolo + '-btn-cancel-price').addClass('disabled');
                $('#' + args.CodiceArticolo + '-StatoArticolo').removeClass('text-warning');
                $('#' + args.CodiceArticolo + '-StatoArticolo').addClass('text-danger');
            }
        }).fail(function (xhr, status, errorThrown) {
        }).always(function (xhr, status) {

        });
    }
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
            url: "/product-price-approvals-list-product/" + $('#IdApprovazione').val(),
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
    loadProduct = function (product, user) {
        templateString = '';
        $.get("../template/product-price-approvals-list-product-vertical.ejs", function (response) {
            templateString = response;
            var partialProduct = ejs.render(templateString, { product, user });
            $('.data-container').append(partialProduct);
            $("#container-" + product.CodiceArticolo).find('.btn-detect-price').each(function () {
                $(this).click(function () {
                    detectPrice($(this).data("codicearticolo"));
                });
            })
            $("#container-" + product.CodiceArticolo).find('.btn-suggest-price').each(function () {
                $(this).click(function () {
                    suggestPrice($(this).data("codicearticolo"));
                });
            })
        });
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
                    product = response.data;
                    partialProduct +=
                        '<tr>' +
                        '<td scope="col">' + product.PrezzoFamily + '</td>' +
                        '<td scope="col">' + product.PrezzoIlomo + '</td>' +
                        '<td scope="col">' + product.PrezzoSunlux + '</td>' +
                        '<td scope="col">' + product.DataRegistrazione + '</td>' +
                        '<td scope="col">' + product.Utente + '</td>' +
                        '</tr>'
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